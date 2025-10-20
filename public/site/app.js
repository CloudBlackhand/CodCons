// Aplicação principal do site CDC - Landing Page Jurídica
class CDCLandingPage {
  constructor() {
    this.sessionToken = null;
    this.sessionExpiry = null;
    this.timerInterval = null;
    this.allArticles = [];
    this.filteredArticles = [];
    
    this.init();
  }

  init() {
    this.checkSession();
    this.setupEventListeners();
    this.loadAllArticles();
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
    // Busca
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }
  }

  // Carregar todos os artigos
  loadAllArticles() {
    this.allArticles = [];
    
    // Extrair todos os artigos do CDC_CONTENT
    Object.keys(CDC_CONTENT).forEach(chapterKey => {
      const chapter = CDC_CONTENT[chapterKey];
      
      if (chapter.articles) {
        Object.keys(chapter.articles).forEach(articleKey => {
          const article = chapter.articles[articleKey];
          this.allArticles.push({
            ...article,
            chapterKey,
            chapterTitle: chapter.title
          });
        });
      }
    });
    
    this.filteredArticles = [...this.allArticles];
    this.renderArticles();
    this.renderChapters();
  }

  // Mostrar conteúdo principal
  showContent() {
    document.querySelector('.site-container').style.display = 'flex';
    document.querySelector('.loading')?.remove();
  }

  // Mostrar erro
  showError(message) {
    const container = document.querySelector('.site-container');
    container.innerHTML = `
      <div class="error">
        <h2>🚫 Acesso Negado</h2>
        <p>${message}</p>
        <p><strong>Instruções:</strong></p>
        <ul style="text-align: left; display: inline-block;">
          <li>Escaneie o QR code novamente</li>
          <li>Certifique-se de que o QR code está ativo</li>
          <li>Entre em contato com o administrador se o problema persistir</li>
        </ul>
      </div>
    `;
  }

  // Lidar com busca
  handleSearch(query) {
    if (!query.trim()) {
      this.clearSearch();
      return;
    }

    const searchTerm = query.toLowerCase();
    this.filteredArticles = this.allArticles.filter(article => {
      return (
        article.title.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        article.number.toLowerCase().includes(searchTerm) ||
        article.chapterTitle.toLowerCase().includes(searchTerm)
      );
    });

    this.displaySearchResults();
  }

  // Exibir resultados da busca
  displaySearchResults() {
    const searchResults = document.getElementById('search-results');
    const searchResultsGrid = document.getElementById('search-results-grid');
    const articlesSection = document.querySelector('.articles-section');
    const chaptersSection = document.querySelector('.chapters-section');

    if (this.filteredArticles.length === 0) {
      searchResultsGrid.innerHTML = `
        <div class="no-results">
          <h3>Nenhum resultado encontrado</h3>
          <p>Tente usar outras palavras-chave ou navegue pelos capítulos abaixo</p>
        </div>
      `;
    } else {
      searchResultsGrid.innerHTML = this.filteredArticles.map(article => 
        this.createArticleCard(article)
      ).join('');
    }

    searchResults.style.display = 'block';
    articlesSection.style.display = 'none';
    chaptersSection.style.display = 'none';
  }

  // Limpar busca
  clearSearch() {
    const searchResults = document.getElementById('search-results');
    const articlesSection = document.querySelector('.articles-section');
    const chaptersSection = document.querySelector('.chapters-section');

    searchResults.style.display = 'none';
    articlesSection.style.display = 'block';
    chaptersSection.style.display = 'block';
    
    this.filteredArticles = [...this.allArticles];
  }

  // Renderizar artigos
  renderArticles() {
    const articlesGrid = document.getElementById('articles-grid');
    articlesGrid.innerHTML = this.allArticles.map(article => 
      this.createArticleCard(article)
    ).join('');
  }

  // Criar card de artigo
  createArticleCard(article) {
    const contentPreview = article.content.length > 200 
      ? article.content.substring(0, 200) + '...'
      : article.content;

    return `
      <div class="article-card" onclick="app.scrollToArticle('${article.chapterKey}', '${article.number}')">
        <div class="article-number">${article.number}</div>
        <div class="article-title">${article.title}</div>
        <div class="article-content">${contentPreview}</div>
      </div>
    `;
  }

  // Renderizar capítulos
  renderChapters() {
    const chaptersGrid = document.getElementById('chapters-grid');
    
    const chapters = [
      {
        title: '📋 Título I - Das Disposições Gerais',
        description: 'Artigos 1º a 6º - Objetivo, definições e princípios fundamentais',
        articles: this.allArticles.filter(a => a.chapterKey === 'titulo1').length
      },
      {
        title: '📋 Título II - Da Política Nacional',
        description: 'Artigos 7º a 10º - Política nacional das relações de consumo',
        articles: this.allArticles.filter(a => a.chapterKey === 'titulo2').length
      },
      {
        title: '📋 Título III - Dos Direitos Básicos',
        description: 'Artigos 11º a 119º - Direitos básicos e responsabilidades',
        articles: this.allArticles.filter(a => a.chapterKey === 'titulo3').length
      }
    ];

    chaptersGrid.innerHTML = chapters.map(chapter => `
      <div class="chapter-card" onclick="app.filterByChapter('${chapter.title}')">
        <div class="chapter-title">${chapter.title}</div>
        <div class="chapter-description">${chapter.description}</div>
        <div style="margin-top: 10px; font-size: 0.9rem; color: #3b82f6; font-weight: 500;">
          ${chapter.articles} artigos
        </div>
      </div>
    `).join('');
  }

  // Filtrar por capítulo
  filterByChapter(chapterTitle) {
    const searchInput = document.querySelector('.search-input');
    searchInput.value = chapterTitle;
    this.handleSearch(chapterTitle);
  }

  // Scroll para artigo específico
  scrollToArticle(chapterKey, articleNumber) {
    // Implementar scroll suave para o artigo
    console.log(`Scroll para ${articleNumber} do ${chapterKey}`);
  }
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CDCLandingPage();
});