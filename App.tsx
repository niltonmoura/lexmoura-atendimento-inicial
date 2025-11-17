import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import PortalPrevidenciario from './pages/PortalPrevidenciario';
import PortalTrabalhista from './pages/PortalTrabalhista';
import Entrevistas from './pages/Entrevistas';
import Visitas from './pages/Visitas';
import GestorDocumentos from './pages/GestorDocumentos';
import ConfiguracaoNomes from './pages/ConfiguracaoNomes';
import AperfeicoarAutomacao from './pages/AperfeicoarAutomacao';
import Observacoes from './pages/Observacoes';


const routes: { [key: string]: React.ComponentType } = {
  '': Home,
  '#home': Home,
  '#entrevistas': Entrevistas,
  '#visitas': Visitas,
  '#portal-previdenciario': PortalPrevidenciario,
  '#portal-trabalhista': PortalTrabalhista,
  '#gestor-documentos': GestorDocumentos,
  '#configurar-nomes': ConfiguracaoNomes,
  '#aperfeicoar-automacao': AperfeicoarAutomacao,
  '#observacoes': Observacoes,
};

function App() {
  const [hash, setHash] = useState(window.location.hash || '#home');

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#home');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const CurrentPage = routes[hash] || Home;

  return (
    <Layout>
      <CurrentPage />
    </Layout>
  );
}

export default App;
