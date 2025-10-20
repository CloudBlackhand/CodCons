// Aplicação principal do site CDC - Interface Jurídica Profissional
class CDCApp {
  constructor() {
    this.sessionToken = null;
    this.sessionExpiry = null;
    this.timerInterval = null;
    this.currentChapter = null;
    this.currentArticle = null;
    this.isHomepage = true;
    
    this.init();
  }

  init() {
    this.checkSession();
    this.setupEventListeners();
    this.showHomepage();
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
    
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
      timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      // Mudar cor baseado no tempo restante
      timerDisplay.className = 'timer-text';
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
    // Busca principal
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Busca por artigo
    const articleSearch = document.getElementById('articleSearch');
    if (articleSearch) {
      articleSearch.addEventListener('input', (e) => {
        this.handleArticleSearch(e.target.value);
      });
    }

    // Busca por palavra-chave
    const keywordSearch = document.getElementById('keywordSearch');
    if (keywordSearch) {
      keywordSearch.addEventListener('input', (e) => {
        this.handleKeywordSearch(e.target.value);
      });
    }

    // Navegação
    document.addEventListener('click', (e) => {
      if (e.target.matches('.nav-link, .quick-link, .article-card')) {
        e.preventDefault();
        this.handleNavigation(e.target);
      }
    });

    // Botão voltar
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.showHomepage();
      });
    }

    // Menu mobile
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
      navToggle.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }

    // Fechar sidebar
    const sidebarClose = document.getElementById('sidebarClose');
    if (sidebarClose) {
      sidebarClose.addEventListener('click', () => {
        this.closeSidebar();
      });
    }

    // Overlay
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        this.closeSidebar();
      });
    }
  }

  // Mostrar conteúdo principal
  showContent() {
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('siteContainer').style.display = 'flex';
  }

  // Mostrar homepage
  showHomepage() {
    this.isHomepage = true;
    document.getElementById('homepage').style.display = 'block';
    document.getElementById('contentArea').style.display = 'none';
    document.getElementById('searchResults').style.display = 'none';
    
    // Limpar busca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    const articleSearch = document.getElementById('articleSearch');
    if (articleSearch) articleSearch.value = '';
    
    const keywordSearch = document.getElementById('keywordSearch');
    if (keywordSearch) keywordSearch.value = '';
  }

  // Mostrar erro
  showError(message) {
    const container = document.getElementById('siteContainer');
    container.innerHTML = `
      <div class="error-container">
        <div class="error-content">
          <div class="error-icon">🚫</div>
          <h2>Acesso Negado</h2>
          <p>${message}</p>
          <div class="error-instructions">
            <h3>Instruções:</h3>
            <ul>
              <li>Escaneie o QR code novamente</li>
              <li>Certifique-se de que o QR code está ativo</li>
              <li>Entre em contato com o administrador se o problema persistir</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // Lidar com busca principal
  handleSearch(query) {
    if (!query.trim()) {
      this.showHomepage();
      return;
    }

    const results = searchCDCContent(query);
    this.displaySearchResults(results, query);
  }

  // Lidar com busca por artigo
  handleArticleSearch(query) {
    if (!query.trim()) {
      this.showHomepage();
      return;
    }

    // Buscar por número de artigo
    const articleNumber = query.replace(/\D/g, ''); // Remove não-números
    const results = searchCDCContent(`Art. ${articleNumber}`);
    this.displaySearchResults(results, `Artigo ${articleNumber}`);
  }

  // Lidar com busca por palavra-chave
  handleKeywordSearch(query) {
    if (!query.trim()) {
      this.showHomepage();
      return;
    }

    const results = searchCDCContent(query);
    this.displaySearchResults(results, query);
  }

  // Exibir resultados da busca
  displaySearchResults(results, query) {
    this.isHomepage = false;
    document.getElementById('homepage').style.display = 'none';
    document.getElementById('contentArea').style.display = 'none';
    document.getElementById('searchResults').style.display = 'block';
    
    const searchCount = document.getElementById('searchCount');
    const searchList = document.getElementById('searchList');
    
    if (results.length === 0) {
      searchCount.textContent = `Nenhum resultado encontrado para "${query}"`;
      searchList.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>Nenhum resultado encontrado</h3>
          <p>Tente usar termos diferentes ou verifique a ortografia.</p>
        </div>
      `;
      return;
    }

    searchCount.textContent = `${results.length} resultado(s) encontrado(s) para "${query}"`;
    
    let html = '';
    results.forEach(result => {
      html += `
        <div class="search-result-item" onclick="app.navigateToResult('${result.chapterKey || ''}', '${result.key || ''}')">
          <div class="result-header">
            <span class="result-type">${this.getResultTypeLabel(result.type)}</span>
            ${result.number ? `<span class="result-number">${result.number}</span>` : ''}
          </div>
          <h4 class="result-title">${result.title}</h4>
          <p class="result-content">${this.truncateText(result.content, 200)}</p>
        </div>
      `;
    });

    searchList.innerHTML = html;
  }

  // Obter label do tipo de resultado
  getResultTypeLabel(type) {
    const labels = {
      'chapter': '📋 Capítulo',
      'article': '📄 Artigo',
      'content': '📝 Conteúdo'
    };
    return labels[type] || '📄 Resultado';
  }

  // Truncar texto
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

    if (articleKey) {
      this.showArticle(chapterKey, articleKey);
    } else if (chapterKey) {
      this.showChapter(chapterKey);
    }

    this.closeSidebar();
  }

  // Mostrar capítulo
  showChapter(chapterKey) {
    const chapter = getChapter(chapterKey);
    if (!chapter) return;

    this.isHomepage = false;
    document.getElementById('homepage').style.display = 'none';
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('contentArea').style.display = 'block';
    
    const contentTitle = document.getElementById('contentTitle');
    const contentSubtitle = document.getElementById('contentSubtitle');
    const contentBody = document.getElementById('contentBody');
    
    contentTitle.textContent = chapter.title;
    contentSubtitle.textContent = 'Código de Defesa do Consumidor - Lei 8.078/90';
    
    let html = '';
    
    if (chapter.content) {
      html += `
        <div class="chapter-intro">
          ${chapter.content}
        </div>
      `;
    }

    if (chapter.articles) {
      html += `
        <div class="articles-section">
          <h3>Artigos do Capítulo</h3>
          <div class="articles-grid">
      `;

      Object.keys(chapter.articles).forEach(articleKey => {
        const article = chapter.articles[articleKey];
        html += `
          <div class="article-item" onclick="app.showArticle('${chapterKey}', '${articleKey}')">
            <div class="article-header">
              <span class="article-number">${article.number}</span>
              <h4 class="article-title">${article.title}</h4>
            </div>
            <p class="article-preview">${this.truncateText(article.content, 150)}</p>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }

    contentBody.innerHTML = html;
    this.currentChapter = chapterKey;
    this.currentArticle = null;
  }

  // Mostrar artigo
  showArticle(chapterKey, articleKey) {
    const article = getArticle(chapterKey, articleKey);
    if (!article) return;

    this.isHomepage = false;
    document.getElementById('homepage').style.display = 'none';
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('contentArea').style.display = 'block';
    
    const contentTitle = document.getElementById('contentTitle');
    const contentSubtitle = document.getElementById('contentSubtitle');
    const contentBody = document.getElementById('contentBody');
    
    contentTitle.textContent = article.title;
    contentSubtitle.textContent = `${article.number} - ${getChapter(chapterKey).title}`;
    
    const html = `
      <div class="article-content">
        <div class="article-header">
          <span class="article-number">${article.number}</span>
          <h2 class="article-title">${article.title}</h2>
        </div>
        <div class="article-text">
          ${article.content}
        </div>
      </div>
    `;

    contentBody.innerHTML = html;
    this.currentChapter = chapterKey;
    this.currentArticle = articleKey;
  }

  // Toggle sidebar
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  }

  // Fechar sidebar
  closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  }
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CDCApp();
});