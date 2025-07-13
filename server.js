const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "public"))) // Aponta para a pasta 'public'

// Armazenamento temporário (em produção, use um banco de dados)
const closedTickets = new Map()
const ticketMessages = new Map()

// Dados de exemplo para demonstração
const sampleTickets = [
  {
    id: "TK-001",
    user: {
      name: "João Silva",
      avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
      discriminator: "#1234",
    },
    category: "Corregedoria",
    closedAt: new Date().toISOString(),
    duration: "2h 15m",
    closedBy: "Moderador",
    priority: "Alta",
    satisfaction: 5,
    channelId: "123456789",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TK-002",
    user: {
      name: "Maria Santos",
      avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
      discriminator: "#5678",
    },
    category: "Up de Patente",
    closedAt: new Date().toISOString(),
    duration: "45m",
    closedBy: "Admin",
    priority: "Média",
    satisfaction: 4,
    channelId: "123456790",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "TK-003",
    user: {
      name: "Pedro Costa",
      avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
      discriminator: "#9012",
    },
    category: "Dúvidas Gerais",
    closedAt: new Date().toISOString(),
    duration: "1h 30m",
    closedBy: "Desenvolvedor",
    priority: "Baixa",
    satisfaction: 5,
    channelId: "123456791",
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
]

// Inicializar com dados de exemplo
sampleTickets.forEach((ticket) => {
  closedTickets.set(ticket.id, ticket)
})

// Mensagens de exemplo
const sampleMessages = {
  123456789: [
    {
      id: "msg-1",
      author: { name: "João Silva", avatar: "https://cdn.discordapp.com/embed/avatars/0.png", isStaff: false },
      content: "Olá! Preciso de ajuda com uma questão disciplinar.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      attachments: [],
    },
    {
      id: "msg-2",
      author: { name: "Moderador", avatar: "https://cdn.discordapp.com/embed/avatars/3.png", isStaff: true },
      content: "Olá João! Vou te ajudar. Pode me explicar melhor a situação?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
      attachments: [],
    },
    {
      id: "msg-3",
      author: { name: "João Silva", avatar: "https://cdn.discordapp.com/embed/avatars/0.png", isStaff: false },
      content: "Perfeito! Problema resolvido. Muito obrigado! 😊",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      attachments: [],
    },
  ],
}

Object.entries(sampleMessages).forEach(([channelId, messages]) => {
  ticketMessages.set(channelId, messages)
})

// Rotas da API
app.get("/api/tickets/stats", (req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const allTickets = Array.from(closedTickets.values())
  const todayTickets = allTickets.filter((ticket) => new Date(ticket.closedAt) >= today)

  const totalDuration = allTickets.length > 0 ? allTickets.length : 0 // Usando o número de tickets de exemplo
  const avgDuration = allTickets.length > 0 ? 5700000 : 0 // Exemplo de duração em ms (1h35m)
  const avgHours = Math.floor(avgDuration / (1000 * 60 * 60))
  const avgMinutes = Math.floor((avgDuration % (1000 * 60 * 60)) / (1000 * 60))

  const avgSatisfaction =
    allTickets.length > 0
      ? allTickets.reduce((sum, ticket) => sum + (ticket.satisfaction || 0), 0) / allTickets.length
      : 0

  res.json({
    totalClosed: totalDuration,
    todayClosed: todayTickets.length,
    avgResolutionTime: `${avgHours}h ${avgMinutes}m`,
    satisfactionRate: Math.round(avgSatisfaction * 10) / 10,
  })
})

app.get("/api/tickets/closed", (req, res) => {
  const tickets = Array.from(closedTickets.values())
    .sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt))
    .slice(0, 50)

  res.json(tickets)
})

app.get("/api/tickets/:ticketId/messages", (req, res) => {
  const { ticketId } = req.params
  const ticket = closedTickets.get(ticketId)

  if (!ticket) {
    return res.status(404).json({ error: "Ticket não encontrado" })
  }

  const messages = ticketMessages.get(ticket.channelId) || []
  res.json(messages)
})

// Rota para adicionar novos tickets (será usada pelo bot Discord)
app.post("/api/tickets/add", (req, res) => {
  try {
    const ticketData = req.body
    closedTickets.set(ticketData.id, ticketData)

    if (ticketData.messages) {
      ticketMessages.set(ticketData.channelId, ticketData.messages)
    }

    res.json({ success: true, message: "Ticket adicionado com sucesso" })
  } catch (error) {
    res.status(500).json({ error: "Erro ao adicionar ticket" })
  }
})

// Servir o dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Rota de health check para Render
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🌐 Dashboard rodando na porta ${PORT}`)
  console.log(`📊 Acesse: http://localhost:${PORT}`)
})
