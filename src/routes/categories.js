const express = require('express');
const { cacheCategories } = require('../middleware/simple-cache');
const router = express.Router();

// GET /api/categories - Get all categories with article counts
router.get('/', cacheCategories, async (req, res) => {
  try {
    const articles = req.app.locals.sampleArticles || [];
    const categoryMap = {};

    articles.forEach((article) => {
      if (categoryMap[article.category]) {
        categoryMap[article.category]++;
      } else {
        categoryMap[article.category] = 1;
      }
    });

    const categories = Object.keys(categoryMap)
      .map((name) => ({
        name,
        count: categoryMap[name],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories/:name - Get articles by category
router.get('/:name', async (req, res) => {
  try {
    const articles = req.app.locals.sampleArticles || [];
    const categoryName = req.params.name;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'publishedAt';
    const sortOrder = req.query.sortOrder || 'desc';

    // Filter articles by category
    let filteredArticles = articles.filter(
      (article) => article.category.toLowerCase() === categoryName.toLowerCase()
    );

    // Sort articles
    filteredArticles.sort((a, b) => {
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
    const totalArticles = filteredArticles.length;
    const totalPages = Math.ceil(totalArticles / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

    // Return paginated response or simple array based on request
    if (req.query.page || req.query.limit) {
      res.json({
        category: categoryName,
        articles: paginatedArticles,
        pagination: {
          currentPage: page,
          totalPages,
          totalArticles,
          articlesPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } else {
      // For backward compatibility, return simple format if no pagination params
      res.json({
        category: categoryName,
        articles: filteredArticles,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
