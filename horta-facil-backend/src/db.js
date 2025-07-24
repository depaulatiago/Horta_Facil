const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./horta.db');

// Crie a tabela se ainda não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS hortas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT
    )
  `);
});

module.exports = db;
