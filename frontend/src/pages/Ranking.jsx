import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Star, Medal, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Ranking() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3001/api/vendas')
      .then(res => {
        setVendas(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Compute Ranking para Consultoras (Vendas Ativas)
  const rankingConsultoras = Object.entries(
    vendas
      .filter(v => v.status_cliente === 'Ativo' && v.consultora)
      .reduce((acc, v) => {
        acc[v.consultora] = (acc[v.consultora] || 0) + 1;
        return acc;
      }, {})
  )
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total);

  // Compute Ranking para SDRs (Leads que viraram Ativos)
  const rankingSDRs = Object.entries(
    vendas
      .filter(v => v.status_cliente === 'Ativo' && v.sdr)
      .reduce((acc, v) => {
        acc[v.sdr] = (acc[v.sdr] || 0) + 1;
        return acc;
      }, {})
  )
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total);

  if (loading) return <div className="animate-fade-in" style={{ padding: '2rem' }}>Carregando dados do ranking...</div>;

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h2>Metas & Ranking (Leaderboard)</h2>
          <p style={{ color: 'var(--text-muted)' }}>Acompanhe o desempenho da equipe em tempo real</p>
        </div>
      </div>

      <div className="form-grid">
        {/* PODIUM CONSULTORAS */}
        <div className="glass-panel card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Trophy size={24} color="#f59e0b" />
            Top Consultoras (Fechamentos)
          </h3>
          
          {rankingConsultoras.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Nenhuma venda ativa atribuída a uma consultora ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {rankingConsultoras.map((c, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '1rem', background: idx === 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0,0,0,0.2)', 
                  border: idx === 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                  borderRadius: '12px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', background: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--bg-dark)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem'
                    }}>
                      {idx === 0 ? <Trophy size={20} color="#fff" /> : idx === 1 ? <Medal size={20} color="#fff" /> : idx === 2 ? <Medal size={20} color="#fff" /> : idx + 1}
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: idx === 0 ? 'bold' : 'normal' }}>{c.nome}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {c.total} <Star size={16} fill="var(--primary)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PODIUM SDRs */}
        <div className="glass-panel card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <ArrowUpRight size={24} color="var(--primary)" />
            Top SDRs (Geração de Ativos)
          </h3>
          
          {rankingSDRs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Nenhum SDR com clientes ativos ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {rankingSDRs.map((s, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '1rem', background: idx === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.2)', 
                  border: idx === 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                  borderRadius: '12px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '30px', height: '30px', borderRadius: '50%', background: 'var(--bg-dark)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: '1.1rem' }}>{s.nome}</span>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {s.total} clientes
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GRAFICO */}
        <div className="glass-panel card" style={{ gridColumn: '1 / -1', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Visão Geral (Top 5 Consultoras)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rankingConsultoras.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
              <XAxis type="number" />
              <YAxis dataKey="nome" type="category" width={100} tick={{ fill: 'var(--text-muted)' }} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
              <Bar dataKey="total" fill="var(--primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Ranking;
