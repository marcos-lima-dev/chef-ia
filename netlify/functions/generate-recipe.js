const axios = require('axios');

exports.handler = async (event, context) => {
  console.log('🚀 Function generate-recipe invoked');
  
  // Configuração de CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Responder a preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Só permite POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    console.log('📦 Parsing request body...');
    const { ingredients, preferences } = JSON.parse(event.body);
    
    console.log('🎯 Ingredients:', ingredients);
    console.log('🎯 Preferences:', preferences);
    console.log('🔑 API Key present:', !!process.env.OLLAMA_API_KEY);

    const SYSTEM_PROMPT = `Você é um chef profissional brasileiro premiado com estrela Michelin. Responda APENAS com JSON.

ESTRUTURA PARA INGREDIENTES VÁLIDOS:
{
  "nome": "Nome da receita",
  "emoji": "🍳",
  "tempoPreparo": "XX minutos",
  "rendimento": "X porções",
  "dificuldade": "Fácil|Média|Difícil",
  "ingredientes": [{"item": "Nome", "quantidade": "XXXg"}],
  "modoPreparo": ["Passo 1", "Passo 2"],
  "dicas": "Dica do chef"
}

ESTRUTURA PARA INGREDIENTES INVÁLIDOS:
{
  "erro": "Mensagem bem-humorada",
  "sugestao": "Sugestão opcional"
}`;

    const userMessage = preferences 
      ? `Crie uma receita usando: ${ingredients}. Preferências: ${preferences}`
      : `Crie uma receita usando: ${ingredients}`;

    console.log('📤 Enviando para Ollama Cloud...');

    const response = await axios.post('https://ollama.com/api/chat', {
      model: 'gpt-oss:120b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      stream: false,
      temperature: 0.8
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OLLAMA_API_KEY}`
      },
      timeout: 60000
    });

    console.log('✅ Resposta recebida da Ollama');

    const content = response.data.message?.content;
    
    if (!content) {
      throw new Error('Resposta vazia da API Ollama');
    }

    console.log('📄 Conteúdo bruto:', content.substring(0, 200) + '...');

    let jsonContent = content.trim();
    
    // Limpar JSON
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\s*/g, '').replace(/```\s*$/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\s*/g, '').replace(/```\s*$/g, '');
    }

    const recipeData = JSON.parse(jsonContent);

    // Verificar se é erro do chef
    if (recipeData.erro) {
      console.log('👨‍🍳 Chef recusou ingredientes');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          error: recipeData.erro,
          suggestion: recipeData.sugestao,
          isChefRefusal: true
        })
      };
    }

    console.log('🍳 Receita gerada:', recipeData.nome);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(recipeData)
    };

  } catch (error) {
    console.error('❌ Erro na function:', error.message);
    console.error('Stack:', error.stack);
    
    let statusCode = 500;
    let errorMessage = 'Erro interno do servidor';

    if (error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.error || error.message;
    } else if (error.request) {
      errorMessage = 'Não foi possível conectar à API Ollama';
    } else {
      errorMessage = error.message;
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({ 
        error: errorMessage 
      })
    };
  }
};