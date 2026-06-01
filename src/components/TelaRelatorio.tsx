import { useState, useRef, useEffect } from "react";
import { TOPICOS, ValoresTopicos, Tecnico, FILIAIS, Filial, initValores, Topico, HistoricoItem } from "../data/topicos";
import Counter from "./Counter";
import { gerarTextoWhatsApp, exportarPDF } from "../utils/relatorio";

interface Props {
  tecnico: Tecnico;
  onLogout: () => void;
}

function todayBR(): string {
  return new Date().toLocaleDateString("pt-BR");
}

type Tab = "form" | "preview" | "history";

export default function TelaRelatorio({ tecnico, onLogout }: Props) {
  const [filial, setFilial] = useState<Filial>(FILIAIS[0]);
  const [data, setData] = useState(todayBR());
  const [valores, setValores] = useState<ValoresTopicos>(initValores());
  const [obs, setObs] = useState("");
  const [tab, setTab] = useState<Tab>("form");
  const [salvandoFeedback, setSalvandoFeedback] = useState(false);
  
  // Estados para a Caixa de Seleção Inteligente
  const [busca, setBusca] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [topicosSelecionados, setTopicosSelecionados] = useState<Topico[]>([]);

  // Estado do Histórico Local
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const localStorageKey = `historico_relatorios_${tecnico.id}`;
  const rascunhoKey = `rascunho_relatorio_${tecnico.id}`;

  // 1. Carrega o histórico E o rascunho salvo ao abrir o app pela primeira vez
  useEffect(() => {
    const salvo = localStorage.getItem(localStorageKey);
    if (salvo) {
      try { setHistorico(JSON.parse(salvo)); } catch (e) { console.error(e); }
    }

    const rascunho = localStorage.getItem(rascunhoKey);
    if (rascunho) {
      try {
        const dados = JSON.parse(rascunho);
        setFilial(dados.filial || FILIAIS[0]);
        setData(dados.data || todayBR());
        setValores(dados.valores || initValores());
        setObs(dados.obs || "");
        
        // Reconstrói a lista visual de edição com base nos tópicos que possuem valor > 0
        const ativos = TOPICOS.filter((t) => dados.valores?.[t] > 0);
        setTopicosSelecionados(ativos);
      } catch (e) {
        console.error("Erro ao restaurar rascunho", e);
      }
    }
  }, [localStorageKey, rascunhoKey]);

  // 2. Autosave: Salva o rascunho automaticamente a cada mudança feita pelo técnico
  useEffect(() => {
    // Evita salvar um estado completamente vazio se o app ainda estiver inicializando
    const totalItens = TOPICOS.reduce((s, t) => s + valores[t], 0);
    if (totalItens > 0 || obs.trim() !== "") {
      const dadosRascunho = { filial, data, valores, obs };
      localStorage.setItem(rascunhoKey, JSON.stringify(dadosRascunho));
    }
  }, [filial, data, valores, obs, rascunhoKey]);

  // Fecha o dropdown se o usuário clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const total = TOPICOS.reduce((s, t) => s + valores[t], 0);
  const ativoCount = TOPICOS.filter((t) => valores[t] > 0).length;

  const setVal = (topico: Topico, val: number) => {
    setValores((prev) => ({ ...prev, [topico]: val }));
    if (val > 0 && !topicosSelecionados.includes(topico)) {
      setTopicosSelecionados((prev) => [...prev, topico]);
    }
  };

  // Força o salvamento manual gerando o feedback visual na tela
  const handleSalvarRascunho = () => {
    const dadosRascunho = { filial, data, valores, obs };
    localStorage.setItem(rascunhoKey, JSON.stringify(dadosRascunho));
    
    setSalvandoFeedback(true);
    setTimeout(() => setSalvandoFeedback(false), 2000);
  };

  // Envia o relatório, joga no histórico definitivo e limpa o rascunho temporário
  const handleEnviarWhatsAppWeb = () => {
    const texto = gerarTextoWhatsApp(tecnico.nome, filial, data, valores, obs);

    const novoItem: HistoricoItem = {
      id: Date.now().toString(),
      data,
      filial,
      valores: { ...valores },
      obs
    };

    const historicoAtualizado = [novoItem, ...historico.filter(h => h.id !== novoItem.id)];
    setHistorico(historicoAtualizado);
    localStorage.setItem(localStorageKey, JSON.stringify(historicoAtualizado));

    // Remove o rascunho do dia já que ele virou histórico oficial enviado
    localStorage.removeItem(rascunhoKey);

    const textoCodificado = encodeURIComponent(texto);
    const urlWhatsAppWeb = `https://web.whatsapp.com/send?text=${textoCodificado}`;
    
    window.open(urlWhatsAppWeb, "_blank");
  };

  // Reenvia dados puxados diretamente do histórico
  const handleEnviarWhatsAppHistoricoWeb = (item: HistoricoItem) => {
    const texto = gerarTextoWhatsApp(tecnico.nome, item.filial, item.data, item.valores, item.obs);
    const textoCodificado = encodeURIComponent(texto);
    const urlWhatsAppWeb = `https://web.whatsapp.com/send?text=${textoCodificado}`;
    
    window.open(urlWhatsAppWeb, "_blank");
  };

  // Restaura dados antigos no formulário para ajustes e correções
  const restaurarRelatorio = (item: HistoricoItem) => {
    setFilial(item.filial);
    setData(item.data);
    setValores({ ...item.valores });
    setObs(item.obs);
    
    const ativos = TOPICOS.filter((t) => item.valores[t] > 0);
    setTopicosSelecionados(ativos);
    setTab("form");
  };

  const deletarDoHistorico = (id: string) => {
    if (confirm("Tem certeza que deseja apagar este relatório do histórico?")) {
      const filtrado = historico.filter((h) => h.id !== id);
      setHistorico(filtrado);
      localStorage.setItem(localStorageKey, JSON.stringify(filtrado));
    }
  };

  const handlePDF = () => {
    exportarPDF(tecnico.nome, filial, data, valores, obs);
  };

  const handleLimpar = () => {
    if (confirm("Deseja zerar todas as quantidades e observações?")) {
      setValores(initValores());
      setObs("");
      setBusca("");
      setTopicosSelecionados([]);
      localStorage.removeItem(rascunhoKey); // Reseta o rascunho salvo do navegador
    }
  };

  const opcoesFiltradas = TOPICOS.filter((t) =>
    t.toLowerCase().includes(busca.toLowerCase())
  );

  const selecionarTopico = (topico: Topico) => {
    if (!topicosSelecionados.includes(topico)) {
      setTopicosSelecionados((prev) => [...prev, topico]);
    }
    setBusca("");
    setIsOpen(false);
  };

  const removerTopicoDaLista = (topico: Topico) => {
    setTopicosSelecionados((prev) => prev.filter((item) => item !== topico));
    setValores((prev) => ({ ...prev, [topico]: 0 }));
  };

  const previewTexto = gerarTextoWhatsApp(tecnico.nome, filial, data, valores, obs);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 60px" }}>
      {/* Cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6b6b78", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 8px" }}>
            Painel do Técnico
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>
            Olá, {tecnico.nome.split(" ")[0]}
          </h2>
        </div>
        <button onClick={onLogout} style={{
          background: "transparent", border: "1px solid #2a2a30", borderRadius: 8,
          padding: "6px 12px", color: "#6b6b78", fontSize: 12, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", transition: "all .15s"
        }}>Sair</button>
      </div>

      {/* Abas de Navegação */}
      <div style={{ display: "flex", gap: 6, background: "#17171a", padding: 4, borderRadius: 10, marginBottom: 24 }}>
        <button onClick={() => setTab("form")} style={{
          flex: 1, padding: "8px 0", borderRadius: 7, border: "none", fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .12s",
          background: tab === "form" ? "#1e1e22" : "transparent",
          color: tab === "form" ? "#f0f0f0" : "#6b6b78",
        }}>Formulário</button>
        <button onClick={() => setTab("preview")} style={{
          flex: 1, padding: "8px 0", borderRadius: 7, border: "none", fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .12s",
          background: tab === "preview" ? "#1e1e22" : "transparent",
          color: tab === "preview" ? "#f0f0f0" : "#6b6b78",
        }}>Visualizar Texto ({ativoCount})</button>
        <button onClick={() => setTab("history")} style={{
          flex: 1, padding: "8px 0", borderRadius: 7, border: "none", fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .12s",
          background: tab === "history" ? "#1e1e22" : "transparent",
          color: tab === "history" ? "#f0f0f0" : "#6b6b78",
        }}>Histórico ({historico.length})</button>
      </div>

      {/* Box de Conteúdo Principal */}
      <div style={{ background: "#17171a", border: "1px solid #2a2a30", borderRadius: 16, padding: "24px", marginBottom: 24 }}>
        {tab === "form" && (
          <div>
            {/* Metadados: Filial & Data */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#6b6b78", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Filial</label>
                <select value={filial} onChange={(e) => setFilial(e.target.value as Filial)} style={{
                  width: "100%", background: "#1e1e22", border: "1px solid #38383f", borderRadius: 8,
                  padding: "8px 12px", color: "#f0f0f0", fontFamily: "'DM Sans', sans-serif", fontSize: 14
                }}>
                  {FILIAIS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#6b6b78", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Data</label>
                <input type="text" value={data} onChange={(e) => setData(e.target.value)} style={{
                  width: "100%", background: "#1e1e22", border: "1px solid #38383f", borderRadius: 8,
                  padding: "8px 12px", color: "#f0f0f0", fontFamily: "'DM Sans', sans-serif", fontSize: 14
                }} />
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #2a2a30", margin: "0 0 20px" }} />

            {/* COMBOBOX SELEÇÃO */}
            <div ref={dropdownRef} style={{ marginBottom: 24, position: "relative" }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#6b6b78", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Selecionar Tópico de Atendimento
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder='Digite para buscar... (ex: "ati")'
                  value={busca}
                  onFocus={() => setIsOpen(true)}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    setIsOpen(true);
                  }}
                  style={{
                    width: "100%", background: "#1e1e22", border: "1px solid #38383f", borderRadius: 8,
                    padding: "10px 14px", color: "#f0f0f0", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                    borderColor: isOpen ? "#c8f564" : "#38383f", transition: "border-color .2s"
                  }}
                />
                {busca && (
                  <button onClick={() => setBusca("")} style={{ position: "absolute", right: 35, background: "transparent", border: "none", color: "#6b6b78", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>✕</button>
                )}
                <span style={{ position: "absolute", right: 14, color: "#6b6b78", pointerEvents: "none", fontSize: 10, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
              </div>

              {isOpen && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#1e1e22", border: "1px solid #38383f", borderRadius: 8, marginTop: 4, maxHeight: 220, overflowY: "auto", zIndex: 50, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)" }}>
                  {opcoesFiltradas.length > 0 ? (
                    opcoesFiltradas.map((t) => {
                      const jaSelecionado = topicosSelecionados.includes(t);
                      return (
                        <button key={t} type="button" onClick={() => selecionarTopico(t)} style={{ width: "100%", padding: "10px 14px", background: "transparent", border: "none", color: jaSelecionado ? "#c8f564" : "#f0f0f0", textAlign: "left", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer", borderBottom: "1px solid #2a2a30", display: "flex", justifyContent: "space-between", alignItems: "center" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a30")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          <span>{t}</span>
                          {jaSelecionado && <span style={{ fontSize: 11, color: "#c8f564" }}>Selecionado</span>}
                        </button>
                      );
                    })
                  ) : (
                    <div style={{ padding: "12px 14px", color: "#6b6b78", fontSize: 13, fontStyle: "italic" }}>Nenhum resultado para "{busca}"</div>
                  )}
                </div>
              )}
            </div>

            {/* Listagem Dinâmica de Atividades em Edição */}
            <div style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 16 }}>
              {topicosSelecionados.length > 0 && (
                <p style={{ fontSize: 11, fontWeight: 500, color: "#6b6b78", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Tópicos em edição ({topicosSelecionados.length})</p>
              )}

              {topicosSelecionados.map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #2a2a30" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => removerTopicoDaLista(t)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, padding: "0 4px" }} title="Remover da lista">✕</button>
                    <span style={{ fontSize: 14, color: valores[t] > 0 ? "#c8f564" : "#f0f0f0", fontWeight: valores[t] > 0 ? 500 : 400 }}>{t}</span>
                  </div>
                  <Counter value={valores[t]} onChange={(v) => setVal(t, v)} />
                </div>
              ))}

              {topicosSelecionados.length === 0 && (
                <div style={{ padding: "30px 0", textAlign: "center", color: "#6b6b78", fontSize: 13, border: "1px dashed #2a2a30", borderRadius: 8 }}>Use a caixa acima para buscar e adicionar tópicos de atendimento.</div>
              )}
            </div>

            {/* Resumo de Atividades Acumuladas */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, padding: "12px 14px", background: "#1e1e22", borderRadius: 8, border: "1px solid #2a2a30" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#6b6b78" }}>Total de Atividades Lançadas:</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 600, color: total > 0 ? "#c8f564" : "#6b6b78" }}>{total}</span>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #2a2a30", margin: "24px 0 20px" }} />

            {/* Caixa de Texto das Observações */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#6b6b78", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Observações Gerais</label>
              <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Caso queira adicionar algum detalhe sobre o dia..." style={{ width: "100%", height: 80, background: "#1e1e22", border: "1px solid #38383f", borderRadius: 8, padding: "10px 12px", color: "#f0f0f0", fontFamily: "'DM Sans', sans-serif", fontSize: 14, resize: "none" }} />
            </div>
          </div>
        )}

        {tab === "preview" && (
          <div>
            <pre style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, lineHeight: 1.5, color: "#f0f0f0", whiteSpace: "pre-wrap", background: "#1e1e22", borderRadius: 8, padding: "16px", userSelect: "text", margin: 0 }}>
              {previewTexto}
            </pre>
          </div>
        )}

        {/* Listagem do Histórico Gravado */}
        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {historico.length > 0 ? (
              historico.map((item) => {
                const totalItem = TOPICOS.reduce((s, t) => s + (item.valores[t] || 0), 0);
                return (
                  <div key={item.id} style={{ background: "#1e1e22", border: "1px solid #2a2a30", borderRadius: 10, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#c8f564", marginRight: 8 }}>{item.data}</span>
                        <span style={{ fontSize: 12, color: "#6b6b78", background: "#17171a", padding: "2px 8px", borderRadius: 4 }}>{item.filial}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {/* Correção do nome da função de reenvio abaixo para evitar bugs de clique */}
                        <button onClick={() => handleEnviarWhatsAppHistoricoWeb(item)} style={{ background: "transparent", border: "none", color: "#c8f564", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Reenviar 📲</button>
                        <button onClick={() => restaurarRelatorio(item)} style={{ background: "transparent", border: "none", color: "#f0f0f0", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Editar ✏️</button>
                        <button onClick={() => deletarDoHistorico(item.id)} style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Apagar 🗑️</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#a1a1aa", fontFamily: "'DM Mono', monospace" }}>
                      Total de itens: <strong>{totalItem}</strong>
                    </div>
                    {item.obs && (
                      <div style={{ fontSize: 12, color: "#6b6b78", borderLeft: "2px solid #38383f", paddingLeft: 8, marginTop: 6, fontStyle: "italic" }}>
                        Obs: {item.obs}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#6b6b78", fontSize: 13, border: "1px dashed #2a2a30", borderRadius: 8 }}>
                Nenhum relatório enviado ainda. Eles aparecerão aqui automaticamente após o primeiro envio!
              </div>
            )}
          </div>
        )}

        {/* Botões de Ação na Base do App */}
        {tab !== "history" && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
            <button onClick={handleEnviarWhatsAppWeb} style={{ padding: "9px 20px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s", background: "#c8f564", color: "#0f0f11", border: "none" }}>
              📲 Enviar para o WhatsApp
            </button>
            
            {/* Botão de Salvar Rascunho com feedback dinâmico */}
            <button onClick={handleSalvarRascunho} style={{ 
              padding: "9px 20px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, 
              cursor: "pointer", transition: "all .15s",
              background: salvandoFeedback ? "#22c55e" : "#1e1e22", 
              color: "#f0f0f0", border: "1px solid #38383f"
            }}>
              {salvandoFeedback ? "✓ Salvo com Sucesso!" : "💾 Salvar Rascunho"}
            </button>

            <button onClick={handlePDF} style={{ padding: "9px 20px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#1e1e22", color: "#f0f0f0", border: "1px solid #38383f", transition: "all .15s" }}>
              📄 Baixar Relatório
            </button>
            <button onClick={handleLimpar} style={{ padding: "9px 16px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer", background: "transparent", color: "#6b6b78", border: "1px solid transparent", transition: "all .15s" }}>
              Limpar Tudo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}