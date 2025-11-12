/**
 * Articles Manager - View and manage all saved articles
 */

class ArticlesManager {
  constructor() {
    this.articles = [];
    this.filteredArticles = [];
    this.currentPage = 1;
    this.articlesPerPage = 12;
    this.currentFilters = {
      search: '',
      category: '',
      status: '',
      sort: 'newest',
    };
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadArticles();
  }

  setupEventListeners() {
    // Filter controls
    document
      .getElementById('search-input')
      .addEventListener('input', this.handleSearch.bind(this));
    document
      .getElementById('category-filter')
      .addEventListener('change', this.handleCategoryFilter.bind(this));
    document
      .getElementById('status-filter')
      .addEventListener('change', this.handleStatusFilter.bind(this));
    document
      .getElementById('sort-filter')
      .addEventListener('change', this.handleSortFilter.bind(this));
    document
      .getElementById('refresh-btn')
      .addEventListener('click', this.loadArticles.bind(this));

    // Modal controls
    document
      .getElementById('close-modal')
      .addEventListener('click', this.closeModal.bind(this));
    document
      .getElementById('view-transparency-btn')
      .addEventListener('click', this.viewTransparencyFromModal.bind(this));
    document
      .getElementById('edit-article-btn')
      .addEventListener('click', this.editArticle.bind(this));
    document
      .getElementById('delete-article-btn')
      .addEventListener('click', this.deleteArticle.bind(this));
    document
      .getElementById('copy-slug-btn')
      .addEventListener('click', this.copySlug.bind(this));

    // Close modal on background click
    document.getElementById('article-modal').addEventListener('click', (e) => {
      if (e.target.id === 'article-modal') {
        this.closeModal();
      }
    });
  }

  async loadArticles() {
    try {
      this.showLoading();

      const response = await fetch('/api/articles?limit=1000'); // Get all articles
      if (!response.ok) {
        throw new Error(`Failed to load articles: ${response.status}`);
      }

      const data = await response.json();
      this.articles = data.articles || [];

      this.updateStats();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading articles:', error);
      this.showError(
        'Failed to load articles. Make sure the server is running on the correct port.'
      );
    }
  }

  updateStats() {
    const total = this.articles.length;
    const published = this.articles.filter((a) => a.published).length;
    const drafts = total - published;
    const categories = [...new Set(this.articles.map((a) => a.category))]
      .length;

    document.getElementById(
      'article-count'
    ).textContent = `${total} articles total`;

    const statsContainer = document.getElementById('stats-cards');
    statsContainer.innerHTML = `
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div class="text-2xl font-bold text-blue-600">${total}</div>
                <div class="text-sm text-blue-800">Total Articles</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                <div class="text-2xl font-bold text-green-600">${published}</div>
                <div class="text-sm text-green-800">Published</div>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div class="text-2xl font-bold text-yellow-600">${drafts}</div>
                <div class="text-sm text-yellow-800">Drafts</div>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div class="text-2xl font-bold text-purple-600">${categories}</div>
                <div class="text-sm text-purple-800">Categories</div>
            </div>
        `;
  }

  handleSearch(e) {
    this.currentFilters.search = e.target.value.toLowerCase();
    this.currentPage = 1;
    this.applyFilters();
  }

  handleCategoryFilter(e) {
    this.currentFilters.category = e.target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  handleStatusFilter(e) {
    this.currentFilters.status = e.target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  handleSortFilter(e) {
    this.currentFilters.sort = e.target.value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.articles];

    // Apply search filter
    if (this.currentFilters.search) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(this.currentFilters.search) ||
          article.content.toLowerCase().includes(this.currentFilters.search) ||
          article.slug.toLowerCase().includes(this.currentFilters.search) ||
          (article.excerpt &&
            article.excerpt.toLowerCase().includes(this.currentFilters.search))
      );
    }

    // Apply category filter
    if (this.currentFilters.category) {
      filtered = filtered.filter(
        (article) => article.category === this.currentFilters.category
      );
    }

    // Apply status filter
    if (this.currentFilters.status !== '') {
      const isPublished = this.currentFilters.status === 'true';
      filtered = filtered.filter(
        (article) => article.published === isPublished
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.currentFilters.sort) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'position':
          // Handle both numeric and string positions
          const aPos = a.spot_number || 'zzz';
          const bPos = b.spot_number || 'zzz';
          return String(aPos).localeCompare(String(bPos));
        default:
          return 0;
      }
    });

    this.filteredArticles = filtered;
    this.renderArticles();
  }

  renderArticles() {
    const container = document.getElementById('articles-container');
    const grid = document.getElementById('articles-grid');
    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');

    loadingState.classList.add('hidden');

    if (this.filteredArticles.length === 0) {
      container.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    container.classList.remove('hidden');

    // Calculate pagination
    const totalPages = Math.ceil(
      this.filteredArticles.length / this.articlesPerPage
    );
    const startIndex = (this.currentPage - 1) * this.articlesPerPage;
    const endIndex = startIndex + this.articlesPerPage;
    const articlesToShow = this.filteredArticles.slice(startIndex, endIndex);

    // Render articles
    grid.innerHTML = '';
    articlesToShow.forEach((article) => {
      const card = this.createArticleCard(article);
      grid.appendChild(card);
    });

    // Render pagination
    this.renderPagination(totalPages);
  }

  createArticleCard(article) {
    const card = document.createElement('div');
    card.className =
      'article-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer';

    const publishedDate = new Date(
      article.publishedAt || article.createdAt
    ).toLocaleDateString();
    const statusClass = article.published ? 'status-published' : 'status-draft';
    const statusText = article.published ? 'Published' : 'Draft';

    const excerpt =
      article.excerpt || article.content.substring(0, 150) + '...';
    const position = article.spot_number
      ? `Pos: ${article.spot_number}`
      : 'No Position';

    card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-2">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <span class="position-badge">${position}</span>
                </div>
                <div class="text-xs text-gray-500">${publishedDate}</div>
            </div>
            
            <h3 class="font-bold text-lg text-gray-900 mb-2 line-clamp-2" title="${article.title}">
                ${article.title}
            </h3>
            
            <div class="flex items-center gap-2 mb-3">
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">${article.category}</span>
                <span class="text-xs text-gray-500">by ${article.author}</span>
            </div>
            
            <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                ${excerpt}
            </p>
            
            <div class="flex justify-between items-center">
                <div class="text-xs text-gray-500">
                    Slug: <code class="bg-gray-100 px-1 rounded">${article.slug}</code>
                </div>
                <div class="flex gap-2">
                    <button class="edit-btn text-blue-600 hover:text-blue-800 text-sm font-medium" data-slug="${article.slug}">
                        ✏️ Edit
                    </button>
                    <button class="view-btn text-green-600 hover:text-green-800 text-sm font-medium" data-slug="${article.slug}">
                        👁️ View
                    </button>
                    <button class="transparency-btn text-purple-600 hover:text-purple-800 text-sm font-medium" data-slug="${article.slug}">
                        🔍 Transparency
                    </button>
                </div>
            </div>
        `;

    // Add click handlers
    card.querySelector('.view-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.viewArticle(article);
    });

    card.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.redirectToEdit(article.slug);
    });

    card.querySelector('.transparency-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.viewTransparency(article.slug);
    });

    card.addEventListener('click', () => {
      this.viewArticle(article);
    });

    return card;
  }

  renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let paginationHTML = '<div class="flex items-center gap-2">';

    // Previous button
    if (this.currentPage > 1) {
      paginationHTML += `<button class="pagination-btn px-3 py-2 bg-white border rounded hover:bg-gray-50" data-page="${
        this.currentPage - 1
      }">← Previous</button>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === this.currentPage) {
        paginationHTML += `<button class="pagination-btn px-3 py-2 bg-pr-primary text-white rounded" data-page="${i}">${i}</button>`;
      } else if (
        i === 1 ||
        i === totalPages ||
        (i >= this.currentPage - 2 && i <= this.currentPage + 2)
      ) {
        paginationHTML += `<button class="pagination-btn px-3 py-2 bg-white border rounded hover:bg-gray-50" data-page="${i}">${i}</button>`;
      } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
        paginationHTML += '<span class="px-2">...</span>';
      }
    }

    // Next button
    if (this.currentPage < totalPages) {
      paginationHTML += `<button class="pagination-btn px-3 py-2 bg-white border rounded hover:bg-gray-50" data-page="${
        this.currentPage + 1
      }">Next →</button>`;
    }

    paginationHTML += '</div>';
    pagination.innerHTML = paginationHTML;

    // Add pagination click handlers
    pagination.querySelectorAll('.pagination-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.currentPage = parseInt(e.target.dataset.page);
        this.renderArticles();
      });
    });
  }

  viewArticle(article) {
    const modal = document.getElementById('article-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    modalTitle.textContent = article.title;

    const publishedDate = new Date(
      article.publishedAt || article.createdAt
    ).toLocaleDateString();
    const statusText = article.published ? 'Published' : 'Draft';
    const position = article.spot_number || 'No Position';

    modalContent.innerHTML = `
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div><strong>Status:</strong> ${statusText}</div>
                <div><strong>Position:</strong> ${position}</div>
                <div><strong>Category:</strong> ${article.category}</div>
                <div><strong>Author:</strong> ${article.author}</div>
                <div><strong>Created:</strong> ${publishedDate}</div>
                <div><strong>Slug:</strong> <code class="bg-gray-100 px-1 rounded">${
                  article.slug
                }</code></div>
            </div>
            
            ${
              article.excerpt
                ? `
                <div class="mb-4">
                    <strong>Summary:</strong>
                    <p class="mt-1 text-gray-700">${article.excerpt}</p>
                </div>
            `
                : ''
            }
            
            <div class="mb-4">
                <strong>Content Preview:</strong>
                <div class="mt-1 p-3 bg-gray-50 rounded max-h-40 overflow-y-auto">
                    <p class="text-gray-700">${article.content.substring(
                      0,
                      500
                    )}${article.content.length > 500 ? '...' : ''}</p>
                </div>
            </div>
            
            ${
              article.sources
                ? `
                <div class="mb-4">
                    <strong>Sources:</strong>
                    <div class="mt-1 p-3 bg-gray-50 rounded max-h-32 overflow-y-auto">
                        <p class="text-gray-700 text-sm">${article.sources}</p>
                    </div>
                </div>
            `
                : ''
            }
            
            ${
              article.tags
                ? `
                <div class="mb-4">
                    <strong>Tags:</strong> <span class="text-gray-700">${article.tags}</span>
                </div>
            `
                : ''
            }
        `;

    // Store current article for modal actions
    modal.dataset.currentSlug = article.slug;
    modal.classList.remove('hidden');
  }

  closeModal() {
    document.getElementById('article-modal').classList.add('hidden');
  }

  editArticle() {
    const modal = document.getElementById('article-modal');
    const slug = modal.dataset.currentSlug;
    this.redirectToEdit(slug);
  }

  redirectToEdit(slug) {
    window.location.href = `create.html?edit=${slug}`;
  }

  viewTransparency(slug) {
    window.location.href = `transparency.html?article=${slug}`;
  }

  viewTransparencyFromModal() {
    const modal = document.getElementById('article-modal');
    const slug = modal.dataset.currentSlug;
    this.viewTransparency(slug);
  }

  async deleteArticle() {
    const modal = document.getElementById('article-modal');
    const slug = modal.dataset.currentSlug;

    if (
      !confirm(
        `Are you sure you want to delete the article "${slug}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      this.showSuccess('Article deleted successfully!');
      this.closeModal();
      this.loadArticles(); // Reload articles
    } catch (error) {
      console.error('Error deleting article:', error);
      this.showError(`Failed to delete article: ${error.message}`);
    }
  }

  copySlug() {
    const modal = document.getElementById('article-modal');
    const slug = modal.dataset.currentSlug;

    navigator.clipboard
      .writeText(slug)
      .then(() => {
        this.showSuccess('Slug copied to clipboard!');
      })
      .catch(() => {
        this.showError('Failed to copy slug');
      });
  }

  showLoading() {
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('articles-container').classList.add('hidden');
    document.getElementById('empty-state').classList.add('hidden');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize the articles manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new ArticlesManager();
});
