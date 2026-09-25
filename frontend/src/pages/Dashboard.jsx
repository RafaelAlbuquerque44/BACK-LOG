import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0
  });
  const [recent, setRecent] = useState([]);
  const [chartData, setChartData] = useState({ status: [], products: [] });

  useEffect(() => {
    axios.get('/api/vendas')
      .then(res => {
        const vendas = res.data.data || [];
        
        const active = vendas.filter(v => v.status_cliente === 'Ativo').length;
        const pending = vendas.filter(v => v.status_cliente === 'Pendente').length;
        const inactive = vendas.filter(v => v.status_cliente === 'Inativo').length;
        
        setStats({
          total: vendas.length,
          active,
          pending
        });
        setRecent(vendas.slice(0, 5));

        // Prepare Status Chart Data
        setChartData({
          status: [
            { name: 'Ativo', value: active, color: '#10b981' },
            { name: 'Pendente', value: pending, color: '#f59e0b' },
            { name: 'Inativo', value: inactive, color: '#ef4444' }
          ].filter(d => d.value > 0),
          
          // Prepare Products Chart Data
          products: Object.entries(
            vendas.reduce((acc, v) => {
              const prod = v.produto || 'Não informado';
              acc[prod] = (acc[prod] || 0) + 1;
              return acc;
            }, {})
          ).map(([name, count]) => ({ name, count }))
        });
      })
      .catch(err => console.error(err));
  }, []);

  const getStatusClass = (status) => {
    if(status === 'Ativo') return 'status-active';
    if(status === 'Pendente') return 'status-pending';
    return 'status-inactive';
  };

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h2>Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Visão geral do sistema de vendas</p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="glass-panel stat-card">
          <div className="stat-icon">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total de Vendas</p>
          </div>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.active}</h3>
            <p>Clientes Ativos</p>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Negociações Pendentes</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Distribuição de Status</h3>
          <div style={{ height: 300 }}>
            {chartData.status.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.status}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.status.map((entry, index) => (
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
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Vendas por Produto</h3>
          <div style={{ height: 300 }}>
            {chartData.products.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.products}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: 'none', borderRadius: '8px', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">Sem dados suficientes</div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--primary)" />
          Atividade Recente
        </h3>
        
        {recent.length === 0 ? (
          <div className="empty-state">Nenhuma venda registrada ainda.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Razão Social</th>
                  <th>Produto</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(venda => (
                  <tr key={venda.id}>
                    <td>{new Date(venda.created_at).toLocaleDateString('pt-BR')}</td>
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
  );
}

export default Dashboard;
