const express = require('express');
const cors = require('cors');

const hortaRoutes = require('./routes/horta');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/hortas', hortaRoutes);

app.get('/', (req, res) => {
  res.send('API Horta Fácil rodando com SQLite!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
