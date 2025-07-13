const express = require("express")
const cors = require("cors")
const path = require("path")
const fs = require("fs") // Importar o módulo 'fs' para manipulação de arquivos
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

// Caminhos para os arquivos de dados
const DATA_DIR = path.join(__dirname, "data")
const TICKETS_FILE = path.join(DATA_DIR, "closedTickets.json")
const MESSAGES_FILE = path.join(DATA_DIR, "ticketMessages.json")

// Armazenamento temporário (será carregado/salvo de/para arquivos)
let closedTickets = new Map()
let ticketMessages = new Map()

// Função para carregar dados dos arquivos
function loadData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR)
  }

  if (fs.existsSync(TICKETS_FILE)) {
    const ticketsJson = fs.readFileSync(TICKETS_FILE, "utf8")
    closedTickets = new Map(JSON.parse(ticketsJson))
  } else {
    // Dados de exemplo se o arquivo não existir
    const sampleTickets = [
      {
        id: "TK-001",
        user: {
          name: "João Silva",
          avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
          discriminator: "#1234",
        },
        category: "Suporte Técnico", // Atualizado para consistência
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
        category: "Dúvidas Gerais", // Atualizado para consistência
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
        category: "Reportar Bug", // Atualizado para consistência
        closedAt: new Date().toISOString(),
        duration: "1h 30m",
        closedBy: "Desenvolvedor",
        priority: "Baixa",
        satisfaction: 5,
        channelId: "123456791",
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      },
      {
        id: "TK-004",
        user: {
          name: "Ana Oliveira",
          avatar: "https://cdn.discordapp.com/embed/avatars/3.png",
          discriminator: "#3456",
        },
        category: "Sugestões", // Nova categoria
        closedAt: new Date().toISOString(),
        duration: "20m",
        closedBy: "Moderador",
        priority: "Baixa",
        satisfaction: 3,
        channelId: "123456792",
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      },
      {
        id: "TK-005",
        user: { name: "Carlos Lima", avatar: "https://cdn.discordapp.com/embed/avatars/4.png", discriminator: "#7890" },
        category: "Suporte Técnico", // Categoria existente
        closedAt: new Date().toISOString(),
        duration: "3h 45m",
        closedBy: "Admin",
        priority: "Crítica", // Nova prioridade
        satisfaction: 4,
        channelId: "123456793",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000 - 45 * 60 * 1000).toISOString(),
      },
    ]
    sampleTickets.forEach((ticket) => closedTickets.set(ticket.id, ticket))
    saveData() // Salva os dados de exemplo se o arquivo não existia
  }

  if (fs.existsSync(MESSAGES_FILE)) {
    const messagesJson = fs.readFileSync(MESSAGES_FILE, "utf8")
    ticketMessages = new Map(JSON.parse(messagesJson))
  } else {
    // Mensagens de exemplo
    const sampleMessages = {
      123456789: [
        {
          id: "msg-1",
          author: { name: "João Silva", avatar: "https://cdn.discordapp.com/embed/avatars/0.png", isStaff: false },
          content: "Olá! Preciso de ajuda com uma questão de suporte técnico.",
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
      123456790: [
        {
          id: "msg-4",
          author: { name: "Maria Santos", avatar: "https://cdn.discordapp.com/embed/avatars/1.png", isStaff: false },
          content: "Tenho uma dúvida geral sobre o servidor.",
          timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        },
        {
          id: "msg-5",
          author: { name: "Admin", avatar: "https://cdn.discordapp.com/embed/avatars/1.png", isStaff: true },
          content: "Claro, pode perguntar!",
          timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
        },
      ],
      123456791: [
        {
          id: "msg-6",
          author: { name: "Pedro Costa", avatar: "https://cdn.discordapp.com/embed/avatars/2.png", isStaff: false },
          content: "Encontrei um bug no comando X.",
          timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
        },
        {
          id: "msg-7",
          author: { name: "Desenvolvedor", avatar: "https://cdn.discordapp.com/embed/avatars/2.png", isStaff: true },
          content: "Obrigado por reportar! Poderia dar mais detalhes?",
          timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
        },
      ],
    }
    Object.entries(sampleMessages).forEach(([channelId, messages]) => ticketMessages.set(channelId, messages))
    saveData() // Salva os dados de exemplo se o arquivo não existia
  }
}

// Função para salvar dados nos arquivos
function saveData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR)
  }
  fs.writeFileSync(TICKETS_FILE, JSON.stringify(Array.from(closedTickets.entries())), "utf8")
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(Array.from(ticketMessages.entries())), "utf8")
}

// Carregar dados ao iniciar o servidor
loadData()

// Rotas da API
app.get("/api/tickets/stats", (req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const allTicketsArray = Array.from(closedTickets.values())
  const todayTickets = allTicketsArray.filter((ticket) => new Date(ticket.closedAt) >= today)

  const totalDurationMs = allTicketsArray.reduce((sum, ticket) => {
    const createdAt = new Date(ticket.createdAt).getTime()
    const closedAt = new Date(ticket.closedAt).getTime()
    return sum + (closedAt - createdAt)
  }, 0)

  const avgDurationMs = allTicketsArray.length > 0 ? totalDurationMs / allTicketsArray.length : 0
  const avgHours = Math.floor(avgDurationMs / (1000 * 60 * 60))
  const avgMinutes = Math.floor((avgDurationMs % (1000 * 60 * 60)) / (1000 * 60))

  const avgSatisfaction =
    allTicketsArray.length > 0
      ? allTicketsArray.reduce((sum, ticket) => sum + (ticket.satisfaction || 0), 0) / allTicketsArray.length
      : 0

  res.json({
    totalClosed: allTicketsArray.length,
    todayClosed: todayTickets.length,
    avgResolutionTime: `${avgHours}h ${avgMinutes}m`,
    satisfactionRate: Math.round(avgSatisfaction * 10) / 10,
  })
})

app.get("/api/tickets/closed", (req, res) => {
  const tickets = Array.from(closedTickets.values())
    .sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime())
    .slice(0, 50)

  res.json(tickets)
})

app.get("/api/tickets/:ticketId/messages", (req, res) => {
  const { ticketId } = req.params
  const ticket = Array.from(closedTickets.values()).find((t) => t.id === ticketId)

  if (!ticket) {
    return res.status(404).json({ error: "Ticket não encontrado" })
  }

  const messages = ticketMessages.get(ticket.channelId) || []
  res.json(messages)
})

app.post("/api/tickets/add", (req, res) => {
  try {
    const ticketData = req.body
    closedTickets.set(ticketData.id, ticketData)

    if (ticketData.messages && ticketData.channelId) {
      ticketMessages.set(ticketData.channelId, ticketData.messages)
    }
    saveData() // Salvar dados após adicionar/atualizar um ticket
    res.json({ success: true, message: "Ticket adicionado com sucesso" })
  } catch (error) {
    console.error("Erro ao adicionar ticket:", error)
    res.status(500).json({ error: "Erro ao adicionar ticket" })
  }
})

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🌐 Dashboard rodando na porta ${PORT}`)
  console.log(`📊 Acesse: https://dashboardtickets.onrender.com`)
})
