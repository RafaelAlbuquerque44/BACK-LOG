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
    
    db.serialize(() => {
      // Vendas Table
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

      // Users Table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          password TEXT,
          role TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, () => {
        db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
          if (!row) {
            db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', 'admin123', 'admin']);
          }
        });
      });

      // History Table
      db.run(`
        CREATE TABLE IF NOT EXISTS vendas_historico (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          venda_id INTEGER,
          consultora TEXT,
          status_anterior TEXT,
          status_novo TEXT,
          data DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Dynamic Options Table
      db.run(`
        CREATE TABLE IF NOT EXISTS opcoes_sistema (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          categoria TEXT,
          valor TEXT
        )
      `, () => {
        // Populate default options if empty
        db.get('SELECT count(*) as count FROM opcoes_sistema', (err, row) => {
          if (row && row.count === 0) {
            const defaults = [
              ['status', 'Ativo'],
              ['status', 'Em negociação'],
              ['status', 'Sem contato'],
              ['status', 'Sem interesse'],
              ['produto', 'VVN 5G'],
              ['produto', 'Banda Larga'],
              ['segmento', 'PME'],
              ['segmento', 'Grande Porte'],
              ['segmento', 'Governo']
            ];
            const stmt = db.prepare('INSERT INTO opcoes_sistema (categoria, valor) VALUES (?, ?)');
            defaults.forEach(d => stmt.run(d));
            stmt.finalize();
          }
        });
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

// Get options
app.get('/api/opcoes', (req, res) => {
  db.all('SELECT * FROM opcoes_sistema', [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ data: rows });
  });
});

app.post('/api/opcoes', (req, res) => {
  const { categoria, valor } = req.body;
  db.run('INSERT INTO opcoes_sistema (categoria, valor) VALUES (?, ?)', [categoria, valor], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, categoria, valor });
  });
});

app.delete('/api/opcoes/:id', (req, res) => {
  db.run('DELETE FROM opcoes_sistema WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ success: true });
  });
});

// Update Sale Status (Quick update for Kanban & Consultoras)
app.patch('/api/vendas/:id/status', (req, res) => {
  const { status_cliente, consultora } = req.body;
  const vendaId = req.params.id;

  // First get the current status to save in history
  db.get('SELECT status_cliente, consultora FROM vendas WHERE id = ?', [vendaId], (err, row) => {
    if (err || !row) return res.status(400).json({ error: 'Venda não encontrada' });
    
    const statusAnterior = row.status_cliente;
    const nomeConsultora = consultora || row.consultora || 'Desconhecida';
    
    // Negative status logic (Bounce back to backlog)
    const negativeStatuses = ['Sem contato', 'Sem interesse', 'Não tem interesse', 'Inativo'];
    const isNegative = negativeStatuses.includes(status_cliente);
    
    let novoStatus = status_cliente;
    let novaConsultora = row.consultora;
    
    if (isNegative) {
      novoStatus = 'Pendente'; // Reset to pendente for the backlog
      novaConsultora = ''; // Remove from consultora
    }

    db.run('UPDATE vendas SET status_cliente = ?, consultora = ? WHERE id = ?', [novoStatus, novaConsultora, vendaId], function(err) {
      if (err) return res.status(400).json({ error: err.message });
      
      // Save history
      db.run('INSERT INTO vendas_historico (venda_id, consultora, status_anterior, status_novo) VALUES (?, ?, ?, ?)', 
        [vendaId, nomeConsultora, statusAnterior, status_cliente] // save original intent in history
      );

      res.json({ message: 'Status atualizado com sucesso', changes: this.changes, bounced: isNegative });
    });
  });
});

// Get all sales (with role-based filtering)
app.get('/api/vendas', (req, res) => {
  const { consultora } = req.query; // If provided, means it's a consultora view
  
  if (consultora) {
    // Consultora logic: All her non-pendent + max 3 pendentes
    const sql = `
      SELECT * FROM vendas 
      WHERE consultora = ? AND status_cliente != 'Pendente'
      UNION ALL
      SELECT * FROM vendas 
      WHERE consultora = ? AND status_cliente = 'Pendente'
      ORDER BY created_at ASC
      LIMIT 3
    `;
    // Wait, UNION ALL limit applies to the whole result. We want ALL active + 3 pendentes.
    // Let's just fetch all her assigned, and slice the pendentes in memory to be safe and easy.
    db.all('SELECT * FROM vendas WHERE consultora = ? ORDER BY created_at ASC', [consultora], (err, rows) => {
      if (err) return res.status(400).json({ error: err.message });
      
      const nonPendent = rows.filter(r => r.status_cliente !== 'Pendente');
      const pendent = rows.filter(r => r.status_cliente === 'Pendente').slice(0, 3);
      
      res.json({ data: [...nonPendent, ...pendent] });
    });
  } else {
    // Admin view
    db.all('SELECT * FROM vendas ORDER BY created_at DESC', [], (err, rows) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ data: rows });
    });
  }
});

// Get sale history
app.get('/api/vendas/:id/historico', (req, res) => {
  db.all('SELECT * FROM vendas_historico WHERE venda_id = ? ORDER BY data DESC', [req.params.id], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ data: rows });
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

// --- USER MANAGEMENT ENDPOINTS ---
app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, role FROM users', [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ data: rows });
  });
});

app.post('/api/users', (req, res) => {
  const { username, password, role } = req.body;
  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, username, role });
  });
});

app.put('/api/users/:id', (req, res) => {
  const { username, password, role } = req.body;
  if (password) {
    db.run('UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?', [username, password, role, req.params.id], function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ success: true });
    });
  } else {
    db.run('UPDATE users SET username = ?, role = ? WHERE id = ?', [username, role, req.params.id], function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ success: true });
    });
  }
});

app.delete('/api/users/:id', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
