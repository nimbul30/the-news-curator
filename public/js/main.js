// Main JavaScript entry point for public pages
import '../css/main.css';

// API base URL
const API_BASE = '/api';

// Utility functions
const utils = {
  // Format date for display
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // Create article card HTML
  createArticleCard(article) {
    return `
      <article class="article-card">
        <div class="article-meta">
          <span class="category category-${article.category.toLowerCase()}">${
      article.category
    }</span>
          <time class="date">${this.formatDate(article.publishedAt)}</time>
        </div>
        <h3 class="article-title">
          <a href="/article.html?slug=${article.slug}">${article.title}</a>
        </h3>
        <p class="article-excerpt">${article.excerpt}</p>
        <div class="article-footer">
          <span class="author">By ${article.author}</span>
          <span class="views">${article.viewCount} views</span>
        </div>
      </article>
    `;
  },

  // Show loading state
  showLoading(container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
  },

  // Show error message
  showError(container, message) {
    container.innerHTML = `<div class="error">Error: ${message}</div>`;
  },
};

// API functions
const api = {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Handle both direct arrays and wrapped responses
      return Array.isArray(data) ? data : data.articles || data.results || data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

// Page-specific functionality
const pages = {
  // Homepage functionality
  home: {
    async init() {
      await this.loadFeaturedArticles();
      await this.loadRecentArticles();
      this.setupSearch();
    },

    async loadFeaturedArticles() {
      const container = document.getElementById('featuredGrid');
      if (!container) return;

      utils.showLoading(container);

      try {
        const articles = await api.get('/articles?featured=true&limit=3');
        if (articles.length === 0) {
          container.innerHTML = '<p>No featured articles available.</p>';
          return;
        }

        container.innerHTML = articles
          .map((article) => utils.createArticleCard(article))
          .join('');
      } catch (error) {
        utils.showError(container, 'Failed to load featured articles');
      }
    },

    async loadRecentArticles() {
      const container = document.getElementById('recentGrid');
      if (!container) return;

      utils.showLoading(container);

      try {
        const articles = await api.get('/articles?limit=6');
        if (articles.length === 0) {
          container.innerHTML = '<p>No articles available.</p>';
          return;
        }

        container.innerHTML = articles
          .map((article) => utils.createArticleCard(article))
          .join('');
      } catch (error) {
        utils.showError(container, 'Failed to load recent articles');
      }
    },

    setupSearch() {
      const searchInput = document.getElementById('searchInput');
      const searchBtn = document.getElementById('searchBtn');

      if (!searchInput || !searchBtn) return;

      const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `/category.html?search=${encodeURIComponent(
            query
          )}`;
        }
      };

      searchBtn.addEventListener('click', performSearch);
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          performSearch();
        }
      });
    },
  },

  // Article page functionality
  article: {
    async init() {
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get('slug');

      if (slug) {
        await this.loadArticle(slug);
        await this.loadRelatedArticles(slug);
      }
    },

    async loadArticle(slug) {
      const container = document.getElementById('articleContent');
      if (!container) return;

      utils.showLoading(container);

      try {
        const article = await api.get(`/articles/${slug}`);

        // Update page title and meta
        document.title = `${article.title} - Modern News Platform`;

        container.innerHTML = `
          <header class="article-header">
            <div class="article-meta">
              <span class="category category-${article.category.toLowerCase()}">${
          article.category
        }</span>
              <time class="date">${utils.formatDate(article.publishedAt)}</time>
            </div>
            <h1 class="article-title">${article.title}</h1>
            <p class="article-excerpt">${article.excerpt}</p>
            <div class="article-byline">
              <span class="author">By ${article.author}</span>
              <span class="views">${article.viewCount} views</span>
            </div>
          </header>
          <div class="article-body">
            ${article.content.replace(/\n/g, '</p><p>')}
          </div>
        `;
      } catch (error) {
        utils.showError(container, 'Failed to load article');
      }
    },

    async loadRelatedArticles(currentSlug) {
      const container = document.getElementById('relatedGrid');
      if (!container) return;

      try {
        const articles = await api.get('/articles?limit=3');
        const relatedArticles = articles.filter(
          (article) => article.slug !== currentSlug
        );

        if (relatedArticles.length === 0) {
          container.innerHTML = '<p>No related articles available.</p>';
          return;
        }

        container.innerHTML = relatedArticles
          .map((article) => utils.createArticleCard(article))
          .join('');
      } catch (error) {
        utils.showError(container, 'Failed to load related articles');
      }
    },
  },

  // Category page functionality
  category: {
    async init() {
      const urlParams = new URLSearchParams(window.location.search);
      const category = urlParams.get('category');
      const search = urlParams.get('search');

      if (category) {
        await this.loadCategoryArticles(category);
      } else if (search) {
        await this.loadSearchResults(search);
      }
    },

    async loadCategoryArticles(category) {
      const titleElement = document.getElementById('categoryTitle');
      const container = document.getElementById('categoryGrid');

      if (titleElement) {
        titleElement.textContent = `${category} Articles`;
      }

      if (!container) return;

      utils.showLoading(container);

      try {
        const response = await api.get(`/categories/${category.toLowerCase()}`);
        const articles = response.articles || response;

        if (!articles || articles.length === 0) {
          container.innerHTML = `<p>No articles found in ${category} category.</p>`;
          return;
        }

        container.innerHTML = articles
          .map((article) => utils.createArticleCard(article))
          .join('');
      } catch (error) {
        utils.showError(container, `Failed to load ${category} articles`);
      }
    },

    async loadSearchResults(query) {
      const titleElement = document.getElementById('categoryTitle');
      const container = document.getElementById('categoryGrid');

      if (titleElement) {
        titleElement.textContent = `Search Results for "${query}"`;
      }

      if (!container) return;

      utils.showLoading(container);

      try {
        const response = await api.get(
          `/search?q=${encodeURIComponent(query)}`
        );
        const articles = response.results || response;

        if (!articles || articles.length === 0) {
          container.innerHTML = `<p>No articles found for "${query}".</p>`;
          return;
        }

        container.innerHTML = articles
          .map((article) => utils.createArticleCard(article))
          .join('');
      } catch (error) {
        utils.showError(container, 'Failed to load search results');
      }
    },
  },
};

// Initialize appropriate page functionality
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path === '/' || path === '/index.html') {
    pages.home.init();
  } else if (path === '/article.html') {
    pages.article.init();
  } else if (path === '/category.html') {
    pages.category.init();
  }
});

// Export for potential use in other modules
window.NewsApp = { utils, api, pages };
