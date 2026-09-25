import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';

function NovaVenda() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dados_envios: '',
    sdr: '',
    cnpj: '',
    razao_social: '',
    origem_cliente: '',
    seguimento_empresa: 'PME',
    produto: '',
    consultora: '',
    nome_gestor: '',
    email_gestor: '',
    telefone_gestor: '',
    endereco_empresa: '',
    obs_consultora: '',
    status_cliente: 'Pendente'
  });
  const [opcoes, setOpcoes] = useState([]);

  useEffect(() => {
    axios.get('/api/opcoes')
      .then(res => setOpcoes(res.data.data || []))
      .catch(err => console.error(err));
  }, []);

  const maskCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const maskPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
      .slice(0, 15);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let maskedValue = value;
    
    if (name === 'cnpj') maskedValue = maskCNPJ(value);
    if (name === 'telefone_gestor') maskedValue = maskPhone(value);

    setFormData(prev => ({ ...prev, [name]: maskedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/vendas', formData)
      .then(() => {
        alert('Venda registrada com sucesso!');
        navigate('/vendas');
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao salvar a venda.');
      });
  };

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h2>Nova Venda</h2>
          <p style={{ color: 'var(--text-muted)' }}>Cadastre os dados de uma nova venda ou cliente</p>
        </div>
        <Link to="/vendas" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={18} />
          Voltar
        </Link>
      </div>

      <div className="glass-panel card">
        <form onSubmit={handleSubmit}>
          
          <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Informações da Empresa
          </h4>
          <div className="form-grid" style={{ marginBottom: '2rem' }}>
            <div className="form-group">
              <label>Razão Social</label>
              <input required type="text" className="form-control" name="razao_social" value={formData.razao_social} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>CNPJ</label>
              <input required type="text" className="form-control" name="cnpj" value={formData.cnpj} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Seguimento da Empresa</label>
              <select className="form-control" name="seguimento_empresa" value={formData.seguimento_empresa} onChange={handleChange}>
                <option value="">Selecione...</option>
                {opcoes.filter(o => o.categoria === 'segmento').map(o => <option key={o.id} value={o.valor}>{o.valor}</option>)}
                <option value="PME">PME (Pequenas e Médias)</option>
                <option value="Grande Porte">Grande Porte</option>
                <option value="Governo">Governo</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="form-group">
              <label>Endereço da Empresa</label>
              <input type="text" className="form-control" name="endereco_empresa" value={formData.endereco_empresa} onChange={handleChange} />
            </div>
          </div>

          <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Informações do Gestor
          </h4>
          <div className="form-grid" style={{ marginBottom: '2rem' }}>
            <div className="form-group">
              <label>Nome do Gestor</label>
              <input required type="text" className="form-control" name="nome_gestor" value={formData.nome_gestor} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" className="form-control" name="email_gestor" value={formData.email_gestor} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Telefone do Gestor</label>
              <input required type="text" className="form-control" name="telefone_gestor" value={formData.telefone_gestor} onChange={handleChange} />
            </div>
          </div>

          <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Detalhes da Venda
          </h4>
          <div className="form-grid" style={{ marginBottom: '2rem' }}>
            <div className="form-group">
              <label>Produto</label>
              <select required className="form-control" name="produto" value={formData.produto} onChange={handleChange}>
                <option value="">Selecione...</option>
                {opcoes.filter(o => o.categoria === 'produto').map(o => <option key={o.id} value={o.valor}>{o.valor}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>SDR</label>
              <select className="form-control" name="sdr" value={formData.sdr} onChange={handleChange}>
                <option value="">Selecione...</option>
                {opcoes.filter(o => o.categoria === 'sdr').map(o => <option key={o.id} value={o.valor}>{o.valor}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Consultora</label>
              <select className="form-control" name="consultora" value={formData.consultora} onChange={handleChange}>
                <option value="">Backlog (Sem Consultora)</option>
                {opcoes.filter(o => o.categoria === 'consultora').map(o => <option key={o.id} value={o.valor}>{o.valor}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Origem do Cliente</label>
              <input type="text" className="form-control" name="origem_cliente" value={formData.origem_cliente} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Status do Cliente</label>
              <select className="form-control" name="status_cliente" value={formData.status_cliente} onChange={handleChange}>
                <option value="Pendente">Pendente</option>
                {opcoes.filter(o => o.categoria === 'status').map(o => <option key={o.id} value={o.valor}>{o.valor}</option>)}
              </select>
            </div>
          </div>

          <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Outras Informações
          </h4>
          <div className="form-grid" style={{ marginBottom: '2rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>OBS SDR</label>
              <textarea className="form-control" name="dados_envios" value={formData.dados_envios} onChange={handleChange} rows={3}></textarea>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>OBS Consultora</label>
              <textarea className="form-control" name="obs_consultora" value={formData.obs_consultora} onChange={handleChange} rows={3}></textarea>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              Salvar Venda
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default NovaVenda;
