# Category Pages - Spot Naming System

## Spot Naming Convention

Each category page uses the format: `{category-prefix}-{number}`

## Category Pages Created

### 1. World News (world.html)

- **Prefix**: `world`
- **Spots**: world-1 through world-13
- **Layout**:
  - Hero: world-1 (large), world-2, world-3 (stacked right)
  - Featured: world-4, world-5, world-6, world-7 (row 1)
  - Featured: world-8, world-9 (row 2)
  - Latest: world-10, world-11, world-12, world-13

### 2. Technology (technology.html)

- **Prefix**: `tech`
- **Spots**: tech-1 through tech-13
- **Layout**: Same as World News

### 3. Business (business.html)

- **Prefix**: `biz`
- **Spots**: biz-1 through biz-13
- **Layout**: Same as World News

### 4. Economy (economy.html)

- **Prefix**: `econ`
- **Spots**: econ-1 through econ-13
- **Layout**: Same as World News

### 5. Environment (environment.html)

- **Prefix**: `env`
- **Spots**: env-1 through env-13
- **Layout**: Same as World News

### 6. Education (education.html)

- **Prefix**: `edu`
- **Spots**: edu-1 through edu-13
- **Layout**: Same as World News

### 7. Law & Crime (law-crime.html)

- **Prefix**: `law`
- **Spots**: law-1 through law-13
- **Layout**: Same as World News

### 8. Science (science.html)

- **Prefix**: `sci`
- **Spots**: sci-1 through sci-13
- **Layout**: Same as World News

### 9. Politics (politics.html)

- **Prefix**: `pol`
- **Spots**: pol-1 through pol-13
- **Layout**: Same as World News

## Homepage Spots

- **Spots 1-3**: Hero section (1 large left, 2 & 3 stacked right)
- **Spots 4-7**: Featured row 1 (4 articles)
- **Spots 8-9**: Featured row 2 (2 articles)
- **Spots 10+**: Category sections (4 articles per category in grid)

## Database Field Mapping

When implementing with real articles, use the `spot_number` field with these prefixes:

- Homepage: numeric (1, 2, 3, etc.)
- Category pages: prefixed (world-1, tech-5, pol-12, etc.)

## Next Steps

1. ✅ World News page created
2. ✅ Technology page created
3. ⏳ Create remaining 7 category pages
4. ⏳ Update JavaScript to load articles by spot prefix
5. ⏳ Test all pages with placeholder numbers
6. ⏳ Integrate with real article data
