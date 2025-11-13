# Design Document: Homepage Category Redesign

## Overview

This design document outlines the technical approach for redesigning The News Curator homepage to feature a category-based layout. The redesign will transform the current fixed-spot system into a dynamic, category-driven structure where articles are automatically organized by their category field, with sequential spot numbering starting from spot 10 for category sections.

The current homepage already has a category-based structure (spots 1-44), but the article placement logic needs to be updated to:

1. Keep spots 1-9 for featured stories (showcase + featured grid)
2. Start category sections at spot 10 with World News
3. Display articles vertically within each category section
4. Dynamically show/hide category sections based on available content
5. Maintain sequential spot numbering across all categories

## Architecture

### High-Level Structure

```
Homepage Layout
├── Header (Navigation Bar)
├── Main Content
│   ├── Showcase Article (Spot 1)
│   ├── Featured Stories Grid (Spots 2-9)
│   └── Category Sections (Spots 10+)
│       ├── World (Spots 10-13+)
│       ├── Technology (Spots 14-17+)
│       ├── Business (Spots 18-21+)
│       ├── Economy (Spots 22-25+)
│       ├── Environment (Spots 26-29+)
│       ├── Education (Spots 30-33+)
│       ├── Law & Crime (Spots 34-37+)
│       ├── Science (Spots 38-41+)
│       └── Politics (Spots 42-45+)
└── Footer
```

### Component Architecture

The redesign will modify the existing `SimpleArticleLoader` class to implement category-aware article placement:

```
SimpleArticleLoader
├── loadArticles() - Fetch articles from API
├── groupArticlesByCategory() - NEW: Group articles by category
├── calculateSpotNumbers() - NEW: Assign sequential spots per category
├── displayCategorySections() - NEW: Render category sections dynamically
├── createArticleHTML() - Modified: Support vertical layout
└── hidEmptySections() - NEW: Hide categories with no articles
```

## Components and Interfaces

### 1. Category Configuration

Define category metadata including display order, spot ranges, and article limits:

```javascript
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
```

### 2. Article Grouping Logic

```javascript
groupArticlesByCategory() {
  const grouped = {};

  // Initialize all categories
  CATEGORY_CONFIG.forEach(cat => {
    grouped[cat.name] = [];
  });

  // Group articles by category
  this.articles.forEach(article => {
    const category = article.category || article.customFields?.category;
    if (category && grouped[category]) {
      grouped[category].push(article);
    }
  });

  // Sort articles within each category by date (newest first)
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt);
      const dateB = new Date(b.publishedAt || b.createdAt);
      return dateB - dateA;
    });
  });

  return grouped;
}
```

### 3. Spot Number Assignment

```javascript
calculateSpotNumbers(groupedArticles) {
  let currentSpot = 10; // Start after featured stories (spots 1-9)
  const spotAssignments = {};

  CATEGORY_CONFIG.forEach(categoryConfig => {
    const articles = groupedArticles[categoryConfig.name] || [];
    const articlesToShow = articles.slice(0, categoryConfig.maxArticles);

    if (articlesToShow.length > 0) {
      spotAssignments[categoryConfig.name] = {
        articles: articlesToShow,
        startSpot: currentSpot,
        endSpot: currentSpot + articlesToShow.length - 1
      };
      currentSpot += articlesToShow.length;
    }
  });

  return spotAssignments;
}
```

### 4. Dynamic Section Rendering

Instead of pre-rendering all category sections in HTML, we'll dynamically generate them based on available content:

```javascript
displayCategorySections(spotAssignments) {
  const container = document.querySelector('.layout-content-container');

  // Remove existing category sections (keep showcase and featured)
  const existingSections = container.querySelectorAll('section[data-category]');
  existingSections.forEach(section => section.remove());

  // Render each category with articles
  CATEGORY_CONFIG.forEach(categoryConfig => {
    const assignment = spotAssignments[categoryConfig.name];

    if (assignment && assignment.articles.length > 0) {
      const sectionHTML = this.createCategorySectionHTML(
        categoryConfig,
        assignment
      );
      container.insertAdjacentHTML('beforeend', sectionHTML);
    }
  });
}
```

### 5. Category Section HTML Template

```javascript
createCategorySectionHTML(categoryConfig, assignment) {
  const { articles, startSpot } = assignment;

  return `
    <section class="py-8" data-category="${categoryConfig.name}">
      <h2 class="font-display text-slate-blue dark:text-background-light text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-4 pt-5 border-b border-steel-blue/20 dark:border-heather-gray/20 mb-4">
        <a href="${categoryConfig.name.toLowerCase().replace(' & ', '-')}.html"
           class="hover:text-primary transition-colors cursor-pointer">
          ${categoryConfig.displayName}
        </a>
      </h2>
      <div class="flex flex-col gap-6 p-4">
        ${articles.map((article, index) =>
          this.createVerticalArticleHTML(article, startSpot + index)
        ).join('')}
      </div>
    </section>
  `;
}
```

### 6. Vertical Article Card Layout

```javascript
createVerticalArticleHTML(article, spotNumber) {
  const imageUrl = article.customFields?.image_url || article.image_url;
  const title = article.title || 'Untitled Article';
  const excerpt = article.excerpt || 'No excerpt available';
  const slug = article.slug || article.id || 'article';
  const category = article.category || 'Uncategorized';
  const date = this.formatDate(article.publishedAt || article.createdAt);

  return `
    <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
             data-spot="${spotNumber}">
      <div class="flex flex-col md:flex-row">
        <div class="md:w-1/3">
          ${imageUrl
            ? `<img src="${imageUrl}" alt="${title}" class="w-full h-48 md:h-full object-cover">`
            : `<div class="w-full h-48 md:h-full bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>`
          }
        </div>
        <div class="md:w-2/3 p-6">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-semibold text-primary uppercase">${category}</span>
            <span class="text-xs text-gray-500">${date}</span>
          </div>
          <h3 class="font-display text-xl font-bold mb-3 text-slate-blue">
            <a href="/article.html?slug=${slug}" class="hover:text-primary transition-colors">
              ${title}
            </a>
          </h3>
          <p class="text-sm text-gray-600 line-clamp-3">${excerpt}</p>
        </div>
      </div>
    </article>
  `;
}
```

## Data Models

### Article Data Structure

```typescript
interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string; // 'World' | 'Technology' | 'Business' | etc.
  image_url?: string;
  publishedAt: string; // ISO date string
  createdAt: string;
  spot_number?: number; // Optional manual spot assignment
  customFields?: {
    image_url?: string;
    spot_number?: number;
    category?: string;
  };
}
```

### Category Configuration Structure

```typescript
interface CategoryConfig {
  name: string; // Internal category name
  displayName: string; // Display name for UI
  minArticles: number; // Minimum articles to show section
  maxArticles: number; // Maximum articles per section
  startSpot: number | null; // Fixed start spot (only for first category)
}
```

### Spot Assignment Structure

```typescript
interface SpotAssignment {
  [categoryName: string]: {
    articles: Article[];
    startSpot: number;
    endSpot: number;
  };
}
```

## HTML Structure Changes

### Current Structure (index.html)

- Fixed category sections with hardcoded spot numbers (9-44)
- 4-column grid layout for all category sections
- Static placeholder divs with `data-spot` attributes

### New Structure

- Keep showcase (spot 1) and featured stories (spots 2-9) unchanged
- Remove hardcoded category sections from HTML
- Dynamically generate category sections via JavaScript
- Vertical article layout (1 column) for category sections
- Responsive: Stack vertically on mobile, side-by-side image/content on desktop

### Minimal HTML Changes Required

The existing HTML structure for spots 1-9 remains unchanged. Category sections (currently starting at "World News") will be removed and replaced with a single container div:

```html
<!-- After Featured Stories Section -->
<div id="category-sections-container" class="space-y-8">
  <!-- Category sections will be dynamically inserted here -->
</div>
```

## Error Handling

### 1. Missing Category Data

- If an article has no category field, log a warning and skip the article
- Provide fallback category "Uncategorized" for debugging purposes

### 2. Empty Categories

- Hide category sections that have zero articles
- Log which categories are hidden for debugging

### 3. API Failures

- Maintain existing fallback article system
- Display error message in console but don't break page layout

### 4. Image Loading Failures

- Use existing placeholder div approach
- Display "No Image" text in gray box

### 5. Invalid Spot Numbers

- Ignore manual spot_number assignments outside valid range (1-9 for featured)
- Auto-assign spots for category articles regardless of manual assignments

## Testing Strategy

### 1. Unit Testing Focus

- Test `groupArticlesByCategory()` with various article datasets
- Test `calculateSpotNumbers()` with different category distributions
- Test category section visibility logic (show/hide based on content)

### 2. Integration Testing

- Test full article loading and rendering flow
- Verify spot number sequencing across categories
- Test responsive layout on different screen sizes

### 3. Manual Testing Scenarios

- Load homepage with full article dataset
- Load homepage with articles in only some categories
- Load homepage with no articles (fallback behavior)
- Test article links navigate correctly
- Verify category header links work
- Test on mobile, tablet, and desktop viewports

### 4. Performance Considerations

- Measure page load time with 50+ articles
- Ensure smooth rendering without layout shifts
- Optimize image loading (lazy loading for below-fold content)

## Implementation Phases

### Phase 1: JavaScript Logic Updates

- Update `SimpleArticleLoader` class with new methods
- Implement category grouping and spot calculation
- Test with console logging (no UI changes yet)

### Phase 2: HTML Template Updates

- Create vertical article card template
- Create dynamic category section template
- Update CSS for new layout

### Phase 3: HTML Structure Cleanup

- Remove hardcoded category sections from index.html
- Add container div for dynamic sections
- Update CSS classes

### Phase 4: Integration and Testing

- Wire up new JavaScript to page load
- Test with real article data
- Fix responsive layout issues
- Performance optimization

## Responsive Design

### Desktop (≥1024px)

- Showcase article: Full width, 625px height
- Featured stories: 4-column grid (spots 2-5), then 3-column grid (spots 6-8), spot 9 standalone
- Category articles: Horizontal card layout (image left, content right)

### Tablet (768px - 1023px)

- Showcase article: Full width, 400px height
- Featured stories: 2-column grid
- Category articles: Horizontal card layout (smaller image)

### Mobile (<768px)

- Showcase article: Full width, 400px height
- Featured stories: 1-column stack
- Category articles: Vertical card layout (image top, content bottom)

## Migration Notes

### Backward Compatibility

- Spots 1-9 behavior remains unchanged
- Existing articles with spot_number 1-9 will still work
- Articles with spot_number 10+ will be ignored (category placement takes over)

### Data Requirements

- All articles must have a `category` field matching one of the defined categories
- Articles without categories will be skipped with a console warning
- No database migration required

### Deployment Considerations

- Changes are client-side only (HTML + JavaScript)
- No server-side changes required
- Can be deployed independently
- Rollback is simple (revert HTML and JS files)
