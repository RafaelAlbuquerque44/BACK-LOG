const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database('./vendas.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dados_envios TEXT,
        sdr TEXT,
        cnpj TEXT,
        razao_social TEXT,
        origem_cliente TEXT,
        seguimento_empresa TEXT,
        produto TEXT,
        consultora TEXT,
        nome_gestor TEXT,
        email_gestor TEXT,
        telefone_gestor TEXT,
        endereco_empresa TEXT,
        obs_consultora TEXT,
        status_cliente TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, () => {
      // Create default admin if not exists
      db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
        if (!row) {
          db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', 'admin123', 'admin']);
        }
      });
    });
  }
});

// Login User
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err || !row) {
      res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    } else {
      res.json({ success: true, message: 'Login realizado com sucesso', user: { id: row.id, username: row.username, role: row.role } });
    }
  });
});

// Update Sale Status (Quick update for Kanban)
app.patch('/api/vendas/:id/status', (req, res) => {
  const { status_cliente } = req.body;
  db.run('UPDATE vendas SET status_cliente = ? WHERE id = ?', [status_cliente, req.params.id], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'Status atualizado com sucesso', changes: this.changes });
  });
});

// Create a new sale
app.post('/api/vendas', (req, res) => {
  const {
    dados_envios, sdr, cnpj, razao_social, origem_cliente,
    seguimento_empresa, produto, consultora, nome_gestor,
    email_gestor, telefone_gestor, endereco_empresa,
    obs_consultora, status_cliente
  } = req.body;

  const sql = `
    INSERT INTO vendas (
      dados_envios, sdr, cnpj, razao_social, origem_cliente,
      seguimento_empresa, produto, consultora, nome_gestor,
      email_gestor, telefone_gestor, endereco_empresa,
      obs_consultora, status_cliente
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    dados_envios, sdr, cnpj, razao_social, origem_cliente,
    seguimento_empresa, produto, consultora, nome_gestor,
    email_gestor, telefone_gestor, endereco_empresa,
    obs_consultora, status_cliente
  ];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Venda criada com sucesso',
      data: { id: this.lastID }
    });
  });
});

// Get all sales
app.get('/api/vendas', (req, res) => {
  const sql = 'SELECT * FROM vendas ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// Get a single sale
app.get('/api/vendas/:id', (req, res) => {
  const sql = 'SELECT * FROM vendas WHERE id = ?';
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: row
    });
  });
});

// Update a sale
app.put('/api/vendas/:id', (req, res) => {
  const {
    dados_envios, sdr, cnpj, razao_social, origem_cliente,
    seguimento_empresa, produto, consultora, nome_gestor,
    email_gestor, telefone_gestor, endereco_empresa,
    obs_consultora, status_cliente
  } = req.body;

  const sql = `
    UPDATE vendas SET 
      dados_envios = ?, sdr = ?, cnpj = ?, razao_social = ?, origem_cliente = ?,
      seguimento_empresa = ?, produto = ?, consultora = ?, nome_gestor = ?,
      email_gestor = ?, telefone_gestor = ?, endereco_empresa = ?,
      obs_consultora = ?, status_cliente = ?
    WHERE id = ?
  `;
  const params = [
    dados_envios, sdr, cnpj, razao_social, origem_cliente,
    seguimento_empresa, produto, consultora, nome_gestor,
    email_gestor, telefone_gestor, endereco_empresa,
    obs_consultora, status_cliente, req.params.id
  ];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Venda atualizada com sucesso',
      changes: this.changes
    });
  });
});

// Delete a sale
app.delete('/api/vendas/:id', (req, res) => {
  const sql = 'DELETE FROM vendas WHERE id = ?';
  db.run(sql, [req.params.id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Venda deletada com sucesso',
      changes: this.changes
    });
  });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
