import { jsPDF } from "jspdf";
import { TOPICOS_POR_SETOR, ValoresTopicos, Setor } from "../data/topicos";

export function gerarTextoWhatsApp(
  nome: string,
  filial: string,
  data: string,
  valores: ValoresTopicos,
  obs: string,
  setor: Setor = "Suporte Técnico" // Fallback seguro caso o setor não venha informado
): string {
  const topicosDoSetor = TOPICOS_POR_SETOR[setor] || [];
  
  // Tipando explicitamente o acumulador (s) e o item (t) como string
  const total = topicosDoSetor.reduce((s: number, t: string) => s + (valores[t] || 0), 0);
  const ativos = topicosDoSetor.filter((t: string) => (valores[t] || 0) > 0);
  const inativos = topicosDoSetor.filter((t: string) => (valores[t] || 0) === 0);

  const linhasAtivos = ativos
    .map((t: string) => `  ✅ ${t}: *${valores[t]}*`)
    .join("\n");

  const linhasInativos = inativos
    .map((t: string) => `  ▫️ ${t}: 0`)
    .join("\n");

  const deVolta = [
    `━━━━━━━━━━━━━━━━━━━━`,
    `📋 *RELATÓRIO DIÁRIO - ${setor.toUpperCase()}*`,
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

export function exportarPDF(
  nome: string,
  filial: string,
  data: string,
  valores: ValoresTopicos,
  obs: string,
  setor: Setor = "Suporte Técnico"
) {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const topicosDoSetor = TOPICOS_POR_SETOR[setor] || [];
    const total = topicosDoSetor.reduce((s: number, t: string) => s + (valores[t] || 0), 0);
    const ativos = topicosDoSetor.filter((t: string) => (valores[t] || 0) > 0);
    const inativos = topicosDoSetor.filter((t: string) => (valores[t] || 0) === 0);

    let y = 20;

    // 1. TÍTULO DO RELATÓRIO
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text(`RELATÓRIO DIÁRIO DE ATIVIDADES`, 15, y);
    
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);

    // 2. INFORMAÇÕES GERAIS
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("COLABORADOR:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(nome, 50, y);

    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("SETOR:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(setor, 50, y);

    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("FILIAL / DATA:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${filial}  -  ${data}`, 50, y);

    // 3. SEÇÃO: ATIVIDADES REALIZADAS
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(40, 160, 40);
    doc.text("ATIVIDADES REALIZADAS", 15, y);
    
    y += 3;
    doc.setDrawColor(220, 220, 220);
    doc.line(15, y, 195, y);
    
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);

    if (ativos.length > 0) {
      ativos.forEach((topico: string) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`[ X ]  ${topico}:`, 18, y);
        doc.setFont("helvetica", "bold");
        doc.text(`${valores[topico]}`, 175, y, { align: "right" });
        doc.setFont("helvetica", "normal");
        y += 7;
      });
    } else {
      doc.text("Nenhuma atividade registrada no período.", 18, y);
      y += 7;
    }

    // 4. SEÇÃO: SEM OCORRÊNCIAS
    y += 8;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(100, 100, 110);
    doc.text("SEM OCORRÊNCIAS", 15, y);
    
    y += 3;
    doc.line(15, y, 195, y);
    
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);

    inativos.forEach((topico: string) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`[ - ]  ${topico}: 0`, 18, y);
      y += 6;
    });

    // 5. SEÇÃO: RESUMO GERAL
    y += 10;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("RESUMO GERAL", 15, y);
    
    y += 3;
    doc.setDrawColor(150, 150, 150);
    doc.line(15, y, 195, y);
    
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total de Atividades Concluídas:", 15, y);
    doc.text(`${total}`, 175, y, { align: "right" });

    // 6. SEÇÃO: OBSERVAÇÕES
    if (obs.trim()) {
      y += 15;
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("OBSERVAÇÕES GERAIS", 15, y);
      
      y += 3;
      doc.setDrawColor(220, 220, 220);
      doc.line(15, y, 195, y);
      
      y += 8;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      
      const linhasObs = doc.splitTextToSize(obs.trim(), 175);
      linhasObs.forEach((linha: string) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(linha, 18, y);
        y += 6;
      });
    }

    const dataArquivo = data.replace(/\//g, "-");
    doc.save(`relatorio_${dataArquivo}.pdf`);
    
  } catch (error) {
    console.error("Erro ao gerar o PDF:", error);
    alert("Ocorreu um erro ao estruturar o arquivo PDF.");
  }
}