const express = require("express")
const cors = require("cors")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "dashboard")))

// Armazenamento temporário
const closedTickets = new Map()
const ticketMessages = new Map()

// Dados de exemplo
const sampleTickets = [
  {
    id: "TK-001",
    user: {
      name: "Usuário Exemplo",
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
]

// Inicializar com dados de exemplo
sampleTickets.forEach((ticket) => {
  closedTickets.set(ticket.id, ticket)
})

// Rotas da API
app.get("/api/tickets/stats", (req, res) => {
  const allTickets = Array.from(closedTickets.values())

  res.json({
    totalClosed: allTickets.length,
    todayClosed: 1,
    avgResolutionTime: "1h 30m",
    satisfactionRate: 4.8,
  })
})

app.get("/api/tickets/closed", (req, res) => {
  const tickets = Array.from(closedTickets.values())
  res.json(tickets)
})

app.get("/api/tickets/:ticketId/messages", (req, res) => {
  const messages = [
    {
      id: "msg-1",
      author: { name: "Usuário", avatar: "https://cdn.discordapp.com/embed/avatars/0.png", isStaff: false },
      content: "Olá! Preciso de ajuda.",
      timestamp: new Date().toISOString(),
      attachments: [],
    },
    {
      id: "msg-2",
      author: { name: "Staff", avatar: "https://cdn.discordapp.com/embed/avatars/1.png", isStaff: true },
      content: "Olá! Como posso ajudar?",
      timestamp: new Date().toISOString(),
      attachments: [],
    },
  ]
  res.json(messages)
})

app.post("/api/tickets/add", (req, res) => {
  try {
    const ticketData = req.body
    closedTickets.set(ticketData.id, ticketData)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: "Erro ao adicionar ticket" })
  }
})

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard", "index.html"))
})

app.listen(PORT, () => {
  console.log(`🌐 Dashboard rodando em: http://localhost:${PORT}`)
})
