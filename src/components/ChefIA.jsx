import React, { useState } from 'react';
import { ChefHat, Sparkles, Clock, Users, RefreshCw, Share2, Loader2 } from 'lucide-react';
import { generateRecipeFromOllama } from '../services/ollamaService'; // Importe o serviço

const ChefIA = () => {
  const [ingredients, setIngredients] = useState('');
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);
  const [slotMachine, setSlotMachine] = useState(false);
  const [currentDish, setCurrentDish] = useState(0);
  const [recipe, setRecipe] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState('');

  const dishes = [
    '🍝 Pasta Italiana',
    '🍛 Curry Aromático',
    '🥘 Risoto Cremoso',
    '🍲 Sopa Caseira',
    '🥗 Salada Fresca',
    '🍳 Omelete Recheada',
    '🌮 Tacos Mexicanos',
    '🍕 Pizza Artesanal'
  ];

  const phases = [
    { icon: '🔍', text: 'Analisando ingredientes...', duration: 1500 },
    { icon: '🤔', text: 'Explorando possibilidades culinárias...', duration: 2000 },
    { icon: '👨‍🍳', text: 'Consultando meu livro de receitas...', duration: 1500 },
    { icon: '✨', text: 'Preparando sua receita perfeita...', duration: 1000 },
  ];

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const typeEffect = async (text) => {
    setStreamingText('');
    for (let i = 0; i < text.length; i++) {
      setStreamingText(prev => prev + text[i]);
      await sleep(30);
    }
  };

  const runSlotMachine = async () => {
    setSlotMachine(true);
    for (let i = 0; i < 25; i++) {
      setCurrentDish(prev => (prev + 1) % dishes.length);
      await sleep(100);
    }
    setSlotMachine(false);
  };

  const generateRecipe = async () => {
  if (!ingredients.trim()) {
    setError('Por favor, digite alguns ingredientes!');
    return;
  }

  setError('');
  setLoading(true);
  setRecipe(null);
  setPhase(0);

  try {
    // Animação de fases
    for (let i = 0; i < phases.length; i++) {
      setPhase(i);
      await sleep(phases[i].duration);
    }

    // Slot machine
    await runSlotMachine();

    // Chamada à API
    console.log('🔄 Gerando receita com ingredientes:', ingredients);
    
    const generatedRecipe = await generateRecipeFromOllama(ingredients, preferences);
    
    console.log('✅ Receita gerada:', generatedRecipe);

    setRecipe(generatedRecipe);
    setLoading(false);
    await typeEffect(generatedRecipe.nome);
    
  } catch (error) {
    console.error('❌ Erro ao gerar receita:', error);
    
    // ⚡ NOVO: Verificar se é recusa do chef
    if (error.isChefRefusal) {
      // Montar mensagem de erro formatada
      let errorMessage = error.message;
      if (error.suggestion) {
        errorMessage += `\n\n💡 Sugestão: ${error.suggestion}`;
      }
      setError(errorMessage);
    } else {
      // Erro técnico normal
      setError(error.message || 'Erro ao gerar receita. Tente novamente.');
    }
    
    setLoading(false);
  }
};

  const resetRecipe = () => {
    setRecipe(null);
    setIngredients('');
    setPreferences('');
    setStreamingText('');
    setError('');
  };

  const shareRecipe = () => {
    if (recipe) {
      const text = `🍳 ${recipe.nome} ${recipe.emoji}\n⏱️ Tempo: ${recipe.tempoPreparo}\n👥 Rende: ${recipe.rendimento}\n📊 Dificuldade: ${recipe.dificuldade}\n\n🛒 Ingredientes:\n${recipe.ingredientes.map(ing => `• ${ing.item}: ${ing.quantidade}`).join('\n')}\n\n👨‍🍳 Modo de Preparo:\n${recipe.modoPreparo.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n💡 ${recipe.dicas}\n\nCriado pelo Chef IA 🧑‍🍳`;
      navigator.clipboard.writeText(text);
      alert('Receita copiada para a área de transferência! 📋');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400 rounded-t-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-3">
            <ChefHat className="w-12 h-12 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Chef IA</h1>
          </div>
          <p className="text-center text-white text-lg font-medium">
            Criador de Receitas Personalizadas com Inteligência Artificial
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-3xl shadow-2xl p-8 md:p-12">
          {/* Form */}
          {!loading && !recipe && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  👋 Olá! Sou seu Chef IA pessoal
                </h2>
                <p className="text-gray-600 text-lg">
                  Digite os ingredientes que você tem disponível e eu criarei uma receita deliciosa e personalizada para você!
                </p>
              </div>

              {error && (
  <div className={`border-l-4 p-4 rounded-lg shadow-md ${
    error.includes('fome') || 
    error.includes('Michelin') || 
    error.includes('confundiu') ||
    error.includes('oficina') ||
    error.includes('técnico')
      ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-500'
      : 'bg-red-50 border-red-500'
  }`}>
    <div className="flex items-start gap-3">
      <div className="text-4xl animate-bounce">
        {error.includes('fome') || 
         error.includes('Michelin') || 
         error.includes('confundiu') ||
         error.includes('oficina') ||
         error.includes('técnico')
          ? '👨‍🍳' 
          : '⚠️'}
      </div>
      <div className="flex-1">
        <p className={`font-bold text-lg mb-2 ${
          error.includes('fome') || error.includes('Michelin')
            ? 'text-orange-800'
            : 'text-red-700'
        }`}>
          {error.split('\n\n')[0]}
        </p>
        {error.split('\n\n')[1] && (
          <div className="bg-white rounded-lg p-3 mt-3 border-2 border-orange-200">
            <p className="text-gray-700 text-sm">
              {error.split('\n\n')[1]}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
            )}

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Ingredientes disponíveis:
                  </label>
                  <input
                    type="text"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="Ex: tomate, cebola, alho, frango, arroz"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all outline-none text-gray-700"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Exemplo: <span className="text-orange-600">tomate, cebola, alho, macarrão, paprica defumada</span>
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    💡 Dica: Mencione suas preferências culinárias, restrições alimentares ou tipo de prato desejado!
                  </label>
                  <input
                    type="text"
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="Ex: quero algo saudável e rápido, sem glúten"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all outline-none text-gray-700"
                  />
                </div>

                <button
                  onClick={generateRecipe}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-5 h-5" />
                  {loading ? 'Criando Receita...' : 'Criar Minha Receita'}
                </button>
              </div>
            </div>
          )}

          {/* Loading Animation */}
          {loading && (
            <div className="space-y-8 py-12">
              <div className="text-center">
                <div className="text-6xl mb-4">{phases[phase]?.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {phases[phase]?.text}
                </h3>
                <div className="flex justify-center gap-2 mt-4">
                  {phases.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 w-12 rounded-full transition-all duration-300 ${
                        idx <= phase ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {slotMachine && (
                <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-8 shadow-inner">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800 animate-bounce">
                      {dishes[currentDish]}
                    </div>
                    <p className="text-gray-600 mt-2">Escolhendo a receita perfeita...</p>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
              </div>
            </div>
          )}

          {/* Recipe Display */}
          {recipe && !loading && (
            <div className="space-y-6">
              <div className="text-center border-b-4 border-orange-400 pb-6">
                <div className="text-6xl mb-4">{recipe.emoji}</div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  {streamingText}
                  {streamingText && streamingText.length < recipe.nome.length && (
                    <span className="animate-pulse">|</span>
                  )}
                </h2>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-orange-800">{recipe.tempoPreparo}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-pink-100 px-4 py-2 rounded-full">
                    <Users className="w-5 h-5 text-pink-600" />
                    <span className="font-semibold text-pink-800">{recipe.rendimento}</span>
                  </div>
                  <div className="bg-purple-100 px-4 py-2 rounded-full">
                    <span className="font-semibold text-purple-800">Dificuldade: {recipe.dificuldade}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">🛒 Ingredientes</h3>
                <div className="bg-orange-50 rounded-xl p-6">
                  <ul className="space-y-2">
                    {recipe.ingredientes.map((ing, idx) => (
                      <li key={idx} className="flex justify-between items-center border-b border-orange-200 pb-2">
                        <span className="text-gray-700 font-medium">{ing.item}</span>
                        <span className="text-orange-600 font-semibold">{ing.quantidade}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">👨‍🍳 Modo de Preparo</h3>
                <div className="space-y-4">
                  {recipe.modoPreparo.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-gray-700 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {recipe.dicas && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-l-4 border-yellow-400">
                  <p className="text-gray-700 leading-relaxed">{recipe.dicas}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-6">
                <button
                  onClick={resetRecipe}
                  className="flex-1 min-w-[200px] bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Nova Receita
                </button>
                <button
                  onClick={shareRecipe}
                  className="flex-1 min-w-[200px] bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Compartilhar
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="text-center mt-6 text-white text-sm opacity-75">
          <p>💡 Powered by Ollama Cloud AI</p>
        </footer>
      </div>
    </div>
  );
};

export default ChefIA;