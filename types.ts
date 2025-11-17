export interface MembroFamiliar {
  nome: string;
  grauParentesco: string;
  dataNascimento: string;
  renda: string;
}

export interface ClientFormData {
  // Etapa 1: Dados Pessoais
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  estadoCivil: string;
  profissao: string;
  email: string;
  telefone: string;
  
  // Dados da Mãe (seção específica)
  nomeMae: string;
  cpfMae: string;
  rgMae: string;
  dataNascimentoMae: string;
  profissaoMae: string;
  estadoCivilMae: string;

  // Endereço
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  pontoReferencia: string;
  temComprovanteEndereco: boolean;
  
  // Representação
  temRepresentante: boolean;
  maeERepresentante: boolean;
  repNome: string;
  repCpf: string;
  repRg: string;
  repDataNascimento: string;
  repGrauParentesco: string;
  repEstadoCivil: string;
  repProfissao: string;
  
  // Composição Familiar
  informarComposicaoFamiliar: boolean;
  composicaoFamiliar: MembroFamiliar[];
  
  // Testemunhas (para analfabeto)
  clienteAnalfabeto: boolean;
  testemunha1Nome: string;
  testemunha1Cpf: string;
  testemunha1Rg: string;
  testemunha2Nome: string;
  testemunha2Cpf: string;
  testemunha2Rg: string;

  // Etapa 2: Parte Contrária
  parteContrariaCnpj: string;
  parteContrariaNome: string;
  parteContrariaRazaoSocial: string;
  parteContrariaCep: string;
  parteContrariaEndereco: string;
  parteContrariaNumero: string;
  parteContrariaBairro: string;
  parteContrariaCidade: string;
  parteContrariaUf: string;

  // Etapa 3: Dados da Ação
  beneficioRequerido: string;
  viaProcesso: string;
  der: string; // Data de Entrada do Requerimento
  nb: string;  // Número do Benefício
  numCadUnico: string;
  rendaFamiliarTotal: string;
  motivoIndeferimento: string;

  // Outros
  areaJuridica: 'Previdenciário' | 'Trabalhista' | 'Outra';
  resumoCaso?: string; // Adicionado para manter compatibilidade com o log
}

export interface DocumentoSelecionado {
  id: string;
  label: string;
  templateId: string;
}

export interface GeneratedFile {
  name: string;
  url: string | null;
  error?: string;
}

export interface ProgressState {
  message: string;
  percentage: number;
}

export interface EntrevistaListItem {
    id: string;
    nome: string;
    cpf: string;
    area_juridica: string;
    data_cadastro: string;
    [key: string]: any; 
}

export interface VisitaListItem {
    id: string;
    nome: string;
    telefone: string;
    endereco: string;
    bairro: string;
    cidade: string;
    data: string;
    hora: string;
    status: 'agendada' | 'concluida' | 'não concluida';
    [key: string]: any;
}
