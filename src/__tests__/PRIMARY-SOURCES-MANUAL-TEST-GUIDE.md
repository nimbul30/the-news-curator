# Primary Sources Feature - Manual Testing Guide

This guide provides step-by-step instructions for manually testing the primary sources feature to ensure all functionality works correctly.

## Prerequisites

1. Ensure MongoDB is running
2. Ensure the server is running (`npm start` or `node server.js`)
3. Have at least 3-5 test articles with different primary sources in the database

## Test Data Setup

Before testing, create test articles with the following primary sources:

1. **URL Primary Source (Multiple Articles)**: `https://github.com/blog`

   - Create 2-3 articles with this source
   - Use different categories (Technology, Science)

2. **URL Primary Source (Single Article)**: `https://www.nature.com/articles/research-2024`

   - Create 1 article with this source
   - Category: Science

3. **Non-URL Primary Source**: `Government Policy Report 2024`

   - Create 1 article with this source
   - Category: Politics

4. **Article Without Primary Source**:

   - Create 1 article with empty primary_source field
   - This should NOT appear in primary sources index

5. **Unpublished Article with Primary Source**:
   - Create 1 unpublished article with a primary source
   - This should NOT appear in primary sources index

## Test Cases

### 1. Primary Sources Index Page

**URL**: `http://localhost:3000/primary-sources.html`

#### Test 1.1: Page Loads Correctly

- [ ] Page loads without errors
- [ ] Navigation header is visible
- [ ] Page title "Primary Sources" is displayed
- [ ] Search box is visible
- [ ] Category filter dropdown is visible
- [ ] Sources are displayed as cards

#### Test 1.2: Sources Display

- [ ] All published primary sources are displayed
- [ ] Each source card shows:
  - Source name/URL
  - Article count badge
  - Categories as tags
- [ ] Sources are sorted by article count (highest first)
- [ ] Empty primary sources are NOT displayed
- [ ] Unpublished articles' sources are NOT displayed

#### Test 1.3: Search Functionality

- [ ] Type "github" in search box
- [ ] Results filter to show only GitHub sources
- [ ] Search is case-insensitive (try "GITHUB")
- [ ] Partial matching works (try "git")
- [ ] Clear search shows all sources again

#### Test 1.4: Category Filter

- [ ] Select "Technology" from category dropdown
- [ ] Only sources with Technology articles are shown
- [ ] Select "Science" from category dropdown
- [ ] Only sources with Science articles are shown
- [ ] Select "All Categories" to reset filter

#### Test 1.5: Navigation to Source Detail

- [ ] Click on a source card
- [ ] Browser navigates to source-detail.html with correct source parameter
- [ ] URL contains encoded source ID

### 2. Source Detail Page

**URL**: `http://localhost:3000/source-detail.html?source=<encoded-source>`

#### Test 2.1: Page Loads Correctly

- [ ] Page loads without errors
- [ ] Source name/URL is displayed in header
- [ ] Article count is displayed
- [ ] Articles list is visible

#### Test 2.2: Articles Display

- [ ] All articles for the source are displayed
- [ ] Each article card shows:
  - Title
  - Excerpt
  - Date
  - Category
  - "View Article" button
  - "View Transparency" button
- [ ] Articles are sorted by date (newest first)

#### Test 2.3: URL Primary Sources

- [ ] Navigate to a URL-based source (e.g., GitHub)
- [ ] Source URL is displayed correctly
- [ ] All articles with that exact URL are shown

#### Test 2.4: Non-URL Primary Sources

- [ ] Navigate to a non-URL source (e.g., "Government Policy Report 2024")
- [ ] Source name is displayed correctly
- [ ] All articles with that exact source name are shown

#### Test 2.5: Pagination

- [ ] If source has more than 20 articles, pagination controls appear
- [ ] Click "Next" to go to page 2
- [ ] Click "Previous" to go back to page 1
- [ ] Page numbers are displayed correctly

#### Test 2.6: Article Navigation

- [ ] Click "View Article" button
- [ ] Browser navigates to article page
- [ ] Go back and click "View Transparency" button
- [ ] Browser navigates to transparency page

### 3. Transparency Page Enhancement

**URL**: `http://localhost:3000/transparency.html?slug=<article-slug>`

#### Test 3.1: Related by Primary Source Section

- [ ] Open transparency page for an article with a primary source
- [ ] "Related by Primary Source" section is visible
- [ ] Primary source is displayed as a clickable link
- [ ] Up to 5 related articles are shown
- [ ] Current article is NOT included in related articles

#### Test 3.2: Primary Source Link

- [ ] Click on the primary source link
- [ ] Browser navigates to source-detail.html
- [ ] Correct source is displayed
- [ ] All articles for that source are shown

#### Test 3.3: Related Articles Display

- [ ] Each related article card shows:
  - Title
  - Excerpt (if available)
  - Date
  - Category
- [ ] Click on a related article
- [ ] Browser navigates to that article's transparency page

#### Test 3.4: "View All" Link

- [ ] "View all articles from this source" link is visible
- [ ] Click the link
- [ ] Browser navigates to source-detail.html
- [ ] All articles for the source are displayed

#### Test 3.5: Section Visibility

- [ ] Open transparency page for article with only 1 article for its source
- [ ] "Related by Primary Source" section should be hidden (fewer than 2 related)
- [ ] Open transparency page for article without primary source
- [ ] "Related by Primary Source" section should be hidden

### 4. Navigation Links

#### Test 4.1: Main Navigation

- [ ] "Primary Sources" link is visible in main navigation
- [ ] Click link navigates to primary-sources.html
- [ ] Link is accessible from all pages

#### Test 4.2: Transparency Page Link

- [ ] "Browse by Source" link is visible on transparency page
- [ ] Click link navigates to primary-sources.html

### 5. Empty States

#### Test 5.1: No Sources Available

- [ ] Remove all articles from database (or unpublish all)
- [ ] Navigate to primary-sources.html
- [ ] Empty state message is displayed
- [ ] No error occurs

#### Test 5.2: No Articles for Source

- [ ] Navigate to source-detail.html with non-existent source
- [ ] Empty state message is displayed
- [ ] "No articles found" or similar message

#### Test 5.3: Search No Results

- [ ] On primary-sources.html, search for "nonexistentxyz123"
- [ ] "No results found" message is displayed
- [ ] No error occurs

### 6. Responsive Design

#### Test 6.1: Mobile View (< 768px)

- [ ] Resize browser to mobile width
- [ ] Primary sources cards stack vertically
- [ ] Search and filter controls are usable
- [ ] Navigation menu works correctly
- [ ] Article cards on source detail are readable

#### Test 6.2: Tablet View (768px - 1024px)

- [ ] Resize browser to tablet width
- [ ] Layout adjusts appropriately
- [ ] All functionality remains accessible

#### Test 6.3: Desktop View (> 1024px)

- [ ] Full desktop layout is displayed
- [ ] Cards are displayed in grid format
- [ ] All elements are properly spaced

### 7. Error Handling

#### Test 7.1: Network Errors

- [ ] Stop the server
- [ ] Try to load primary-sources.html
- [ ] Error message is displayed
- [ ] Retry button works when server is restarted

#### Test 7.2: Invalid URL Parameters

- [ ] Navigate to source-detail.html without source parameter
- [ ] Appropriate error or redirect occurs
- [ ] Navigate with malformed source parameter
- [ ] Error is handled gracefully

### 8. Performance

#### Test 8.1: Load Time

- [ ] Primary sources index loads within 2 seconds
- [ ] Source detail page loads within 2 seconds
- [ ] Search results appear within 500ms

#### Test 8.2: Large Data Sets

- [ ] Test with 50+ primary sources
- [ ] Page remains responsive
- [ ] Pagination works correctly
- [ ] Search remains fast

## API Endpoint Testing

### Manual API Tests (using browser or curl)

#### Test API 1: Get All Primary Sources

```bash
curl http://localhost:3000/api/primary-sources
```

- [ ] Returns array of sources
- [ ] Each source has \_id, count, categories, articles

#### Test API 2: Search Primary Sources

```bash
curl "http://localhost:3000/api/primary-sources/search?q=github"
```

- [ ] Returns filtered sources
- [ ] Search is case-insensitive

#### Test API 3: Get Articles by Source

```bash
curl "http://localhost:3000/api/primary-sources/https%3A%2F%2Fgithub.com%2Fblog/articles"
```

- [ ] Returns articles array
- [ ] Includes pagination metadata

#### Test API 4: Filter by Category

```bash
curl "http://localhost:3000/api/primary-sources?category=Technology"
```

- [ ] Returns only Technology sources

## Automated Test Results

The automated integration tests cover:

- ✅ API endpoint functionality
- ✅ Database queries and aggregation
- ✅ Pagination logic
- ✅ Search functionality
- ✅ URL encoding/decoding
- ✅ Empty state handling
- ✅ Published/unpublished filtering

**Test Results**: All 16 automated tests passing ✅

## Sign-off Checklist

After completing all manual tests:

- [ ] All primary sources index tests passed
- [ ] All source detail page tests passed
- [ ] All transparency page enhancement tests passed
- [ ] All navigation tests passed
- [ ] All empty state tests passed
- [ ] All responsive design tests passed
- [ ] All error handling tests passed
- [ ] All performance tests passed
- [ ] All API endpoint tests passed
- [ ] Automated tests are passing

## Notes

- Document any issues found during testing
- Take screenshots of any visual bugs
- Note any performance concerns
- Record any suggestions for improvements

## Test Completion

**Tested By**: ********\_********  
**Date**: ********\_********  
**Status**: [ ] Pass [ ] Fail  
**Notes**: ********\_********
