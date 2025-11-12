/**
 * Spotlights Loader
 * Loads article-specific spotlight content and populates the page
 */

class SpotlightsLoader {
  constructor() {
    this.articleSlug = this.getArticleSlugFromURL();
    this.spotlightData = null;
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
   * Initialize the spotlight page
   */
  async init() {
    if (!this.articleSlug) {
      this.showError(
        'No article specified. Please access this page from an article.'
      );
      return;
    }

    try {
      await this.loadSpotlightData();
      await this.loadArticleData();
      this.populatePage();
    } catch (error) {
      console.error('Error loading spotlight:', error);
      this.showError('Unable to load spotlight content for this article.');
    }
  }

  /**
   * Load spotlight data for the article
   */
  async loadSpotlightData() {
    try {
      // First try to load from API
      const response = await fetch(`/api/spotlights/${this.articleSlug}.json`);
      if (response.ok) {
        this.spotlightData = await response.json();
        return;
      }
    } catch (error) {
      console.log('API spotlight data not found, checking localStorage');
    }

    // Fallback to localStorage (from create form)
    const localKey = `spotlight_${this.articleSlug}`;
    const localData = localStorage.getItem(localKey);
    if (localData) {
      this.spotlightData = JSON.parse(localData);
      return;
    }

    // Fallback to transparency data
    const transparencyKey = `transparency_${this.articleSlug}`;
    const transparencyData = localStorage.getItem(transparencyKey);
    if (transparencyData) {
      const parsed = JSON.parse(transparencyData);
      if (parsed.spotlight_content) {
        this.spotlightData = parsed.spotlight_content;
        return;
      }
    }

    // Create default spotlight content
    this.spotlightData = {
      title: 'Editorial Spotlight',
      content:
        'This article represents our commitment to thorough journalism and fact-based reporting. Our editorial team has carefully researched and verified the information presented to ensure accuracy and provide valuable insights to our readers.',
      has_content: true,
    };
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
   * Populate the page with spotlight data
   */
  populatePage() {
    // Hide loading state
    document.getElementById('loading-state').classList.add('hidden');

    // Show content section
    document.getElementById('content-section').classList.remove('hidden');

    // Update header
    this.updateHeader();

    // Update main spotlight content
    this.updateSpotlightContent();

    // Update video section if available
    this.updateVideoSection();

    // Update quotes section if available
    this.updateQuotesSection();

    // Update analysis section
    this.updateAnalysisSection();
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
   * Update main spotlight content
   */
  updateSpotlightContent() {
    const titleElement = document.getElementById('spotlight-title');
    const contentElement = document.getElementById('spotlight-content');

    if (!contentElement) return;

    // Update title if available
    if (titleElement && this.spotlightData.title) {
      titleElement.innerHTML = `<span class="text-yellow-400 mr-2">✨</span>${this.spotlightData.title}`;
    }

    // Update content
    let content = '';
    if (typeof this.spotlightData === 'string') {
      content = this.spotlightData;
    } else if (this.spotlightData && this.spotlightData.content) {
      content = this.spotlightData.content;
    } else {
      content =
        'This article represents our commitment to thorough journalism and fact-based reporting.';
    }

    // Convert paragraphs to HTML
    const paragraphs = content.split('\n\n').filter((p) => p.trim());
    const htmlContent = paragraphs
      .map((p) => `<p class="mb-4 leading-relaxed">${p.trim()}</p>`)
      .join('');

    contentElement.innerHTML = htmlContent;
  }

  /**
   * Update video section
   */
  updateVideoSection() {
    const section = document.getElementById('video-section');
    const container = document.getElementById('video-container');

    if (!section || !container) return;

    if (this.spotlightData && this.spotlightData.video_url) {
      section.classList.remove('hidden');

      const videoUrl = this.spotlightData.video_url;
      let embedHtml = '';

      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const videoId = this.extractYouTubeId(videoUrl);
        if (videoId) {
          embedHtml = `
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/${videoId}" 
              frameborder="0" 
              allowfullscreen
              class="rounded-lg">
            </iframe>
          `;
        }
      }

      if (embedHtml) {
        container.innerHTML = embedHtml;
      } else {
        container.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <a href="${videoUrl}" target="_blank" class="text-cyan-400 hover:text-cyan-300 text-lg font-medium">
              🎥 Watch Video
            </a>
          </div>
        `;
      }
    }
  }

  /**
   * Update quotes section
   */
  updateQuotesSection() {
    const section = document.getElementById('quotes-section');
    const container = document.getElementById('quotes-container');

    if (!section || !container) return;

    if (
      this.spotlightData &&
      this.spotlightData.quotes &&
      this.spotlightData.quotes.trim()
    ) {
      section.classList.remove('hidden');

      const quotes = this.spotlightData.quotes
        .split('\n')
        .filter((q) => q.trim());
      const quotesHtml = quotes
        .map(
          (quote) => `
        <blockquote class="bg-gray-700/50 p-4 rounded-lg border-l-4 border-green-400">
          <p class="text-gray-200 italic">"${quote.trim()}"</p>
        </blockquote>
      `
        )
        .join('');

      container.innerHTML = quotesHtml;
    }
  }

  /**
   * Update analysis section
   */
  updateAnalysisSection() {
    const container = document.getElementById('analysis-content');
    if (!container) return;

    let analysisContent = '';

    if (this.spotlightData && this.spotlightData.analysis) {
      analysisContent = this.spotlightData.analysis;
    } else {
      // Generate default analysis based on article
      analysisContent = `This article addresses important topics that deserve careful consideration. Our editorial team has highlighted this content because it represents significant developments that may impact our readers' understanding of current events. We encourage readers to engage critically with the information presented and seek additional perspectives where appropriate.`;
    }

    const paragraphs = analysisContent.split('\n\n').filter((p) => p.trim());
    const htmlContent = paragraphs
      .map((p) => `<p class="mb-3 leading-relaxed">${p.trim()}</p>`)
      .join('');

    container.innerHTML = htmlContent;
  }

  /**
   * Extract YouTube video ID from URL
   */
  extractYouTubeId(url) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
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
  const loader = new SpotlightsLoader();
  loader.init();
});
