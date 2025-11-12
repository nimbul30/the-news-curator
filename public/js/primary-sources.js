/**
 * Primary Sources Manager
 * Handles fetching, searching, filtering, and displaying primary sources
 */

class PrimarySourcesManager {
  constructor() {
    this.sources = [];
    this.filteredSources = [];
    this.currentSort = 'count'; // 'count' or 'alpha'
    this.currentCategory = '';
    this.searchDebounceTimer = null;
    this.API_BASE = '/api';

    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    // DOM elements
    this.searchInput = document.getElementById('source-search');
    this.categoryFilter = document.getElementById('category-filter');
    this.sortCountBtn = document.getElementById('sort-count');
    this.sortAlphaBtn = document.getElementById('sort-alpha');
    this.sourcesGrid = document.getElementById('sources-grid');
    this.sourcesContainer = document.getElementById('sources-container');
    this.loadingState = document.getElementById('loading-state');
    this.emptyState = document.getElementById('empty-state');
  }

  attachEventListeners() {
    // Search with debouncing
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Category filter
    if (this.categoryFilter) {
      this.categoryFilter.addEventListener('change', (e) => {
        this.currentCategory = e.target.value;
        this.fetchPrimarySources();
      });
    }

    // Sort buttons
    if (this.sortCountBtn) {
      this.sortCountBtn.addEventListener('click', () => {
        this.setSort('count');
      });
    }

    if (this.sortAlphaBtn) {
      this.sortAlphaBtn.addEventListener('click', () => {
        this.setSort('alpha');
      });
    }
  }

  /**
   * Handle search with debouncing
   */
  handleSearch(query) {
    clearTimeout(this.searchDebounceTimer);

    this.searchDebounceTimer = setTimeout(() => {
      if (query.trim().length > 0) {
        this.searchPrimarySources(query);
      } else {
        this.fetchPrimarySources();
      }
    }, 300); // 300ms debounce
  }

  /**
   * Set sort method and update UI
   */
  setSort(sortType) {
    this.currentSort = sortType;

    // Update button styles
    if (sortType === 'count') {
      this.sortCountBtn.classList.remove('bg-steel-blue/20', 'text-slate-blue');
      this.sortCountBtn.classList.add('bg-primary', 'text-white');
      this.sortAlphaBtn.classList.remove('bg-primary', 'text-white');
      this.sortAlphaBtn.classList.add('bg-steel-blue/20', 'text-slate-blue');
    } else {
      this.sortAlphaBtn.classList.remove('bg-steel-blue/20', 'text-slate-blue');
      this.sortAlphaBtn.classList.add('bg-primary', 'text-white');
      this.sortCountBtn.classList.remove('bg-primary', 'text-white');
      this.sortCountBtn.classList.add('bg-steel-blue/20', 'text-slate-blue');
    }

    // Re-render with new sort
    this.renderSourcesList(this.filteredSources);
  }

  /**
   * Fetch all primary sources with optional category filter
   */
  async fetchPrimarySources() {
    try {
      this.showLoading();

      let url = `${this.API_BASE}/primary-sources`;
      if (this.currentCategory) {
        url += `?category=${encodeURIComponent(this.currentCategory)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.sources = data;
      this.filteredSources = data;

      this.renderSourcesList(this.filteredSources);
    } catch (error) {
      console.error('Error fetching primary sources:', error);
      this.showError('Failed to load primary sources. Please try again later.');
    }
  }

  /**
   * Search primary sources by query
   */
  async searchPrimarySources(query) {
    try {
      this.showLoading();

      const url = `${
        this.API_BASE
      }/primary-sources/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.filteredSources = data;

      this.renderSourcesList(this.filteredSources);
    } catch (error) {
      console.error('Error searching primary sources:', error);
      this.showError('Failed to search primary sources. Please try again.');
    }
  }

  /**
   * Render the list of sources as cards
   */
  renderSourcesList(sources) {
    this.hideLoading();

    if (!sources || sources.length === 0) {
      this.showEmpty();
      return;
    }

    // Sort sources
    const sortedSources = this.sortSources(sources);

    // Clear grid
    this.sourcesGrid.innerHTML = '';

    // Create cards
    sortedSources.forEach((source) => {
      const card = this.createSourceCard(source);
      this.sourcesGrid.appendChild(card);
    });

    // Show container
    this.sourcesContainer.classList.remove('hidden');
    this.emptyState.classList.add('hidden');
  }

  /**
   * Sort sources based on current sort method
   */
  sortSources(sources) {
    const sorted = [...sources];

    if (this.currentSort === 'count') {
      sorted.sort((a, b) => b.count - a.count);
    } else {
      sorted.sort((a, b) => {
        const nameA = this.formatSourceDisplay(a._id).toLowerCase();
        const nameB = this.formatSourceDisplay(b._id).toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    return sorted;
  }

  /**
   * Create a source card element
   */
  createSourceCard(source) {
    const card = document.createElement('div');
    card.className =
      'source-card bg-white dark:bg-slate-blue rounded-lg shadow-md p-6 hover:shadow-xl transition-all';

    const displayName = this.formatSourceDisplay(source._id);
    const articleCount = source.count || 0;
    const categories = source.categories || [];

    card.innerHTML = `
      <div class="flex flex-col h-full">
        <div class="flex-1">
          <h3 class="font-display text-slate-blue dark:text-white text-xl font-bold mb-3 break-words">
            ${this.escapeHtml(displayName)}
          </h3>
          
          <div class="flex items-center gap-2 mb-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary text-white">
              ${articleCount} ${articleCount === 1 ? 'article' : 'articles'}
            </span>
          </div>
          
          ${
            categories.length > 0
              ? `
            <div class="flex flex-wrap gap-1 mb-4">
              ${categories
                .slice(0, 3)
                .map(
                  (cat) => `
                <span class="category-tag">${this.escapeHtml(cat)}</span>
              `
                )
                .join('')}
              ${
                categories.length > 3
                  ? `
                <span class="category-tag">+${categories.length - 3} more</span>
              `
                  : ''
              }
            </div>
          `
              : ''
          }
        </div>
        
        <div class="mt-4">
          <button
            onclick="primarySourcesManager.navigateToSource('${this.escapeHtml(
              source._id
            )}')"
            class="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            View Articles →
          </button>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Format source for display (clean up URLs)
   */
  formatSourceDisplay(source) {
    if (!source) return 'Unknown Source';

    // If it looks like a URL, clean it up
    if (source.includes('://') || source.startsWith('www.')) {
      try {
        let cleaned = source;

        // Remove protocol
        cleaned = cleaned.replace(/^https?:\/\//, '');

        // Remove www
        cleaned = cleaned.replace(/^www\./, '');

        // Remove trailing slash
        cleaned = cleaned.replace(/\/$/, '');

        // Limit length for display
        if (cleaned.length > 50) {
          cleaned = cleaned.substring(0, 47) + '...';
        }

        return cleaned;
      } catch (e) {
        return source;
      }
    }

    return source;
  }

  /**
   * Navigate to source detail page
   */
  navigateToSource(sourceId) {
    const encodedSource = encodeURIComponent(sourceId);
    window.location.href = `source-detail.html?source=${encodedSource}`;
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.loadingState.classList.remove('hidden');
    this.sourcesContainer.classList.add('hidden');
    this.emptyState.classList.add('hidden');
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    this.loadingState.classList.add('hidden');
  }

  /**
   * Show empty state
   */
  showEmpty() {
    this.sourcesContainer.classList.add('hidden');
    this.emptyState.classList.remove('hidden');
  }

  /**
   * Show error message
   */
  showError(message) {
    this.hideLoading();
    this.sourcesContainer.classList.add('hidden');
    this.emptyState.classList.remove('hidden');

    // Update empty state with error message
    const emptyStateContent = this.emptyState.querySelector('p');
    if (emptyStateContent) {
      emptyStateContent.textContent = message;
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Initialize the manager
   */
  async init() {
    await this.fetchPrimarySources();
  }

  // ========================================
  // SOURCE DETAIL PAGE METHODS
  // ========================================

  /**
   * Initialize source detail page
   */
  initSourceDetailPage() {
    this.currentPage = 1;
    this.articlesPerPage = 10;
    this.totalArticles = 0;

    // Get source from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const sourceId = urlParams.get('source');

    if (!sourceId) {
      this.showSourceDetailError('No source specified');
      return;
    }

    this.currentSourceId = decodeURIComponent(sourceId);
    this.loadSourceDetail();
  }

  /**
   * Load source detail and articles
   */
  async loadSourceDetail() {
    try {
      this.showSourceDetailLoading();

      // Fetch articles for this source
      await this.fetchArticlesBySource(this.currentSourceId, this.currentPage);
    } catch (error) {
      console.error('Error loading source detail:', error);
      this.showSourceDetailError(
        'Failed to load source details. Please try again.'
      );
    }
  }

  /**
   * Fetch articles by source with pagination
   */
  async fetchArticlesBySource(sourceId, page = 1) {
    try {
      const url = `${this.API_BASE}/primary-sources/${encodeURIComponent(
        sourceId
      )}/articles?page=${page}&limit=${this.articlesPerPage}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update state
      this.currentArticles = data.articles || [];
      this.totalArticles = data.total || 0;
      this.currentPage = data.page || 1;
      this.totalPages = data.totalPages || 1;

      // Render source detail
      this.renderSourceDetail(sourceId, data);

      // Render articles list
      this.renderArticlesList(this.currentArticles);

      // Setup pagination
      this.setupPagination();
    } catch (error) {
      console.error('Error fetching articles by source:', error);
      throw error;
    }
  }

  /**
   * Render source detail header
   */
  renderSourceDetail(sourceId, data) {
    const sourceNameEl = document.getElementById('source-name');
    const sourceUrlEl = document.getElementById('source-url');
    const articleCountEl = document.getElementById('article-count');

    if (sourceNameEl) {
      const displayName = this.formatSourceDisplay(sourceId);
      sourceNameEl.textContent = displayName;
    }

    if (sourceUrlEl) {
      // Show full URL if it's a URL
      if (sourceId.includes('://') || sourceId.startsWith('www.')) {
        sourceUrlEl.textContent = sourceId;
      } else {
        sourceUrlEl.textContent = '';
      }
    }

    if (articleCountEl) {
      articleCountEl.textContent = this.totalArticles;
    }
  }

  /**
   * Render articles list as cards
   */
  renderArticlesList(articles) {
    const articlesList = document.getElementById('articles-list');
    const articlesContainer = document.getElementById('articles-container');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');

    if (!articlesList) return;

    // Hide loading
    if (loadingState) loadingState.classList.add('hidden');

    // Check if empty
    if (!articles || articles.length === 0) {
      articlesContainer.classList.add('hidden');
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    // Show articles container
    articlesContainer.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');

    // Clear list
    articlesList.innerHTML = '';

    // Create article cards
    articles.forEach((article) => {
      const card = this.createArticleCard(article);
      articlesList.appendChild(card);
    });
  }

  /**
   * Create an article card element
   */
  createArticleCard(article) {
    const card = document.createElement('div');
    card.className =
      'article-card bg-white dark:bg-slate-blue rounded-lg shadow-md p-6 hover:shadow-xl transition-all';

    const title = article.title || 'Untitled';
    const excerpt = article.excerpt || article.summary || '';
    const category = article.category || 'Uncategorized';
    const publishedAt = article.publishedAt || article.published;
    const slug = article.slug || '';

    // Format date
    let dateStr = 'Date unknown';
    if (publishedAt) {
      try {
        const date = new Date(publishedAt);
        dateStr = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      } catch (e) {
        console.error('Error formatting date:', e);
      }
    }

    card.innerHTML = `
      <div class="flex flex-col h-full">
        <div class="flex-1">
          <h3 class="font-display text-slate-blue dark:text-white text-2xl font-bold mb-3 leading-tight">
            ${this.escapeHtml(title)}
          </h3>
          
          <div class="flex items-center gap-3 mb-4 text-sm">
            <span class="category-badge">${this.escapeHtml(category)}</span>
            <span class="text-steel-blue dark:text-heather-gray flex items-center gap-1">
              <span class="material-symbols-outlined text-base">calendar_today</span>
              ${dateStr}
            </span>
          </div>
          
          ${
            excerpt
              ? `
            <p class="text-steel-blue dark:text-heather-gray mb-4 line-clamp-3">
              ${this.escapeHtml(excerpt)}
            </p>
          `
              : ''
          }
        </div>
        
        <div class="flex gap-3 mt-4">
          <a
            href="article.html?slug=${encodeURIComponent(slug)}"
            class="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
          >
            View Article
          </a>
          <a
            href="transparency.html?slug=${encodeURIComponent(slug)}"
            class="flex-1 bg-steel-blue/20 hover:bg-steel-blue/30 text-slate-blue dark:text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
          >
            Transparency
          </a>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Setup pagination controls
   */
  setupPagination() {
    const paginationContainer = document.getElementById('pagination-container');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const currentPageEl = document.getElementById('current-page');
    const totalPagesEl = document.getElementById('total-pages');

    if (!paginationContainer) return;

    // Show/hide pagination
    if (this.totalPages > 1) {
      paginationContainer.classList.remove('hidden');
    } else {
      paginationContainer.classList.add('hidden');
      return;
    }

    // Update page numbers
    if (currentPageEl) currentPageEl.textContent = this.currentPage;
    if (totalPagesEl) totalPagesEl.textContent = this.totalPages;

    // Update button states
    if (prevBtn) {
      prevBtn.disabled = this.currentPage <= 1;

      // Remove old listener and add new one
      const newPrevBtn = prevBtn.cloneNode(true);
      prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);

      newPrevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.goToPage(this.currentPage - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentPage >= this.totalPages;

      // Remove old listener and add new one
      const newNextBtn = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

      newNextBtn.addEventListener('click', () => {
        if (this.currentPage < this.totalPages) {
          this.goToPage(this.currentPage + 1);
        }
      });
    }
  }

  /**
   * Navigate to a specific page
   */
  async goToPage(page) {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await this.fetchArticlesBySource(this.currentSourceId, page);
  }

  /**
   * Show loading state for source detail
   */
  showSourceDetailLoading() {
    const loadingState = document.getElementById('loading-state');
    const articlesContainer = document.getElementById('articles-container');
    const emptyState = document.getElementById('empty-state');

    if (loadingState) loadingState.classList.remove('hidden');
    if (articlesContainer) articlesContainer.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
  }

  /**
   * Show error state for source detail
   */
  showSourceDetailError(message) {
    const loadingState = document.getElementById('loading-state');
    const articlesContainer = document.getElementById('articles-container');
    const emptyState = document.getElementById('empty-state');

    if (loadingState) loadingState.classList.add('hidden');
    if (articlesContainer) articlesContainer.classList.add('hidden');
    if (emptyState) {
      emptyState.classList.remove('hidden');

      // Update error message
      const emptyTitle = emptyState.querySelector('h2');
      const emptyText = emptyState.querySelector('p');

      if (emptyTitle) emptyTitle.textContent = 'Error Loading Source';
      if (emptyText) emptyText.textContent = message;
    }
  }
}

// Initialize when DOM is ready
let primarySourcesManager;

document.addEventListener('DOMContentLoaded', () => {
  primarySourcesManager = new PrimarySourcesManager();

  // Check if we're on the source detail page or index page
  const isSourceDetailPage =
    window.location.pathname.includes('source-detail.html');

  if (!isSourceDetailPage) {
    // Initialize index page
    primarySourcesManager.init();
  }
  // Source detail page initialization is handled by inline script in HTML
});

// Make available globally for inline event handlers and source detail page
window.primarySourcesManager = primarySourcesManager;
window.PrimarySourcesManager = PrimarySourcesManager;
