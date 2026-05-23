const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HISTORY_FILE = path.join(__dirname, 'history.json');

// Middleware para JSON e arquivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/mathjs', express.static(path.join(__dirname, 'node_modules', 'mathjs')));

// Função auxiliar para ler o histórico
async function readHistory() {
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existir ou estiver corrompido, retorna um array vazio
    if (error.code === 'ENOENT') {
      await writeHistory([]);
      return [];
    }
    console.error('Erro ao ler o histórico:', error);
    return [];
  }
}

// Função auxiliar para gravar o histórico
async function writeHistory(history) {
  try {
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao gravar o histórico:', error);
  }
}

// Rotas da API

// GET /api/history - Retorna o histórico de cálculos
app.get('/api/history', async (req, res) => {
  const history = await readHistory();
  res.json(history);
});

// POST /api/history - Adiciona um novo cálculo ao histórico
app.post('/api/history', async (req, res) => {
  const { expression, result, type, timestamp } = req.body;
  
  if (!expression || result === undefined) {
    return res.status(400).json({ error: 'Expressão e resultado são obrigatórios.' });
  }

  const history = await readHistory();
  const newEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    expression,
    result,
    type: type || 'scientific',
    timestamp: timestamp || new Date().toISOString()
  };

  // Mantém os últimos 50 registros no histórico para economia de espaço
  history.unshift(newEntry);
  if (history.length > 50) {
    history.pop();
  }

  await writeHistory(history);
  res.status(201).json(newEntry);
});

// DELETE /api/history - Limpa o histórico de cálculos
app.delete('/api/history', async (req, res) => {
  await writeHistory([]);
  res.json({ message: 'Histórico limpo com sucesso.' });
});

// Rota coringa para servir o index.html em qualquer rota desconhecida (estilo SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Calculadora Avançada rodando em http://localhost:${PORT}`);
  console.log(`📁 Servindo arquivos de: ${path.join(__dirname, 'public')}`);
  console.log(`💾 Histórico persistido em: ${HISTORY_FILE}`);
  console.log(`==================================================`);
});
