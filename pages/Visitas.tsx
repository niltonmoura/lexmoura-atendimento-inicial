import React, { useState, useEffect } from 'react';
import { CalendarIcon, PlusIcon, NavigationIcon, MoreVerticalIcon, UserIcon } from '../components/icons';
import { listarVisitas } from '../services/apiService';
import { VisitaListItem } from '../types';

const Visitas: React.FC = () => {
    const [visitas, setVisitas] = useState<VisitaListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVisitas = async () => {
            setIsLoading(true);
            setError(null);
            const result = await listarVisitas();
            if (result.success && result.data) {
                setVisitas(result.data);
            } else {
                setError(result.error || "Falha ao carregar visitas. Verifique se a aba 'Visitas' existe na sua planilha.");
            }
            setIsLoading(false);
        };
        fetchVisitas();
    }, []);

    const stats = {
        agendadas: visitas.filter(v => v.status === 'agendada').length,
        concluidas: visitas.filter(v => v.status === 'concluida').length,
        naoConcluidas: visitas.filter(v => v.status === 'não concluida').length,
    };

    const visitasPorBairro = visitas.reduce((acc, visita) => {
        const bairro = visita.bairro || 'Sem bairro definido';
        if (!acc[bairro]) acc[bairro] = [];
        acc[bairro].push(visita);
        return acc;
    }, {} as Record<string, VisitaListItem[]>);

    const bairros = Object.keys(visitasPorBairro).sort();

  return (
    <div>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <CalendarIcon className="w-8 h-8 text-blue-600" />
                    Controle de Visitas
                </h1>
                <p className="text-slate-500 mt-1">Organize suas visitas semanais com rotas inteligentes.</p>
            </div>
            <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700">
                    <NavigationIcon className="w-4 h-4 inline mr-2"/> Gerar Rota
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                    <PlusIcon className="w-4 h-4 inline mr-2"/> Nova Visita
                </button>
            </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                <p className="text-2xl font-bold text-blue-700">{stats.agendadas}</p>
                <p className="text-sm text-blue-600">Agendadas</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                <p className="text-2xl font-bold text-green-700">{stats.concluidas}</p>
                <p className="text-sm text-green-600">Concluídas</p>
            </div>
             <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                <p className="text-2xl font-bold text-red-700">{stats.naoConcluidas}</p>
                <p className="text-sm text-red-600">Não Concluídas</p>
            </div>
             <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                <p className="text-2xl font-bold text-purple-700">{bairros.length}</p>
                <p className="text-sm text-purple-600">Bairros</p>
            </div>
        </div>

        <div className="mt-6 space-y-6">
            {isLoading && <p className="text-center text-gray-600">Carregando visitas...</p>}
            {error && <p className="text-center text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}
            {!isLoading && !error && bairros.length === 0 && (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm border">
                    <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhuma visita encontrada.</p>
                </div>
            )}

            {bairros.map(bairro => (
                <div key={bairro}>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">{bairro} ({visitasPorBairro[bairro].length})</h2>
                    <div className="space-y-3">
                    {visitasPorBairro[bairro].map((visita, index) => (
                        <div key={visita.id || index} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${visita.status === 'agendada' ? 'border-blue-500' : visita.status === 'concluida' ? 'border-green-500 opacity-70' : 'border-red-500 opacity-70'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className={`font-bold text-lg ${visita.status !== 'agendada' ? 'line-through' : 'text-gray-800'}`}>{visita.nome}</p>
                                    <p className="text-sm text-gray-500">{visita.endereco}</p>
                                    <p className="text-sm text-gray-500">{visita.telefone}</p>
                                    <p className="text-sm font-semibold text-gray-700 mt-1">{new Date(visita.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} às {visita.hora}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                     {visita.status === 'agendada' && <button className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">Entrevista</button>}
                                     <button className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">Editar</button>
                                     <button className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full">Navegar</button>
                                     <button className="p-1"><MoreVerticalIcon className="w-5 h-5 text-gray-500"/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Visitas;
