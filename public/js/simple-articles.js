/**
 * Simple, reliable article loader
 * No complex APIs, no breaking integrations
 */

// Category configuration with all 9 categories in correct order
const CATEGORY_CONFIG = [
  {
    name: 'World',
    displayName: 'World News',
    minArticles: 3,
    maxArticles: 6,
    startSpot: 10,
  },
  {
    name: 'Technology',
    displayName: 'Technology',
    minArticles: 3,
    maxArticles: 6,
    startSpot: null,
  },
  {
    name: 'Business',
    displayName: 'Business',
    minArticles: 3,
    maxArticles: 6,
    startSpot: null,
  },
  {
    name: 'Economy',
    displayName: 'Economy',
    minArticles: 3,
    maxArticles: 6,
    startSpot: null,
  },
  {
    name: 'Environment',
    displayName: 'Environment',
    minArticles: 3,
    maxArticles: 6,
    startSpot: null,
  },
  {
    name: 'Education',
    displayName: 'Education',
    minArticles: 3,
    maxArticles: 6,
    startSpot: null,
  },
  {
    name: 'Law & Crime',
    displayName: 'Law & Crime',
    minArticles: 3,
    maxArticles: 6,
    startSpot: null,
  },
  {
    name: 'Science',
    displayName: 'Science',
    minArticles: 3,
    maxArticles: 6,
    startSpot: null,
  },
  {
    name: 'Politics',
    displayName: 'Politics',
    minArticles: 3,
    maxArticles: 6,
    startSpot: null,
  },
];

class SimpleArticleLoader {
  constructor() {
    this.articles = [];
  }

  async loadArticles() {
    console.log('[API] Fetching articles from /api/articles.json...');
    try {
      const response = await fetch('/api/articles.json');
      if (!response.ok) {
        console.warn(
          `[Error Handling] API request failed with status ${response.status} - using fallback articles`
        );
        this.articles = this.getFallbackArticles();
        return;
      }

      const data = await response.json();
      this.articles = Array.isArray(data) ? data : [];
      console.log(
        `[API] ✓ Successfully loaded ${this.articles.length} articles`
      );
    } catch (error) {
      console.error(
        '[Error Handling] Error loading articles from API - using fallback articles:',
        error.message
      );
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

  /**
   * Group articles by category field
   * Organizes articles into category buckets and sorts by publishedAt date (newest first)
   * @returns {Object} Object with category names as keys and arrays of articles as values
   */
  groupArticlesByCategory() {
    const grouped = {};
    let articlesWithoutCategory = 0;
    let articlesWithUnrecognizedCategory = 0;

    // Initialize all categories with empty arrays
    CATEGORY_CONFIG.forEach((cat) => {
      grouped[cat.name] = [];
    });

    // Group articles by category
    this.articles.forEach((article) => {
      const category = article.category || article.customFields?.category;

      if (!category) {
        // Log warning for articles without category field
        articlesWithoutCategory++;
        console.warn(
          `[Error Handling] Article "${article.title || article.id}" (ID: ${
            article.id
          }) is missing category field - skipping`
        );
        return;
      }

      if (grouped[category]) {
        grouped[category].push(article);
      } else {
        // Log warning for articles with unrecognized categories
        articlesWithUnrecognizedCategory++;
        console.warn(
          `[Error Handling] Article "${article.title}" has unrecognized category: "${category}" - skipping`
        );
      }
    });

    // Sort articles within each category by publishedAt date (newest first)
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt);
        const dateB = new Date(b.publishedAt || b.createdAt);
        return dateB - dateA; // Descending order (newest first)
      });
    });

    // Summary logging
    console.log(
      '[Grouping Summary] Articles grouped by category:',
      Object.keys(grouped)
        .map((cat) => `${cat}: ${grouped[cat].length} articles`)
        .join(', ')
    );

    if (articlesWithoutCategory > 0) {
      console.warn(
        `[Grouping Summary] ${articlesWithoutCategory} article(s) skipped due to missing category field`
      );
    }

    if (articlesWithUnrecognizedCategory > 0) {
      console.warn(
        `[Grouping Summary] ${articlesWithUnrecognizedCategory} article(s) skipped due to unrecognized category`
      );
    }

    return grouped;
  }

  /**
   * Calculate sequential spot numbers for category articles starting at spot 10
   * Assigns spot numbers across all categories without gaps
   * Limits articles per category to maxArticles from config
   * @param {Object} groupedArticles - Articles grouped by category from groupArticlesByCategory()
   * @returns {Object} Spot assignment data structure with startSpot and endSpot per category
   */
  calculateSpotNumbers(groupedArticles) {
    console.log('[Spot Assignment] Starting spot number calculation...');
    let currentSpot = 10; // Start after featured stories (spots 1-9)
    const spotAssignments = {};
    let totalArticlesAssigned = 0;
    let categoriesWithArticles = 0;
    let categoriesSkipped = 0;

    // Iterate through categories in configured order
    CATEGORY_CONFIG.forEach((categoryConfig) => {
      const articles = groupedArticles[categoryConfig.name] || [];

      // Limit articles to maxArticles from config
      const articlesToShow = articles.slice(0, categoryConfig.maxArticles);

      // Only create assignment if there are articles to show
      if (articlesToShow.length > 0) {
        spotAssignments[categoryConfig.name] = {
          articles: articlesToShow,
          startSpot: currentSpot,
          endSpot: currentSpot + articlesToShow.length - 1,
        };

        console.log(
          `[Spot Assignment] ${categoryConfig.name}: spots ${currentSpot}-${
            currentSpot + articlesToShow.length - 1
          } (${articlesToShow.length} articles)`
        );

        totalArticlesAssigned += articlesToShow.length;
        categoriesWithArticles++;

        // Move to next spot number (sequential, no gaps)
        currentSpot += articlesToShow.length;
      } else {
        categoriesSkipped++;
        console.log(
          `[Spot Assignment] ${categoryConfig.name}: no articles, skipping section`
        );
      }
    });

    console.log(
      `[Spot Assignment Summary] Total: ${totalArticlesAssigned} articles assigned across ${categoriesWithArticles} categories (${categoriesSkipped} categories skipped)`
    );
    console.log('[Spot Assignment] Final assignments:', spotAssignments);
    return spotAssignments;
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

      // Convert to number if it's a string
      const spotNum = assignedSpot ? parseInt(assignedSpot, 10) : null;

      if (spotNum && spotNum <= 40) {
        const slot = document.querySelector(`[data-spot="${spotNum}"]`);
        if (slot && !filledSpots.has(spotNum)) {
          slot.innerHTML = this.createArticleHTML(article, spotNum);
          slot.classList.remove('article-square');
          slot.classList.add(
            'bg-white',
            'rounded-lg',
            'shadow-md',
            'overflow-hidden'
          );
          filledSpots.add(spotNum);
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

    // Log warning if image is missing for featured articles
    if (!imageUrl && spotNumber <= 9) {
      console.warn(
        `[Error Handling] Featured article "${title}" (spot ${spotNumber}) is missing image - using placeholder`
      );
    }

    // All spots use overlay style with full-height image
    const isMainStory = spotNumber === 1;

    const imageClass = 'w-full h-full object-cover';
    const containerClass =
      'relative h-full border-2 border-gray-300 rounded-lg overflow-hidden';
    const contentClass =
      'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 text-white';
    const titleClass = isMainStory
      ? 'font-display text-2xl md:text-3xl font-bold mb-2'
      : 'font-display text-lg font-bold mb-1';
    const excerptClass = 'text-sm text-gray-200 line-clamp-2';

    // Add onerror handler to images for graceful fallback
    const imageErrorHandler = `onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full bg-gray-200 flex items-center justify-center text-gray-500\\'>Image Failed to Load</div>'"`;

    return `
      <div class="${containerClass}">
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="${title}" class="${imageClass}" ${imageErrorHandler}>`
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

  /**
   * Create vertical article card HTML with horizontal layout for desktop
   * Image on left (1/3 width), content on right (2/3 width) for desktop
   * Stacks vertically on mobile (image top, content bottom)
   * @param {Object} article - Article object with title, excerpt, category, etc.
   * @param {number} spotNumber - Spot number for this article
   * @returns {string} HTML string for the article card
   */
  createVerticalArticleHTML(article, spotNumber) {
    const imageUrl = article.customFields?.image_url || article.image_url;
    const title = article.title || 'Untitled Article';
    const excerpt = article.excerpt || 'No excerpt available';
    const slug = article.slug || article.id || 'article';
    const category = article.category || 'Uncategorized';
    const date = this.formatDate(article.publishedAt || article.createdAt);

    // Log warning if image is missing
    if (!imageUrl) {
      console.warn(
        `[Error Handling] Article "${title}" (spot ${spotNumber}) is missing image - using placeholder`
      );
    }

    return `
      <article class="vertical-article-card"
               data-spot="${spotNumber}">
        <div class="flex flex-col md:flex-row">
          <div class="article-image-container">
            ${
              imageUrl
                ? `<img src="${imageUrl}" alt="${title}" class="w-full h-48 md:h-full object-cover" onerror="this.parentElement.innerHTML='<div class=\\'w-full h-48 md:h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400\\'><span class=\\'text-sm\\'>Image Failed to Load</span></div>'">`
                : `<div class="w-full h-48 md:h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                     <span class="text-sm">No Image</span>
                   </div>`
            }
          </div>
          <div class="article-content-container">
            <div class="flex items-center gap-2 mb-2">
              <span class="category-badge">${category}</span>
              <span class="article-date">${date}</span>
            </div>
            <h3 class="article-title mb-3">
              <a href="/article.html?slug=${slug}">
                ${title}
              </a>
            </h3>
            <p class="article-excerpt line-clamp-3">${excerpt}</p>
          </div>
        </div>
      </article>
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

  /**
   * Create HTML markup for a complete category section
   * Generates section with header and article cards
   * @param {Object} categoryConfig - Category configuration object from CATEGORY_CONFIG
   * @param {Object} assignment - Spot assignment object with articles, startSpot, endSpot
   * @returns {string} HTML string for the complete category section
   */
  createCategorySectionHTML(categoryConfig, assignment) {
    const { articles, startSpot } = assignment;

    // Map category names to their corresponding page URLs
    const categoryUrlMap = {
      World: 'world.html',
      Technology: 'technology.html',
      Business: 'business.html',
      Economy: 'economy.html',
      Environment: 'environment.html',
      Education: 'education.html',
      'Law & Crime': 'law-crime.html',
      Science: 'science.html',
      Politics: 'politics.html',
    };

    const categoryUrl = categoryUrlMap[categoryConfig.name] || '#';

    return `
      <section class="py-8" data-category="${categoryConfig.name}">
        <h2 class="category-section-header font-display text-slate-blue dark:text-background-light text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-4 pt-5 border-b border-steel-blue/20 dark:border-heather-gray/20 mb-4">
          <a href="${categoryUrl}"
             class="hover:text-blue-600 transition-colors cursor-pointer">
            ${categoryConfig.displayName}
          </a>
        </h2>
        <div class="flex flex-col gap-6 p-4">
          ${articles
            .map((article, index) =>
              this.createVerticalArticleHTML(article, startSpot + index)
            )
            .join('')}
        </div>
      </section>
    `;
  }

  /**
   * Render all category sections dynamically based on spot assignments
   * Hides category sections that have zero articles
   * Removes existing category sections and creates new ones
   * @param {Object} spotAssignments - Spot assignment data from calculateSpotNumbers()
   */
  displayCategorySections(spotAssignments) {
    console.log('[Section Rendering] Starting category section rendering...');

    // Find the container where category sections should be inserted
    // This should be after the featured stories section
    const container = document.querySelector('.layout-content-container');

    if (!container) {
      console.error(
        '[Error Handling] Could not find .layout-content-container for category sections - page layout may be broken'
      );
      return;
    }

    // Remove existing category sections (keep showcase and featured)
    const existingSections = container.querySelectorAll(
      'section[data-category]'
    );
    if (existingSections.length > 0) {
      console.log(
        `[Section Rendering] Removing ${existingSections.length} existing category sections`
      );
      existingSections.forEach((section) => {
        console.log(
          `[Section Rendering] Removing existing section: ${section.dataset.category}`
        );
        section.remove();
      });
    }

    // Render each category with articles
    let sectionsRendered = 0;
    let sectionsHidden = 0;

    CATEGORY_CONFIG.forEach((categoryConfig) => {
      const assignment = spotAssignments[categoryConfig.name];

      if (assignment && assignment.articles.length > 0) {
        try {
          const sectionHTML = this.createCategorySectionHTML(
            categoryConfig,
            assignment
          );
          container.insertAdjacentHTML('beforeend', sectionHTML);
          sectionsRendered++;
          console.log(
            `[Section Rendering] ✓ Rendered ${categoryConfig.name} section with ${assignment.articles.length} articles (spots ${assignment.startSpot}-${assignment.endSpot})`
          );
        } catch (error) {
          console.error(
            `[Error Handling] Failed to render ${categoryConfig.name} section:`,
            error
          );
        }
      } else {
        sectionsHidden++;
        console.log(
          `[Section Rendering] ✗ Hiding ${categoryConfig.name} section (no articles available)`
        );
      }
    });

    console.log(
      `[Section Rendering Summary] ${sectionsRendered} sections rendered, ${sectionsHidden} sections hidden`
    );
  }

  async init() {
    console.log('[Init] Starting SimpleArticleLoader initialization...');

    try {
      await this.loadArticles();
      this.displayArticles();

      // Show empty category sections with placeholder numbers
      console.log(
        '[Init] Displaying category section placeholders (spots 11+)...'
      );
      this.displayCategoryPlaceholders();

      console.log('[Init] ✓ Initialization complete');
    } catch (error) {
      console.error(
        '[Error Handling] Critical error during initialization:',
        error
      );
      console.error(
        '[Error Handling] Page may not display correctly. Check console for details.'
      );
    }
  }

  displayCategoryPlaceholders() {
    const container = document.querySelector('.layout-content-container');
    if (!container) return;

    let currentSpot = 10;

    CATEGORY_CONFIG.forEach((categoryConfig) => {
      const numArticles = 4; // Show 4 placeholder articles per category (like spots 4-7)

      const sectionHTML = `
        <section class="py-8" data-category="${categoryConfig.name}">
          <h2 class="font-display text-slate-blue dark:text-background-light text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 border-b border-steel-blue/20 dark:border-heather-gray/20 mb-0">
            ${categoryConfig.displayName}
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
            ${Array.from({ length: numArticles }, (_, i) => {
              const spotNum = currentSpot + i;
              return `
                <div class="bg-gray-100 border-2 border-gray-400 flex items-center justify-center" style="height: 350px;">
                  <span class="text-6xl font-bold text-gray-600">${spotNum}</span>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      `;

      container.insertAdjacentHTML('beforeend', sectionHTML);
      currentSpot += numArticles;
    });
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  const loader = new SimpleArticleLoader();
  loader.init();
});

// Make available globally for debugging
window.SimpleArticleLoader = SimpleArticleLoader;
