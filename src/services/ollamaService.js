import axios from 'axios';

// Configuração: detectar ambiente automaticamente
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const USE_NETLIFY_FUNCTION = !IS_DEVELOPMENT; // Usar function em produção

// URLs baseadas no ambiente
const NETLIFY_FUNCTION_URL = '/.netlify/functions/generate-recipe';
const LOCAL_PROXY_URL = 'http://localhost:3001/api/ollama-proxy';

// API Key (apenas para desenvolvimento)
const API_KEY = process.env.REACT_APP_OLLAMA_API_KEY || '';

// Modelo
const MODEL = 'gpt-oss:120b';

/**
 * Sistema de prompt otimizado para receitas COM VALIDAÇÃO INTELIGENTE
 */
const SYSTEM_PROMPT = `Você é um chef profissional brasileiro premiado com estrela Michelin, criativo, experiente e com senso de humor.

IMPORTANTE: Você DEVE validar se os ingredientes fornecidos são realmente comestíveis e adequados para uma receita culinária.

SE OS INGREDIENTES FOREM VÁLIDOS (alimentos reais e comestíveis):
- Responda com um JSON válido contendo a receita completa
- Use sua criatividade para criar pratos deliciosos

SE OS INGREDIENTES FOREM INVÁLIDOS (não são alimentos, objetos, códigos, tecnologia, etc):
- Responda com um JSON contendo apenas o campo "erro" com uma mensagem bem-humorada e profissional
- Use criatividade e bom humor na recusa
- Mantenha o tom leve mas deixe claro que não pode criar receitas com ingredientes não-comestíveis
- Opcionalmente, sugira ingredientes reais que poderiam ser usados

ESTRUTURA DE RESPOSTA PARA INGREDIENTES VÁLIDOS:
{
  "nome": "Nome criativo e apetitoso da receita",
  "emoji": "🍳",
  "tempoPreparo": "XX minutos",
  "rendimento": "X porções",
  "dificuldade": "Fácil|Média|Difícil",
  "ingredientes": [
    {"item": "Nome do ingrediente", "quantidade": "XXXg/ml/unidade"}
  ],
  "modoPreparo": [
    "Passo 1 detalhado...",
    "Passo 2 detalhado..."
  ],
  "dicas": "Uma dica valiosa do chef"
}

ESTRUTURA DE RESPOSTA PARA INGREDIENTES INVÁLIDOS:
{
  "erro": "Mensagem bem-humorada explicando que não pode fazer receitas com esses 'ingredientes'",
  "sugestao": "Sugestão opcional de ingredientes reais que o usuário poderia usar"
}

EXEMPLOS DE RESPOSTAS DE ERRO (seja criativo e use seu próprio estilo):
- "Você está com fome mesmo, hein? 😅 Mas infelizmente HTML, CSS e JavaScript não são comestíveis! Que tal tentar com tomate, cebola e alho?"
- "Adoraria te ajudar, mas não posso arriscar minha estrela Michelin preparando receitas com código! 👨‍🍳 Experimente ingredientes de verdade como frango, arroz e legumes."
- "Hmm... parece que você confundiu a cozinha com a oficina! 🔨 Pregos e martelos não são comestíveis. Que tal experimentar com ingredientes reais?"
- "Ei, eu sou chef, não técnico de TI! 💻 Esses 'ingredientes' não cabem na minha cozinha. Tente com alimentos de verdade!"

REGRAS IMPORTANTES:
- Seja criativo mas prático nas receitas válidas
- Use quantidades realistas e precisas
- Passos claros, objetivos e numerados (mínimo 5 passos)
- Nome atraente em português brasileiro
- Escolha um emoji adequado ao prato
- Dica deve ser útil e relevante
- SEMPRE verifique se os ingredientes são realmente alimentos antes de criar a receita
- Se houver dúvida sobre um ingrediente, prefira recusar com bom humor
- Se houver MIX de ingredientes válidos e inválidos, mencione os válidos na sugestão`;

/**
 * Gera uma receita usando Netlify Function (produção) ou Proxy Local (desenvolvimento)
 * @param {string} ingredients - Ingredientes disponíveis
 * @param {string} preferences - Preferências culinárias (opcional)
 * @returns {Promise<Object>} - Objeto com dados da receita
 */
export const generateRecipeFromOllama = async (ingredients, preferences = '') => {
  try {
    console.log('🔄 Iniciando geração de receita...');
    console.log('Ambiente:', IS_DEVELOPMENT ? 'Desenvolvimento' : 'Produção');
    console.log('Ingredientes:', ingredients);
    console.log('Preferências:', preferences);

    let recipeData;
    
    if (USE_NETLIFY_FUNCTION) {
      // 🚀 Modo produção: Netlify Function
      console.log('📤 Enviando para Netlify Function...');
      
      const response = await fetch(NETLIFY_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          preferences
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      const result = await response.json();
      
      // Verificar se a function retornou erro
      if (result.error) {
        const error = new Error(result.error);
        if (result.isChefRefusal) {
          error.isChefRefusal = true;
          error.suggestion = result.suggestion;
        }
        throw error;
      }
      
      console.log('✅ Receita recebida da Netlify Function');
      recipeData = result;

    } else {
      // 💻 Modo desenvolvimento: Proxy Local
      console.log('📤 Enviando para proxy local...');
      
      const userMessage = preferences 
        ? `Crie uma receita deliciosa usando principalmente: ${ingredients}.\n\nPreferências: ${preferences}`
        : `Crie uma receita deliciosa usando principalmente: ${ingredients}`;

      const payload = {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        stream: false,
        temperature: 0.8,
      };

      const response = await axios.post(LOCAL_PROXY_URL, payload, {
        timeout: 60000
      });

      console.log('✅ Resposta recebida do proxy local');

      const content = response.data.message?.content;
      
      if (!content) {
        throw new Error('Resposta vazia da API');
      }

      // Processar resposta
      let jsonContent = content.trim();
      
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/g, '').replace(/```\s*$/g, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/g, '').replace(/```\s*$/g, '');
      }

      jsonContent = jsonContent.trim();
      recipeData = JSON.parse(jsonContent);
      
      // Verificar se é erro do chef
      if (recipeData.erro) {
        const error = new Error(recipeData.erro);
        error.isChefRefusal = true;
        error.suggestion = recipeData.sugestao;
        throw error;
      }

      console.log('✨ Resposta processada do proxy local');
    }

    // ⚡ VALIDAÇÃO COMUM PARA AMBOS OS MODOS
    console.log('🔍 Validando estrutura da receita...');

    // Verificar se é erro do chef (fallback)
    if (recipeData.erro) {
      console.log('⚠️ Chef recusou os ingredientes:', recipeData.erro);
      const error = new Error(recipeData.erro);
      error.isChefRefusal = true;
      error.suggestion = recipeData.sugestao;
      throw error;
    }

    // Validar estrutura básica da receita
    if (!recipeData.nome || !recipeData.ingredientes || !recipeData.modoPreparo) {
      console.error('Dados recebidos:', recipeData);
      throw new Error('Estrutura de receita inválida');
    }

    // Garantir que ingredientes e passos são arrays
    if (!Array.isArray(recipeData.ingredientes)) {
      throw new Error('Ingredientes devem ser um array');
    }
    if (!Array.isArray(recipeData.modoPreparo)) {
      throw new Error('Modo de preparo deve ser um array');
    }

    console.log('✅ Receita válida gerada!');
    console.log('Nome:', recipeData.nome);
    console.log('Tempo:', recipeData.tempoPreparo);
    console.log('Rendimento:', recipeData.rendimento);

    return recipeData;

  } catch (error) {
    console.error('❌ Erro ao gerar receita:', error);

    // Se já é um erro customizado (do chef), apenas repassar
    if (error.isChefRefusal) {
      throw error;
    }

    // Tratamento de erros de rede/conexão
    if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
      if (USE_NETLIFY_FUNCTION) {
        throw new Error('Erro de conexão com o servidor. Tente novamente em alguns instantes.');
      } else {
        throw new Error('Proxy local não encontrado. Certifique-se de executar: node proxy-server.js');
      }
    }

    if (error.code === 'ECONNREFUSED') {
      if (USE_NETLIFY_FUNCTION) {
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        throw new Error('Proxy local não encontrado. Execute: node proxy-server.js');
      }
    }

    if (error.code === 'ETIMEDOUT') {
      throw new Error('A requisição demorou muito. Tente novamente.');
    }

    if (error.message.includes('JSON')) {
      throw new Error('A IA retornou uma resposta inválida. Tente novamente.');
    }

    // Outros erros
    throw new Error(error.message || 'Erro ao gerar receita. Tente novamente.');
  }
};

/**
 * Gera receita com streaming (efeito de digitação em tempo real)
 * @param {string} ingredients - Ingredientes
 * @param {string} preferences - Preferências
 * @param {Function} onChunk - Callback chamado para cada pedaço de texto recebido
 * @returns {Promise<Object>} - Receita completa
 */
export const generateRecipeWithStreaming = async (ingredients, preferences = '', onChunk) => {
  try {
    const userMessage = preferences 
      ? `Crie uma receita usando: ${ingredients}. Preferências: ${preferences}`
      : `Crie uma receita usando: ${ingredients}`;

    if (USE_NETLIFY_FUNCTION) {
      // Streaming não suportado via Netlify Function ainda
      console.warn('⚠️ Streaming não suportado em produção. Usando modo normal...');
      return await generateRecipeFromOllama(ingredients, preferences);
    }

    // 💻 Modo desenvolvimento: Proxy Local com Streaming
    const payload = {
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      stream: true,
      temperature: 0.8
    };

    const response = await fetch(LOCAL_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          const content = parsed.message?.content || '';
          
          if (content) {
            fullText += content;
            if (onChunk) onChunk(content);
          }

          if (parsed.done) {
            break;
          }
        } catch (e) {
          console.error('Erro ao parsear linha:', e);
        }
      }
    }

    let jsonContent = fullText.trim();
    
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\s*/g, '').replace(/```\s*$/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\s*/g, '').replace(/```\s*$/g, '');
    }

    const recipeData = JSON.parse(jsonContent);

    if (recipeData.erro) {
      const error = new Error(recipeData.erro);
      error.isChefRefusal = true;
      error.suggestion = recipeData.sugestao;
      throw error;
    }

    return recipeData;

  } catch (error) {
    console.error('Erro no streaming:', error);
    throw error;
  }
};

/**
 * Receita mock para testes (quando não há API configurada)
 */
export const generateRecipeMock = async (ingredients, preferences = '') => {
  console.log('⚠️ Usando receita MOCK (para testes)');
  
  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 2000));

  const ingredientList = ingredients.split(',').map(i => i.trim());
  const mainIngredient = ingredientList[0] || 'ingredientes variados';

  return {
    nome: `Receita Especial com ${mainIngredient}`,
    emoji: '🍳',
    tempoPreparo: '35 minutos',
    rendimento: '4 porções',
    dificuldade: 'Média',
    ingredientes: [
      { item: mainIngredient, quantidade: '500g' },
      { item: 'Temperos variados', quantidade: 'A gosto' },
      { item: 'Azeite de oliva', quantidade: '3 colheres' },
      { item: 'Sal e pimenta', quantidade: 'A gosto' },
      { item: 'Cebola', quantidade: '1 unidade' },
      { item: 'Alho', quantidade: '2 dentes' }
    ],
    modoPreparo: [
      'Prepare todos os ingredientes, lavando e cortando conforme necessário.',
      'Em uma panela, aqueça o azeite em fogo médio.',
      'Adicione a cebola e o alho picados, refogando até dourar.',
      `Adicione ${mainIngredient} e refogue por 5 minutos.`,
      'Tempere com sal e pimenta a gosto.',
      'Cozinhe em fogo baixo até atingir o ponto desejado.',
      'Ajuste os temperos se necessário.',
      'Sirva quente e aproveite!'
    ],
    dicas: `💡 Esta é uma receita MOCK para testes. Ingredientes usados: ${ingredients}. ${preferences ? `Preferências: ${preferences}` : ''}`
  };
};

/**
 * Testa a conexão com a API
 */
export const testConnection = async () => {
  try {
    if (USE_NETLIFY_FUNCTION) {
      // Testar Netlify Function com uma requisição simples
      const response = await fetch(NETLIFY_FUNCTION_URL, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ingredients: 'teste, conexão',
          preferences: 'teste de conexão' 
        })
      });
      
      const isOk = response.ok;
      console.log('🔗 Teste Netlify Function:', isOk ? '✅ OK' : '❌ Falhou');
      return isOk;
    } else {
      // Testar proxy local
      const response = await axios.get('http://localhost:3001/health', { 
        timeout: 5000 
      });
      
      console.log('🔗 Teste Proxy Local:', '✅ OK');
      return true;
    }
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    
    if (USE_NETLIFY_FUNCTION) {
      console.error('Netlify Function não está respondendo');
    } else {
      console.error('Proxy local não encontrado. Execute: node proxy-server.js');
    }
    
    return false;
  }
};

/**
 * Inicializa o serviço verificando a conexão
 */
export const initializeOllamaService = async () => {
  console.log('🔧 Inicializando Chef IA Service...');
  console.log('Ambiente:', IS_DEVELOPMENT ? 'Desenvolvimento' : 'Produção');
  console.log('Modo:', USE_NETLIFY_FUNCTION ? 'Netlify Function' : 'Proxy Local');
  console.log('API Key configurada:', !!API_KEY);
  
  const isConnected = await testConnection();
  
  if (!isConnected) {
    if (USE_NETLIFY_FUNCTION) {
      console.warn('⚠️  Netlify Function não está respondendo. Verifique o deploy.');
    } else {
      console.warn('⚠️  Proxy local não encontrado. Execute: node proxy-server.js');
    }
  } else {
    console.log('🎉 Chef IA Service inicializado com sucesso!');
  }
  
  return isConnected;
};

// Exportar informações do ambiente para debug
export const getServiceInfo = () => ({
  isDevelopment: IS_DEVELOPMENT,
  useNetlifyFunction: USE_NETLIFY_FUNCTION,
  apiKeyConfigured: !!API_KEY,
  endpoints: {
    netlifyFunction: NETLIFY_FUNCTION_URL,
    localProxy: LOCAL_PROXY_URL
  }
});