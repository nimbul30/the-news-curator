# Spot Naming System - Implementation Guide

## Overview

The News Curator uses a flexible spot naming system that supports both numeric and alphanumeric spot identifiers.

## Spot Naming Convention

### Homepage Spots (Numeric)

- **Format**: Numbers only (1, 2, 3, 4, etc.)
- **Range**: 1-9 for featured, 10+ for category sections
- **Example**: `spot_number: 1`, `spot_number: 5`, `spot_number: 12`

### Category Page Spots (Alphanumeric)

- **Format**: `{prefix}-{number}`
- **Prefixes**:

  - `world` - World News
  - `tech` - Technology
  - `biz` - Business
  - `econ` - Economy
  - `env` - Environment
  - `edu` - Education
  - `law` - Law & Crime
  - `sci` - Science
  - `pol` - Politics

- **Examples**:
  - `spot_number: "world-1"` (World News hero spot)
  - `spot_number: "tech-5"` (Technology featured story)
  - `spot_number: "pol-12"` (Politics latest story)

## Database Field

### MongoDB Schema

```javascript
{
  spot_number: String | Number,  // Can be numeric (1, 2, 3) or string ("world-1", "tech-5")
  customFields: {
    spot_number: String | Number  // Alternative location
  }
}
```

### Examples

```javascript
// Homepage article
{
  id: "article123",
  title: "Breaking News",
  spot_number: 1,  // or "1"
  category: "World"
}

// World News page article
{
  id: "article456",
  title: "International Summit",
  spot_number: "world-1",
  category: "World"
}

// Technology page article
{
  id: "article789",
  title: "AI Breakthrough",
  spot_number: "tech-5",
  category: "Technology"
}
```

## HTML Implementation

### Data Attributes

All article slots use `data-spot` attributes that match the spot naming:

```html
<!-- Homepage -->
<div data-spot="1">...</div>
<div data-spot="2">...</div>
<div data-spot="10">...</div>

<!-- World News Page -->
<div data-spot="world-1">...</div>
<div data-spot="world-2">...</div>
<div data-spot="world-10">...</div>

<!-- Technology Page -->
<div data-spot="tech-1">...</div>
<div data-spot="tech-5">...</div>
```

## JavaScript Implementation

### Article Placement Logic

The `displayArticles()` method uses `document.querySelector()` which works with both numeric and string values:

```javascript
const assignedSpot = article.customFields?.spot_number || article.spot_number;
const slot = document.querySelector(`[data-spot="${assignedSpot}"]`);

if (slot) {
  slot.innerHTML = this.createArticleHTML(article, assignedSpot);
  // Article is placed in the matching slot
}
```

### How It Works

1. **Exact Match**: The system looks for an exact match between `spot_number` and `data-spot`
2. **String Comparison**: Both "1" and 1 will match `data-spot="1"`
3. **Alphanumeric Support**: "world-1" matches `data-spot="world-1"`

## Compatibility

### ✅ Supported Formats

- Numeric: `1`, `2`, `3`, `10`, `25`
- String numeric: `"1"`, `"2"`, `"10"`
- Alphanumeric: `"world-1"`, `"tech-5"`, `"pol-12"`

### ❌ Not Supported

- Spaces: `"world 1"` (use hyphens instead)
- Special characters: `"world_1"`, `"world.1"` (use hyphens)
- Mixed case: `"World-1"` (use lowercase)

## Migration Path

### Current Articles (Numeric Spots)

No changes needed. Existing articles with numeric `spot_number` values (1-40) will continue to work on the homepage.

### New Category Page Articles

When creating articles for category pages, set `spot_number` to the appropriate prefixed value:

```javascript
// Creating a World News article for spot 1
{
  spot_number: "world-1",
  category: "World",
  title: "Article Title"
}

// Creating a Technology article for spot 7
{
  spot_number: "tech-7",
  category: "Technology",
  title: "Tech Article"
}
```

## Content Management

### Assigning Articles to Spots

#### Homepage

1. Set `spot_number` to a number between 1-9 for featured spots
2. Set `spot_number` to 10+ for category section spots (or leave blank for auto-assignment)

#### Category Pages

1. Determine which category page: World, Technology, Business, etc.
2. Choose the spot position: 1-13
3. Set `spot_number` to `"{prefix}-{number}"`:
   - World hero: `"world-1"`
   - Tech featured: `"tech-5"`
   - Politics latest: `"pol-12"`

### Auto-Assignment

Articles without a `spot_number` will be auto-assigned to available spots in order. This works for the homepage but category pages require explicit spot assignments.

## Testing

### Verify Spot Placement

1. Open browser console (F12)
2. Check for log messages: `"Placed article in spot X: Article Title"`
3. Inspect elements to verify `data-spot` attributes match article `spot_number`

### Test Cases

- ✅ Numeric spot on homepage: `spot_number: 1` → `data-spot="1"`
- ✅ String numeric on homepage: `spot_number: "5"` → `data-spot="5"`
- ✅ Alphanumeric on category page: `spot_number: "world-1"` → `data-spot="world-1"`
- ✅ Mixed: Some articles with spots, some auto-assigned

## Summary

The spot naming system is **fully compatible** with alphanumeric identifiers. The current JavaScript implementation using `document.querySelector(\`[data-spot="${assignedSpot}"]\`)` will work seamlessly with:

- Numeric spots (1, 2, 3)
- String numeric spots ("1", "2", "3")
- Alphanumeric spots ("world-1", "tech-5", "pol-12")

No code changes are required to support the new category page spot naming convention.
