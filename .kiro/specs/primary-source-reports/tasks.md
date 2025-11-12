# Implementation Plan

- [x] 1. Set up backend infrastructure for primary source indexing

  - Add database index on `primary_source` field in Article model
  - Add compound index on `(primary_source, published)` for efficient queries
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 2. Create URL normalization utility

  - [x] 2.1 Implement URL normalization function in `src/utils/url-normalizer.js`

    - Remove protocol (http/https)
    - Remove www prefix
    - Convert to lowercase
    - Remove trailing slashes
    - Handle non-URL strings gracefully
    - _Requirements: 1.4_

  - [x] 2.2 Write unit tests for URL normalization

    - Test various URL formats (http, https, www, non-www)
    - Test non-URL strings
    - Test edge cases (empty, null, special characters)
    - _Requirements: 1.4_

- [x] 3. Implement primary sources API endpoints

  - [x] 3.1 Create `src/routes/primary-sources.js` router

    - Set up Express router
    - Import Article model and URL normalizer
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Implement GET /api/primary-sources endpoint

    - Use MongoDB aggregation pipeline to group articles by primary_source
    - Filter out articles with empty/null primary_source
    - Return array with source, article count, and categories
    - Support category filtering via query parameter
    - Apply caching middleware
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.3 Implement GET /api/primary-sources/search endpoint

    - Accept search query parameter
    - Use regex for partial matching on primary_source field
    - Return matching sources with article counts
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.4 Implement GET /api/primary-sources/:sourceId/articles endpoint

    - Decode URL-encoded sourceId parameter
    - Query articles by primary_source
    - Support pagination (page, limit parameters)
    - Support sorting (date, category)
    - Return articles array with pagination metadata
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.4, 2.5_

  - [x] 3.5 Register primary-sources router in `src/server.js`

    - Add `app.use('/api/primary-sources', require('./routes/primary-sources'))`
    - _Requirements: 1.1, 2.1, 3.1_

- [x] 4. Create primary sources index page

  - [x] 4.1 Create `public/primary-sources.html`

    - Add page header with title and description
    - Add search input field
    - Add category filter dropdown
    - Add sort options (by count, alphabetically)
    - Add container for sources grid
    - Add loading and empty states
    - Include navigation header and footer
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.2 Create `public/js/primary-sources.js` controller

    - Implement PrimarySourcesManager class
    - Add fetchPrimarySources method with filter support
    - Add searchPrimarySources method with debouncing
    - Add renderSourcesList method to display sources as cards
    - Add formatSourceDisplay method for URL formatting
    - Add event listeners for search, filter, and sort
    - Handle loading and error states
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.3 Style primary sources cards

    - Create card layout showing source name/URL
    - Display article count badge
    - Show categories as tags
    - Add hover effects and click handlers
    - Make responsive for mobile/tablet/desktop
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Create source detail page

  - [x] 5.1 Create `public/source-detail.html`

    - Add page header showing source name/URL
    - Add article count display
    - Add container for articles list
    - Add pagination controls
    - Add loading and empty states
    - Include navigation header and footer
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.4, 2.5_

  - [x] 5.2 Implement source detail JavaScript in `public/js/primary-sources.js`

    - Add fetchArticlesBySource method with pagination
    - Add renderSourceDetail method to display source info
    - Add renderArticlesList method to display article cards
    - Parse source ID from URL query parameter
    - Handle pagination navigation
    - Handle loading and error states
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.4, 2.5_

  - [x] 5.3 Style article cards on source detail page

    - Create article card layout with title, excerpt, date, category
    - Add "View Article" and "View Transparency" buttons
    - Make cards responsive
    - Add hover effects
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 6. Enhance transparency page with related articles by primary source

  - [x] 6.1 Update `public/js/transparency.js`

    - Add fetchRelatedByPrimarySource method
    - Fetch articles with same primary_source (exclude current article)
    - Limit to 5 related articles
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 6.2 Add "Related by Primary Source" section to `public/transparency.html`

    - Add new section after reading suggestions
    - Display primary source as clickable link to source-detail page
    - Show related article cards
    - Add "View all articles from this source" link
    - Hide section if fewer than 2 related articles
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 6.3 Update renderPrimarySource method in transparency.js

    - Make primary source clickable
    - Link to source-detail page with encoded source parameter
    - _Requirements: 1.1, 5.1_

- [x] 7. Add navigation links to primary sources feature

  - [x] 7.1 Add "Primary Sources" link to main navigation

    - Update navigation header in relevant HTML files
    - Link to `primary-sources.html`
    - _Requirements: 3.1_

  - [x] 7.2 Add "Browse by Source" link to transparency page

    - Add link in transparency page header or sidebar
    - _Requirements: 1.1, 3.1_

- [x] 8. Integration testing and validation

  - Create test articles with various primary sources
  - Verify primary sources index displays correctly
  - Test navigation from index to source detail
  - Test search and filter functionality
  - Verify related articles appear on transparency page
  - Test with URL and non-URL primary sources
  - Test pagination on source detail page
  - Verify empty states display correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5_
