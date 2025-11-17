import React, { useState, useEffect } from 'react';
import { FileTextIcon, SearchIcon, UserIcon, PhoneIcon, CalendarIcon, ChevronRightIcon } from '../components/icons';
import { listarEntrevistas } from '../services/apiService';
import { EntrevistaListItem } from '../types';

const AREA_COLORS: { [key: string]: string } = {
  previdenciário: "bg-green-100 text-green-800",
  trabalhista: "bg-amber-100 text-amber-800",
  cível: "bg-blue-100 text-blue-800",
  consumidor: "bg-yellow-100 text-yellow-800",
  família: "bg-pink-100 text-pink-800",
  default: "bg-gray-100 text-gray-800",
};

const Entrevistas: React.FC = () => {
  const [entrevistas, setEntrevistas] = useState<EntrevistaListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('Todas');

  useEffect(() => {
    const fetchEntrevistas = async () => {
      setIsLoading(true);
      setError(null);
      const result = await listarEntrevistas();
      if (result.success && result.data) {
        setEntrevistas(result.data.sort((a, b) => new Date(b.data_cadastro).getTime() - new Date(a.data_cadastro).getTime()));
      } else {
        setError(result.error || "Falha ao carregar entrevistas.");
      }
      setIsLoading(false);
    };
    fetchEntrevistas();
  }, []);
  
  const filteredEntrevistas = entrevistas.filter(e => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = (e.nome || '').toLowerCase().includes(lowerSearch) || (e.cpf || '').replace(/\D/g, '').includes(lowerSearch.replace(/\D/g, ''));
      const matchesArea = filterArea === 'Todas' || (e.area_juridica && e.area_juridica.toLowerCase() === filterArea.toLowerCase());
      return matchesSearch && matchesArea;
  });

  const areas = ['Todas', ...Array.from(new Set(entrevistas.map(e => e.area_juridica).filter(Boolean)))];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <FileTextIcon className="w-8 h-8 text-blue-600" />
        Entrevistas Realizadas
      </h1>
      <p className="text-slate-500 mt-1">Visualize e gerencie todas as fichas de atendimento dos seus clientes.</p>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md border">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
            {areas.map(area => (
                <button
                    key={area}
                    onClick={() => setFilterArea(area)}
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${filterArea === area ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    {area}
                </button>
            ))}
        </div>
      </div>
      
      <div className="mt-6 space-y-4">
        {isLoading && (
            <div className="text-center py-10">
                <p className="text-gray-600">Carregando entrevistas...</p>
            </div>
        )}
        {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-red-700 font-bold">Erro ao carregar:</p>
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        )}
        {!isLoading && !error && filteredEntrevistas.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm border">
                <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma entrevista encontrada.</p>
            </div>
        )}
        {!isLoading && !error && filteredEntrevistas.map((entrevista, index) => (
            <div key={entrevista.id || index} className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-green-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                           <h2 className="text-lg font-bold text-gray-800">{entrevista.nome}</h2>
                           {entrevista.area_juridica && (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${AREA_COLORS[entrevista.area_juridica.toLowerCase()] || AREA_COLORS.default}`}>
                                {entrevista.area_juridica}
                            </span>
                           )}
                        </div>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm text-gray-600">
                           <div className="flex items-center gap-2"><UserIcon className="w-4 h-4 text-gray-400" /><span>CPF: {entrevista.cpf}</span></div>
                           <div className="flex items-center gap-2"><PhoneIcon className="w-4 h-4 text-gray-400" /><span>{entrevista.telefone || 'N/A'}</span></div>
                           <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-gray-400" /><span>{new Date(entrevista.data_cadastro).toLocaleDateString('pt-BR')}</span></div>
                        </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                       <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Entrevistas;
