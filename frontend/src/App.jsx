import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Vendas from './pages/Vendas';
import NovaVenda from './pages/NovaVenda';
import EditarVenda from './pages/EditarVenda';
import Clientes from './pages/Clientes';
import Configuracoes from './pages/Configuracoes';
import Login from './pages/Login';
import Kanban from './pages/Kanban';
import ConsultoraPainel from './pages/ConsultoraPainel';
import Equipe from './pages/Equipe';
import Relatorios from './pages/Relatorios';
import Ranking from './pages/Ranking';
import { Columns, LayoutDashboard, ReceiptText, Users, Settings, UserCog, BarChart3, Trophy } from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  
  return (
    <div className="sidebar">
      <div style={{ marginBottom: '1rem' }}>
        <img src="/logo-escrita.jpg" alt="Grupo Sempre Empresas" style={{ width: '100%', borderRadius: '8px' }} />
      </div>
      <nav className="nav-links mt-8">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Dashboard
        </Link>
        <Link to="/vendas" className={`nav-item ${location.pathname === '/vendas' || location.pathname.includes('/vendas/nova') || location.pathname.includes('/vendas/editar') ? 'active' : ''}`}>
          <ReceiptText size={20} />
          Vendas (Lista)
        </Link>
        <Link to="/kanban" className={`nav-item ${location.pathname === '/kanban' ? 'active' : ''}`}>
          <Columns size={20} />
          Funil (Kanban)
        </Link>
        <Link to="/relatorios" className={`nav-item ${location.pathname === '/relatorios' ? 'active' : ''}`}>
          <BarChart3 size={20} />
          Relatórios
        </Link>
        <Link to="/ranking" className={`nav-item ${location.pathname === '/ranking' ? 'active' : ''}`}>
          <Trophy size={20} />
          Metas & Ranking
        </Link>
        <Link to="/clientes" className={`nav-item ${location.pathname === '/clientes' ? 'active' : ''}`}>
          <Users size={20} />
          Clientes
        </Link>
        <Link to="/equipe" className={`nav-item ${location.pathname === '/equipe' ? 'active' : ''}`}>
          <UserCog size={20} />
          Equipe / Acessos
        </Link>
        <Link to="/configuracoes" className={`nav-item ${location.pathname === '/configuracoes' ? 'active' : ''}`}>
          <Settings size={20} />
          Configurações
        </Link>
      </nav>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const isAdmin = user.role === 'admin';

  return (
    <BrowserRouter>
      <div className="app-container">
        {isAdmin ? <Sidebar /> : null}
        <main className="main-content" style={!isAdmin ? { padding: '1rem' } : {}}>
          <Routes>
            {isAdmin ? (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/vendas" element={<Vendas />} />
                <Route path="/vendas/nova" element={<NovaVenda />} />
                <Route path="/vendas/editar/:id" element={<EditarVenda />} />
                <Route path="/kanban" element={<Kanban />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/equipe" element={<Equipe />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
              </>
            ) : (
              <Route path="*" element={<ConsultoraPainel user={user} onLogout={() => setUser(null)} />} />
            )}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
