const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()
const { neon } = require("@neondatabase/serverless") // Importar Neon

const app = express()
const PORT = process.env.PORT || 3000

// Conexão com o banco de dados Neon
const sql = neon(process.env.DATABASE_URL)

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

// Função para garantir que as tabelas existam (executada na inicialização)
async function ensureTablesExist() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_avatar TEXT,
        user_discriminator TEXT,
        category TEXT NOT NULL,
        closed_at TIMESTAMP WITH TIME ZONE NOT NULL,
        duration TEXT NOT NULL,
        closed_by TEXT NOT NULL,
        priority TEXT NOT NULL,
        satisfaction INTEGER,
        channel_id TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        reason TEXT
      );
    `
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        ticket_channel_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_avatar TEXT,
        author_is_staff BOOLEAN NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        attachments JSONB,
        FOREIGN KEY (ticket_channel_id) REFERENCES tickets(channel_id) ON DELETE CASCADE
      );
    `
    console.log("✅ Tabelas 'tickets' e 'messages' verificadas/criadas com sucesso.")
  } catch (error) {
    console.error("❌ Erro ao verificar/criar tabelas:", error)
    process.exit(1) // Sair se não conseguir conectar ao DB ou criar tabelas
  }
}

// Carregar dados de exemplo se o banco de dados estiver vazio (apenas para o primeiro deploy)
async function seedDataIfEmpty() {
  try {
    const { count } = await sql`SELECT COUNT(*) FROM tickets;`.then((rows) => rows[0])
    if (Number.parseInt(count) === 0) {
      console.log(" seeding data...")
      const sampleTickets = [
        {
          id: "TK-001",
          user_id: "user1",
          user_name: "João Silva",
          user_avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
          user_discriminator: "#1234",
          category: "Suporte Técnico",
          closed_at: new Date().toISOString(),
          duration: "2h 15m",
          closed_by: "Moderador",
          priority: "Alta",
          satisfaction: 5,
          channel_id: "123456789",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          reason: "Problema de login resolvido.",
        },
        {
          id: "TK-002",
          user_id: "user2",
          user_name: "Maria Santos",
          user_avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
          user_discriminator: "#5678",
          category: "Dúvidas Gerais",
          closed_at: new Date().toISOString(),
          duration: "45m",
          closed_by: "Admin",
          priority: "Média",
          satisfaction: 4,
          channel_id: "123456790",
          created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          reason: "Dúvida sobre sistema de pontos.",
        },
        {
          id: "TK-003",
          user_id: "user3",
          user_name: "Pedro Costa",
          user_avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
          user_discriminator: "#9012",
          category: "Reportar Bug",
          closed_at: new Date().toISOString(),
          duration: "1h 30m",
          closed_by: "Desenvolvedor",
          priority: "Baixa",
          satisfaction: 5,
          channel_id: "123456791",
          created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          reason: "Bug no comando X corrigido.",
        },
        {
          id: "TK-004",
          user_id: "user4",
          user_name: "Ana Oliveira",
          user_avatar: "https://cdn.discordapp.com/embed/avatars/3.png",
          user_discriminator: "#3456",
          category: "Sugestões",
          closed_at: new Date().toISOString(),
          duration: "20m",
          closed_by: "Moderador",
          priority: "Baixa",
          satisfaction: 3,
          channel_id: "123456792",
          created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          reason: "Sugestão de recurso avaliada.",
        },
        {
          id: "TK-005",
          user_id: "user5",
          user_name: "Carlos Lima",
          user_avatar: "https://cdn.discordapp.com/embed/avatars/4.png",
          user_discriminator: "#7890",
          category: "Suporte Técnico",
          closed_at: new Date().toISOString(),
          duration: "3h 45m",
          closed_by: "Admin",
          priority: "Crítica",
          satisfaction: 4,
          channel_id: "123456793",
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000 - 45 * 60 * 1000).toISOString(),
          reason: "Problema de conexão resolvido.",
        },
      ]

      for (const ticket of sampleTickets) {
        await sql`
          INSERT INTO tickets (id, user_id, user_name, user_avatar, user_discriminator, category, closed_at, duration, closed_by, priority, satisfaction, channel_id, created_at, reason)
          VALUES (
            ${ticket.id},
            ${ticket.user_id},
            ${ticket.user_name},
            ${ticket.user_avatar},
            ${ticket.user_discriminator},
            ${ticket.category},
            ${ticket.closed_at}::timestamp with time zone,
            ${ticket.duration},
            ${ticket.closed_by},
            ${ticket.priority},
            ${ticket.satisfaction},
            ${ticket.channel_id},
            ${ticket.created_at}::timestamp with time zone,
            ${ticket.reason}
          )
          ON CONFLICT (id) DO NOTHING;
        `
      }

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

      for (const channelId in sampleMessages) {
        for (const message of sampleMessages[channelId]) {
          await sql`
            INSERT INTO messages (id, ticket_channel_id, author_name, author_avatar, author_is_staff, content, timestamp, attachments)
            VALUES (
              ${message.id},
              ${channelId},
              ${message.author.name},
              ${message.author.avatar},
              ${message.author.isStaff},
              ${message.content},
              ${message.timestamp}::timestamp with time zone,
              ${JSON.stringify(message.attachments)}::jsonb
            )
            ON CONFLICT (id) DO NOTHING;
          `
        }
      }
      console.log("✅ Dados de exemplo inseridos (se o DB estava vazio).")
    }
  } catch (error) {
    console.error("❌ Erro ao inserir dados de exemplo:", error)
  }
}

// Rotas da API
app.get("/api/tickets/stats", async (req, res) => {
  try {
    const allTickets = await sql`SELECT * FROM tickets;`
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayTickets = allTickets.filter((ticket) => new Date(ticket.closed_at) >= today)

    const totalDurationMs = allTickets.reduce((sum, ticket) => {
      const createdAt = new Date(ticket.created_at).getTime()
      const closedAt = new Date(ticket.closed_at).getTime()
      return sum + (closedAt - createdAt)
    }, 0)

    const avgDurationMs = allTickets.length > 0 ? totalDurationMs / allTickets.length : 0
    const avgHours = Math.floor(avgDurationMs / (1000 * 60 * 60))
    const avgMinutes = Math.floor((avgDurationMs % (1000 * 60 * 60)) / (1000 * 60))

    const avgSatisfaction =
      allTickets.length > 0
        ? allTickets.reduce((sum, ticket) => sum + (ticket.satisfaction || 0), 0) / allTickets.length
        : 0

    res.json({
      totalClosed: allTickets.length,
      todayClosed: todayTickets.length,
      avgResolutionTime: `${avgHours}h ${avgMinutes}m`,
      satisfactionRate: Math.round(avgSatisfaction * 10) / 10,
    })
  } catch (error) {
    console.error("Erro ao carregar estatísticas do DB:", error)
    res.status(500).json({ error: "Erro ao carregar estatísticas" })
  }
})

app.get("/api/tickets/closed", async (req, res) => {
  try {
    const tickets = await sql`
      SELECT 
        id,
        user_name AS user_name,
        user_avatar AS user_avatar,
        user_discriminator AS user_discriminator,
        category,
        closed_at,
        duration,
        closed_by,
        priority,
        satisfaction,
        channel_id,
        created_at
      FROM tickets
      ORDER BY closed_at DESC
      LIMIT 50;
    `
    // Mapear para o formato esperado pelo frontend
    const formattedTickets = tickets.map((t) => ({
      id: t.id,
      user: {
        name: t.user_name,
        avatar: t.user_avatar,
        discriminator: t.user_discriminator,
      },
      category: t.category,
      closedAt: t.closed_at,
      duration: t.duration,
      closedBy: t.closed_by,
      priority: t.priority,
      satisfaction: t.satisfaction,
      channelId: t.channel_id,
      createdAt: t.created_at,
    }))
    res.json(formattedTickets)
  } catch (error) {
    console.error("Erro ao carregar tickets fechados do DB:", error)
    res.status(500).json({ error: "Erro ao carregar tickets fechados" })
  }
})

app.get("/api/tickets/:ticketId/messages", async (req, res) => {
  try {
    const { ticketId } = req.params
    const ticket = await sql`SELECT channel_id FROM tickets WHERE id = ${ticketId};`

    if (ticket.length === 0) {
      return res.status(404).json({ error: "Ticket não encontrado" })
    }

    const channelId = ticket[0].channel_id
    const messages = await sql`
      SELECT 
        id,
        author_name AS author_name,
        author_avatar AS author_avatar,
        author_is_staff AS author_is_staff,
        content,
        timestamp,
        attachments
      FROM messages
      WHERE ticket_channel_id = ${channelId}
      ORDER BY timestamp ASC;
    `
    // Mapear para o formato esperado pelo frontend
    const formattedMessages = messages.map((m) => ({
      id: m.id,
      author: {
        name: m.author_name,
        avatar: m.author_avatar,
        isStaff: m.author_is_staff,
      },
      content: m.content,
      timestamp: m.timestamp,
      attachments: m.attachments,
    }))
    res.json(formattedMessages)
  } catch (error) {
    console.error("Erro ao carregar mensagens do DB:", error)
    res.status(500).json({ error: "Erro ao carregar mensagens" })
  }
})

app.post("/api/tickets/add", async (req, res) => {
  try {
    const ticketData = req.body

    // Inserir ticket
    await sql`
      INSERT INTO tickets (id, user_id, user_name, user_avatar, user_discriminator, category, closed_at, duration, closed_by, priority, satisfaction, channel_id, created_at, reason)
      VALUES (
        ${ticketData.id},
        ${ticketData.user.id},
        ${ticketData.user.name},
        ${ticketData.user.avatar},
        ${ticketData.user.discriminator},
        ${ticketData.category},
        ${ticketData.closedAt}::timestamp with time zone,
        ${ticketData.duration},
        ${ticketData.closedBy},
        ${ticketData.priority},
        ${ticketData.satisfaction},
        ${ticketData.channelId},
        ${ticketData.createdAt}::timestamp with time zone,
        ${ticketData.reason || null}
      )
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        user_name = EXCLUDED.user_name,
        user_avatar = EXCLUDED.user_avatar,
        user_discriminator = EXCLUDED.user_discriminator,
        category = EXCLUDED.category,
        closed_at = EXCLUDED.closed_at,
        duration = EXCLUDED.duration,
        closed_by = EXCLUDED.closed_by,
        priority = EXCLUDED.priority,
        satisfaction = EXCLUDED.satisfaction,
        channel_id = EXCLUDED.channel_id,
        created_at = EXCLUDED.created_at,
        reason = EXCLUDED.reason;
    `

    // Inserir mensagens
    if (ticketData.messages && ticketData.channelId) {
      for (const message of ticketData.messages) {
        await sql`
          INSERT INTO messages (id, ticket_channel_id, author_name, author_avatar, author_is_staff, content, timestamp, attachments)
          VALUES (
            ${message.id},
            ${ticketData.channelId},
            ${message.author.name},
            ${message.author.avatar},
            ${message.author.isStaff},
            ${message.content},
            ${message.timestamp}::timestamp with time zone,
            ${JSON.stringify(message.attachments || [])}::jsonb
          )
          ON CONFLICT (id) DO NOTHING;
        `
      }
    }

    res.json({ success: true, message: "Ticket adicionado com sucesso" })
  } catch (error) {
    console.error("Erro ao adicionar ticket ao DB:", error)
    res.status(500).json({ error: "Erro ao adicionar ticket" })
  }
})

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Iniciar o servidor após garantir que as tabelas existam e os dados de exemplo sejam inseridos
ensureTablesExist().then(() => {
  seedDataIfEmpty().then(() => {
    app.listen(PORT, () => {
      console.log(`🌐 Dashboard rodando na porta ${PORT}`)
      console.log(`📊 Acesse: http://localhost:${PORT}`)
    })
  })
})
