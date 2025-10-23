import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, recipe }) => {
  const [copied, setCopied] = useState(false);
  const [shareType, setShareType] = useState('');

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !recipe) return null;

  // Texto formatado para compartilhar
  const shareText = `🍳 ${recipe.nome} ${recipe.emoji}

⏱️ Tempo: ${recipe.tempoPreparo}
👥 Rende: ${recipe.rendimento}
📊 Dificuldade: ${recipe.dificuldade}

🛒 Ingredientes:
${recipe.ingredientes.map(ing => `• ${ing.item}: ${ing.quantidade}`).join('\n')}

👨‍🍳 Modo de Preparo:
${recipe.modoPreparo.map((step, i) => `${i + 1}. ${step}`).join('\n')}

💡 ${recipe.dicas}

Criado pelo Chef IA 🧑‍🍳
${window.location.href}`;

  const shareUrl = window.location.href;

  // Opções de compartilhamento
  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '📱',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      }
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => {
        const tweetText = `🍳 ${recipe.nome}\n\nCriado pelo Chef IA! #ChefIA #Receita #Culinaria`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    },
    {
      name: 'Copiar Texto',
      icon: '📋',
      color: 'bg-gray-600 hover:bg-gray-700',
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareText);
          setShareType('texto');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Erro ao copiar:', err);
        }
      }
    },
    {
      name: 'Copiar Link',
      icon: '🔗',
      color: 'bg-purple-600 hover:bg-purple-700',
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setShareType('link');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Erro ao copiar:', err);
        }
      }
    },
    {
      name: 'Email',
      icon: '📧',
      color: 'bg-red-600 hover:bg-red-700',
      action: () => {
        const subject = `Receita: ${recipe.nome}`;
        const body = encodeURIComponent(shareText);
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
      }
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-cyan-500 hover:bg-cyan-600',
      action: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
      }
    }
  ];

  // Web Share API (mobile nativo)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `🍳 ${recipe.nome}`,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Erro ao compartilhar:', err);
        }
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-pink-500 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl">{recipe.emoji}</span>
                Compartilhar Receita
              </h2>
              <p className="text-white text-sm opacity-90 mt-1">
                {recipe.nome}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              aria-label="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Toast de sucesso */}
          {copied && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center gap-3 animate-slideDown">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">
                {shareType === 'texto' ? 'Texto copiado!' : 'Link copiado!'} 📋
              </p>
            </div>
          )}

          {/* Web Share API Button (Mobile) */}
          {navigator.share && (
            <div className="mb-6 md:hidden">
              <button
                onClick={handleNativeShare}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <span className="text-2xl">📤</span>
                Compartilhar (Escolher App)
              </button>
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-gray-500 text-sm">ou escolha uma opção</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
            </div>
          )}

          {/* Desktop: Grid de Ícones */}
          <div className="hidden md:block">
            <div className="grid grid-cols-4 gap-4">
              {shareOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={option.action}
                  className={`${option.color} text-white rounded-2xl p-6 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex flex-col items-center justify-center gap-3 aspect-square`}
                >
                  <span className="text-5xl">{option.icon}</span>
                  <span className="text-sm font-bold text-center leading-tight">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile: Grid de Ícones (igual desktop) */}
          <div className="md:hidden">
            <div className="grid grid-cols-4 gap-3">
              {shareOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={option.action}
                  className={`${option.color} text-white rounded-2xl p-4 transition-all transform active:scale-95 shadow-lg flex flex-col items-center justify-center gap-2 aspect-square`}
                >
                  <span className="text-3xl">{option.icon}</span>
                  <span className="text-xs font-semibold text-center leading-tight">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            💡 Compartilhe essa receita deliciosa com seus amigos!
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ShareModal;