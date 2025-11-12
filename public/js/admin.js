// Admin JavaScript entry point
import '../css/admin.css';

// API base URL
const API_BASE = '/api';

// Admin utilities
const adminUtils = {
  // Format date for admin display
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  },

  // Confirm action
  confirm(message) {
    return window.confirm(message);
  },
};

// Admin API functions
const adminApi = {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Admin API Error:', error);
      throw error;
    }
  },

  async get(endpoint) {
    return this.request(endpoint);
  },

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },

  // Get article by ID (convert slug lookup to ID lookup)
  async getById(endpoint, id) {
    return this.request(`${endpoint}/${id}`);
  },
};
};

// Admin pages
const adminPages = {
  // Dashboard functionality
  dashboard: {
    async init() {
      await this.loadStats();
      await this.loadArticles();
      this.setupFilters();
      this.setupLogout();
    },

    async loadStats() {
      try {
        const articles = await adminApi.get('/articles');

        const totalArticles = articles.length;
        const featuredArticles = articles.filter((a) => a.featured).length;
        const totalViews = articles.reduce((sum, a) => sum + a.viewCount, 0);

        document.getElementById('totalArticles').textContent = totalArticles;
        document.getElementById('featuredArticles').textContent =
          featuredArticles;
        document.getElementById('totalViews').textContent = totalViews;
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    },

    async loadArticles(categoryFilter = '') {
      const container = document.getElementById('articlesTable');
      if (!container) return;

      try {
        let articles = await adminApi.get('/articles');

        if (categoryFilter) {
          articles = articles.filter((a) => a.category === categoryFilter);
        }

        container.innerHTML = `
          <table class="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Published</th>
                <th>Views</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${articles
                .map(
                  (article) => `
                <tr>
                  <td>
                    <a href="/article.html?slug=${
                      article.slug
                    }" target="_blank">
                      ${article.title}
                    </a>
                  </td>
                  <td><span class="category-badge category-${article.category.toLowerCase()}">${
                    article.category
                  }</span></td>
                  <td>${article.author}</td>
                  <td>${adminUtils.formatDate(article.publishedAt)}</td>
                  <td>${article.viewCount}</td>
                  <td>${article.featured ? '⭐' : ''}</td>
                  <td class="actions">
                    <button onclick="adminPages.dashboard.editArticle('${
                      article._id
                    }')" class="btn btn-sm btn-secondary">Edit</button>
                    <button onclick="adminPages.dashboard.deleteArticle('${
                      article._id
                    }', '${
                    article.title
                  }')" class="btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `;
      } catch (error) {
        container.innerHTML = '<p class="error">Failed to load articles</p>';
      }
    },

    setupFilters() {
      const categoryFilter = document.getElementById('categoryFilter');
      if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
          this.loadArticles(e.target.value);
        });
      }
    },

    setupLogout() {
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (adminUtils.confirm('Are you sure you want to logout?')) {
            // Implement logout logic
            window.location.href = '/';
          }
        });
      }
    },

    editArticle(articleId) {
      window.location.href = `/admin/editor.html?id=${articleId}`;
    },

    async deleteArticle(articleId, title) {
      if (!adminUtils.confirm(`Are you sure you want to delete "${title}"?`)) {
        return;
      }

      try {
        await adminApi.delete(`/articles/${articleId}`);
        adminUtils.showNotification('Article deleted successfully', 'success');
        await this.loadArticles();
        await this.loadStats();
      } catch (error) {
        adminUtils.showNotification('Failed to delete article', 'error');
      }
    },
  },

  // Editor functionality
  editor: {
    currentArticleId: null,

    async init() {
      this.setupForm();
      this.setupPreview();
      this.setupLogout();

      // Check if editing existing article
      const urlParams = new URLSearchParams(window.location.search);
      const articleId = urlParams.get('id');

      if (articleId) {
        await this.loadArticleForEdit(articleId);
      }
    },

    async loadArticleForEdit(articleId) {
      try {
        const article = await adminApi.get(`/articles/${articleId}`);

        this.currentArticleId = articleId;
        document.getElementById('editorTitle').textContent = 'Edit Article';

        // Populate form
        document.getElementById('title').value = article.title;
        document.getElementById('excerpt').value = article.excerpt;
        document.getElementById('category').value = article.category;
        document.getElementById('author').value = article.author;
        document.getElementById('tags').value = article.tags.join(', ');
        document.getElementById('content').value = article.content;
        document.getElementById('featured').checked = article.featured;
      } catch (error) {
        adminUtils.showNotification(
          'Failed to load article for editing',
          'error'
        );
      }
    },

    setupForm() {
      const form = document.getElementById('articleForm');
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveArticle();
      });
    },

    setupPreview() {
      const previewBtn = document.getElementById('previewBtn');
      const previewSection = document.getElementById('previewSection');
      const previewContent = document.getElementById('previewContent');

      if (!previewBtn || !previewSection || !previewContent) return;

      previewBtn.addEventListener('click', () => {
        const formData = this.getFormData();

        previewContent.innerHTML = `
          <article class="preview-article">
            <header class="article-header">
              <div class="article-meta">
                <span class="category category-${formData.category.toLowerCase()}">${
          formData.category
        }</span>
                <time class="date">${new Date().toLocaleDateString()}</time>
              </div>
              <h1 class="article-title">${formData.title}</h1>
              <p class="article-excerpt">${formData.excerpt}</p>
              <div class="article-byline">
                <span class="author">By ${formData.author}</span>
              </div>
            </header>
            <div class="article-body">
              ${formData.content.replace(/\n/g, '</p><p>')}
            </div>
          </article>
        `;

        previewSection.style.display = 'block';
        previewSection.scrollIntoView({ behavior: 'smooth' });
      });
    },

    setupLogout() {
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (adminUtils.confirm('Are you sure you want to logout?')) {
            window.location.href = '/';
          }
        });
      }
    },

    getFormData() {
      return {
        title: document.getElementById('title').value.trim(),
        excerpt: document.getElementById('excerpt').value.trim(),
        category: document.getElementById('category').value,
        author: document.getElementById('author').value.trim(),
        tags: document
          .getElementById('tags')
          .value.split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        content: document.getElementById('content').value.trim(),
        featured: document.getElementById('featured').checked,
      };
    },

    async saveArticle() {
      const formData = this.getFormData();

      // Basic validation
      if (
        !formData.title ||
        !formData.excerpt ||
        !formData.category ||
        !formData.author ||
        !formData.content
      ) {
        adminUtils.showNotification(
          'Please fill in all required fields',
          'error'
        );
        return;
      }

      try {
        if (this.currentArticleId) {
          // Update existing article
          await adminApi.put(`/articles/${this.currentArticleId}`, formData);
          adminUtils.showNotification(
            'Article updated successfully',
            'success'
          );
        } else {
          // Create new article
          await adminApi.post('/articles', formData);
          adminUtils.showNotification(
            'Article created successfully',
            'success'
          );
        }

        // Redirect to dashboard after short delay
        setTimeout(() => {
          window.location.href = '/admin/dashboard.html';
        }, 1500);
      } catch (error) {
        adminUtils.showNotification('Failed to save article', 'error');
      }
    },
  },
};

// Initialize appropriate admin page
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path === '/admin/dashboard.html') {
    adminPages.dashboard.init();
  } else if (path === '/admin/editor.html') {
    adminPages.editor.init();
  }
});

// Export for global access
window.AdminApp = { adminUtils, adminApi, adminPages };
