import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';

function EditarVenda() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    axios.get(`http://localhost:3001/api/vendas/${id}`)
      .then(res => {
        if (res.data.data) {
          setFormData(res.data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

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
    axios.put(`http://localhost:3001/api/vendas/${id}`, formData)
      .then(() => {
        alert('Venda atualizada com sucesso!');
        navigate('/vendas');
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao atualizar a venda.');
      });
  };

  if (loading) return <div className="animate-fade-in"><div className="empty-state">Carregando dados...</div></div>;

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h2>Editar Venda</h2>
          <p style={{ color: 'var(--text-muted)' }}>Atualize os dados desta venda</p>
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
              <input required type="text" className="form-control" name="razao_social" value={formData.razao_social || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>CNPJ</label>
              <input required type="text" className="form-control" name="cnpj" value={formData.cnpj || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Seguimento da Empresa</label>
              <select className="form-control" name="seguimento_empresa" value={formData.seguimento_empresa || 'PME'} onChange={handleChange}>
                <option value="PME">PME (Pequenas e Médias)</option>
                <option value="Grande Porte">Grande Porte</option>
                <option value="Governo">Governo</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="form-group">
              <label>Endereço da Empresa</label>
              <input type="text" className="form-control" name="endereco_empresa" value={formData.endereco_empresa || ''} onChange={handleChange} />
            </div>
          </div>

          <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Informações do Gestor
          </h4>
          <div className="form-grid" style={{ marginBottom: '2rem' }}>
            <div className="form-group">
              <label>Nome do Gestor</label>
              <input required type="text" className="form-control" name="nome_gestor" value={formData.nome_gestor || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" className="form-control" name="email_gestor" value={formData.email_gestor || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Telefone do Gestor</label>
              <input required type="text" className="form-control" name="telefone_gestor" value={formData.telefone_gestor || ''} onChange={handleChange} />
            </div>
          </div>

          <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Detalhes da Venda
          </h4>
          <div className="form-grid" style={{ marginBottom: '2rem' }}>
            <div className="form-group">
              <label>Produto (Ex: VVN 5G)</label>
              <input required type="text" className="form-control" name="produto" value={formData.produto || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>SDR</label>
              <input type="text" className="form-control" name="sdr" value={formData.sdr || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Consultora</label>
              <input type="text" className="form-control" name="consultora" value={formData.consultora || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Origem do Cliente</label>
              <input type="text" className="form-control" name="origem_cliente" value={formData.origem_cliente || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Status do Cliente</label>
              <select className="form-control" name="status_cliente" value={formData.status_cliente || 'Pendente'} onChange={handleChange}>
                <option value="Ativo">Ativo</option>
                <option value="Pendente">Pendente</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Outras Informações
          </h4>
          <div className="form-grid" style={{ marginBottom: '2rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Dados de Envios</label>
              <textarea className="form-control" name="dados_envios" value={formData.dados_envios || ''} onChange={handleChange} rows={3}></textarea>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>OBS Consultora</label>
              <textarea className="form-control" name="obs_consultora" value={formData.obs_consultora || ''} onChange={handleChange} rows={3}></textarea>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              Salvar Alterações
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditarVenda;
