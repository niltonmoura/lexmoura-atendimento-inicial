import React, { useState } from 'react';
import { ClientFormData, MembroFamiliar, GeneratedFile, ProgressState } from '../types';
import { DOCUMENTOS_CONFIG } from '../config';
import * as api from '../services/apiService';
import Input, { Textarea } from '../components/Input';
import Modal from '../components/Modal';
import { PlusIcon, XIcon, CheckCircle, ShieldIcon } from '../components/icons';


const initialFormData: ClientFormData = {
  nome: '', cpf: '', rg: '', dataNascimento: '', estadoCivil: '', profissao: '', email: '', telefone: '',
  nomeMae: '', cpfMae: '', rgMae: '', dataNascimentoMae: '', profissaoMae: '', estadoCivilMae: '',
  cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: 'Fortaleza', uf: 'CE', pontoReferencia: '', temComprovanteEndereco: false,
  temRepresentante: false, maeERepresentante: false,
  repNome: '', repCpf: '', repRg: '', repDataNascimento: '', repGrauParentesco: '', repEstadoCivil: '', repProfissao: '',
  informarComposicaoFamiliar: false,
  composicaoFamiliar: [{ nome: '', grauParentesco: 'Titular', dataNascimento: '', renda: '0,00' }],
  clienteAnalfabeto: false,
  testemunha1Nome: '', testemunha1Cpf: '', testemunha1Rg: '',
  testemunha2Nome: '', testemunha2Cpf: '', testemunha2Rg: '',
  parteContrariaCnpj: '29.979.036/0001-40', parteContrariaNome: 'INSS - Instituto Nacional do Seguro Social',
  parteContrariaRazaoSocial: 'Instituto Nacional do Seguro Social', parteContrariaCep: '60035-150',
  parteContrariaEndereco: 'Rua Pedro Pereira, 383', parteContrariaNumero: '', parteContrariaBairro: 'Centro',
  parteContrariaCidade: 'Fortaleza', parteContrariaUf: 'CE',
  beneficioRequerido: 'BPC/LOAS para idoso', viaProcesso: 'Administrativa', der: '', nb: '', numCadUnico: '',
  rendaFamiliarTotal: '', motivoIndeferimento: '',
  areaJuridica: 'Previdenciário',
};


const PortalPrevidenciario: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dados-pessoais');
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({});

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({ message: '', percentage: 0 });
  const [results, setResults] = useState<GeneratedFile[]>([]);
  const [error, setError] = useState<string>('');
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
        ...prev,
        [id]: isCheckbox ? checked : value
    }));
  };

  const handleMembroFamiliarChange = (index: number, field: keyof MembroFamiliar, value: string) => {
    const updatedComposicao = [...formData.composicaoFamiliar];
    updatedComposicao[index] = { ...updatedComposicao[index], [field]: value };
    setFormData(prev => ({ ...prev, composicaoFamiliar: updatedComposicao }));
  };
  
  const addMembroFamiliar = () => {
    setFormData(prev => ({
        ...prev,
        composicaoFamiliar: [...prev.composicaoFamiliar, { nome: '', grauParentesco: '', dataNascimento: '', renda: '' }]
    }));
  };
  
  const removeMembroFamiliar = (index: number) => {
    if (index === 0) return; // Não remover o titular
    setFormData(prev => ({
        ...prev,
        composicaoFamiliar: prev.composicaoFamiliar.filter((_, i) => i !== index)
    }));
  };

  const handleDocSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setSelectedDocs(prev => ({ ...prev, [id]: checked }));
  };
  
  const resetApp = () => {
    setFormData(initialFormData);
    setSelectedDocs({});
    setResults([]);
    setError('');
    setIsResultModalOpen(false);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const docsToGenerate = DOCUMENTOS_CONFIG.filter(doc => selectedDocs[doc.id]);
    if (docsToGenerate.length === 0) {
        alert("Por favor, selecione ao menos um documento para gerar.");
        return;
    }
    
    setIsProcessing(true);
    setResults([]);
    setError('');
    setProgress({ message: 'Iniciando processo...', percentage: 0 });

    if (!api.isBackendConfigured()) {
        setError('A URL do backend não foi configurada. Por favor, edite o arquivo config.ts.');
        setIsProcessing(false);
        return;
    }
    
    setProgress({ message: 'Criando pasta do cliente no Google Drive...', percentage: 10 });
    const pastaResult = await api.criarPastaCliente(formData.nome, formData.cpf);
    
    if (!pastaResult.success || !pastaResult.data?.folderId) {
      setError(`Falha ao criar pasta do cliente: ${pastaResult.error || 'Erro desconhecido'}`);
      setIsProcessing(false);
      return;
    }
    const folderId = pastaResult.data.folderId;
    const totalSteps = docsToGenerate.length + 1;
    let completedSteps = 0;

    const generatedFiles: GeneratedFile[] = [];
    for (const doc of docsToGenerate) {
      const percentage = 10 + Math.round(((completedSteps + 1) / totalSteps) * 80);
      setProgress({ message: `Gerando ${doc.label}...`, percentage });
      
      const docResult = await api.gerarDocumento(doc.templateId, folderId, `${doc.label} - ${formData.nome}`, formData);
      
      if (docResult.success && docResult.data?.pdfUrl) {
        generatedFiles.push({ name: doc.label, url: docResult.data.pdfUrl });
      } else {
        generatedFiles.push({ name: doc.label, url: null, error: `Falha ao gerar: ${docResult.error || 'Erro desconhecido'}` });
      }
      completedSteps++;
    }

    setProgress({ message: 'Registrando atendimento na planilha...', percentage: 95 });
    await api.logEntrevista({
      nome: formData.nome,
      cpf: formData.cpf,
      area_juridica: formData.areaJuridica,
    });

    setProgress({ message: 'Processo concluído!', percentage: 100 });
    setResults(generatedFiles);
    setIsProcessing(false);
    setIsResultModalOpen(true);
  };


  const TabButton: React.FC<{ id: string; label: string; }> = ({ id, label }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
    >
      {label}
    </button>
  );

  return (
    <>
        <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg">
                <ShieldIcon className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                Atendimento Previdenciário
                </h1>
                <p className="text-gray-600">
                Ficha de atendimento completa para casos previdenciários.
                </p>
            </div>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="sticky top-20 md:top-4 bg-white/80 backdrop-blur-sm z-10 py-2 px-2 mb-6 border rounded-lg flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <TabButton id="dados-pessoais" label="1. Dados Pessoais" />
                    <TabButton id="parte-contraria" label="2. Parte Contrária" />
                    <TabButton id="dados-acao" label="3. Dados da Ação" />
                    <TabButton id="gerar-documentos" label="4. Gerar Documentos" />
                </div>
                <button type="submit" disabled={isProcessing} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-wait transition-all flex items-center justify-center">
                    {isProcessing ? 'Processando...' : 'Salvar e Gerar Docs'}
                </button>
            </div>

            <div className="space-y-8">
                {activeTab === 'dados-pessoais' && (
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                        <h3 className="text-lg font-semibold border-b pb-2">Qualificação do Segurado</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <Input label="Nome Completo" id="nome" value={formData.nome} onChange={handleChange} required />
                          <Input label="CPF" id="cpf" value={formData.cpf} onChange={handleChange} required />
                          <Input label="RG" id="rg" value={formData.rg} onChange={handleChange} />
                          <Input label="Data de Nascimento" id="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} />
                          <Input label="Estado Civil" id="estadoCivil" value={formData.estadoCivil} onChange={handleChange} />
                           <Input label="Profissão" id="profissao" value={formData.profissao} onChange={handleChange} />
                          <Input label="E-mail" id="email" type="email" value={formData.email} onChange={handleChange} />
                          <Input label="Telefone/WhatsApp" id="telefone" type="tel" value={formData.telefone} onChange={handleChange} />
                        </div>

                         <h3 className="text-lg font-semibold border-b pb-2 pt-4">Dados da Mãe</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input label="Nome da Mãe" id="nomeMae" value={formData.nomeMae} onChange={handleChange} />
                            <Input label="CPF da Mãe" id="cpfMae" value={formData.cpfMae} onChange={handleChange} />
                            <Input label="RG da Mãe" id="rgMae" value={formData.rgMae} onChange={handleChange} />
                            <Input label="Data de Nascimento da Mãe" id="dataNascimentoMae" type="date" value={formData.dataNascimentoMae} onChange={handleChange} />
                            <Input label="Profissão da Mãe" id="profissaoMae" value={formData.profissaoMae} onChange={handleChange} />
                            <Input label="Estado Civil da Mãe" id="estadoCivilMae" value={formData.estadoCivilMae} onChange={handleChange} />
                         </div>

                        <h3 className="text-lg font-semibold border-b pb-2 pt-4">Endereço do Segurado</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="CEP" id="cep" value={formData.cep} onChange={handleChange} />
                            <Input label="Endereço" id="endereco" value={formData.endereco} className="md:col-span-2" />
                            <Input label="Número" id="numero" value={formData.numero} onChange={handleChange} />
                            <Input label="Complemento" id="complemento" value={formData.complemento} onChange={handleChange} />
                             <Input label="Bairro" id="bairro" value={formData.bairro} onChange={handleChange} />
                            <Input label="Cidade" id="cidade" value={formData.cidade} onChange={handleChange} />
                            <Input label="UF" id="uf" value={formData.uf} onChange={handleChange} maxLength={2} />
                            <div className="flex items-center gap-2 mt-auto">
                                <input type="checkbox" id="temComprovanteEndereco" checked={formData.temComprovanteEndereco} onChange={handleChange} className="h-4 w-4" />
                                <label htmlFor="temComprovanteEndereco">Tem comprovante de endereço</label>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold border-b pb-2 pt-4">Representação e Composição Familiar</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                               <div className="flex items-center gap-2">
                                  <input type="checkbox" id="temRepresentante" checked={formData.temRepresentante} onChange={handleChange} className="h-4 w-4" />
                                  <label htmlFor="temRepresentante">Cliente é representado?</label>
                               </div>
                               <div className="flex items-center gap-2">
                                  <input type="checkbox" id="maeERepresentante" checked={formData.maeERepresentante} onChange={handleChange} className="h-4 w-4" />
                                  <label htmlFor="maeERepresentante">A mãe é a representante legal</label>
                               </div>
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" id="informarComposicaoFamiliar" checked={formData.informarComposicaoFamiliar} onChange={handleChange} className="h-4 w-4" />
                                  <label htmlFor="informarComposicaoFamiliar">Informar composição familiar?</label>
                               </div>
                            </div>
                            
                            {formData.informarComposicaoFamiliar && (
                                <div className="p-4 bg-slate-50 border rounded-lg space-y-3">
                                    <h4 className="font-semibold">Membros da Família</h4>
                                    {formData.composicaoFamiliar.map((membro, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-2 border-b">
                                            <Input label="Nome Completo" id={`membro-nome-${index}`} value={membro.nome} onChange={e => handleMembroFamiliarChange(index, 'nome', e.target.value)} disabled={index === 0} />
                                            <Input label="Grau Parentesco" id={`membro-grau-${index}`} value={membro.grauParentesco} onChange={e => handleMembroFamiliarChange(index, 'grauParentesco', e.target.value)} disabled={index === 0} />
                                            <Input label="Nascimento" id={`membro-nasc-${index}`} type="date" value={membro.dataNascimento} onChange={e => handleMembroFamiliarChange(index, 'dataNascimento', e.target.value)} />
                                            <div className="flex items-center gap-2">
                                                <Input label="Renda (R$)" id={`membro-renda-${index}`} value={membro.renda} onChange={e => handleMembroFamiliarChange(index, 'renda', e.target.value)} />
                                                {index > 0 && (
                                                    <button type="button" onClick={() => removeMembroFamiliar(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full h-10 w-10 mb-1">
                                                        <XIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addMembroFamiliar} className="mt-2 text-sm text-blue-600 font-semibold flex items-center gap-1"><PlusIcon className="w-4 h-4"/> Adicionar Membro</button>
                                </div>
                            )}

                        </div>
                    </div>
                )}
                {activeTab === 'parte-contraria' && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold border-b pb-2">Parte Contrária</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                           <Input label="CNPJ/CPF" id="parteContrariaCnpj" value={formData.parteContrariaCnpj} onChange={handleChange} />
                           <Input label="Nome/Razão Social" id="parteContrariaNome" value={formData.parteContrariaNome} onChange={handleChange} />
                           {/* ... outros campos ... */}
                        </div>
                    </div>
                )}
                 {activeTab === 'dados-acao' && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                         <h3 className="text-lg font-semibold border-b pb-2">Dados da Ação</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            <Input label="Benefício Requerido" id="beneficioRequerido" value={formData.beneficioRequerido} onChange={handleChange} />
                            <Input label="Via do Processo" id="viaProcesso" value={formData.viaProcesso} onChange={handleChange} />
                            <Input label="DER" id="der" type="date" value={formData.der} onChange={handleChange} />
                            <Input label="Nº Benefício" id="nb" value={formData.nb} onChange={handleChange} />
                            <Input label="Nº CadÚnico" id="numCadUnico" value={formData.numCadUnico} onChange={handleChange} />
                            <Input label="Renda Familiar Total" id="rendaFamiliarTotal" value={formData.rendaFamiliarTotal} onChange={handleChange} />
                         </div>
                         <div className="mt-4">
                            <Textarea label="Motivo do Indeferimento" id="motivoIndeferimento" value={formData.motivoIndeferimento} onChange={handleChange} />
                         </div>
                    </div>
                )}
                 {activeTab === 'gerar-documentos' && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold border-b pb-2">Documentos a Gerar</h3>
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {DOCUMENTOS_CONFIG.map(doc => (
                                <div key={doc.id} className="relative flex items-start p-2 border rounded-lg hover:bg-slate-50">
                                    <div className="flex items-center h-5">
                                        <input
                                        id={doc.id}
                                        type="checkbox"
                                        onChange={handleDocSelectionChange}
                                        checked={!!selectedDocs[doc.id]}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor={doc.id} className="font-medium text-gray-700 cursor-pointer">{doc.label}</label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </form>

        <Modal isOpen={isProcessing} onClose={() => {}} title="Gerando Documentação" hideCloseButton>
            <div className="p-6 text-center">
                <p className="text-lg text-gray-700 mb-4">{progress.message}</p>
                <div className="w-full bg-gray-200 rounded-full h-4"><div className="bg-blue-600 h-4 rounded-full transition-all duration-500" style={{ width: `${progress.percentage}%` }}></div></div>
                <p className="text-sm font-bold text-blue-600 mt-2">{progress.percentage}%</p>
            </div>
        </Modal>

        <Modal isOpen={isResultModalOpen} onClose={resetApp} title="Processo Concluído">
            <div className="p-6">
                <div className="flex items-center gap-3 bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">Documentação gerada com sucesso!</h3>
                </div>
                <ul className="space-y-3">
                    {results.map((file, index) => (
                    <li key={index} className="p-3 bg-slate-50 border rounded-md">
                        <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{file.name}</span>
                        {file.url ? (
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-md hover:bg-green-600 transition-colors">
                            Abrir PDF
                            </a>
                        ) : (
                            <span className="text-sm text-red-500 font-semibold">Falhou</span>
                        )}
                        </div>
                        {file.error && <p className="text-xs text-red-600 mt-1 pl-1">{file.error}</p>}
                    </li>
                    ))}
                </ul>
                <div className="mt-6 text-center">
                    <button onClick={resetApp} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    Iniciar Novo Atendimento
                    </button>
                </div>
            </div>
        </Modal>

        <Modal isOpen={!!error} onClose={() => setError('')} title="Ocorreu um Erro">
            <div className="p-6"><p className="text-red-600 bg-red-50 p-4 rounded-md">{error}</p></div>
        </Modal>

    </>
  );
};

export default PortalPrevidenciario;
