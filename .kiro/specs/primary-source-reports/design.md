# Design Document: Primary Source Reports

## Overview

This feature adds the ability to organize and retrieve transparency reports by their primary source. The system will automatically index articles by their `primary_source` field and provide UI components for browsing, searching, and viewing related articles grouped by source.

The implementation leverages the existing MongoDB Article model and adds new API endpoints and frontend pages to enable primary source-based navigation and discovery.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
├─────────────────────────────────────────────────────────────┤
│  • Primary Sources Index Page (primary-sources.html)       │
│  • Source Detail Page (source-detail.html)                  │
│  • Enhanced Transparency Page (transparency.html)           │
│  • JavaScript Controllers (primary-sources.js)              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
├─────────────────────────────────────────────────────────────┤
│  • GET /api/primary-sources                                 │
│  • GET /api/primary-sources/:sourceId/articles              │
│  • GET /api/articles/by-primary-source                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
├─────────────────────────────────────────────────────────────┤
│  • Article Model (existing)                                 │
│  • MongoDB Aggregation Pipeline                             │
│  • Indexes on primary_source field                          │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Indexing**: Articles are automatically indexed by `primary_source` when created/updated
2. **Aggregation**: MongoDB aggregation pipeline groups articles by primary source
3. **API**: Express routes expose primary source data and related articles
4. **Frontend**: JavaScript fetches and displays primary source information

## Components and Interfaces

### Backend Components

#### 1. Primary Sources Route (`src/routes/primary-sources.js`)

New Express router handling primary source operations:

```javascript
// GET /api/primary-sources
// Returns list of all primary sources with article counts
router.get('/', async (req, res) => {
  // Aggregation pipeline to group by primary_source
  // Returns: [{ _id: source, count: number, articles: [...] }]
});

// GET /api/primary-sources/search
// Search for primary sources by text
router.get('/search', async (req, res) => {
  // Query parameter: q (search query)
  // Returns matching primary sources
});

// GET /api/primary-sources/:sourceId/articles
// Get all articles for a specific primary source
router.get('/:sourceId/articles', async (req, res) => {
  // URL-encoded source identifier
  // Returns articles array with pagination
});
```

#### 2. Article Model Enhancement

Add database index for efficient primary source queries:

```javascript
// In src/models/Article.js
articleSchema.index({ primary_source: 1 });
articleSchema.index({ primary_source: 1, published: 1 });
```

#### 3. URL Normalization Utility

Helper function to normalize URLs for consistent grouping:

```javascript
// src/utils/url-normalizer.js
function normalizeUrl(url) {
  // Remove protocol (http/https)
  // Remove www prefix
  // Remove trailing slashes
  // Convert to lowercase
  // Return normalized string
}
```

### Frontend Components

#### 1. Primary Sources Index Page (`public/primary-sources.html`)

Displays all primary sources with article counts:

**Features:**

- Grid/list view of all primary sources
- Sort by article count or alphabetically
- Filter by category
- Search functionality
- Click to view source detail

**Layout:**

```
┌────────────────────────────────────────┐
│  Primary Sources Index                 │
├────────────────────────────────────────┤
│  [Search Box]  [Category Filter]       │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │ Source Name/URL                  │  │
│  │ 15 articles                      │  │
│  │ Categories: Tech, Science        │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ Another Source                   │  │
│  │ 8 articles                       │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

#### 2. Source Detail Page (`public/source-detail.html`)

Shows all articles from a specific primary source:

**Features:**

- Source information header
- List of all articles referencing this source
- Article cards with title, excerpt, date, category
- Link to transparency report for each article
- Pagination for large result sets

**Layout:**

```
┌────────────────────────────────────────┐
│  Primary Source: [Source Name/URL]     │
│  15 articles reference this source     │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │ Article Title                    │  │
│  │ Excerpt...                       │  │
│  │ Tech • Jan 15, 2024              │  │
│  │ [View Article] [Transparency]    │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ Another Article                  │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

#### 3. Enhanced Transparency Page

Add "Related by Primary Source" section to existing transparency page:

**New Section:**

```html
<!-- Related by Primary Source -->
<div class="transparency-section">
  <h2>📎 Related by Primary Source</h2>
  <p>
    Other articles referencing:
    <a href="source-detail.html?source=..."> [Primary Source] </a>
  </p>

  <div class="related-articles">
    <!-- Article cards -->
  </div>

  <a href="source-detail.html?source=...">
    View all articles from this source →
  </a>
</div>
```

#### 4. JavaScript Controller (`public/js/primary-sources.js`)

Handles frontend logic for primary source features:

```javascript
class PrimarySourcesManager {
  // Fetch all primary sources
  async fetchPrimarySources(filters) {}

  // Fetch articles for a specific source
  async fetchArticlesBySource(sourceId, page) {}

  // Search primary sources
  async searchPrimarySources(query) {}

  // Render primary sources list
  renderSourcesList(sources) {}

  // Render source detail page
  renderSourceDetail(source, articles) {}

  // URL normalization for display
  formatSourceDisplay(source) {}
}
```

## Data Models

### Primary Source Aggregation Result

```javascript
{
  _id: "https://example.com/document",  // The primary_source value
  count: 15,                             // Number of articles
  categories: ["Technology", "Science"], // Unique categories
  latestArticle: {                       // Most recent article
    title: "...",
    slug: "...",
    publishedAt: "2024-01-15"
  },
  articles: [                            // Array of article references
    {
      _id: "...",
      title: "...",
      slug: "...",
      category: "...",
      publishedAt: "..."
    }
  ]
}
```

### Article Model (existing, no changes)

The existing Article model already contains the `primary_source` field:

```javascript
{
  primary_source: {
    type: String,
    default: '',
  }
}
```

## Error Handling

### Backend Error Scenarios

1. **Empty Primary Source**: Articles with empty/null primary_source are excluded from aggregation
2. **Invalid Source ID**: Return 404 with helpful message
3. **Database Errors**: Return 500 with generic error message
4. **Pagination Errors**: Validate page/limit parameters, default to safe values

### Frontend Error Scenarios

1. **No Sources Found**: Display empty state with helpful message
2. **Network Errors**: Show retry button and error message
3. **Invalid URL Parameters**: Redirect to index page
4. **Loading States**: Show spinners during data fetch

## Testing Strategy

### Unit Tests

1. **URL Normalization**

   - Test various URL formats
   - Test non-URL strings
   - Test edge cases (empty, null, special characters)

2. **API Endpoints**
   - Test primary sources aggregation
   - Test article filtering by source
   - Test search functionality
   - Test pagination

### Integration Tests

1. **End-to-End Flow**

   - Create article with primary source
   - Verify it appears in primary sources index
   - Navigate to source detail page
   - Verify article is listed

2. **Data Consistency**

   - Update article primary source
   - Verify old source no longer shows article
   - Verify new source shows article

3. **Edge Cases**
   - Articles with no primary source
   - Multiple articles with same source
   - URL variations (http vs https, www vs non-www)

### Manual Testing

1. **UI/UX Testing**

   - Test responsive design on mobile/tablet/desktop
   - Test navigation flow
   - Test search and filter functionality
   - Test pagination

2. **Performance Testing**
   - Test with large number of sources (100+)
   - Test with large number of articles per source (50+)
   - Verify page load times are acceptable

## Performance Considerations

### Database Optimization

1. **Indexes**: Add compound index on `(primary_source, published)` for efficient queries
2. **Aggregation**: Use MongoDB aggregation pipeline for efficient grouping
3. **Pagination**: Implement cursor-based pagination for large result sets
4. **Caching**: Cache primary sources list for 5 minutes using existing cache middleware

### Frontend Optimization

1. **Lazy Loading**: Load article details on demand
2. **Debouncing**: Debounce search input to reduce API calls
3. **Virtual Scrolling**: For very long lists of sources
4. **Image Optimization**: Lazy load article images

## Security Considerations

1. **Input Validation**: Sanitize source IDs and search queries
2. **SQL Injection**: Use parameterized queries (MongoDB handles this)
3. **XSS Prevention**: Escape user-generated content in URLs
4. **Rate Limiting**: Apply existing rate limiting to new endpoints
5. **Authentication**: Primary sources index is public, but respects article published status

## Implementation Notes

### URL Encoding

Primary sources may contain special characters (especially URLs). Use URL encoding:

```javascript
// Encoding for URL parameters
const encodedSource = encodeURIComponent(primarySource);

// Decoding in backend
const decodedSource = decodeURIComponent(req.params.sourceId);
```

### URL Normalization Strategy

To group similar URLs together:

1. Remove protocol (http:// or https://)
2. Remove www. prefix
3. Convert to lowercase
4. Remove trailing slashes
5. Store both original and normalized versions

### Backward Compatibility

- Existing articles without primary_source continue to work
- Transparency page works with or without primary source
- No breaking changes to existing API endpoints

## Future Enhancements

1. **Source Credibility Ratings**: Aggregate credibility ratings across articles
2. **Source Timeline**: Visualize when a source was used over time
3. **Source Comparison**: Compare multiple sources side-by-side
4. **Export Functionality**: Export source reports as PDF
5. **Source Alerts**: Notify when new articles reference a source
