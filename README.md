# 🎫 Dashboard de Tickets Discord

Dashboard web para visualização e gerenciamento de tickets fechados do sistema Discord.

## 🚀 Deploy no Render.com

### Pré-requisitos
- Conta no GitHub
- Conta no Render.com (gratuita)

### Passos para Deploy

1. **Criar repositório no GitHub**
   - Crie um novo repositório
   - Faça upload de todos os arquivos desta pasta

2. **Deploy no Render**
   - Acesse [render.com](https://render.com)
   - Conecte sua conta GitHub
   - Clique em "New +" → "Web Service"
   - Selecione seu repositório
   - Configure:
     - **Name**: `dashboard-tickets-discord`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: `Free`

3. **Configurar Variáveis (Opcional)**
   - `NODE_ENV`: `production`
   - `PORT`: (deixe vazio, Render define automaticamente)

4. **Deploy**
   - Clique em "Create Web Service"
   - Aguarde o deploy (2-3 minutos)
   - Seu dashboard estará disponível!

## 🔗 Conectar com Bot Discord

Para enviar dados do seu bot para o dashboard, use:

\`\`\`javascript
// Adicione esta função no seu bot Discord
async function sendTicketToDashboard(ticketData) {
  try {
    await fetch('https://SEU-DASHBOARD.onrender.com/api/tickets/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });
  } catch (error) {
    console.error('Erro ao enviar para dashboard:', error);
  }
}
\`\`\`

## 📊 Funcionalidades

- ✅ Estatísticas em tempo real
- ✅ Lista de tickets fechados
- ✅ Filtros avançados
- ✅ Histórico de mensagens
- ✅ Interface responsiva
- ✅ Atualização automática

## 🛠️ Tecnologias

- Node.js + Express
- HTML5 + CSS3 (Tailwind)
- JavaScript (Vanilla)
- Lucide Icons

## 📝 Licença

MIT License
