# Homepage Layout Correction

## Issue

The initial implementation did not match the visual mockups provided by the user. The layout has been corrected to match the red-box annotations in the provided images.

## Corrected Layout Structure

### Hero Section (Top of Page)

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  ┌──────────────────────────┐  ┌──────────────────┐    │
│  │                          │  │                  │    │
│  │      SPOT 1              │  │     SPOT 3       │    │
│  │   (Large Hero)           │  │  (Secondary)     │    │
│  │   2/3 width              │  │   1/3 width      │    │
│  │   500px height           │  │   500px height   │    │
│  │                          │  │                  │    │
│  └──────────────────────────┘  └──────────────────┘    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Featured Stories Section

```
┌─────────────────────────────────────────────────────────┐
│  Featured Stories                                         │
│  ─────────────────────────────────────────────────────   │
│                                                           │
│  Row 1: Five articles in a row                           │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐               │
│  │ 2  │  │ 4  │  │ 5  │  │ 6  │  │ 7  │               │
│  └────┘  └────┘  └────┘  └────┘  └────┘               │
│                                                           │
│  Row 2: Three articles in a row                          │
│  ┌────────┐  ┌────────┐  ┌────────┐                    │
│  │   8    │  │   9    │  │   10   │                    │
│  └────────┘  └────────┘  └────────┘                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Category Sections (Starting at Spot 11)

```
┌─────────────────────────────────────────────────────────┐
│  World News                                               │
│  ─────────────────────────────────────────────────────   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ [Image] Article 11 Title and Excerpt            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ [Image] Article 12 Title and Excerpt            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ... (up to 6 articles per category)                     │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Technology                                               │
│  ─────────────────────────────────────────────────────   │
│  ... (continues with next spot numbers)                  │
└─────────────────────────────────────────────────────────┘
```

## Key Changes Made

### 1. HTML Structure (index.html)

- **Hero Section**: Created a 2-column grid with Spot 1 (2/3 width) and Spot 3 (1/3 width)
- **Featured Row 1**: Changed to 5-column grid containing spots 2, 4, 5, 6, 7
- **Featured Row 2**: Changed to 3-column grid containing spots 8, 9, 10
- **Category Container**: Now starts after spot 10

### 2. JavaScript Logic (simple-articles.js)

- Updated `calculateSpotNumbers()` to start at spot **11** instead of spot 10
- Updated `CATEGORY_CONFIG` to reflect startSpot: 11 for World category
- Updated console logs to reference "spots 1-10" for featured stories
- Updated console logs to reference "spots 11+" for category sections

### 3. Requirements Document

- Updated Requirement 1 to specify the hero layout (spot 1 + spot 3)
- Updated Requirement 1 to specify featured stories layout (spots 2,4,5,6,7 then 8,9,10)
- Updated Requirement 2 to specify category sections start at spot 11
- Updated all references from "spot 10" to "spot 11" for category start

## Spot Number Allocation

| Spot Range    | Section           | Layout                          |
| ------------- | ----------------- | ------------------------------- |
| 1, 3          | Hero              | 2-column grid (2/3 + 1/3 width) |
| 2, 4, 5, 6, 7 | Featured Row 1    | 5-column grid                   |
| 8, 9, 10      | Featured Row 2    | 3-column grid                   |
| 11+           | Category Sections | Vertical stacked articles       |

## Responsive Behavior

### Desktop (≥1024px)

- Hero: Side-by-side (spot 1 left, spot 3 right)
- Featured Row 1: 5 articles in a row
- Featured Row 2: 3 articles in a row
- Category articles: Horizontal cards (image left, content right)

### Tablet (768px-1023px)

- Hero: Side-by-side (spot 1 left, spot 3 right)
- Featured Row 1: 2-3 articles per row (wraps)
- Featured Row 2: 2-3 articles per row (wraps)
- Category articles: Horizontal cards

### Mobile (<768px)

- Hero: Stacked vertically (spot 1 on top, spot 3 below)
- Featured Row 1: Stacked vertically (1 per row)
- Featured Row 2: Stacked vertically (1 per row)
- Category articles: Vertical cards (image top, content bottom)

## Visual Reference

The layout now matches the red-box annotations in the provided mockup images:

1. **Image 1**: Shows spot 1 (large left) and spot 3 (smaller right) in hero section
2. **Image 2**: Shows spots 2, 4, 5, 6, 7 in first row below hero
3. **Image 3**: Shows spots 8, 9, 10 in second row, then "World News" category section starting below

## Testing

To verify the corrected layout:

1. Open http://localhost:5500/index.html
2. Verify hero section shows spot 1 (large, left) and spot 3 (smaller, right)
3. Verify "Featured Stories" section shows:
   - Row 1: Spots 2, 4, 5, 6, 7 (5 articles)
   - Row 2: Spots 8, 9, 10 (3 articles)
4. Verify category sections start below featured stories
5. Check browser console - should show "spots 11+" for category sections
6. Verify spot numbering: World starts at 11, continues sequentially

## Files Modified

1. `public/index.html` - Updated HTML structure for hero and featured sections
2. `public/js/simple-articles.js` - Updated spot numbering logic (11+ for categories)
3. `.kiro/specs/homepage-category-redesign/requirements.md` - Updated requirements to match layout

## Status

✅ Layout corrected to match user's visual mockups
✅ Spot numbering updated (categories start at 11)
✅ Requirements documentation updated
✅ Ready for visual verification
