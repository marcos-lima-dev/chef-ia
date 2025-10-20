const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rota proxy para a API do Ollama
app.post('/api/ollama-proxy', async (req, res) => {
  try {
    console.log('📤 Recebida requisição no proxy...');
    console.log('Modelo:', req.body.model);
    
    const response = await axios.post('https://ollama.com/api/chat', req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OLLAMA_API_KEY}`
      },
      timeout: 60000
    });

    console.log('✅ Resposta recebida da Ollama Cloud');
    res.json(response.data);
  } catch (error) {
    console.error('❌ Erro no proxy:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data.error || error.message
      });
    } else {
      res.status(500).json({
        error: error.message
      });
    }
  }
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Proxy server running',
    timestamp: new Date().toISOString()
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Chef IA Proxy Server',
    endpoints: {
      health: '/health',
      ollama: '/api/ollama-proxy'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`🔧 Endpoint: http://localhost:${PORT}/api/ollama-proxy`);
});