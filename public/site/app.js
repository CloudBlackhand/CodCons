// Aplicação principal da Landing Page Jurídica CDC
class CDCApp {
  constructor() {
    this.sessionToken = null;
    this.sessionExpiry = null;
    this.timerInterval = null;
    this.currentChapter = null;
    this.currentArticle = null;

    this.init();
  }

  init() {
    this.checkSession();
    this.setupEventListeners();
    this.setupNavigation();
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
    // Busca
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Navegação
    document.addEventListener('click', (e) => {
      if (e.target.matches('.nav-link')) {
        e.preventDefault();
        this.handleNavigation(e.target);
      }
    });

    // Menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Overlay mobile
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }
  }

  // Carregar conteúdo padrão
  loadDefaultContent() {
    this.showChapter('preambulo');
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
    const mainContent = document.querySelector('.main-content');
    
    if (results.length === 0) {
      mainContent.innerHTML = `
        <div class="content-header">
          <h1>🔍 Resultados da Busca</h1>
          <p>Nenhum resultado encontrado para "${document.querySelector('.search-input').value}"</p>
        </div>
      `;
      return;
    }

    let html = `
      <div class="content-header">
        <h1>🔍 Resultados da Busca</h1>
        <p>${results.length} resultado(s) encontrado(s) para "${document.querySelector('.search-input').value}"</p>
      </div>
      <div class="chapter-content">
        <div class="articles-list">
    `;

    results.forEach(result => {
      html += `
        <div class="article-card" onclick="app.navigateToResult('${result.chapterKey || ''}', '${result.key || ''}')">
          <div class="article-card-title">${result.title}</div>
          ${result.number ? `<div class="article-card-number">${result.number}</div>` : ''}
          <div class="article-card-content">${result.content.substring(0, 200)}...</div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    mainContent.innerHTML = html;
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

  // Configurar navegação
  setupNavigation() {
    // Smooth scroll para seções
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Eventos de clique para cards de capítulo
    document.querySelectorAll('.chapter-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const chapterKey = card.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
        if (chapterKey) {
          this.showChapter(chapterKey);
        }
      });
    });

    // Eventos de clique para artigos
    document.addEventListener('click', (e) => {
      if (e.target.closest('.article-card')) {
        const card = e.target.closest('.article-card');
        const onclick = card.getAttribute('onclick');
        if (onclick) {
          const match = onclick.match(/showArticle\('([^']+)',\s*'([^']+)'\)/);
          if (match) {
            this.showArticle(match[1], match[2]);
          }
        }
      }
    });

    // Atualizar navegação ativa no scroll
    window.addEventListener('scroll', () => {
      this.updateActiveNavigation();
    });
  }

  // Atualizar navegação ativa baseada no scroll
  updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.pageYOffset >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').substring(1) === current) {
        link.classList.add('active');
      }
    });
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

    this.closeMobileMenu();
  }

  // Mostrar capítulo
  showChapter(chapterKey) {
    const chapter = getChapter(chapterKey);
    if (!chapter) return;

    const contentArea = document.getElementById('content-area');

    let html = `
      <div class="content-header">
        <h2>${chapter.title}</h2>
        <p>Capítulo específico do Código de Defesa do Consumidor</p>
      </div>
    `;

    if (chapter.content) {
      html += `
        <div class="article-container">
          <div class="article-header">
            <h3 class="article-title">Conteúdo do Capítulo</h3>
          </div>
          <div class="article-text">
            ${chapter.content}
          </div>
        </div>
      `;
    }

    if (chapter.articles && Object.keys(chapter.articles).length > 0) {
      // Criar lista de artigos do capítulo
      const articlesList = Object.keys(chapter.articles).map(articleKey => {
        const article = chapter.articles[articleKey];
        return `
          <div class="article-card" onclick="app.showArticle('${chapterKey}', '${articleKey}')">
            <div class="article-card-title">${article.title}</div>
            <div class="article-card-number">${article.number}</div>
          </div>
        `;
      }).join('');

      html += `
        <div class="content-header" style="margin-top: 40px;">
          <h3>Artigos deste Capítulo</h3>
          <p>Clique em qualquer artigo para visualizar seu conteúdo completo</p>
        </div>
        <div class="chapters-nav">
          ${articlesList}
        </div>
      `;
    }

    contentArea.innerHTML = html;
    this.currentChapter = chapterKey;
    this.currentArticle = null;

    // Scroll para o conteúdo
    contentArea.scrollIntoView({ behavior: 'smooth' });
  }

  // Mostrar artigo
  showArticle(chapterKey, articleKey) {
    const article = getArticle(chapterKey, articleKey);
    if (!article) return;

    const contentArea = document.getElementById('content-area');

    const html = `
      <div class="article-container">
        <div class="article-header">
          <h2 class="article-title">${article.title}</h2>
          <span class="article-number">${article.number}</span>
        </div>
        <div class="article-text">
          ${article.content}
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; text-align: center;">
          <p style="color: #7f8c8d; font-size: 14px;">
            <strong>Capítulo:</strong> ${getChapter(chapterKey).title} |
            <strong>Artigo:</strong> ${article.number}
          </p>
        </div>
      </div>
    `;

    contentArea.innerHTML = html;
    this.currentChapter = chapterKey;
    this.currentArticle = articleKey;

    // Scroll para o artigo
    contentArea.scrollIntoView({ behavior: 'smooth' });
  }

  // Toggle menu mobile
  toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  }

  // Fechar menu mobile
  closeMobileMenu() {
    const navMobile = document.querySelector('.nav-mobile');
    const overlay = document.querySelector('.nav-overlay');

    if (navMobile) navMobile.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  // Lidar com busca
  handleSearch(query) {
    const searchResults = document.getElementById('search-results');
    const resultsList = document.getElementById('results-list');

    if (!query.trim()) {
      searchResults.style.display = 'none';
      return;
    }

    const results = searchCDCContent(query);

    if (results.length === 0) {
      resultsList.innerHTML = `
        <div class="result-item">
          <div class="result-title">Nenhum resultado encontrado</div>
          <div class="result-preview">Tente outros termos de busca</div>
        </div>
      `;
      searchResults.style.display = 'block';
      return;
    }

    resultsList.innerHTML = results.map(result => `
      <div class="result-item" onclick="app.navigateToResult('${result.chapterKey || ''}', '${result.key || ''}')">
        <div class="result-title">${result.title}</div>
        <div class="result-number">${result.number || ''}</div>
        <div class="result-preview">${result.content?.substring(0, 150)}...</div>
      </div>
    `).join('');

    searchResults.style.display = 'block';

    // Scroll para resultados
    searchResults.scrollIntoView({ behavior: 'smooth' });
  }

  // Navegar para resultado da busca
  navigateToResult(chapterKey, articleKey) {
    if (articleKey) {
      this.showArticle(chapterKey, articleKey);
    } else if (chapterKey) {
      this.showChapter(chapterKey);
    }

    // Esconder resultados
    document.getElementById('search-results').style.display = 'none';
  }
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CDCApp();
});
