/**
 * Reading Suggestions Loader
 * Loads article-specific reading suggestions and populates the page
 */

class ReadingSuggestionsLoader {
  constructor() {
    this.articleSlug = this.getArticleSlugFromURL();
    this.suggestionsData = null;
    this.articleData = null;
  }

  /**
   * Get article slug from URL parameters
   */
  getArticleSlugFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('article') || urlParams.get('slug');
  }

  /**
   * Initialize the reading suggestions page
   */
  async init() {
    if (!this.articleSlug) {
      this.showError(
        'No article specified. Please access this page from an article.'
      );
      return;
    }

    try {
      await this.loadSuggestionsData();
      await this.loadArticleData();
      this.populatePage();
    } catch (error) {
      console.error('Error loading reading suggestions:', error);
      this.showError('Unable to load reading suggestions for this article.');
    }
  }

  /**
   * Load suggestions data for the article
   */
  async loadSuggestionsData() {
    try {
      // First try to load from API
      const response = await fetch(
        `/api/reading-suggestions/${this.articleSlug}.json`
      );
      if (response.ok) {
        this.suggestionsData = await response.json();
        return;
      }
    } catch (error) {
      console.log('API suggestions data not found, checking localStorage');
    }

    // Fallback to localStorage (from create form)
    const localKey = `suggestions_${this.articleSlug}`;
    const localData = localStorage.getItem(localKey);
    if (localData) {
      this.suggestionsData = JSON.parse(localData);
      return;
    }

    // Fallback to transparency data
    const transparencyKey = `transparency_${this.articleSlug}`;
    const transparencyData = localStorage.getItem(transparencyKey);
    if (transparencyData) {
      const parsed = JSON.parse(transparencyData);
      if (parsed.suggested_reading) {
        this.suggestionsData = {
          content: parsed.suggested_reading.content || parsed.suggested_reading,
          articles: parsed.suggested_reading.articles || [],
        };
        return;
      }
    }

    throw new Error(
      `Reading suggestions not found for article: ${this.articleSlug}`
    );
  }

  /**
   * Load article data
   */
  async loadArticleData() {
    try {
      const response = await fetch(`/api/articles/${this.articleSlug}.json`);
      if (response.ok) {
        this.articleData = await response.json();
        return;
      }
    } catch (error) {
      console.log('Article data not found in API');
    }

    // Create basic article data from slug
    this.articleData = {
      title: this.articleSlug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      slug: this.articleSlug,
    };
  }

  /**
   * Populate the page with suggestions data
   */
  populatePage() {
    // Hide loading state
    document.getElementById('loading-state').classList.add('hidden');

    // Show content section
    document.getElementById('content-section').classList.remove('hidden');

    // Update header
    this.updateHeader();

    // Update main content
    this.updateMainContent();

    // Update related sections
    this.updateRelatedSections();
  }

  /**
   * Update header section
   */
  updateHeader() {
    const titleElement = document.getElementById('article-title');
    const backLinkElement = document.getElementById('back-to-article');

    if (titleElement && this.articleData) {
      titleElement.textContent = this.articleData.title || 'Article';
    }

    if (backLinkElement && this.articleData) {
      backLinkElement.href = `/article.html?slug=${this.articleSlug}`;
    }
  }

  /**
   * Update main reading content
   */
  updateMainContent() {
    const contentElement = document.getElementById('reading-content');
    if (!contentElement) return;

    let content = '';

    if (typeof this.suggestionsData === 'string') {
      content = this.suggestionsData;
    } else if (this.suggestionsData && this.suggestionsData.content) {
      content = this.suggestionsData.content;
    } else {
      content =
        'No specific reading suggestions have been provided for this article. However, we recommend exploring related topics through our article archive and external resources.';
    }

    // Convert paragraphs to HTML
    const paragraphs = content.split('\n\n').filter((p) => p.trim());
    const htmlContent = paragraphs
      .map(
        (p) => `<p class="mb-4 text-gray-200 leading-relaxed">${p.trim()}</p>`
      )
      .join('');

    contentElement.innerHTML = htmlContent;
  }

  /**
   * Update related sections
   */
  updateRelatedSections() {
    // Update related articles if available
    if (
      this.suggestionsData &&
      this.suggestionsData.articles &&
      this.suggestionsData.articles.length > 0
    ) {
      this.updateRelatedArticles();
    }

    // Update external resources
    this.updateExternalResources();

    // Update books section
    this.updateBooksSection();
  }

  /**
   * Update related articles section
   */
  updateRelatedArticles() {
    const section = document.getElementById('related-articles-section');
    const container = document.getElementById('related-articles');

    if (!section || !container) return;

    section.classList.remove('hidden');

    const articles = this.suggestionsData.articles;
    const articlesHtml = articles
      .map(
        (article) => `
      <div class="bg-gray-700/50 p-4 rounded-lg">
        <h3 class="font-semibold text-white mb-2">${article.title}</h3>
        <p class="text-sm text-gray-400 mb-2">by ${article.author} • ${article.source}</p>
        <p class="text-gray-300 text-sm">${article.description}</p>
      </div>
    `
      )
      .join('');

    container.innerHTML = articlesHtml;
  }

  /**
   * Update external resources section
   */
  updateExternalResources() {
    const section = document.getElementById('external-resources-section');
    const container = document.getElementById('external-resources');

    if (!section || !container) return;

    // Show section with default resources
    section.classList.remove('hidden');

    const defaultResources = [
      {
        title: 'The News Curator Archive',
        description:
          'Explore our complete archive of verified articles and analysis',
        url: '/',
        type: 'Internal',
      },
      {
        title: 'Fact-Checking Resources',
        description:
          'Independent fact-checking organizations and verification tools',
        url: '#',
        type: 'External',
      },
    ];

    const resourcesHtml = defaultResources
      .map(
        (resource) => `
      <div class="bg-gray-700/50 p-4 rounded-lg flex justify-between items-start">
        <div class="flex-1">
          <h3 class="font-semibold text-white mb-1">${resource.title}</h3>
          <p class="text-gray-300 text-sm mb-2">${resource.description}</p>
          <span class="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded">${resource.type}</span>
        </div>
        <a href="${resource.url}" class="ml-4 text-cyan-400 hover:text-cyan-300 text-sm font-medium">
          Visit →
        </a>
      </div>
    `
      )
      .join('');

    container.innerHTML = resourcesHtml;
  }

  /**
   * Update books section
   */
  updateBooksSection() {
    const section = document.getElementById('books-section');
    const container = document.getElementById('books-list');

    if (!section || !container) return;

    // Show section with default book recommendations
    section.classList.remove('hidden');

    const defaultBooks = [
      {
        title: 'The Elements of Journalism',
        author: 'Bill Kovach & Tom Rosenstiel',
        description:
          'Essential principles for news consumers and journalists alike',
      },
      {
        title: "Trust Me, I'm Lying",
        author: 'Ryan Holiday',
        description: 'Understanding media manipulation in the digital age',
      },
    ];

    const booksHtml = defaultBooks
      .map(
        (book) => `
      <div class="bg-gray-700/50 p-4 rounded-lg">
        <h3 class="font-semibold text-white mb-1">${book.title}</h3>
        <p class="text-sm text-gray-400 mb-2">by ${book.author}</p>
        <p class="text-gray-300 text-sm">${book.description}</p>
      </div>
    `
      )
      .join('');

    container.innerHTML = booksHtml;
  }

  /**
   * Show error message
   */
  showError(message) {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('error-state').classList.remove('hidden');
    document.getElementById('error-message').textContent = message;
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  const loader = new ReadingSuggestionsLoader();
  loader.init();
});
