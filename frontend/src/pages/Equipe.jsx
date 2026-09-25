import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Trash2, Edit2, ShieldAlert } from 'lucide-react';

function Equipe() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ id: null, username: '', password: '', role: 'consultora' });
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    axios.get('/api/users')
      .then(res => {
        setUsers(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.id) {
      // Edit
      axios.put(`/api/users/${formData.id}`, formData)
        .then(() => {
          setFormData({ id: null, username: '', password: '', role: 'consultora' });
          fetchUsers();
        })
        .catch(err => alert('Erro ao atualizar usuário'));
    } else {
      // Create
      axios.post('/api/users', formData)
        .then(() => {
          setFormData({ id: null, username: '', password: '', role: 'consultora' });
          fetchUsers();
        })
        .catch(err => alert('Erro ao criar usuário'));
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    axios.delete(`/api/users/${id}`)
      .then(() => fetchUsers())
      .catch(err => alert('Erro ao excluir usuário'));
  };

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h2>Gestão de Equipe</h2>
          <p style={{ color: 'var(--text-muted)' }}>Controle de acessos, administradores e consultoras</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="glass-panel card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <UserPlus size={20} color="var(--primary)" />
            {formData.id ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label>Nome de Usuário</label>
              <input 
                required 
                type="text" 
                className="form-control" 
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label>{formData.id ? 'Nova Senha (opcional)' : 'Senha'}</label>
              <input 
                type="password" 
                className="form-control" 
                required={!formData.id}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label>Nível de Acesso (Cargo)</label>
              <select 
                className="form-control" 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="consultora">Consultora (Acesso Restrito)</option>
                <option value="admin">Administrador (Acesso Total)</option>
              </select>
            </div>
            <div style={{ flex: '1 1 200px', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
                {formData.id ? 'Atualizar' : 'Criar Usuário'}
              </button>
              {formData.id && (
                <button type="button" onClick={() => setFormData({ id: null, username: '', password: '', role: 'consultora' })} className="btn btn-secondary" style={{ padding: '0.75rem' }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="glass-panel card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Users size={20} color="var(--primary)" />
            Usuários Cadastrados
          </h3>
          
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem' }}>ID</th>
                    <th style={{ padding: '1rem' }}>Usuário</th>
                    <th style={{ padding: '1rem' }}>Nível de Acesso</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>#{u.id}</td>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{u.username}</td>
                      <td style={{ padding: '1rem' }}>
                        {u.role === 'admin' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem' }}>
                            <ShieldAlert size={14} /> Administrador
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem' }}>
                            <Users size={14} /> Consultora
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => setFormData({ id: u.id, username: u.username, password: '', role: u.role })} 
                            className="btn btn-secondary" 
                            style={{ padding: '0.5rem' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id)} 
                            className="btn btn-secondary" 
                            style={{ padding: '0.5rem', color: 'var(--danger)' }}
                            disabled={u.username === 'admin'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Equipe;
