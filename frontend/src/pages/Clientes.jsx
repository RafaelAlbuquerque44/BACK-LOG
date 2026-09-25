import React, { useState, useEffect } from 'react';
import { Users, Search, Building } from 'lucide-react';
import axios from 'axios';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/vendas')
      .then(res => {
        // Extrair clientes únicos baseados no CNPJ ou Razão Social
        const vendas = res.data.data || [];
        const uniqueClientesMap = new Map();
        
        vendas.forEach(v => {
          const key = v.cnpj || v.razao_social;
          if (!uniqueClientesMap.has(key)) {
            uniqueClientesMap.set(key, {
              razao_social: v.razao_social,
              cnpj: v.cnpj,
              seguimento_empresa: v.seguimento_empresa,
              endereco_empresa: v.endereco_empresa,
              nome_gestor: v.nome_gestor,
              telefone_gestor: v.telefone_gestor,
              status_cliente: v.status_cliente
            });
          }
        });
        
        setClientes(Array.from(uniqueClientesMap.values()));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredClientes = clientes.filter(c => 
    (c.razao_social || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.cnpj || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h2>Clientes</h2>
          <p style={{ color: 'var(--text-muted)' }}>Carteira de clientes cadastrados</p>
        </div>
      </div>

      <div className="glass-panel card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar cliente por Razão Social ou CNPJ..." 
              style={{ width: '100%', paddingLeft: '2.5rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Carregando...</div>
        ) : filteredClientes.length === 0 ? (
          <div className="empty-state">Nenhum cliente encontrado.</div>
        ) : (
          <div className="form-grid">
            {filteredClientes.map((cliente, index) => (
              <div key={index} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className="stat-icon" style={{ width: '40px', height: '40px' }}>
                    <Building size={20} />
                  </div>
                  <div>
                    <h4 style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>{cliente.razao_social}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>CNPJ: {cliente.cnpj}</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <div><strong style={{ color: 'var(--text-muted)' }}>Segmento:</strong> {cliente.seguimento_empresa}</div>
                      <div><strong style={{ color: 'var(--text-muted)' }}>Gestor:</strong> {cliente.nome_gestor}</div>
                      <div><strong style={{ color: 'var(--text-muted)' }}>Telefone:</strong> {cliente.telefone_gestor}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Clientes;
