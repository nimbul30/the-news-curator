const express = require('express');
const { cacheSearch } = require('../middleware/simple-cache');
const router = express.Router();

// GET /api/search?q=query - Search articles
router.get('/', cacheSearch, async (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'publishedAt';
    const sortOrder = req.query.sortOrder || 'desc';

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const articles = req.app.locals.sampleArticles || [];
    const searchTerm = query.toLowerCase();

    // Search articles
    let results = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchTerm) ||
        article.excerpt.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );

    // Sort results
    results.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'publishedAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Calculate pagination
    const totalResults = results.length;
    const totalPages = Math.ceil(totalResults / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    // Return paginated response or simple array based on request
    if (req.query.page || req.query.limit) {
      res.json({
        query: query,
        results: paginatedResults,
        count: totalResults,
        pagination: {
          currentPage: page,
          totalPages,
          totalResults,
          resultsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } else {
      // For backward compatibility, return simple format if no pagination params
      res.json({
        query: query,
        results: results,
        count: totalResults,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
