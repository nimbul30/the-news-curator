/**
 * Simple, reliable article loader
 * No complex APIs, no breaking integrations
 */

class SimpleArticleLoader {
  constructor() {
    this.articles = [];
    this.categories = {
      World: { start: 1, end: 8 },
      Technology: { start: 9, end: 16 },
      Business: { start: 17, end: 24 },
      Economy: { start: 25, end: 32 },
      Environment: { start: 33, end: 36 },
      Politics: { start: 37, end: 40 },
    };
  }

  async loadArticles() {
    try {
      const response = await fetch('/api/articles.json');
      if (!response.ok) {
        console.log('Using fallback articles');
        this.articles = this.getFallbackArticles();
        return;
      }

      const data = await response.json();
      this.articles = Array.isArray(data) ? data : [];
      console.log(`Loaded ${this.articles.length} articles`);
    } catch (error) {
      console.log('Error loading articles, using fallback:', error);
      this.articles = this.getFallbackArticles();
    }
  }

  getFallbackArticles() {
    return [
      {
        id: 'sample-article',
        title: 'Welcome to The News Curator',
        excerpt: 'Your reliable source for verified news and analysis.',
        category: 'World',
        spot_number: 1,
        image_url: 'assets/The News Curator.png',
        publishedAt: new Date().toISOString(),
      },
    ];
  }

  displayArticles() {
    console.log('Displaying articles:', this.articles.length);

    // Track which spots are filled
    const filledSpots = new Set();
    let autoSpotIndex = 1;

    // First pass: Place articles with assigned spots
    this.articles.forEach((article) => {
      const assignedSpot =
        article.customFields?.spot_number || article.spot_number;

      if (assignedSpot && assignedSpot <= 40) {
        const slot = document.querySelector(`[data-spot="${assignedSpot}"]`);
        if (slot && !filledSpots.has(assignedSpot)) {
          slot.innerHTML = this.createArticleHTML(article, assignedSpot);
          slot.classList.remove('article-square');
          slot.classList.add(
            'bg-white',
            'rounded-lg',
            'shadow-md',
            'overflow-hidden'
          );
          filledSpots.add(assignedSpot);
          console.log(
            'Placed article in spot',
            assignedSpot,
            ':',
            article.title
          );
        }
      }
    });

    // Second pass: Auto-assign articles without spots
    this.articles.forEach((article) => {
      const assignedSpot =
        article.customFields?.spot_number || article.spot_number;

      if (!assignedSpot) {
        // Find next available spot
        while (autoSpotIndex <= 40) {
          if (!filledSpots.has(autoSpotIndex)) {
            const slot = document.querySelector(
              `[data-spot="${autoSpotIndex}"]`
            );
            if (slot) {
              slot.innerHTML = this.createArticleHTML(article, autoSpotIndex);
              slot.classList.remove('article-square');
              slot.classList.add(
                'bg-white',
                'rounded-lg',
                'shadow-md',
                'overflow-hidden'
              );
              filledSpots.add(autoSpotIndex);
              console.log(
                'Auto-placed article in spot',
                autoSpotIndex,
                ':',
                article.title
              );
              autoSpotIndex++;
              break;
            }
          }
          autoSpotIndex++;
        }
      }
    });
  }

  createBlankSquare(dimensions) {
    return `
      <div class="article-placeholder">
        <div class="placeholder-image">
          <span class="dimensions-text">${dimensions}</span>
        </div>
      </div>
    `;
  }

  createArticleHTML(article, spotNumber = null) {
    const imageUrl = article.customFields?.image_url || article.image_url;
    const title = article.title || 'Untitled Article';
    const excerpt = article.excerpt || 'No excerpt available';
    const slug = article.slug || article.id || 'article';

    // Spot 1 is the main hero - needs full height image
    const isMainStory = spotNumber === 1;
    const imageHeight = isMainStory ? 'h-full' : 'h-32';
    const imageClass = isMainStory
      ? 'w-full h-full object-cover'
      : 'w-full h-32 object-cover';
    const containerClass = isMainStory
      ? 'relative h-full'
      : 'h-full flex flex-col';
    const contentClass = isMainStory
      ? 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white'
      : 'p-4';
    const titleClass = isMainStory
      ? 'font-display text-2xl md:text-3xl font-bold mb-2'
      : 'font-bold text-sm mb-2 line-clamp-2';
    const excerptClass = isMainStory
      ? 'text-sm md:text-base text-gray-200 line-clamp-2'
      : 'text-xs text-gray-600 line-clamp-2';

    if (isMainStory) {
      return `
        <div class="${containerClass}">
          ${
            imageUrl
              ? `<img src="${imageUrl}" alt="${title}" class="${imageClass}">`
              : `<div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>`
          }
          <div class="${contentClass}">
            <h3 class="${titleClass}">
              <a href="/article.html?slug=${slug}" class="hover:text-blue-300">${title}</a>
            </h3>
            <p class="${excerptClass}">${excerpt}</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="${containerClass}">
        <div class="flex-1">
          ${
            imageUrl
              ? `<img src="${imageUrl}" alt="${title}" class="${imageClass}">`
              : `<div class="w-full ${imageHeight} bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>`
          }
        </div>
        <div class="${contentClass}">
          <h3 class="${titleClass}">
            <a href="/article.html?slug=${slug}" class="hover:text-blue-600">${title}</a>
          </h3>
          <p class="${excerptClass}">${excerpt}</p>
        </div>
      </div>
    `;
  }

  formatDate(dateString) {
    if (!dateString) return 'Recent';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Recent';
    }
  }

  async init() {
    await this.loadArticles();
    this.displayArticles();
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  const loader = new SimpleArticleLoader();
  loader.init();
});

// Make available globally for debugging
window.SimpleArticleLoader = SimpleArticleLoader;
