export type Setor = "Suporte Técnico" | "Comercial";
export const SETORES: Setor[] = ["Suporte Técnico", "Comercial"];

export const TOPICOS_POR_SETOR: Record<Setor, string[]> = {
  "Suporte Técnico": [
    "Encaminhamento de OS",
    "Abertura de OS para regularização/duplicação",
    "Cobrança aos técnicos",
    "Ativação",
    "Suporte grupo",
    "Relatório geral das OS antiga IXC",
    "Suporte atendente/setores",
    "Verificação de PDO",
    "Verificação de equipamento",
    "Viabilidades",
    "Verificação checklist",
    "Verificação fiscalização",
    "Acompanhamento de rede"
  ],
  "Comercial": [
    "Cadastro de venda",
    "Vendas",
    "Up / renovações realizado",
    "Whats",
    "Recebimentos",
    "Atendimentos abertos",
    "Conf. de Mvno",
    "Mudança de endereço",
    "Troca de titularidade em andamento",
    "Equipamento entregue em loja"
  ]
};

export type ValoresTopicos = Record<string, number>;

export interface Tecnico {
  id: string;
  nome: string;
}

export type Filial = "Corbélia" | "Cascavel";
export const FILIAIS: Filial[] = ["Corbélia", "Cascavel"];

export interface HistoricoItem {
  id: string;
  data: string;
  filial: Filial;
  setor: Setor;
  valores: ValoresTopicos;
  obs: string;
}

export function initValoresDinamico(listaTopicos: string[]): ValoresTopicos {
  const obj: ValoresTopicos = {};
  listaTopicos.forEach((t) => {
    obj[t] = 0;
  });
  return obj;
}