const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./vendas.db');

db.serialize(() => {
  db.run("DELETE FROM opcoes_sistema WHERE categoria = 'produto'");
  const stmt = db.prepare("INSERT INTO opcoes_sistema (categoria, valor) VALUES (?, ?)");
  
  const produtos = [
    'Mobilidade',
    'Voz Avançada',
    'Internet Fibra',
    'Internet Dedicada',
    'Licenças Microsoft',
    'Equipamentos'
  ];
  
  for (const prod of produtos) {
    stmt.run('produto', prod);
  }
  
  stmt.finalize();
});

db.close(() => {
  console.log('Produtos atualizados com sucesso no banco de dados.');
});
