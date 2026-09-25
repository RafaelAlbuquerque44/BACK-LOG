import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Calendar, Filter } from 'lucide-react';

function Relatorios() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ dataInicio: '', dataFim: '', consultora: '', sdr: '' });
  const [opcoes, setOpcoes] = useState({ consultoras: [], sdrs: [] });

  useEffect(() => {
    // Busca dados e opções
    Promise.all([
      axios.get('http://localhost:3001/api/vendas'),
      axios.get('http://localhost:3001/api/opcoes')
    ]).then(([resVendas, resOpcoes]) => {
      setVendas(resVendas.data.data || []);
      
      const ops = resOpcoes.data.data || [];
      setOpcoes({
        consultoras: ops.filter(o => o.categoria === 'consultora').map(o => o.valor),
        sdrs: ops.filter(o => o.categoria === 'sdr').map(o => o.valor)
      });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const getFilteredData = () => {
    return vendas.filter(v => {
      let pass = true;
      if (filtros.consultora && v.consultora !== filtros.consultora) pass = false;
      if (filtros.sdr && v.sdr !== filtros.sdr) pass = false;
      // Obs: A API atual não tem timestamp de criação explícito na venda, 
      // mas se houver data de fechamento, o filtro de datas entraria aqui.
      return pass;
    });
  };

  const exportToCSV = () => {
    const data = getFilteredData();
    if (data.length === 0) return alert('Nenhum dado para exportar.');
    
    const headers = ['ID', 'Razao Social', 'CNPJ', 'SDR', 'Consultora', 'Produto', 'Status', 'Origem'];
    const csvContent = [
      headers.join(';'),
      ...data.map(v => [
        v.id,
        v.razao_social,
        v.cnpj,
        v.sdr || '',
        v.consultora || '',
        v.produto || '',
        v.status_cliente || '',
        v.origem_cliente || ''
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_vendas_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = getFilteredData();
  const totalAtivos = filteredData.filter(v => v.status_cliente === 'Ativo').length;

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h2>Relatórios Avançados</h2>
          <p style={{ color: 'var(--text-muted)' }}>Filtre dados e exporte planilhas de comissionamento ou auditoria</p>
        </div>
        <button onClick={exportToCSV} className="btn btn-primary">
          <Download size={18} />
          Exportar Excel (CSV)
        </button>
      </div>

      <div className="glass-panel card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Filter size={20} color="var(--primary)" />
          Filtros de Relatório
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Consultora</label>
            <select className="form-control" name="consultora" value={filtros.consultora} onChange={handleFilter}>
              <option value="">Todas</option>
              {opcoes.consultoras.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>SDR</label>
            <select className="form-control" name="sdr" value={filtros.sdr} onChange={handleFilter}>
              <option value="">Todos</option>
              {opcoes.sdrs.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Data Início (Em breve)</label>
            <input type="date" className="form-control" disabled />
          </div>
          <div className="form-group">
            <label>Data Fim (Em breve)</label>
            <input type="date" className="form-control" disabled />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text)' }}>{filteredData.length}</div>
          <div style={{ color: 'var(--text-muted)' }}>Total de Leads no Filtro</div>
        </div>
        <div className="glass-panel card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{totalAtivos}</div>
          <div style={{ color: 'var(--text-muted)' }}>Vendas Ativas (Fechadas)</div>
        </div>
        <div className="glass-panel card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            {filteredData.length > 0 ? Math.round((totalAtivos / filteredData.length) * 100) : 0}%
          </div>
          <div style={{ color: 'var(--text-muted)' }}>Taxa de Conversão</div>
        </div>
      </div>

      <div className="glass-panel card">
        <h3 style={{ marginBottom: '1.5rem' }}>Pré-visualização dos Dados ({filteredData.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Empresa</th>
                <th style={{ padding: '0.75rem' }}>Consultora</th>
                <th style={{ padding: '0.75rem' }}>SDR</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 50).map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem' }}>{v.razao_social}</td>
                  <td style={{ padding: '0.75rem' }}>{v.consultora || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>{v.sdr || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ color: v.status_cliente === 'Ativo' ? 'var(--success)' : 'var(--text-muted)' }}>{v.status_cliente}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length > 50 && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>Mostrando apenas os 50 primeiros registros. Exporte para ver todos.</p>}
        </div>
      </div>
    </div>
  );
}

export default Relatorios;
