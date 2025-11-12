const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// GET /api/articles - Get all articles
router.get('/', async (req, res) => {
  try {
    const { category, published, limit = 50, page = 1 } = req.query;

    let query = {};
    if (category) query.category = category;
    if (published !== undefined) query.published = published === 'true';

    const skip = (page - 1) * limit;

    const articles = await Article.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles',
      details: error.message,
    });
  }
});

// GET /api/articles/:slug - Get single article by slug
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }

    res.json({
      success: true,
      article,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article',
      details: error.message,
    });
  }
});

// POST /api/articles - Create new article
router.post('/', async (req, res) => {
  try {
    const articleData = req.body;

    // Validate required fields
    if (!articleData.title || !articleData.slug || !articleData.content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, slug, and content are required',
      });
    }

    // Check if slug already exists
    const existingArticle = await Article.findOne({ slug: articleData.slug });
    if (existingArticle) {
      return res.status(400).json({
        success: false,
        error: 'Article with this slug already exists',
      });
    }

    // Set publication date if published
    if (articleData.published) {
      articleData.publishedAt = new Date();
    }

    const article = new Article(articleData);
    await article.save();

    console.log(`✅ Article created: ${article.title} (${article.slug})`);

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      article,
    });
  } catch (error) {
    console.error('Error creating article:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Article with this slug already exists',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create article',
      details: error.message,
    });
  }
});

// PUT /api/articles/:slug - Update article
router.put('/:slug', async (req, res) => {
  try {
    const articleData = req.body;
    const currentSlug = req.params.slug;

    // If slug is being changed, check if new slug exists
    if (articleData.slug && articleData.slug !== currentSlug) {
      const existingArticle = await Article.findOne({ slug: articleData.slug });
      if (existingArticle) {
        return res.status(400).json({
          success: false,
          error: 'Article with this slug already exists',
        });
      }
    }

    // Update publication date if being published
    if (articleData.published && !articleData.publishedAt) {
      articleData.publishedAt = new Date();
    }

    const article = await Article.findOneAndUpdate(
      { slug: currentSlug },
      articleData,
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }

    console.log(`✅ Article updated: ${article.title} (${article.slug})`);

    res.json({
      success: true,
      message: 'Article updated successfully',
      article,
    });
  } catch (error) {
    console.error('Error updating article:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update article',
      details: error.message,
    });
  }
});

// DELETE /api/articles/:slug - Delete article
router.delete('/:slug', async (req, res) => {
  try {
    const article = await Article.findOneAndDelete({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }

    console.log(`🗑️ Article deleted: ${article.title} (${article.slug})`);

    res.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete article',
      details: error.message,
    });
  }
});

// GET /api/articles/category/:category - Get articles by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const articles = await Article.findByCategory(category)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Article.countDocuments({ category, published: true });

    res.json({
      success: true,
      articles,
      category,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles by category',
      details: error.message,
    });
  }
});

// GET /api/articles/position/:position - Get articles by position
router.get('/position/:position', async (req, res) => {
  try {
    const { position } = req.params;

    const articles = await Article.findByPosition(position);

    res.json({
      success: true,
      articles,
      position,
    });
  } catch (error) {
    console.error('Error fetching articles by position:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles by position',
      details: error.message,
    });
  }
});

module.exports = router;
