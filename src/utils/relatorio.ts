import { jsPDF } from "jspdf";
import { TOPICOS, ValoresTopicos } from "../data/topicos";

export function gerarTextoWhatsApp(
  nome: string,
  filial: string,
  data: string,
  valores: ValoresTopicos,
  obs: string
): string {
  const total = TOPICOS.reduce((s, t) => s + valores[t], 0);

  const ativos = TOPICOS.filter((t) => valores[t] > 0);
  const inativos = TOPICOS.filter((t) => valores[t] === 0);

  const linhasAtivos = ativos
    .map((t) => `  ✅ ${t}: *${valores[t]}*`)
    .join("\n");

  const linhasInativos = inativos
    .map((t) => `  ▫️ ${t}: 0`)
    .join("\n");

  const deVolta = [
    `━━━━━━━━━━━━━━━━━━━━`,
    `📋 *RELATÓRIO DIÁRIO*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `👤 *${nome}*`, 
    `🏢 *Filial:* ${filial}`,
    `📅 *Data:* ${data}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📌 *ATIVIDADES REALIZADAS*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    ativos.length > 0 ? linhasAtivos : `  _Nenhuma atividade registrada_`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📭 *SEM OCORRÊNCIAS*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    linhasInativos,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📊 *RESUMO GERAL*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🚀 Total de Atividades: *${total}*`,
  ];

  if (obs.trim()) {
    deVolta.push(
      ``,
      `━━━━━━━━━━━━━━━━━━━━`,
      `💬 *OBSERVAÇÕES*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `_${obs.trim()}_`
    );
  }

  return deVolta.join("\n");
}

// Função de Exportação que usa o pacote instalado via npm (Sem depender de HTML externo)
export function exportarPDF(
  nome: string,
  filial: string,
  data: string,
  valores: ValoresTopicos,
  obs: string
) {
  const texto = gerarTextoWhatsApp(nome, filial, data, valores, obs);
  const textoLimpo = texto.replace(/[\*_]/g, "");

  try {
    // Instancia o gerador local do jsPDF importado no topo do arquivo
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Configuração de fontes nativas do PDF
    doc.setFont("courier", "normal");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 35);

    const xMargin = 15;
    let yMargin = 20;
    
    // Formata o texto para quebrar linhas e caber na página A4 corretamente
    const linhas = doc.splitTextToSize(textoLimpo, 180);

    linhas.forEach((linha: string) => {
      if (yMargin > 275) {
        doc.addPage();
        yMargin = 20;
      }
      doc.text(linha, xMargin, yMargin);
      yMargin += 6;
    });

    // Executa o download direto do arquivo .pdf real
    const dataArquivo = data.replace(/\//g, "-");
    doc.save(`relatorio_${dataArquivo}.pdf`);
    
  } catch (error) {
    console.error("Erro ao gerar o PDF:", error);
    alert("Ocorreu um erro interno ao gerar o arquivo PDF.");
  }
}