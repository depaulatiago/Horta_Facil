export type Horta = {
  id: number;
  nome: string;
  responsavelId?: number | null;
  localizacao?: string | null;
  areaTotal?: number | null;
  consumoAguaEstimado?: number | null;
};

export type Hortalica = {
  id: number;
  nome: string;
  tipoPlantio: 'mudas' | 'direta';
  cicloDesenvolvimento: number;
  cicloColheita: number;
  cicloLimpeza: number;
  espacamentoLinhas: number;
  espacamentoPlantas: number;
  produtividadeEsperada: number;
  areaModulo: number;
  periodicidade: number;
};

export type Cultivo = {
  id: number;
  hortaId: number;
  hortalicaId: number;
  dataInicio: string;
  producaoSemanalDesejada: number;
  numModulos: number;
  areaTotalHortalica?: number | null;
};

export type Colheita = {
  id: number;
  cultivoId?: number | null;
  data: string;
  quantidadeColhida: number;
};

export type Relatorio = {
  id: number;
  hortaId: number;
  data: string;
  totalProduzidoPlanejado: number;
  totalColhidoReal: number;
  eficiencia?: number | null;
};
