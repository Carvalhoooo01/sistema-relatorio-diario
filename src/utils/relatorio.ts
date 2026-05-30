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

// Nova função: Gera o arquivo do Relatório e baixa direto no computador/celular sem abrir impressora
export function exportarPDF(
  nome: string,
  filial: string,
  data: string,
  valores: ValoresTopicos,
  obs: string
) {
  const texto = gerarTextoWhatsApp(nome, filial, data, valores, obs);
  
  // Limpa os asteriscos do markdown do WhatsApp para o relatório ficar profissional
  const textoLimpo = texto.replace(/\*/g, "");

  // Constrói um documento HTML bem estruturado e com design moderno
  const conteudoHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório Diário - ${data.replace(/\//g, "-")}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          background: #f4f4f7; 
          color: #1a1a1e; 
          margin: 0; 
          padding: 40px 20px; 
          display: flex; 
          justify-content: center; 
        }
        .container { 
          background: #ffffff; 
          width: 100%; 
          max-width: 600px; 
          padding: 32px; 
          border-radius: 12px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
        }
        pre { 
          font-family: 'Courier New', Courier, monospace; 
          font-size: 14px; 
          line-height: 1.6; 
          white-space: pre-wrap; 
          background: #17171a; 
          color: #f0f0f0; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 0;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <pre>${textoLimpo}</pre>
      </div>
    </body>
    </html>
  `;

  // Cria um arquivo virtual (Blob) contendo o relatório
  const blob = new Blob([conteudoHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  // Cria um gatilho de download invisível e clica nele automaticamente
  const linkDescarga = document.createElement("a");
  linkDescarga.href = url;
  
  // Define o nome do arquivo baixado (Ex: relatorio_30-05-2026.html)
  const dataArquivo = data.replace(/\//g, "-");
  linkDescarga.download = `relatorio_${dataArquivo}.html`;
  
  // Simula o clique e limpa a memória do navegador
  document.body.appendChild(linkDescarga);
  linkDescarga.click();
  document.body.removeChild(linkDescarga);
  URL.revokeObjectURL(url);
}