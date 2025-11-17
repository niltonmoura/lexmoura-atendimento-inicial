import React, { useState } from 'react';
import { 
  HomeIcon, FileTextIcon, CalendarIcon, ShieldIcon, BriefcaseIcon, 
  FolderGit2Icon, SparklesIcon, LightbulbIcon, BookOpenIcon, 
  ChevronDownIcon, ChevronRightIcon, MenuIcon, XIcon 
} from './icons';

const NavLink: React.FC<{ href: string; icon: React.ElementType; children: React.ReactNode; isActive: boolean }> = ({ href, icon: Icon, children, isActive }) => (
  <a
    href={href}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    <span>{children}</span>
  </a>
);

const CollapsibleNav: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-1 text-xs font-semibold text-slate-400 uppercase hover:text-slate-600"
      >
        <span>{title}</span>
        {isOpen ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
      </button>
      {isOpen && (
        <nav className="space-y-1 mt-1">
          {children}
        </nav>
      )}
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentHash = window.location.hash || '#home';

  const mainNavItems = [
    { href: '#home', icon: HomeIcon, label: 'Início' },
    { href: '#entrevistas', icon: FileTextIcon, label: 'Entrevistas' },
    { href: '#visitas', icon: CalendarIcon, label: 'Visitas' },
  ];

  const atendimentoNavItems = [
    { href: '#portal-previdenciario', icon: ShieldIcon, label: 'Previdenciário' },
    { href: '#portal-trabalhista', icon: BriefcaseIcon, label: 'Trabalhista' },
  ];

  const ferramentasNavItems = [
    { href: '#gestor-documentos', icon: FolderGit2Icon, label: 'Gestor de Documentos & Tags' },
    { href: '#configurar-nomes', icon: SparklesIcon, label: 'Configurar Detecção de Nomes' },
    { href: '#aperfeicoar-automacao', icon: LightbulbIcon, label: 'Aperfeiçoar Automação' },
    { href: '#observacoes', icon: BookOpenIcon, label: 'Observações' },
  ];

  const sidebarContent = (
    <>
       <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              FM
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Fonteles & Moura</h2>
              <p className="text-slate-500 text-xs">Advocacia</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <nav className="space-y-1 mb-4">
            {mainNavItems.map(item => (
              <NavLink key={item.href} href={item.href} icon={item.icon} isActive={currentHash === item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <CollapsibleNav title="Novo Atendimento">
            {atendimentoNavItems.map(item => (
               <NavLink key={item.href} href={item.href} icon={item.icon} isActive={currentHash === item.href}>
                {item.label}
              </NavLink>
            ))}
          </CollapsibleNav>

          <CollapsibleNav title="Ferramentas">
            {ferramentasNavItems.map(item => (
               <NavLink key={item.href} href={item.href} icon={item.icon} isActive={currentHash === item.href}>
                {item.label}
              </NavLink>
            ))}
          </CollapsibleNav>
        </div>
    </>
  );

  return (
    <div className="min-h-screen flex w-full bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-white border-r border-slate-200">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center text-white font-bold">
              FM
            </div>
            <h2 className="font-bold text-slate-800">Fonteles & Moura</h2>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100"
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20">
           <div className="p-2 overflow-y-auto h-full" onClick={() => setIsMobileMenuOpen(false)}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-0 mt-20 md:mt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
