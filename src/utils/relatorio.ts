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

// Função Atualizada: Gera e baixa um arquivo .PDF real de forma direta e invisível
export function exportarPDF(
  nome: string,
  filial: string,
  data: string,
  valores: ValoresTopicos,
  obs: string
) {
  const texto = gerarTextoWhatsApp(nome, filial, data, valores, obs);
  
  // Limpa os asteriscos e underlines da formatação do WhatsApp para o PDF ficar limpo
  const textoLimpo = texto.replace(/[\*_]/g, "");

  // Criamos uma janela oculta temporária para processar o jsPDF via CDN de forma segura
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const docIframe = iframe.contentWindow?.document || iframe.contentDocument;
  if (!docIframe) return;

  // Injeta o script do jsPDF e faz a montagem direta do arquivo PDF
  const dataArquivo = data.replace(/\//g, "-");
  
  docIframe.write(`
    <html>
    <head>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    </head>
    <body>
      <script>
        window.onload = function() {
          const { jsPDF } = window.jspdf;
          // Cria o documento PDF em formato A4
          const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
          });

          // Configurações de estilo do PDF
          doc.setBackgroundColor("#17171a");
          doc.setFont("courier", "normal");
          doc.setFontSize(11);
          doc.setTextColor(40, 40, 45); // Cor cinza escura profissional

          // Margens e espaçamento do texto
          const xMargin = 15;
          let yMargin = 20;
          const linhas = doc.splitTextToSize(\`${textoLimpo}\`, 180);

          // Renderiza o texto no arquivo
          linhas.forEach(linha => {
            if (yMargin > 280) { // Cria uma nova página se o texto for muito longo
              doc.addPage();
              yMargin = 20;
            }
            doc.text(linha, xMargin, yMargin);
            yMargin += 6;
          });

          // Força o download direto do arquivo .pdf real
          doc.save("relatorio_${dataArquivo}.pdf");

          // Remove o iframe temporário da tela
          setTimeout(() => {
            window.parent.document.body.removeChild(window.frameElement);
          }, 100);
        };
      </script>
    </body>
    </html>
  `);
  docIframe.close();
}