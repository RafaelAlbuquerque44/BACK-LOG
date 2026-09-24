import React from 'react';
import { Settings, Shield, Bell, User } from 'lucide-react';

function Configuracoes() {
  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h2>Configurações</h2>
          <p style={{ color: 'var(--text-muted)' }}>Preferências do sistema e da sua conta</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="glass-panel card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <User size={20} color="var(--primary)" />
            Perfil do Administrador
          </h3>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Nome</label>
            <input type="text" className="form-control" defaultValue="Administrador Principal" />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Email de Contato</label>
            <input type="email" className="form-control" defaultValue="admin@empresa.com" />
          </div>
          <button className="btn btn-primary">Salvar Perfil</button>
        </div>

        <div className="glass-panel card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Shield size={20} color="var(--primary)" />
            Segurança
          </h3>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Nova Senha</label>
            <input type="password" className="form-control" placeholder="••••••••" />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Confirmar Nova Senha</label>
            <input type="password" className="form-control" placeholder="••••••••" />
          </div>
          <button className="btn btn-secondary">Atualizar Senha</button>
        </div>

        <div className="glass-panel card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Bell size={20} color="var(--primary)" />
            Preferências do Sistema
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Notificações de Vendas</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Receber alerta quando houver nova venda cadastrada</span>
            </div>
            <label style={{ cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Tema Escuro (Dark Mode)</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Utilizar visual escuro com foco noturno</span>
            </div>
            <label style={{ cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked disabled style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Configuracoes;
