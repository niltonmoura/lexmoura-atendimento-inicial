import React from 'react';
import { ShieldIcon, BriefcaseIcon, FileTextIcon, CalendarIcon, FolderGit2Icon, BookOpenIcon, ChevronRightIcon, CheckCircle } from '../components/icons';

const QuickActionCard: React.FC<{ href: string; icon: React.ElementType; title: string; description: string; primary?: boolean }> = ({ href, icon: Icon, title, description, primary = false }) => (
  <a href={href} className={`block p-4 rounded-lg transition-all hover:shadow-lg ${primary ? "bg-blue-50 border-2 border-blue-500" : "bg-white border"}`}>
    <div className="flex items-center gap-4">
      <div className={`${primary ? "bg-blue-600" : "bg-slate-100"} p-3 rounded-lg`}>
        <Icon className={`w-5 h-5 ${primary ? "text-white" : "text-slate-600"}`} />
      </div>
      <div>
        <h3 className={`font-semibold ${primary ? "text-blue-900" : "text-slate-800"}`}>{title}</h3>
        <p className={`text-sm ${primary ? "text-blue-700" : "text-slate-600"}`}>{description}</p>
      </div>
      <ChevronRightIcon className={`ml-auto w-5 h-5 ${primary ? "text-blue-600" : "text-slate-400"}`} />
    </div>
  </a>
);

const ToolCard: React.FC<{ href: string; icon: React.ElementType; title: string; description: string; }> = ({ href, icon: Icon, title, description }) => (
    <a href={href} className="block bg-white p-6 rounded-lg border hover:shadow-md transition-all">
        <div className="flex items-center gap-4">
            <div className="bg-sky-100 p-4 rounded-lg">
                <Icon className="w-8 h-8 text-sky-600" />
            </div>
            <div>
                <h3 className="font-semibold text-lg text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600">{description}</p>
            </div>
        </div>
    </a>
);


const Home: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">Fonteles & Moura Advocacia</h1>
        <p className="text-lg text-slate-600">Sistema de Gestão Jurídica</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg border">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard 
                href="#portal-previdenciario"
                icon={ShieldIcon}
                title="Previdenciário"
                description="Nova ficha previdenciária"
                primary
            />
             <QuickActionCard 
                href="#portal-trabalhista"
                icon={BriefcaseIcon}
                title="Trabalhista"
                description="Nova ficha trabalhista"
            />
            <QuickActionCard 
                href="#entrevistas"
                icon={FileTextIcon}
                title="Ver Entrevistas"
                description="Acessar fichas de clientes"
            />
             <QuickActionCard 
                href="#visitas"
                icon={CalendarIcon}
                title="Visitas Agendadas"
                description="Controle de visitas"
            />
        </div>
      </div>

      {/* Ferramentas */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Ferramentas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToolCard 
                href="#gestor-documentos"
                icon={FolderGit2Icon}
                title="Gestor de Documentos & Tags"
                description="Templates e banco de tags unificados"
            />
            <ToolCard 
                href="#observacoes"
                icon={BookOpenIcon}
                title="Observações"
                description="Anotações importantes"
            />
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-blue-300 p-6 rounded-lg">
          <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Sistema Ativo</h3>
                <p className="text-sm text-blue-700">Sistema de gestão focado em Direito Previdenciário e Trabalhista. Integração com Google Drive ativa.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Home;
