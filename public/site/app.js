// Aplicação do Site Jurídico CDC
class CDCApp {
  constructor() {
    this.sessionToken = null;
    this.sessionExpiry = null;
    this.timerInterval = null;
    this.currentSection = 'inicio';
    this.currentArticle = null;
    
    this.init();
  }

  init() {
    this.checkSession();
    this.setupEventListeners();
    this.loadDefaultContent();
  }

  // Verificar sessão atual
  checkSession() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      this.sessionToken = token;
      this.validateSession();
    } else {
      this.showError('Token de sessão não encontrado. Acesso negado.');
    }
  }

  // Validar sessão com o servidor
  async validateSession() {
    try {
      const response = await fetch(`/api/site/verify/${this.sessionToken}`);
      const data = await response.json();
      
      if (data.success && data.data && data.data.valid) {
        this.sessionExpiry = new Date(data.data.expires_at);
        this.startSessionTimer();
        this.showContent();
      } else {
        this.showError('Sessão expirada ou inválida. Acesso negado.');
      }
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      this.showError('Erro ao validar sessão. Tente novamente.');
    }
  }

  // Iniciar timer de sessão
  startSessionTimer() {
    this.updateTimer();
    this.timerInterval = setInterval(() => {
      this.updateTimer();
      this.checkSessionExpiry();
    }, 1000);
  }

  // Atualizar display do timer
  updateTimer() {
    if (!this.sessionExpiry) return;
    
    const now = new Date();
    const timeLeft = this.sessionExpiry - now;
    
    if (timeLeft <= 0) {
      this.handleSessionExpiry();
      return;
    }
    
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    
    const timerDisplay = document.querySelector('.timer-display');
    if (timerDisplay) {
      timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      // Mudar cor baseado no tempo restante
      timerDisplay.className = 'timer-display';
      if (timeLeft <= 60000) { // 1 minuto
        timerDisplay.classList.add('timer-danger');
      } else if (timeLeft <= 300000) { // 5 minutos
        timerDisplay.classList.add('timer-warning');
      }
    }
  }

  // Verificar se sessão expirou
  checkSessionExpiry() {
    if (!this.sessionExpiry) return;
    
    const now = new Date();
    if (now >= this.sessionExpiry) {
      this.handleSessionExpiry();
    }
  }

  // Lidar com expiração da sessão
  handleSessionExpiry() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.showError('Sessão expirada. Escaneie o QR code novamente para continuar.');
  }

  // Configurar event listeners
  setupEventListeners() {
    // Navegação principal
    document.addEventListener('click', (e) => {
      if (e.target.matches('.nav-link')) {
        e.preventDefault();
        this.handleNavigation(e.target);
      }
    });

    // Busca principal
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Busca da sidebar
    const sidebarSearch = document.getElementById('sidebarSearch');
    if (sidebarSearch) {
      sidebarSearch.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }
  }

  // Carregar conteúdo padrão
  loadDefaultContent() {
    this.showSection('inicio');
  }

  // Mostrar conteúdo principal
  showContent() {
    document.querySelector('.site-container').style.display = 'block';
    document.querySelector('.loading')?.remove();
  }

  // Mostrar erro
  showError(message) {
    const container = document.querySelector('.site-container');
    container.innerHTML = `
      <div class="message error">
        <h2>🚫 Acesso Negado</h2>
        <p>${message}</p>
        <p><strong>Instruções:</strong></p>
        <ul>
          <li>Escaneie o QR code novamente</li>
          <li>Certifique-se de que o QR code está ativo</li>
          <li>Entre em contato com o administrador se o problema persistir</li>
        </ul>
      </div>
    `;
  }

  // Lidar com navegação
  handleNavigation(element) {
    const section = element.dataset.section;
    
    // Atualizar navegação ativa
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    element.classList.add('active');

    if (section === 'busca') {
      this.showSection('busca');
    } else {
      this.showSection(section);
    }
  }

  // Mostrar seção
  showSection(sectionKey) {
    // Esconder todas as seções
    document.querySelectorAll('.page-section').forEach(section => {
      section.classList.remove('active');
    });

    // Mostrar seção selecionada
    const targetSection = document.getElementById(sectionKey);
    if (targetSection) {
      targetSection.classList.add('active');
      this.currentSection = sectionKey;
      this.currentArticle = null;
    }

    // Se for busca, focar no input
    if (sectionKey === 'busca') {
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.focus();
      }
    }
  }

  // Mostrar artigo específico
  showArticle(chapterKey, articleKey) {
    const article = getArticle(chapterKey, articleKey);
    if (!article) return;

    // Esconder todas as seções
    document.querySelectorAll('.page-section').forEach(section => {
      section.classList.remove('active');
    });

    // Mostrar seção de artigo
    const articleSection = document.getElementById('artigo');
    articleSection.classList.add('active');

    // Atualizar conteúdo do artigo
    document.getElementById('articleTitle').textContent = article.title;
    document.getElementById('articleNumber').textContent = article.number;
    document.getElementById('articleContent').innerHTML = `
      <p>${article.content}</p>
    `;

    this.currentSection = 'artigo';
    this.currentArticle = { chapterKey, articleKey };

    // Atualizar navegação ativa
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
  }

  // Lidar com busca
  handleSearch(query) {
    if (!query.trim()) {
      this.clearSearchResults();
      return;
    }

    const results = searchCDCContent(query);
    this.displaySearchResults(results);
  }

  // Exibir resultados da busca
  displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="message">
          <h3>🔍 Nenhum resultado encontrado</h3>
          <p>Não foram encontrados artigos para "${document.getElementById('searchInput').value}"</p>
          <p>Tente usar termos diferentes ou números de artigos.</p>
        </div>
      `;
      return;
    }

    let html = `
      <h2>🔍 Resultados da Busca</h2>
      <p class="results-count">${results.length} resultado(s) encontrado(s) para "${document.getElementById('searchInput').value}"</p>
      <div class="articles-grid">
    `;

    results.forEach(result => {
      html += `
        <div class="article-card" onclick="app.navigateToResult('${result.chapterKey || ''}', '${result.key || ''}')">
          <div class="article-number">${result.number || ''}</div>
          <div class="article-title">${result.title}</div>
          <div class="article-content">${result.content.substring(0, 150)}...</div>
        </div>
      `;
    });

    html += `
      </div>
    `;

    searchResults.innerHTML = html;
  }

  // Limpar resultados da busca
  clearSearchResults() {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
  }

  // Navegar para resultado da busca
  navigateToResult(chapterKey, articleKey) {
    if (articleKey) {
      this.showArticle(chapterKey, articleKey);
    } else if (chapterKey) {
      this.showSection(chapterKey);
    }
  }
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CDCApp();
});