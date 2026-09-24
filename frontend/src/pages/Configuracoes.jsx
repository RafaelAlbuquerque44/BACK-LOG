import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Shield, Bell, User, Plus, Trash2 } from 'lucide-react';

function Configuracoes() {
  const [opcoes, setOpcoes] = useState([]);
  const [novaOpcao, setNovaOpcao] = useState({ categoria: 'produto', valor: '' });

  const fetchOpcoes = () => {
    axios.get('http://localhost:3001/api/opcoes')
      .then(res => setOpcoes(res.data.data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchOpcoes();
  }, []);

  const handleAddOpcao = (e) => {
    e.preventDefault();
    if (!novaOpcao.valor.trim()) return;
    axios.post('http://localhost:3001/api/opcoes', novaOpcao)
      .then(() => {
        setNovaOpcao({ ...novaOpcao, valor: '' });
        fetchOpcoes();
      })
      .catch(err => alert('Erro ao adicionar opção'));
  };

  const handleDeleteOpcao = (id) => {
    if (!window.confirm('Excluir esta opção?')) return;
    axios.delete(`http://localhost:3001/api/opcoes/${id}`)
      .then(() => fetchOpcoes())
      .catch(err => alert('Erro ao excluir opção'));
  };

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h2>Configurações do Sistema</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie as opções de seleção e preferências globais</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="glass-panel card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Settings size={20} color="var(--primary)" />
            Opções Dinâmicas (Listas de Seleção)
          </h3>
          
          <form onSubmit={handleAddOpcao} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Categoria</label>
              <select 
                className="form-control" 
                value={novaOpcao.categoria} 
                onChange={e => setNovaOpcao({...novaOpcao, categoria: e.target.value})}
              >
                <option value="produto">Produto</option>
                <option value="status">Status do Cliente</option>
                <option value="segmento">Segmento (PME, etc)</option>
                <option value="origem">Origem do Cliente</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Novo Valor</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ex: VVN 5G Premium"
                value={novaOpcao.valor}
                onChange={e => setNovaOpcao({...novaOpcao, valor: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <Plus size={18} /> Adicionar
            </button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {['produto', 'status', 'segmento', 'origem'].map(cat => (
              <div key={cat} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ textTransform: 'capitalize', marginBottom: '1rem', color: 'var(--primary)' }}>{cat}s</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {opcoes.filter(o => o.categoria === cat).map(opcao => (
                    <li key={opcao.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span>{opcao.valor}</span>
                      <button onClick={() => handleDeleteOpcao(opcao.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                  {opcoes.filter(o => o.categoria === cat).length === 0 && (
                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhuma opção cadastrada.</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <User size={20} color="var(--primary)" />
            Gerenciar Consultoras (Em breve)
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>A gestão de contas de vendedoras e alteração de senhas será ativada na versão 1.1.</p>
        </div>
      </div>
    </div>
  );
}

export default Configuracoes;
