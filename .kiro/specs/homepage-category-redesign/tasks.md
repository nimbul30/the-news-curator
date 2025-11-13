# Implementation Plan

## Overview

This implementation plan transforms the homepage from a fixed-spot grid layout to a dynamic category-based vertical layout. The key changes include:

- Keep spots 1-9 for showcase and featured stories (unchanged)
- Start category sections at spot 10 with sequential numbering
- Display 3-6 articles per category in vertical card layout
- Dynamically show/hide category sections based on available content
- Maintain responsive design across all screen sizes

## Tasks

- [x] 1. Update category configuration and article grouping logic

  - Add CATEGORY_CONFIG constant with all 9 categories in correct order (World, Technology, Business, Economy, Environment, Education, Law & Crime, Science, Politics)
  - Implement groupArticlesByCategory() method to organize articles by category field
  - Sort articles within each category by publishedAt date (newest first)
  - _Requirements: 1.3, 1.4, 2.1, 2.3_

- [x] 2. Implement sequential spot number assignment

  - Create calculateSpotNumbers() method that starts at spot 10
  - Assign sequential spot numbers across all categories without gaps
  - Limit articles per category to maxArticles (3-6) from config
  - Return spot assignment data structure with startSpot and endSpot per category
  - _Requirements: 1.5, 2.2, 2.5_

- [x] 3. Create vertical article card HTML template

  - Implement createVerticalArticleHTML() method for horizontal card layout
  - Include image on left (1/3 width), content on right (2/3 width) for desktop
  - Display category badge, date, title, and excerpt
  - Add hover effects and proper link handling to article detail page
  - Ensure responsive stacking for mobile (image top, content bottom)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Build dynamic category section rendering

  - Implement createCategorySectionHTML() method to generate section markup
  - Create displayCategorySections() method to render all category sections
  - Hide category sections that have zero articles
  - Add data-category attribute to sections for identification
  - Include clickable category headers linking to category pages
  - _Requirements: 1.4, 2.4, 4.3, 4.4_

- [x] 5. Update HTML structure for dynamic sections

  - Remove hardcoded category sections (World through Politics) from index.html
  - Keep showcase (spot 1) and featured stories (spots 2-9) sections unchanged
  - Add container div with id="category-sections-container" after featured stories
  - Maintain existing navigation bar and footer without changes
  - _Requirements: 1.1, 1.2, 4.5_

- [x] 6. Modify SimpleArticleLoader initialization flow

  - Update init() method to call new grouping and rendering methods
  - Preserve spots 1-9 handling for showcase and featured stories
  - Call displayCategorySections() for spots 10+ after featured articles are placed
  - Remove old category-based spot assignment logic (categories object)
  - _Requirements: 2.1, 4.3_

- [x] 7. Add responsive CSS for vertical article cards

  - Create CSS classes for horizontal card layout (flex-row on desktop)
  - Add mobile responsive styles (flex-col, stacked layout below 768px)
  - Style category badges, dates, and hover states
  - Ensure consistent spacing and shadows across all cards
  - Test layout on mobile, tablet, and desktop viewports
  - _Requirements: 3.5, 4.1, 4.2_

- [x] 8. Add error handling and fallback logic

  - Log warnings for articles without category field
  - Handle missing images with placeholder divs
  - Ensure page doesn't break if API fails (use existing fallback)
  - Add console logging for debugging spot assignments
  - _Requirements: 2.1, 4.3_

- [x] 9. Manual testing and validation

  - Test homepage with full article dataset across all categories
  - Verify spot numbering is sequential starting from spot 10
  - Test with articles in only some categories (verify hiding empty sections)
  - Validate article links navigate correctly to article detail page
  - Test responsive layout on mobile, tablet, and desktop
  - Verify category header links work correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2_
