# 🍳 Chef IA

<div align="center">

![Chef IA Banner](https://img.shields.io/badge/Chef%20IA-Receitas%20com%20IA-orange?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)
![Ollama Cloud](https://img.shields.io/badge/Ollama-Cloud-000000?style=for-the-badge)

**Transforme seus ingredientes em receitas incríveis com inteligência artificial!**

[Demo](#-demonstração) • [Features](#-features) • [Instalação](#-instalação) • [Como Usar](#-como-usar) • [Tecnologias](#-tecnologias)

</div>

---

## 📖 Sobre o Projeto

**Chef IA** é um gerador inteligente de receitas personalizadas que utiliza a API do **Ollama Cloud** para criar pratos deliciosos baseados nos ingredientes que você tem disponível. 

### ✨ Diferenciais

- 🧠 **Validação Inteligente**: A IA verifica se os ingredientes são realmente comestíveis
- 😂 **Respostas Humoradas**: Se você tentar fazer uma receita com "HTML e CSS", prepare-se para uma resposta criativa!
- 🎬 **Animações Interativas**: Slot machine de pratos, typing effect e loading faseado
- 🎨 **Interface Moderna**: Design responsivo com gradientes vibrantes e UX polida
- 🚀 **Streaming em Tempo Real**: Receitas geradas progressivamente (suporte para streaming)

---

## 🎯 Features

### Funcionalidades Principais

- ✅ Geração de receitas personalizadas com IA
- ✅ Validação automática de ingredientes
- ✅ Sugestões inteligentes quando ingredientes são inválidos
- ✅ Animação "slot machine" para seleção de pratos
- ✅ Efeito de digitação (typing effect) no nome da receita
- ✅ Compartilhamento de receitas formatado
- ✅ Sistema de loading com 4 fases animadas
- ✅ Tratamento robusto de erros
- ✅ Proxy server para evitar problemas de CORS

### Detalhes Técnicos

- 🔒 API Key protegida no servidor (não exposta no frontend)
- 📱 Totalmente responsivo (mobile-first)
- 🎨 Tailwind CSS com animações customizadas
- 🔄 Suporte a streaming (opcional)
- 🐛 Logs detalhados para debugging

---

## 🎥 Demonstração

### Interface Principal
```
┌─────────────────────────────────────────┐
│        🍳 Chef IA                        │
│  Criador de Receitas Personalizadas     │
├─────────────────────────────────────────┤
│                                          │
│  Ingredientes: tomate, cebola, frango   │
│  Preferências: algo saudável e rápido   │
│                                          │
│  [✨ Criar Minha Receita]                │
│                                          │
└─────────────────────────────────────────┘
```

### Validação Inteligente
```
❌ Ingrediente Inválido:
┌─────────────────────────────────────────┐
│ 👨‍🍳 Ops! HTML e CSS não são comestíveis│
│                                          │
│ 💡 Sugestão: tomate, cebola, alho,      │
│    frango, arroz, feijão                 │
└─────────────────────────────────────────┘
```

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 16+ 
- npm ou yarn
- Conta no [Ollama Cloud](https://ollama.com/)

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/marcos-lima-dev/chef-ia.git
   cd chef-ia
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   REACT_APP_OLLAMA_API_KEY=sua_api_key_aqui
   ```
   
   📝 **Como obter a API Key:**
   - Acesse: https://ollama.com/
   - Faça login ou crie uma conta
   - Vá em Settings > API Keys
   - Crie uma nova chave e cole no `.env`

4. **Inicie o proxy server** (Terminal 1)
   ```bash
   node proxy-server.js
   ```
   
   Deve aparecer:
   ```
   🚀 Proxy server running on http://localhost:3001
   🔧 Endpoint: http://localhost:3001/api/ollama-proxy
   ```

5. **Inicie a aplicação React** (Terminal 2)
   ```bash
   npm start
   ```
   
   Abrirá automaticamente em `http://localhost:3000`

---

## 💡 Como Usar

### 1. Digite seus ingredientes
```
Exemplo: tomate, cebola, alho, frango, arroz
```

### 2. (Opcional) Adicione preferências
```
Exemplo: quero algo saudável e rápido, sem glúten
```

### 3. Clique em "Criar Minha Receita"

### 4. Aguarde a mágica acontecer! ✨

O sistema irá:
1. 🔍 Analisar os ingredientes
2. 🤔 Explorar possibilidades culinárias
3. 👨‍🍳 Consultar o livro de receitas da IA
4. 🎰 Selecionar o prato perfeito (slot machine)
5. ✨ Gerar a receita completa com:
   - Nome criativo
   - Tempo de preparo
   - Rendimento
   - Dificuldade
   - Lista de ingredientes com quantidades
   - Modo de preparo passo a passo
   - Dicas do chef

### 5. Compartilhe ou crie uma nova receita!

---

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca JavaScript para UI
- **Tailwind CSS 3** - Framework CSS utility-first
- **Lucide React** - Ícones modernos
- **Axios** - Cliente HTTP

### Backend/API
- **Ollama Cloud** - IA para geração de receitas
- **Express** - Proxy server para evitar CORS
- **Node.js** - Runtime JavaScript

### Modelo de IA
- **gpt-oss:120b** - Modelo Ollama usado para geração

---

## 📁 Estrutura do Projeto

```
chef-ia/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── ChefIA.jsx          # Componente principal
│   ├── services/
│   │   └── ollamaService.js    # Lógica da API
│   ├── App.js
│   ├── index.js
│   └── index.css               # Estilos globais + Tailwind
├── proxy-server.js             # Servidor proxy Express
├── .env                        # Variáveis de ambiente (não commitar!)
├── package.json
└── README.md
```

---

## 🎨 Personalização

### Alterar o Modelo de IA

No arquivo `src/services/ollamaService.js`:

```javascript
const MODEL = 'gpt-oss:120b'; // Altere aqui
```

Modelos disponíveis:
- `gpt-oss:20b`
- `gpt-oss:120b` (padrão)
- `deepseek-v3.1:671b`
- `kimi-k2:1t`

### Customizar Cores

No arquivo `src/components/ChefIA.jsx`, altere os gradientes:

```javascript
// Header
className="bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400"

// Background
className="bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600"
```

---

## 🧪 Testes

### Testar Validação de Ingredientes

```bash
# Teste 1: Ingredientes válidos
Entrada: tomate, cebola, frango
Resultado: ✅ Receita gerada

# Teste 2: Código/HTML
Entrada: html, css, javascript
Resultado: ❌ "HTML não é comestível!" + sugestões

# Teste 3: Objetos
Entrada: martelo, prego, parafuso
Resultado: ❌ Mensagem bem-humorada

# Teste 4: Mix
Entrada: tomate, html, frango
Resultado: ❌ Identifica os válidos e sugere usá-los
```

---

## 🐛 Troubleshooting

### Erro: "Proxy local não encontrado"
**Solução:** Certifique-se de que o proxy está rodando:
```bash
node proxy-server.js
```

### Erro: "API Key inválida"
**Solução:** 
1. Verifique se a key está correta no `.env`
2. Reinicie AMBOS os servidores (proxy + React)
3. Confirme que a key é válida em https://ollama.com/settings/keys

### Erro: "Resposta inválida da API"
**Solução:** 
1. Verifique os logs no console
2. Confirme que o modelo está disponível
3. Tente um modelo diferente

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga estes passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Roadmap

### Próximas Funcionalidades

- [ ] 📱 Versão mobile (React Native)
- [ ] 📊 Análise nutricional das receitas
- [ ] 💾 Histórico de receitas (localStorage)
- [ ] ⭐ Sistema de favoritos
- [ ] 📤 Exportar receita em PDF
- [ ] 🌐 Suporte a múltiplos idiomas
- [ ] 🎙️ Input por voz
- [ ] 📸 Upload de foto de ingredientes
- [ ] 🔄 Sugestões de substituições
- [ ] 👥 Compartilhamento social direto

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Marcos Lima**

[![GitHub](https://img.shields.io/badge/GitHub-marcos--lima--dev-181717?style=for-the-badge&logo=github)](https://github.com/marcos-lima-dev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/seu-usuario)

---

## 🙏 Agradecimentos

- [Ollama](https://ollama.com/) - Pela incrível API de IA
- [Tailwind CSS](https://tailwindcss.com/) - Pelo framework CSS
- [Lucide](https://lucide.dev/) - Pelos ícones
- Comunidade open source por todas as bibliotecas utilizadas

---

## ⭐ Mostre seu apoio

Se este projeto te ajudou, considere dar uma ⭐️!

---

<div align="center">

**Feito com ❤️ e muito ☕ por [Marcos Lima](https://github.com/marcos-lima-dev)**

</div>