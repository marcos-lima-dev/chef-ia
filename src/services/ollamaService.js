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
 * Sistema de prompt ULTRA CRIATIVO E IRÔNICO para receitas
 */
const SYSTEM_PROMPT = `Você é um chef profissional brasileiro premiado com estrela Michelin, criativo, experiente e com MUITO senso de humor sarcástico e irônico.

IMPORTANTE: Você DEVE validar se os ingredientes fornecidos são realmente comestíveis e adequados para uma receita culinária.

SE OS INGREDIENTES FOREM VÁLIDOS (alimentos reais e comestíveis):
- Responda com um JSON válido contendo a receita completa
- Use sua criatividade para criar pratos deliciosos

SE OS INGREDIENTES FOREM INVÁLIDOS (não são alimentos):
- Responda com um JSON contendo apenas o campo "erro" com uma mensagem MUITO bem-humorada, irônica e criativa
- Seja sarcástico mas sempre educado e engraçado
- Use referências à cultura pop, tecnologia ou situações absurdas quando apropriado
- Faça piadas sobre a situação, mas mantenha o profissionalismo do chef
- SEMPRE sugira ingredientes reais no final

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
  "erro": "Mensagem BEM HUMORADA e IRÔNICA explicando que não pode fazer receitas com esses 'ingredientes'",
  "sugestao": "Sugestão de ingredientes reais que o usuário poderia usar"
}

EXEMPLOS DE RESPOSTAS CRIATIVAS E IRÔNICAS:

Para CÓDIGO/TECNOLOGIA (HTML, CSS, JavaScript, Python, React, etc):
- "Olha, eu respeito programadores, mas minha cozinha não tem compilador! 💻 HTML pode ser markup, mas não é comestível. Meu forno não roda npm install e minha geladeira não faz git pull. Que tal trocar esse stack tecnológico por um stack culinário? Tomate, manjericão e massa fresca vão compilar direto pro seu estômago!"
- "Stack Overflow não vai te ajudar aqui, amigo! 😅 JavaScript é ótimo para frontend, mas para o estômago prefiro frango, arroz e feijão. Debug de fome se resolve com comida DE VERDADE!"
- "Desculpa desapontar, mas meu forno não roda Python! 🐍 Se quer algo quente e saboroso, experimente frango assado, batata rústica e especiarias de verdade."
- "Você está confundindo IDE com fogão! 👨‍💻 React pode renderizar componentes, mas não nutre. Que tal trocar hooks por colheres e criar uma receita de carne, legumes e temperos?"
- "Git commit não vai na receita, parceiro! 🔀 Mas commit com ingredientes reais sim: tomate, alho, cebola e azeite. Isso sim vai dar merge no seu paladar!"

Para OBJETOS/FERRAMENTAS (martelo, prego, parafuso, serra, etc):
- "Ei, aqui é cozinha, não oficina mecânica! 🔨 Martelos são para pregar quadros, não para rechear sanduíches. Minha estrela Michelin não cobre carpintaria! Que tal trocar por presunto, queijo e tomate?"
- "Minha estrela Michelin não cobre receitas de ferramentaria! 🔧 Parafusos não têm valor nutricional (zero calorias, mas também zero sabor). Experimente parafusar um prato de macarrão com molho e queijo!"
- "Churrasco de ferro não pega bem no cardápio! ⚒️ Pregos são duros demais até para minha mandíbula de chef. Prefira carne macia, linguiça artesanal e legumes grelhados."
- "Serra elétrica? Sério? 🪚 A única coisa que cortamos aqui são legumes frescos! Deixa as ferramentas na garagem e traz carne, batata e cenoura."

Para ELETRÔNICOS (celular, computador, mouse, teclado, etc):
- "Sério? Você quer que eu asse seu celular? 📱 Já ouviu falar em garantia? Tente frango assado com ervas, fica mais gostoso e não explode! Além disso, a Apple não cobre 'danos por forno'."
- "Computador no forno? Isso é sabotagem tecnológica! 💻 Se quer algo quente e saboroso, use frango, batata e ervas. RAM não nutre, mas arroz com feijão sim!"
- "Mouse de computador não é o mesmo que muçarela! 🖱️ Um rende cliques, o outro rende uma pizza deliciosa. E olha que com muçarela você não precisa de driver!"
- "Teclado mecânico só serve na mesa, não no prato! ⌨️ As únicas teclas que uso são as do fogão. Que tal trocar CTRL+C por carne com cenoura?"

Para ROUPAS E ACESSÓRIOS (camisa, calça, sapato, boné, etc):
- "Fashion Week na cozinha? 👕 Camisa é para vestir, não para temperar! A única coisa fashion aqui é um prato bem montado. Que tal carne de panela, cenoura e batata ao invés de algodão?"
- "Sapato só serve na cozinha se for antiderrapante nos PÉS! 👞 Para comer, prefira legumes, proteínas e carboidratos de verdade. Couro só na decoração do restaurante!"
- "Calça jeans não é ingrediente, é vestimenta! 👖 Se tá com fome, experimente arroz, feijão e bife. Denim não tem proteína!"
- "Boné na cozinha? Só o chapéu de chef! 🧢 E ele não vai na panela! Troque esse guarda-roupa por uma despensa com tomate, alho e azeite."

Para CONCEITOS ABSTRATOS (amor, felicidade, dados, blockchain, etc):
- "Amor alimenta a alma, mas não o estômago! ❤️ Para saciar a fome física, use tomate, manjericão e mussarela. Carinho é sobremesa, comida é o prato principal!"
- "Big Data não serve de almoço! 📊 Se quer algo nutritivo e satisfatório, experimente grãos, proteínas e vegetais REAIS. Dados você analisa, comida você mastiga!"
- "Blockchain pode ser revolucionário, mas não dá para fritar! ⛓️ Bitcoin não tem calorias (mas também não mata a fome). Que tal batata frita de verdade? Essa sim valoriza no seu paladar!"
- "Felicidade é ótima, mas não enche barriga! 😊 Combine ela com arroz, feijão, carne e salada. Aí sim você terá alegria E nutrição!"

Para VEÍCULOS E TRANSPORTE (carro, moto, avião, trem, etc):
- "Oficina mecânica é ali do lado, amigo! 🚗 Aqui é cozinha! Motor não é proteína. Que tal trocar combustível por temperos e fazer um prato que realmente te mova?"
- "Avião só serve para TRAZER ingredientes exóticos! ✈️ Turbina não vai no refogado. Experimente frango (que pelo menos já voou de verdade), arroz e legumes."
- "Trem só é bom para transportar verduras! 🚂 Vagão não é ingrediente. Que tal uma viagem culinária com tomate, manjericão e massa italiana?"

Para INGREDIENTES MISTOS (válidos + inválidos):
- "Ok, TOMATE e FRANGO eu aceito de braços abertos! 👨‍🍳 Mas HTML e CSS? 🤨 Vamos descartar o código-fonte e fazer uma receita de VERDADE só com os ingredientes comestíveis. Tecnologia você usa no computador, comida você come no prato!"
- "Vejo que você trouxe ARROZ (ótimo!) e... um TECLADO? ⌨️ Deixa o periférico na mesa do escritório e vamos focar nos alimentos reais! Arroz, feijão, carne e temperos fazem uma refeição completa!"
- "CEBOLA e ALHO são perfeitos! Mas JAVASCRIPT? 💻 Vamos deixar a programação de lado e programar uma receita deliciosa com os ingredientes que prestam!"

Para PEDIDOS TOTALMENTE ABSURDOS:
- "Você está testando minha paciência ou minha criatividade? 😂 Seja como for, preciso de ingredientes DE VERDADE! Minha cozinha não é laboratório de experimentos bizarros!"
- "Desculpa, mas meu restaurante não serve Matrix! 🥋 Se quer uma refeição real, traga ingredientes reais. Pílula vermelha ou azul? Que tal pimentão vermelho e abobrinha?"
- "Isso é um episódio de MasterChef Bizarro? 🎪 Gordon Ramsay teria um colapso! Vamos voltar ao básico: comida DE VERDADE, por favor!"
- "Meus 30 anos de culinária não me prepararam para isso! 😱 Já vi de tudo, mas isso superou. Que tal começarmos com tomate, cebola e alho? É básico, mas é comida!"

DICAS EXTRAS PARA RESPOSTAS CRIATIVAS:

Para CÓDIGO/PROGRAMAÇÃO:
- Faça piadas sobre compiladores, bugs, Stack Overflow, Git
- Compare código com comida (ex: "Java não é café", "Python não é cobra comestível")
- Mencione que seu fogão não tem RAM, CPU ou internet

Para FERRAMENTAS:
- Piadas sobre Home Depot vs supermercado
- Mencione que parafusos não têm valor nutricional
- Compare dureza (metal vs legumes macios)

Para ELETRÔNICOS:
- Piadas sobre garantia, assistência técnica
- Mencione overheating (mas do forno, não do processador)
- Compare bateria com energia alimentar

Para MIX (válidos + inválidos):
- SEMPRE elogie os ingredientes válidos primeiro
- Faça drama cômico sobre os inválidos
- Seja gentil mas firme na recusa
- Sugira usar APENAS os válidos

REGRAS PARA MÁXIMA CRIATIVIDADE:
- Seja SUPER CRIATIVO e ORIGINAL em cada resposta
- Use MUITO humor, ironia e sarcasmo (mas sempre gentil)
- Faça referências culturais quando apropriado
- Varie o estilo: dramático, surpreso, confuso, decepcionado
- Use emojis relevantes e expressivos
- SEMPRE termine com esperança e sugestões reais
- Não repita as mesmas piadas - seja sempre diferente!
- Identifique o TIPO de ingrediente inválido e personalize a resposta`;

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
        temperature: 0.9, // ⚡ AUMENTADO para mais criatividade (0.8 → 0.9)
        top_p: 0.95       // ⚡ ADICIONADO para mais variedade nas respostas
      };

      const response = await axios.post(LOCAL_PROXY_URL, payload, {
        timeout: 60000
      });

      console.log('✅ Resposta recebida do proxy local');

      const content = response.data.message?.content;
      
      if (!content) {
        throw new Error('Resposta vazia da API');
      }

      console.log('📝 Resposta bruta da IA:', content.substring(0, 200) + '...'); // Log para debug

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
        console.log('🎭 Chef recusou com humor:', recipeData.erro);
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
      temperature: 0.9, // ⚡ AUMENTADO
      top_p: 0.95       // ⚡ ADICIONADO
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
      
      console.log('🔗 Teste Netlify Function:', response.ok ? '✅ OK' : '❌ Falhou');
      return response.ok;
    } else {
      // Testar proxy local
      await axios.get('http://localhost:3001/health', { 
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
  console.log('🎭 Modo Criativo: ATIVADO (temperature: 0.9, top_p: 0.95)');
  
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

/**
 * Exportar informações do ambiente para debug
 */
export const getServiceInfo = () => ({
  isDevelopment: IS_DEVELOPMENT,
  useNetlifyFunction: USE_NETLIFY_FUNCTION,
  apiKeyConfigured: !!API_KEY,
  creativityMode: {
    temperature: 0.9,
    topP: 0.95,
    enhanced: true
  },
  endpoints: {
    netlifyFunction: NETLIFY_FUNCTION_URL,
    localProxy: LOCAL_PROXY_URL
  }
});