import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Shield, Bell, User, Plus, Trash2, Key } from 'lucide-react';

function Configuracoes() {
  const [opcoes, setOpcoes] = useState([]);
  const [novaOpcao, setNovaOpcao] = useState({ categoria: 'produto', valor: '' });
  
  // States for user management
  const [users, setUsers] = useState([]);
  const [novoUser, setNovoUser] = useState({ username: '', password: '', role: 'consultora' });

  const fetchData = () => {
    // Fetch options
    axios.get('/api/opcoes')
      .then(res => setOpcoes(res.data.data || []))
      .catch(err => console.error(err));
      
    // Fetch users
    axios.get('/api/users')
      .then(res => setUsers(res.data.data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddOpcao = (e) => {
    e.preventDefault();
    if (!novaOpcao.valor.trim()) return;
    axios.post('/api/opcoes', novaOpcao)
      .then(() => {
        setNovaOpcao({ ...novaOpcao, valor: '' });
        fetchData();
      })
      .catch(err => alert('Erro ao adicionar opção'));
  };

  const handleDeleteOpcao = (id) => {
    if (!window.confirm('Excluir esta opção?')) return;
    axios.delete(`/api/opcoes/${id}`)
      .then(() => fetchData())
      .catch(err => alert('Erro ao excluir opção'));
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!novoUser.username.trim() || !novoUser.password.trim()) return;
    axios.post('/api/users', novoUser)
      .then(() => {
        setNovoUser({ username: '', password: '', role: 'consultora' });
        fetchData();
        alert('Usuário criado com sucesso!');
      })
      .catch(err => alert('Erro ao criar usuário (talvez o nome já exista)'));
  };

  const handleDeleteUser = (id, username) => {
    if (username === 'admin') {
      alert('Não é possível excluir o administrador principal.');
      return;
    }
    if (!window.confirm(`Excluir a conta de ${username}?`)) return;
    axios.delete(`/api/users/${id}`)
      .then(() => fetchData())
      .catch(err => alert('Erro ao excluir usuário'));
  };

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h2>Configurações do Sistema</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie as opções de seleção e acessos</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="glass-panel card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Settings size={20} color="var(--primary)" />
            Opções Dinâmicas (Listas de Seleção)
          </h3>
          
          <form onSubmit={handleAddOpcao} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Categoria</label>
              <select 
                className="form-control" 
                value={novaOpcao.categoria} 
                onChange={e => setNovaOpcao({...novaOpcao, categoria: e.target.value})}
              >
                <option value="produto">Produto</option>
                <option value="status">Status do Cliente</option>
                <option value="segmento">Segmento (PME, etc)</option>
                <option value="sdr">SDR</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Novo Valor</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ex: VVN 5G Premium"
                value={novaOpcao.valor}
                onChange={e => setNovaOpcao({...novaOpcao, valor: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <Plus size={18} /> Adicionar
            </button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {['produto', 'status', 'segmento', 'sdr'].map(cat => (
              <div key={cat} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ textTransform: 'capitalize', marginBottom: '1rem', color: 'var(--primary)' }}>{cat}s</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {opcoes.filter(o => o.categoria === cat).map(opcao => (
                    <li key={opcao.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span>{opcao.valor}</span>
                      <button onClick={() => handleDeleteOpcao(opcao.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                  {opcoes.filter(o => o.categoria === cat).length === 0 && (
                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhuma opção cadastrada.</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel card" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <User size={20} color="var(--primary)" />
            Gerenciar Usuários (Consultoras & Admins)
          </h3>
          
          <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>Nome de Usuário (Login)</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  required
                  className="form-control" 
                  placeholder="Nome da consultora"
                  style={{ paddingLeft: '2.5rem' }}
                  value={novoUser.username}
                  onChange={e => setNovoUser({...novoUser, username: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>Senha de Acesso</label>
              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  required
                  className="form-control" 
                  placeholder="Senha forte"
                  style={{ paddingLeft: '2.5rem' }}
                  value={novoUser.password}
                  onChange={e => setNovoUser({...novoUser, password: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label>Nível de Acesso</label>
              <select 
                className="form-control" 
                value={novoUser.role}
                onChange={e => setNovoUser({...novoUser, role: e.target.value})}
              >
                <option value="consultora">Consultora (Acesso Restrito)</option>
                <option value="admin">Administrador (Acesso Total)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <Plus size={18} /> Criar Conta
            </button>
          </form>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuário</th>
                  <th>Nível (Role)</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td style={{ fontWeight: 500 }}>{u.username}</td>
                    <td>
                      <span className={`status-badge ${u.role === 'admin' ? 'status-active' : 'status-pending'}`}>
                        {u.role === 'admin' ? 'Admin' : 'Consultora'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {u.username !== 'admin' && (
                        <button 
                          onClick={() => handleDeleteUser(u.id, u.username)} 
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Configuracoes;

