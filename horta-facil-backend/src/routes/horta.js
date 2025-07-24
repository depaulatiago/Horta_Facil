const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todas as hortas
router.get('/', (req, res) => {
  db.all('SELECT * FROM hortas', (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

// Criar nova horta
router.post('/', (req, res) => {
  const { nome, descricao } = req.body;
  db.run('INSERT INTO hortas (nome, descricao) VALUES (?, ?)', [nome, descricao], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.status(201).json({ id: this.lastID, nome, descricao });
  });
});

// Atualizar horta
router.put('/:id', (req, res) => {
  const { nome, descricao } = req.body;
  db.run(
    'UPDATE hortas SET nome = ?, descricao = ? WHERE id = ?',
    [nome, descricao, req.params.id],
    function(err) {
      if (err) return res.status(500).json({error: err.message});
      res.json({ id: req.params.id, nome, descricao });
    }
  );
});

// Deletar horta
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM hortas WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.status(204).send();
  });
});

module.exports = router;
