const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { normalizeUrl } = require('../utils/url-normalizer');
const { cacheArticles } = require('../middleware/simple-cache');

/**
 * GET /api/primary-sources
 * Returns list of all primary sources with article counts
 * Query params:
 *   - category: Filter by category (optional)
 */
router.get('/', cacheArticles, async (req, res) => {
  try {
    const { category } = req.query;

    // Build match stage for aggregation
    const matchStage = {
      published: true,
      primary_source: { $exists: true, $ne: '', $ne: null },
    };

    // Add category filter if provided
    if (category) {
      matchStage.category = category;
    }

    // Aggregation pipeline to group articles by primary_source
    const sources = await Article.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$primary_source',
          count: { $sum: 1 },
          categories: { $addToSet: '$category' },
          latestArticle: {
            $first: {
              title: '$title',
              slug: '$slug',
              publishedAt: '$publishedAt',
            },
          },
          articles: {
            $push: {
              _id: '$_id',
              title: '$title',
              slug: '$slug',
              category: '$category',
              publishedAt: '$publishedAt',
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(sources);
  } catch (error) {
    console.error('Error fetching primary sources:', error);
    res.status(500).json({ error: 'Failed to fetch primary sources' });
  }
});

/**
 * GET /api/primary-sources/search
 * Search for primary sources by text
 * Query params:
 *   - q: Search query (required)
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Create regex for partial matching (case-insensitive)
    const searchRegex = new RegExp(q.trim(), 'i');

    // Aggregation pipeline to search and group by primary_source
    const sources = await Article.aggregate([
      {
        $match: {
          published: true,
          primary_source: {
            $exists: true,
            $ne: '',
            $ne: null,
            $regex: searchRegex,
          },
        },
      },
      {
        $group: {
          _id: '$primary_source',
          count: { $sum: 1 },
          categories: { $addToSet: '$category' },
          latestArticle: {
            $first: {
              title: '$title',
              slug: '$slug',
              publishedAt: '$publishedAt',
            },
          },
          articles: {
            $push: {
              _id: '$_id',
              title: '$title',
              slug: '$slug',
              category: '$category',
              publishedAt: '$publishedAt',
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(sources);
  } catch (error) {
    console.error('Error searching primary sources:', error);
    res.status(500).json({ error: 'Failed to search primary sources' });
  }
});

/**
 * GET /api/primary-sources/:sourceId/articles
 * Get all articles for a specific primary source
 * URL params:
 *   - sourceId: URL-encoded primary source identifier
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20, max: 100)
 *   - sort: Sort field (date or category, default: date)
 */
router.get('/:sourceId/articles', async (req, res) => {
  try {
    // Decode the URL-encoded source ID
    const sourceId = decodeURIComponent(req.params.sourceId);

    // Parse pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const sort = req.query.sort === 'category' ? 'category' : 'date';
    const skip = (page - 1) * limit;

    // Build sort object
    const sortObj =
      sort === 'category'
        ? { category: 1, publishedAt: -1 }
        : { publishedAt: -1 };

    // Query articles by primary_source
    const query = {
      published: true,
      primary_source: sourceId,
    };

    // Get total count for pagination
    const total = await Article.countDocuments(query);

    // Get articles with pagination
    const articles = await Article.find(query)
      .select('title slug excerpt category publishedAt image_url tags')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      source: sourceId,
    });
  } catch (error) {
    console.error('Error fetching articles by primary source:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

module.exports = router;
