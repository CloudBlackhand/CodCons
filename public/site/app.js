// Aplicação Jurídica - Código de Defesa do Consumidor
// Interface profissional para consulta jurídica

class CDCApp {
  constructor() {
    this.sessionToken = null;
    this.sessionExpiry = null;
    this.timerInterval = null;
    this.currentChapter = null;
    this.currentArticle = null;
    this.searchTimeout = null;
    
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
    // Busca com debounce
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.handleSearch(e.target.value);
        }, 300);
      });
    }

    // Navegação
    document.addEventListener('click', (e) => {
      if (e.target.matches('.nav-link')) {
        e.preventDefault();
        this.handleNavigation(e.target);
      }
    });
  }

  // Carregar conteúdo padrão
  loadDefaultContent() {
    this.showChapter('preambulo');
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
      <header class="header">
        <div class="header-content">
          <div class="header-title">
            <div>Código de Defesa do Consumidor</div>
            <div class="header-subtitle">Lei nº 8.078, de 11 de setembro de 1990</div>
          </div>
        </div>
      </header>
      <div class="container">
        <main class="main-content">
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
        </main>
      </div>
    `;
  }

  // Lidar com busca
  handleSearch(query) {
    if (!query.trim()) {
      this.clearSearchResults();
      return;
    }

    const results = searchCDCContent(query);
    this.displaySearchResults(results, query);
  }

  // Exibir resultados da busca
  displaySearchResults(results, query) {
    const mainContent = document.querySelector('.main-content');
    
    if (results.length === 0) {
      mainContent.innerHTML = `
        <div class="content-header">
          <h1 class="content-title">🔍 Resultados da Busca</h1>
          <div class="content-subtitle">Nenhum resultado encontrado para "${query}"</div>
        </div>
        <div class="message">
          <p>Tente usar termos diferentes ou verifique a ortografia.</p>
          <p>Você pode buscar por:</p>
          <ul>
            <li>Número do artigo (ex: "artigo 1", "art. 5")</li>
            <li>Palavras-chave (ex: "consumidor", "fornecedor", "responsabilidade")</li>
            <li>Títulos de capítulos</li>
          </ul>
        </div>
      `;
      return;
    }

    let html = `
      <div class="content-header">
        <h1 class="content-title">🔍 Resultados da Busca</h1>
        <div class="content-subtitle">${results.length} resultado(s) encontrado(s) para "${query}"</div>
      </div>
      <div class="search-results">
    `;

    results.forEach(result => {
      html += `
        <div class="search-result-item" onclick="app.navigateToResult('${result.chapterKey || ''}', '${result.key || ''}')">
          <div class="search-result-title">${result.title}</div>
          ${result.number ? `<div class="search-result-number">${result.number}</div>` : ''}
          <div class="search-result-preview">${this.highlightSearchTerm(result.content.substring(0, 200), query)}...</div>
        </div>
      `;
    });

    html += `
      </div>
    `;

    mainContent.innerHTML = html;
  }

  // Destacar termo de busca
  highlightSearchTerm(text, term) {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  }

  // Limpar resultados da busca
  clearSearchResults() {
    this.loadDefaultContent();
  }

  // Navegar para resultado da busca
  navigateToResult(chapterKey, articleKey) {
    if (articleKey) {
      this.showArticle(chapterKey, articleKey);
    } else if (chapterKey) {
      this.showChapter(chapterKey);
    }
  }

  // Lidar com navegação
  handleNavigation(element) {
    const chapterKey = element.dataset.chapter;
    const articleKey = element.dataset.article;

    // Atualizar navegação ativa
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    element.classList.add('active');

    if (articleKey) {
      this.showArticle(chapterKey, articleKey);
    } else if (chapterKey) {
      this.showChapter(chapterKey);
    }
  }

  // Mostrar capítulo
  showChapter(chapterKey) {
    const chapter = getChapter(chapterKey);
    if (!chapter) return;

    const mainContent = document.querySelector('.main-content');
    
    let html = `
      <div class="content-header">
        <h1 class="content-title">${chapter.title}</h1>
        <div class="content-subtitle">Código de Defesa do Consumidor - Lei 8.078/90</div>
        <div class="content-meta">
          <span>📅 Lei de 11 de setembro de 1990</span>
          <span>📚 Texto Oficial</span>
        </div>
      </div>
    `;

    if (chapter.content) {
      html += `
        <div class="article-content">
          <div class="article-text">
            ${chapter.content}
          </div>
        </div>
      `;
    }

    if (chapter.articles) {
      html += `
        <div class="articles-list">
      `;

      Object.keys(chapter.articles).forEach(articleKey => {
        const article = chapter.articles[articleKey];
        html += `
          <div class="article-card" onclick="app.showArticle('${chapterKey}', '${articleKey}')">
            <div class="article-card-title">${article.title}</div>
            <div class="article-card-number">${article.number}</div>
            <div class="article-card-content">${article.content.substring(0, 150)}...</div>
          </div>
        `;
      });

      html += `
        </div>
      `;
    }

    mainContent.innerHTML = html;
    this.currentChapter = chapterKey;
    this.currentArticle = null;
  }

  // Mostrar artigo
  showArticle(chapterKey, articleKey) {
    const article = getArticle(chapterKey, articleKey);
    if (!article) return;

    const mainContent = document.querySelector('.main-content');
    
    const html = `
      <div class="content-header">
        <h1 class="content-title">${article.title}</h1>
        <div class="content-subtitle">${getChapter(chapterKey).title}</div>
        <div class="content-meta">
          <span>📅 Lei 8.078/90</span>
          <span>📚 Código de Defesa do Consumidor</span>
        </div>
      </div>
      <div class="article-content">
        <div class="article-header">
          <div class="article-number">${article.number}</div>
          <div class="article-title">${article.title}</div>
        </div>
        <div class="article-text">
          ${article.content}
        </div>
      </div>
    `;

    mainContent.innerHTML = html;
    this.currentChapter = chapterKey;
    this.currentArticle = articleKey;

    // Atualizar navegação ativa
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-chapter="${chapterKey}"][data-article="${articleKey}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CDCApp();
});