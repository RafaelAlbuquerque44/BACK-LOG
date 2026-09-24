import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';
import axios from 'axios';

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/api/login', credentials)
      .then(res => {
        if (res.data.success) {
          onLogin(res.data.user);
        }
      })
      .catch(err => {
        setError('Usuário ou senha incorretos.');
      });
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="glass-panel login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Grupo Sempre Empresas" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1rem' }} />
          <h2>Acesso Restrito</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Insira suas credenciais de administrador</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Usuário</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                required 
                type="text" 
                className="form-control" 
                name="username" 
                value={credentials.username} 
                onChange={handleChange} 
                placeholder="admin"
                style={{ width: '100%', paddingLeft: '2.5rem' }} 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                required 
                type="password" 
                className="form-control" 
                name="password" 
                value={credentials.password} 
                onChange={handleChange} 
                placeholder="••••••••"
                style={{ width: '100%', paddingLeft: '2.5rem' }} 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
