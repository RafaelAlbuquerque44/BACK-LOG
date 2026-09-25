import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';

function ConsultoraClientes({ user }) {
  const [vendas, setVendas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/vendas?consultora=${user.username}`)
      .then(res => {
        setVendas(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  const getStatusClass = (status) => {
    if(status === 'Ativo') return 'status-active';
    if(status === 'Pendente') return 'status-pending';
    return 'status-inactive';
  };

  const filteredVendas = vendas.filter(v => 
    (v.razao_social || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.cnpj || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.produto || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2>Meus Clientes</h2>
          <p style={{ color: 'var(--text-muted)' }}>Consulte todos os clientes atribuídos a você e seu histórico de vendas</p>
        </div>
      </div>

      <div className="glass-panel card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar por Razão Social, CNPJ ou Produto..." 
              style={{ width: '100%', paddingLeft: '2.5rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Carregando seus clientes...</div>
        ) : filteredVendas.length === 0 ? (
          <div className="empty-state">Nenhum cliente encontrado na sua base.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data de Cadastro</th>
                  <th>Razão Social</th>
                  <th>CNPJ</th>
                  <th>Produto</th>
                  <th>Gestor</th>
                  <th>Status Atual</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendas.map(venda => (
                  <tr key={venda.id}>
                    <td>{new Date(venda.created_at).toLocaleDateString('pt-BR')}</td>
                    <td style={{ fontWeight: 500 }}>{venda.razao_social}</td>
                    <td>{venda.cnpj}</td>
                    <td>{venda.produto}</td>
                    <td>{venda.nome_gestor}</td>
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

export default ConsultoraClientes;
