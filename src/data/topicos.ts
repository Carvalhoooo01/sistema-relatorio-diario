export const TOPICOS = [
  "Encaminhamento de OS",
  "Relatório geral das OS antiga IXC",
  "Cobrança aos técnicos",
  "Ativação",
  "Suporte grupo",
  "Verificação de PDO",
  "Verificação de equipamento",
  "Verificação de checklist",
  "Suporte atendente/setores",
  "Viabilidades",
  "Acompanhamento fiscalização",
  "Verificação de rede",
  "Abertura de OS para regularização/duplicação",
] as const;

export type Topico = (typeof TOPICOS)[number];

export interface Tecnico {
  id: string;
  nome: string;
}

export const TECNICOS: Tecnico[] = [
  { id: "gustavo", nome: "Gustavo Carvalho" },
  // Adicione mais técnicos aqui futuramente
];

export const FILIAIS = ["Corbélia", "Cafelândia"] as const;
export type Filial = (typeof FILIAIS)[number];

export type ValoresTopicos = Record<Topico, number>;

export const initValores = (): ValoresTopicos =>
  Object.fromEntries(TOPICOS.map((t) => [t, 0])) as ValoresTopicos;

// Adicione isso no final do arquivo src/data/topicos.ts
export interface HistoricoItem {
  id: string;       // Um identificador único (pode ser um timestamp)
  data: string;     // Data do relatório
  filial: Filial;   // Filial selecionada
  valores: ValoresTopicos; // Quantidade de cada tópico lançado
  obs: string;      // Observações gerais daquele dia
}
