import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, User, Phone, CheckCircle, Clock, TrendingUp, Award, Briefcase, ChevronRight, XCircle, Sun, Moon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function ConsultoraPainel({ user, onLogout, theme, toggleTheme }) {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendas = () => {
    axios.get(`/api/vendas?consultora=${user.username}`)
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
    if (!window.confirm(`Mudar o status para "${novoStatus}"?`)) return;

    axios.patch(`/api/vendas/${id}/status`, { 
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

  // Separar os dados para o visual rico
  const pendentes = vendas.filter(v => v.status_cliente === 'Pendente');
  const emAndamento = vendas.filter(v => v.status_cliente !== 'Pendente' && v.status_cliente !== 'Ativo');
  const fechados = vendas.filter(v => v.status_cliente === 'Ativo');
  
  // Preparar dados do gráfico
  const chartData = [
    { name: 'Em Negociação', value: emAndamento.length, color: '#3b82f6' },
    { name: 'Novos (Fila)', value: pendentes.length, color: '#f59e0b' },
    { name: 'Fechados', value: fechados.length, color: '#10b981' }
  ].filter(d => d.value > 0);

  // Atividade Recente (últimos 5)
  const recent = [...vendas].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  const getStatusClass = (status) => {
    if(status === 'Ativo') return 'status-active';
    if(status === 'Pendente') return 'status-pending';
    return 'status-inactive';
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Premium */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'var(--bg-card)', padding: '1.5rem 2rem', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'var(--primary)', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={32} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>Painel da Consultora</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1rem' }}>Bem-vinda de volta, <strong style={{ color: 'var(--text-main)' }}>{user.username}</strong>! Que tal bater a meta hoje?</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary" 
            style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
          >
            {theme === 'dark' ? <Sun size={18} color="var(--warning)" /> : <Moon size={18} color="var(--primary)" />}
            {theme === 'dark' ? 'Claro' : 'Escuro'}
          </button>
          <button onClick={onLogout} className="btn btn-secondary" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <LogOut size={18} />
            Sair do Sistema
          </button>
        </div>
      </div>

      {/* KPIs / Gamificação */}
      <div className="dashboard-stats" style={{ marginBottom: '3rem' }}>
        <div className="glass-panel stat-card" style={{ borderTop: '4px solid var(--warning)' }}>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <Clock size={28} />
          </div>
          <div className="stat-info">
            <h3 style={{ fontSize: '2rem' }}>{pendentes.length}</h3>
            <p>Novos na Fila (Máx. 3)</p>
          </div>
        </div>
        
        <div className="glass-panel stat-card" style={{ borderTop: '4px solid var(--primary)' }}>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <Briefcase size={28} />
          </div>
          <div className="stat-info">
            <h3 style={{ fontSize: '2rem' }}>{emAndamento.length}</h3>
            <p>Em Negociação</p>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ borderTop: '4px solid var(--success)' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <Award size={28} />
          </div>
          <div className="stat-info">
            <h3 style={{ fontSize: '2rem' }}>{fechados.length}</h3>
            <p>Fechados (Sucesso!)</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Carregando seus clientes...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          
          {/* Seção 1: Caixa de Entrada (Fila) */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--warning)' }}>
              <Clock size={20} />
              Sua Fila de Atendimento (Novos)
            </h3>
            
            {pendentes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
                <h4 style={{ color: 'var(--text-muted)' }}>Fila Zerada!</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Você não tem clientes pendentes no momento. Ao liberar espaço, o sistema enviará novos automaticamente.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendentes.map(venda => (
                  <div key={venda.id} style={{ background: 'rgba(0,0,0,0.3)', borderLeft: '4px solid var(--warning)', borderRadius: '8px', padding: '1.5rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>NOVO</div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{venda.razao_social}</h4>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}><User size={14}/> {venda.nome_gestor}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14}/> {venda.telefone_gestor}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => updateStatus(venda.id, 'Em negociação')} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                        Iniciar Atendimento <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seção 2: Meu Funil (Em Andamento) */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
              <Briefcase size={20} />
              Meu Funil (Em andamento)
            </h3>

            {emAndamento.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <TrendingUp size={40} color="var(--primary)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
                <h4 style={{ color: 'var(--text-muted)' }}>Nenhuma negociação</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Inicie o atendimento de um cliente da sua fila para movê-lo para cá.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {emAndamento.map(venda => (
                  <div key={venda.id} style={{ background: 'rgba(0,0,0,0.3)', borderLeft: '4px solid var(--primary)', borderRadius: '8px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{venda.razao_social}</h4>
                      <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>{venda.status_cliente.toUpperCase()}</span>
                    </div>
                    
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={14}/> {venda.nome_gestor}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={14}/> {venda.telefone_gestor}</div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      <strong>Produto:</strong> {venda.produto} <br/>
                      <span style={{ color: 'var(--text-muted)' }}>{venda.obs_consultora}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button onClick={() => updateStatus(venda.id, 'Ativo')} className="btn btn-primary" style={{ background: 'var(--success)', justifyContent: 'center', fontSize: '0.85rem' }}>
                        <CheckCircle size={16} /> Fechar Venda
                      </button>
                      <button onClick={() => updateStatus(venda.id, 'Sem interesse')} className="btn btn-secondary" style={{ color: 'var(--danger)', justifyContent: 'center', fontSize: '0.85rem' }}>
                        <XCircle size={16} /> Descartar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Gráficos e Atividade Recente */}
      {!loading && vendas.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          
          <div className="glass-panel card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-main)' }}>Seu Desempenho Atual</h3>
            <div style={{ height: 300 }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">Sem dados suficientes</div>
              )}
            </div>
          </div>

          <div className="glass-panel card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Clock size={20} color="var(--primary)" />
              Sua Atividade Recente
            </h3>
            
            {recent.length === 0 ? (
              <div className="empty-state">Nenhuma venda registrada ainda.</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Produto</th>
                      <th>Status Atual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(venda => (
                      <tr key={venda.id}>
                        <td style={{ fontWeight: 500 }}>{venda.razao_social}</td>
                        <td>{venda.produto}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(venda.status_cliente)}`}>
                            {venda.status_cliente}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default ConsultoraPainel;
