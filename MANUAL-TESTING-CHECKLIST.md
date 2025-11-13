# Homepage Category Redesign - Manual Testing Checklist

## Test Environment

- **URL**: http://localhost:5500/index.html
- **Server**: Running on port 5500
- **Date**: Testing performed on implementation completion

---

## ✅ Test 1: Homepage with Full Article Dataset

### Steps:

1. Open http://localhost:5500/index.html in browser
2. Open browser console (F12) to view logs
3. Verify articles load from API

### Expected Results:

- [ ] Console shows: "Successfully loaded X articles"
- [ ] Console shows grouping summary with article counts per category
- [ ] Console shows spot assignment logs starting at spot 10
- [ ] Page displays showcase article (spot 1)
- [ ] Page displays featured stories (spots 2-9)
- [ ] Page displays category sections below featured stories

### Actual Results:

```
[Record your observations here]
```

---

## ✅ Test 2: Verify Spot Numbering is Sequential Starting from Spot 10

### Steps:

1. Open browser console
2. Look for "[Spot Assignment]" logs
3. Inspect category article elements in DevTools
4. Check data-spot attributes on articles

### Expected Results:

- [ ] First category article has data-spot="10"
- [ ] Spot numbers increment sequentially (10, 11, 12, 13...)
- [ ] No gaps in spot numbering across categories
- [ ] Console logs show: "World: spots 10-X", "Technology: spots Y-Z", etc.

### Actual Results:

```
First category spot: ___
Last category spot: ___
Total category articles: ___
Gaps detected: Yes/No
```

---

## ✅ Test 3: Test with Articles in Only Some Categories

### Steps:

1. Check console for "[Grouping Summary]" log
2. Identify which categories have 0 articles
3. Verify those category sections are not displayed on page
4. Use DevTools to search for section[data-category="CategoryName"]

### Expected Results:

- [ ] Console shows which categories have 0 articles
- [ ] Console shows "no articles, skipping section" for empty categories
- [ ] Empty category sections do NOT appear on page
- [ ] Only categories with articles are rendered

### Actual Results:

```
Categories with articles: ___
Categories without articles: ___
Empty sections hidden: Yes/No
```

---

## ✅ Test 4: Validate Article Links Navigate Correctly

### Steps:

1. Scroll to any category section
2. Click on an article title or card
3. Verify navigation to article detail page
4. Check URL includes slug parameter

### Expected Results:

- [ ] Clicking article navigates to /article.html?slug=ARTICLE_SLUG
- [ ] Article detail page loads correctly
- [ ] All article links in category sections work
- [ ] Links open in same tab (not new window)

### Actual Results:

```
Test article clicked: ___
URL navigated to: ___
Page loaded successfully: Yes/No
```

---

## ✅ Test 5: Test Responsive Layout on Mobile, Tablet, and Desktop

### Desktop (≥1024px):

1. Set browser width to 1200px or use desktop view
2. Inspect category article cards

**Expected:**

- [ ] Articles display in horizontal layout (image left, content right)
- [ ] Image takes ~1/3 width, content takes ~2/3 width
- [ ] Hover effects work on article cards
- [ ] Layout is clean and readable

### Tablet (768px - 1023px):

1. Set browser width to 800px or use tablet view
2. Inspect category article cards

**Expected:**

- [ ] Articles still display in horizontal layout
- [ ] Image and content proportions maintained
- [ ] Text remains readable
- [ ] No overflow or layout breaks

### Mobile (<768px):

1. Set browser width to 375px or use mobile view
2. Inspect category article cards

**Expected:**

- [ ] Articles stack vertically (image top, content bottom)
- [ ] Image displays full width
- [ ] Content displays below image
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling

### Actual Results:

```
Desktop layout: Pass/Fail
Tablet layout: Pass/Fail
Mobile layout: Pass/Fail
Issues found: ___
```

---

## ✅ Test 6: Verify Category Header Links Work Correctly

### Steps:

1. Locate category section headers (e.g., "World News", "Technology")
2. Hover over category header - should show hover effect
3. Click on category header
4. Verify navigation to category page

### Expected Results:

- [ ] Category headers are clickable links
- [ ] Hover effect changes color (blue)
- [ ] Clicking "World News" navigates to world.html
- [ ] Clicking "Technology" navigates to technology.html
- [ ] All 9 category headers link correctly
- [ ] Links match category name (Law & Crime → law-crime.html)

### Actual Results:

```
Category headers tested: ___
All links working: Yes/No
Issues found: ___
```

---

## ✅ Test 7: Verify Featured Stories (Spots 1-9) Unchanged

### Steps:

1. Check showcase article (spot 1)
2. Check featured stories grid (spots 2-9)
3. Verify layout matches original design

### Expected Results:

- [ ] Spot 1 displays as large showcase article
- [ ] Spots 2-5 display in 4-column grid
- [ ] Spots 6-8 display in 3-column grid
- [ ] Spot 9 displays as standalone article
- [ ] Featured stories section appears BEFORE category sections
- [ ] "Featured Stories" header is visible

### Actual Results:

```
Showcase (spot 1): Pass/Fail
Featured grid (spots 2-9): Pass/Fail
Layout order correct: Yes/No
```

---

## ✅ Test 8: Console Error Checking

### Steps:

1. Open browser console (F12)
2. Refresh page
3. Check for any errors (red text)
4. Check for warnings (yellow text)

### Expected Results:

- [ ] No JavaScript errors
- [ ] No 404 errors for images or resources
- [ ] Warnings only for articles missing category/image (acceptable)
- [ ] All API calls successful (200 status)

### Actual Results:

```
Errors found: ___
Warnings found: ___
Critical issues: Yes/No
```

---

## ✅ Test 9: Visual Quality Check

### Steps:

1. Review overall page appearance
2. Check spacing and alignment
3. Verify images load correctly
4. Check typography and readability

### Expected Results:

- [ ] Category sections have consistent spacing
- [ ] Article cards have proper shadows and borders
- [ ] Images display without distortion
- [ ] Text is readable and properly sized
- [ ] Category badges are styled correctly
- [ ] Dates display in correct format
- [ ] No layout shifts or jumps during load

### Actual Results:

```
Visual quality: Excellent/Good/Fair/Poor
Issues found: ___
```

---

## ✅ Test 10: Performance Check

### Steps:

1. Open browser DevTools → Network tab
2. Refresh page
3. Check load time and resource sizes
4. Verify smooth scrolling

### Expected Results:

- [ ] Page loads in under 3 seconds
- [ ] No excessive API calls
- [ ] Images load progressively
- [ ] Smooth scrolling through category sections
- [ ] No lag or stuttering

### Actual Results:

```
Page load time: ___ seconds
Total resources loaded: ___
Performance: Excellent/Good/Fair/Poor
```

---

## Summary

### Requirements Coverage:

| Requirement                                   | Test Coverage | Status        |
| --------------------------------------------- | ------------- | ------------- |
| 1.1 - Featured Stories (spots 1-9)            | Test 7        | ☐ Pass ☐ Fail |
| 1.2 - Category sections start at spot 10      | Test 2        | ☐ Pass ☐ Fail |
| 1.3 - Categories in correct order             | Test 1        | ☐ Pass ☐ Fail |
| 1.4 - Visible category headers                | Test 6        | ☐ Pass ☐ Fail |
| 1.5 - Sequential spot numbering               | Test 2        | ☐ Pass ☐ Fail |
| 2.1 - Articles placed by category             | Test 1        | ☐ Pass ☐ Fail |
| 2.2 - Spots start at 10                       | Test 2        | ☐ Pass ☐ Fail |
| 2.3 - Articles sorted by date                 | Test 1        | ☐ Pass ☐ Fail |
| 2.4 - Empty categories hidden                 | Test 3        | ☐ Pass ☐ Fail |
| 2.5 - Sequential across categories            | Test 2        | ☐ Pass ☐ Fail |
| 3.1 - 3-6 articles per category               | Test 1        | ☐ Pass ☐ Fail |
| 3.2 - Vertical arrangement                    | Test 5        | ☐ Pass ☐ Fail |
| 3.3 - Article blocks with image/title/excerpt | Test 9        | ☐ Pass ☐ Fail |
| 3.4 - Clickable article blocks                | Test 4        | ☐ Pass ☐ Fail |
| 3.5 - Consistent styling                      | Test 9        | ☐ Pass ☐ Fail |
| 4.1 - Responsive grid layout                  | Test 5        | ☐ Pass ☐ Fail |
| 4.2 - Mobile stacking (<768px)                | Test 5        | ☐ Pass ☐ Fail |

### Overall Test Result:

- [ ] ✅ All tests passed - Ready for production
- [ ] ⚠️ Some tests failed - Requires fixes
- [ ] ❌ Critical failures - Major rework needed

### Notes:

```
[Add any additional observations, issues, or recommendations here]
```

---

## Testing Completed By:

- **Name**: ******\_\_\_******
- **Date**: ******\_\_\_******
- **Browser**: ******\_\_\_******
- **OS**: ******\_\_\_******
