import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Columns, Building } from 'lucide-react';

function Kanban() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendas = () => {
    axios.get('/api/vendas')
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
  }, []);

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('id', id.toString());
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('id');
    if (id) {
      // Optimistic UI update
      setVendas(prev => prev.map(v => v.id === parseInt(id) ? { ...v, status_cliente: newStatus } : v));
      
      // Backend update
      axios.patch(`/api/vendas/${id}/status`, { status_cliente: newStatus })
        .catch(err => {
          console.error(err);
          fetchVendas(); // revert on error
        });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const columns = [
    { title: 'Pendente', status: 'Pendente', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
    { title: 'Ativo', status: 'Ativo', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
    { title: 'Inativo', status: 'Inativo', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)' }
  ];

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h2>Funil de Vendas (Kanban)</h2>
          <p style={{ color: 'var(--text-muted)' }}>Arraste os cards para alterar o status do cliente</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Carregando...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', minHeight: '60vh' }}>
          {columns.map(col => (
            <div 
              key={col.status}
              className="glass-panel"
              style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', flexDirection: 'column' }}
              onDrop={(e) => handleDrop(e, col.status)}
              onDragOver={handleDragOver}
            >
              <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${col.color}`, color: col.color, display: 'flex', justifyContent: 'space-between' }}>
                {col.title}
                <span style={{ fontSize: '0.9rem', background: col.bg, padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>
                  {vendas.filter(v => v.status_cliente === col.status).length}
                </span>
              </h3>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {vendas.filter(v => v.status_cliente === col.status).map(venda => (
                  <div 
                    key={venda.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, venda.id)}
                    style={{ 
                      background: 'rgba(30, 41, 59, 0.9)', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      cursor: 'grab',
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{venda.razao_social}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Produto: {venda.produto}</div>
                    <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px', display: 'inline-block' }}>
                      Gestor: {venda.nome_gestor}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Kanban;
