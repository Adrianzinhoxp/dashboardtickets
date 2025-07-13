# 🎫 Dashboard de Tickets Discord

Dashboard web para visualização e gerenciamento de tickets fechados do sistema Discord.

## 🚀 Deploy no Render.com

### Pré-requisitos
- Conta no GitHub
- Conta no Render.com (gratuita)

### Passos para Deploy

1. **Criar repositório no GitHub**
   - Crie um novo repositório **apenas para o dashboard**.
   - Faça upload de todos os arquivos desta pasta (exceto o `.env` local).

2. **Deploy no Render**
   - Acesse [render.com](https://render.com)
   - Conecte sua conta GitHub
   - Clique em "New +" → "Web Service"
   - Selecione seu repositório (o que contém o dashboard)
   - O Render deve detectar automaticamente as configurações do `render.yaml`.
   - Se precisar configurar manualmente:
     - **Name**: `discord-tickets-dashboard` (ou o nome que preferir)
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Instance Type**: `Free`

3. **Configurar Variáveis de Ambiente (no Render)**
   - Vá para as configurações do seu serviço no Render.
   - Adicione as variáveis de ambiente:
     - `NODE_ENV`: `production`
     - `PORT`: (Render define automaticamente, não precisa adicionar se não quiser um valor específico)

4. **Deploy**
   - Clique em "Create Web Service" ou "Deploy" se já existir.
   - Acompanhe os logs. Seu dashboard estará disponível na URL fornecida pelo Render.

## 🔗 Conectar com Bot Discord

Para enviar dados do seu bot para o dashboard, use:

\`\`\`javascript
// Adicione esta função no seu bot Discord
async function sendTicketToDashboard(ticketData) {
  try {
    // Substitua SEU-DASHBOARD.onrender.com pela URL real do seu dashboard no Render
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
