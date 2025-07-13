;(() => {
  const themeToggleBtn = document.getElementById("themeToggle")
  const htmlElement = document.documentElement // Representa a tag <html>
  const lucide = window.lucide // Declare the lucide variable

  // Função para definir o tema (claro ou escuro)
  function setTheme(theme) {
    if (theme === "dark") {
      htmlElement.classList.add("dark")
      themeToggleBtn.innerHTML = '<i data-lucide="sun" class="h-4 w-4"></i> <span class="sr-only">Modo Claro</span>' // Ícone de sol para modo escuro
    } else {
      htmlElement.classList.remove("dark")
      themeToggleBtn.innerHTML = '<i data-lucide="moon" class="h-4 w-4"></i> <span class="sr-only">Modo Escuro</span>' // Ícone de lua para modo claro
    }
    localStorage.setItem("theme", theme) // Salva a preferência no localStorage
    // Re-renderiza os ícones Lucide após alterar o innerHTML do botão
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons()
    }
  }

  // Obtém o tema atual do localStorage ou da preferência do sistema
  let currentTheme = localStorage.getItem("theme")
  if (!currentTheme) {
    // Se não houver preferência salva, verifica a preferência do sistema
    currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }
  setTheme(currentTheme) // Aplica o tema inicial

  // Adiciona um ouvinte de evento para o clique do botão
  themeToggleBtn.addEventListener("click", () => {
    const newTheme = htmlElement.classList.contains("dark") ? "light" : "dark"
    setTheme(newTheme) // Alterna o tema
  })
})()
