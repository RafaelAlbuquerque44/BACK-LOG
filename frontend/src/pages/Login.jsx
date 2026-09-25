import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';
import axios from 'axios';

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    axios.post('/api/login', credentials)
      .then(res => {
        if (res.data.success) {
          setTimeout(() => onLogin(res.data.user), 500); // Small delay for UX
        }
      })
      .catch(err => {
        setIsLoading(false);
        setError('Usuário ou senha incorretos.');
      });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', margin: '-1rem', backgroundColor: 'var(--bg-dark)' }} className="animate-fade-in">
      
      {/* Coluna Esquerda - Imagem Decorativa */}
      <div 
        style={{ 
          flex: 1.2, 
          position: 'relative', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-end', 
          padding: '4rem',
          overflow: 'hidden'
        }}
        className="login-image-col" // Você pode adicionar display: none no CSS para mobile se desejar
      >
        <img 
          src="/login_bg.jpg" 
          alt="Tecnologia e Inovação" 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
        />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(10, 15, 30, 0.95) 0%, rgba(10, 15, 30, 0.4) 50%, rgba(10, 15, 30, 0.1) 100%)', zIndex: 1 }} />
        
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '60px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }} />
            <h1 style={{ color: '#fff', fontSize: '2.5rem', margin: 0, fontWeight: 800, letterSpacing: '-1px' }}>
              Grupo Sempre
            </h1>
          </div>
          <h2 style={{ color: '#fff', fontSize: '3rem', margin: '0 0 1rem 0', lineHeight: 1.1, fontWeight: 700 }}>
            Há 15 anos conectando empresas ao futuro!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', lineHeight: 1.6, margin: 0 }}>
            Com uma trajetória sólida e marcada pela excelência, o Grupo Sempre Empresas se consolidou como referência no mercado de telecomunicações. Nossa equipe altamente especializada oferece soluções inteligentes e personalizadas, acompanhando a evolução e as necessidades do seu negócio.
          </p>
        </div>
      </div>

      {/* Coluna Direita - Formulário */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '3rem',
        background: 'var(--bg-main)',
        boxShadow: '-20px 0 50px rgba(0,0,0,0.5)',
        zIndex: 10
      }}>
        
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Bem-vindo de volta</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Insira suas credenciais para acessar o painel</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && (
              <div className="animate-fade-in" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', fontSize: '0.95rem', textAlign: 'center', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Nome de Usuário</label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  required 
                  type="text" 
                  className="form-control" 
                  name="username" 
                  value={credentials.username} 
                  onChange={handleChange} 
                  placeholder="admin"
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', fontSize: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }} 
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Senha de Acesso</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  required 
                  type="password" 
                  className="form-control" 
                  name="password" 
                  value={credentials.password} 
                  onChange={handleChange} 
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', fontSize: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading}
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 600, borderRadius: '12px', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}
            >
              {isLoading ? 'Autenticando...' : (
                <>Entrar no Sistema <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Protegido por criptografia avançada. <br />
              Uso restrito a funcionários do Grupo Sempre.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
