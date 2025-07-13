let allTickets = []
let filteredTickets = []
const lucide = window.lucide // Garante que lucide esteja disponível

// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons()
  loadStats()
  loadTickets()
  setupFilters()

  // Atualizar dados a cada 30 segundos
  setInterval(() => {
    loadStats()
    loadTickets()
  }, 30000)
})

async function loadStats() {
  try {
    const response = await fetch("/api/tickets/stats")
    const stats = await response.json()

    document.getElementById("totalClosed").textContent = stats.totalClosed.toLocaleString()
    document.getElementById("todayClosed").textContent = stats.todayClosed
    document.getElementById("avgTime").textContent = stats.avgResolutionTime
    document.getElementById("satisfaction").textContent = stats.satisfactionRate + "/5"

    updateStatus("online")
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error)
    updateStatus("offline")
  }
}

async function loadTickets() {
  try {
    const response = await fetch("/api/tickets/closed")
    allTickets = await response.json()
    filteredTickets = [...allTickets]
    renderTickets()
    updateStatus("online")
  } catch (error) {
    console.error("Erro ao carregar tickets:", error)
    updateStatus("offline")
    showError("Erro ao carregar tickets")
  }
}

function setupFilters() {
  const searchInput = document.getElementById("searchInput")
  const categoryFilter = document.getElementById("categoryFilter")
  const priorityFilter = document.getElementById("priorityFilter")

  searchInput.addEventListener("input", applyFilters)
  categoryFilter.addEventListener("change", applyFilters)
  priorityFilter.addEventListener("change", applyFilters)
}

function applyFilters() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()
  const categoryFilter = document.getElementById("categoryFilter").value
  const priorityFilter = document.getElementById("priorityFilter").value

  filteredTickets = allTickets.filter((ticket) => {
    const matchesSearch =
      ticket.user.name.toLowerCase().includes(searchTerm) || ticket.id.toLowerCase().includes(searchTerm)
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter

    return matchesSearch && matchesCategory && matchesPriority
  })

  renderTickets()
}

function renderTickets() {
  const tbody = document.getElementById("ticketsTableBody")
  const ticketCount = document.getElementById("ticketCount")

  ticketCount.textContent = `${filteredTickets.length} ticket(s) encontrado(s)`

  if (filteredTickets.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="9" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <i data-lucide="search-x" class="h-12 w-12 text-gray-300 mb-4"></i>
                        <p class="text-lg font-medium">Nenhum ticket encontrado</p>
                        <p class="text-sm">Tente ajustar os filtros de busca</p>
                    </div>
                </td>
            </tr>
        `
    lucide.createIcons()
    return
  }

  tbody.innerHTML = filteredTickets
    .map(
      (ticket) => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                ${ticket.id}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <img class="h-8 w-8 rounded-full" src="${ticket.user.avatar}" alt="" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                    <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">${ticket.user.name}</div>
                        <div class="text-sm text-gray-500">${ticket.user.discriminator}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    ${ticket.category}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-2 h-2 rounded-full mr-2 ${getPriorityColor(ticket.priority)}"></div>
                    <span class="text-sm text-gray-900">${ticket.priority}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                ${ticket.duration}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center">
                    <i data-lucide="user" class="h-4 w-4 text-gray-400 mr-1"></i>
                    ${ticket.closedBy}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                ${formatDate(ticket.closedAt)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex mr-2">
                        ${Array.from(
                          { length: 5 },
                          (_, i) => `
                            <div class="w-3 h-3 rounded-full mr-0.5 ${i < ticket.satisfaction ? "bg-yellow-400" : "bg-gray-200"}"></div>
                        `,
                        ).join("")}
                    </div>
                    <span class="text-sm text-gray-600">${ticket.satisfaction}/5</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button onclick="showTicketMessages('${ticket.id}')" 
                        class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <i data-lucide="eye" class="h-4 w-4"></i>
                </button>
            </td>
        </tr>
    `,
    )
    .join("")

  lucide.createIcons()
}

function getPriorityColor(priority) {
  switch (priority) {
    case "Crítica": // Adicionado para consistência
      return "bg-red-500"
    case "Alta":
      return "bg-orange-500"
    case "Média":
      return "bg-yellow-500"
    case "Baixa":
      return "bg-green-500"
    default:
      return "bg-gray-500"
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

async function showTicketMessages(ticketId) {
  try {
    const ticket = allTickets.find((t) => t.id === ticketId)
    const response = await fetch(`/api/tickets/${ticketId}/messages`)
    const messages = await response.json()

    document.getElementById("modalTitle").textContent = `Histórico do Ticket ${ticketId}`
    document.getElementById("modalSubtitle").textContent = `Conversa entre ${ticket.user.name} e a equipe de suporte`

    const modalContent = document.getElementById("modalContent")

    if (messages.length === 0) {
      modalContent.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i data-lucide="message-circle" class="h-12 w-12 mx-auto mb-4 text-gray-300"></i>
                    <p class="text-lg font-medium">Nenhuma mensagem encontrada</p>
                    <p class="text-sm">Este ticket não possui histórico de mensagens</p>
                </div>
            `
    } else {
      modalContent.innerHTML = `
                <div class="space-y-4">
                    ${messages
                      .map(
                        (message) => `
                        <div class="flex gap-3 ${message.author.isStaff ? "flex-row" : "flex-row-reverse"}">
                            <img class="h-8 w-8 rounded-full flex-shrink-0" 
                                 src="${message.author.avatar}" alt="" 
                                 onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                            
                            <div class="flex-1 max-w-[70%] ${message.author.isStaff ? "" : "text-right"}">
                                <div class="flex items-center gap-2 mb-1 ${message.author.isStaff ? "" : "justify-end"}">
                                    <span class="text-sm font-medium ${message.author.isStaff ? "text-blue-600" : "text-gray-900"}">
                                        ${message.author.name}
                                        ${message.author.isStaff ? '<span class="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Staff</span>' : ""}
                                    </span>
                                    <span class="text-xs text-gray-500">${formatMessageTime(message.timestamp)}</span>
                                </div>
                                
                                <div class="p-3 rounded-lg ${message.author.isStaff ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-900"}">
                                    <p class="text-sm leading-relaxed">${message.content}</p>
                                    
                                    ${
                                      message.attachments && message.attachments.length > 0
                                        ? `
                                        <div class="mt-3 space-y-2">
                                            ${message.attachments
                                              .map(
                                                (att) => `
                                                <div class="flex items-center gap-2 p-2 bg-white bg-opacity-50 rounded">
                                                    <i data-lucide="${att.type === "image" ? "image" : "paperclip"}" class="h-4 w-4"></i>
                                                    ${
                                                      att.type === "image"
                                                        ? `<img src="${att.url}" alt="${att.name}" class="max-w-xs rounded border">`
                                                        : `<span class="text-sm">${att.name}</span>`
                                                    }
                                                </div>
                                            `,
                                              )
                                              .join("")}
                                        </div>
                                    `
                                        : ""
                                    }
                                </div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
                
                <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div class="flex items-center justify-between text-sm text-gray-600">
                        <span>${messages.length} mensagem(s) • Duração: ${ticket.duration}</span>
                        <div class="flex items-center gap-2">
                            <span>Satisfação:</span>
                            <div class="flex">
                                ${Array.from(
                                  { length: 5 },
                                  (_, i) => `
                                    <div class="w-3 h-3 rounded-full mr-0.5 ${i < ticket.satisfaction ? "bg-yellow-400" : "bg-gray-200"}"></div>
                                `,
                                ).join("")}
                            </div>
                            <span>${ticket.satisfaction}/5</span>
                        </div>
                    </div>
                </div>
            `
    }

    document.getElementById("messageModal").classList.remove("hidden")
    lucide.createIcons()
  } catch (error) {
    console.error("Erro ao carregar mensagens:", error)
    showError("Erro ao carregar histórico de mensagens")
  }
}

function formatMessageTime(timestamp) {
  return new Date(timestamp).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function closeModal() {
  document.getElementById("messageModal").classList.add("hidden")
}

function refreshData() {
  loadStats()
  loadTickets()
  showSuccess("Dados atualizados!")
}

function updateStatus(status) {
  const statusElement = document.getElementById("status")
  if (status === "online") {
    statusElement.innerHTML = `
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-gray-600">Online</span>
        `
  } else {
    statusElement.innerHTML = `
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
            <span class="text-gray-600">Offline</span>
        `
  }
}

function showError(message) {
  // Implementar notificação de erro
  console.error(message)
}

function showSuccess(message) {
  // Implementar notificação de sucesso
  console.log(message)
}

// Fechar modal ao clicar fora
document.getElementById("messageModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeModal()
  }
})

// Fechar modal com ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal()
  }
})
