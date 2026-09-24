import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, User, Phone, CheckCircle, XCircle } from 'lucide-react';

function ConsultoraPainel({ user, onLogout }) {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendas = () => {
    // Pass the username to filter by consultora
    axios.get(`http://localhost:3001/api/vendas?consultora=${user.username}`)
      .then(res => {
        setVendas(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVendas();
  }, [user]);

  const updateStatus = (id, novoStatus) => {
    if (!window.confirm(`Tem certeza que deseja mudar o status para "${novoStatus}"?`)) return;

    axios.patch(`http://localhost:3001/api/vendas/${id}/status`, { 
      status_cliente: novoStatus,
      consultora: user.username 
    })
      .then(res => {
        if (res.data.bounced) {
          alert('Cliente devolvido ao Backlog com sucesso.');
        }
        fetchVendas();
      })
      .catch(err => alert('Erro ao atualizar status.'));
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Simplificado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '50px' }} />
          <div>
            <h2 style={{ margin: 0 }}>Painel da Consultora</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Bem-vinda, {user.username}</p>
          </div>
        </div>
        <button onClick={onLogout} className="btn btn-secondary" style={{ background: 'transparent', color: 'var(--danger)' }}>
          <LogOut size={18} />
          Sair
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '1rem', marginBottom: '1.5rem' }}>
          Seus Atendimentos ({vendas.length})
        </h3>
        <p style={{ color: 'var(--text-muted)' }}>Você vê no máximo 3 pendentes por vez. Ao dar andamento, novos aparecerão automaticamente da fila.</p>
      </div>

      {loading ? (
        <div className="empty-state">Carregando seus clientes...</div>
      ) : vendas.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '4rem 2rem' }}>
          <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
          <h3>Fila Zerada!</h3>
          <p>Você não tem nenhum cliente pendente no momento. Fale com a gerência.</p>
        </div>
      ) : (
        <div className="form-grid">
          {vendas.map(venda => (
            <div key={venda.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem', 
                  background: venda.status_cliente === 'Pendente' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: venda.status_cliente === 'Pendente' ? 'var(--warning)' : 'var(--success)'
                }}>
                  {venda.status_cliente.toUpperCase()}
                </div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{venda.razao_social}</h4>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <User size={14} /> {venda.nome_gestor}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                  <Phone size={14} /> {venda.telefone_gestor}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                <div style={{ marginBottom: '0.5rem' }}><strong>Produto:</strong> {venda.produto}</div>
                <div><strong>OBS:</strong> {venda.obs_consultora || 'Nenhuma observação.'}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {venda.status_cliente === 'Pendente' && (
                  <button onClick={() => updateStatus(venda.id, 'Em negociação')} className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.9rem', justifyContent: 'center' }}>
                    Em Negociação
                  </button>
                )}
                <button onClick={() => updateStatus(venda.id, 'Ativo')} className="btn btn-primary" style={{ background: 'var(--success)', padding: '0.5rem', fontSize: '0.9rem', justifyContent: 'center' }}>
                  Fechou (Ativo)
                </button>
                
                {/* Ações Negativas */}
                <button onClick={() => updateStatus(venda.id, 'Sem contato')} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.9rem', justifyContent: 'center', color: 'var(--warning)' }}>
                  Sem Contato
                </button>
                <button onClick={() => updateStatus(venda.id, 'Sem interesse')} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.9rem', justifyContent: 'center', color: 'var(--danger)' }}>
                  Sem Interesse
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ConsultoraPainel;
