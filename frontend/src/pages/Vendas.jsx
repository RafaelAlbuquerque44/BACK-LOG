import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import axios from 'axios';

function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleDelete = (id) => {
    if(window.confirm('Tem certeza que deseja excluir esta venda?')) {
      axios.delete(`/api/vendas/${id}`)
        .then(() => fetchVendas())
        .catch(err => console.error(err));
    }
  };

  const getStatusClass = (status) => {
    if(status === 'Ativo') return 'status-active';
    if(status === 'Pendente') return 'status-pending';
    return 'status-inactive';
  };

  const exportToCSV = () => {
    if (vendas.length === 0) return;
    
    const headers = ['ID', 'Razao Social', 'CNPJ', 'SDR', 'Consultora', 'Gestor', 'Produto', 'Status', 'Data'];
    const csvContent = [
      headers.join(';'),
      ...vendas.map(v => [
        v.id,
        `"${v.razao_social || ''}"`,
        `"${v.cnpj || ''}"`,
        `"${v.sdr || ''}"`,
        `"${v.consultora || ''}"`,
        `"${v.nome_gestor || ''}"`,
        `"${v.produto || ''}"`,
        v.status_cliente,
        new Date(v.created_at).toLocaleDateString('pt-BR')
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vendas_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredVendas = vendas.filter(v => 
    (v.razao_social || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.cnpj || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.produto || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h2>Vendas</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gerenciamento de vendas e clientes</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={exportToCSV} className="btn btn-secondary">
            Exportar CSV
          </button>
          <Link to="/vendas/nova" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={18} />
            Nova Venda
          </Link>
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
          <div className="empty-state">Carregando...</div>
        ) : filteredVendas.length === 0 ? (
          <div className="empty-state">Nenhuma venda encontrada.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Razão Social</th>
                  <th>CNPJ</th>
                  <th>Produto</th>
                  <th>Gestor</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendas.map(venda => (
                  <tr key={venda.id}>
                    <td style={{ fontWeight: 500 }}>{venda.razao_social}</td>
                    <td>{venda.cnpj}</td>
                    <td>{venda.produto}</td>
                    <td>{venda.nome_gestor}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(venda.status_cliente)}`}>
                        {venda.status_cliente}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => navigate(`/vendas/editar/${venda.id}`)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem', background: 'transparent', color: 'var(--text-main)', marginRight: '0.5rem' }}
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(venda.id)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem', background: 'transparent', color: 'var(--danger)' }}
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
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

export default Vendas;
