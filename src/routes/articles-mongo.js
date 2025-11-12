const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { cacheArticles, clearCache } = require('../middleware/simple-cache');
const {
  validateArticle,
  handleValidationErrors,
} = require('../middleware/simple-security');
const Article = require('../models/Article');
const router = express.Router();

// GET /api/articles - Get all articles
router.get('/', cacheArticles, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'publishedAt';
    const sortOrder = req.query.sortOrder || 'desc';
    const featured = req.query.featured;

    // Build query
    let query = { published: true };
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const articles = await Article.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const totalArticles = await Article.countDocuments(query);

    // Return paginated response or simple array based on request
    if (req.query.page || req.query.limit) {
      const totalPages = Math.ceil(totalArticles / limit);
      res.json({
        articles: articles,
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
      // For backward compatibility, return simple array if no pagination params
      const allArticles = await Article.find(query).sort(sort).exec();
      res.json(allArticles);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/articles/draft/:id - Get single draft by ID (protected)
router.get('/draft/:id', requireAuth, async (req, res) => {
  try {
    const draft = await Article.findOne({
      $and: [
        {
          $or: [{ _id: req.params.id }, { slug: req.params.id }],
        },
        {
          $or: [{ published: false }, { 'customFields.is_draft': true }],
        },
      ],
    });

    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    res.json({
      success: true,
      data: {
        ...draft.toObject(),
        TITLE: draft.title,
        SLUG: draft.slug,
        SUMMARY: draft.excerpt,
        IS_DRAFT: true,
        DRAFT_EXPIRES_AT: draft.customFields?.draft_expires_at,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/articles/drafts/list - Get all drafts (protected)
router.get('/drafts/list', requireAuth, async (req, res) => {
  try {
    const drafts = await Article.find({
      $or: [{ published: false }, { 'customFields.is_draft': true }],
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: drafts.map((draft) => ({
        ...draft.toObject(),
        TITLE: draft.title,
        SLUG: draft.slug,
        SUMMARY: draft.excerpt,
        IS_DRAFT: true,
        DRAFT_EXPIRES_AT: draft.customFields?.draft_expires_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/articles/:slug - Get article by slug
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment view count
    article.viewCount += 1;
    await article.save();

    // Return article with custom fields flattened for compatibility
    const articleData = {
      ...article.toObject(),
      // Flatten custom fields for compatibility with existing frontend
      TITLE: article.title,
      SLUG: article.slug,
      CONTENT: article.content,
      SUMMARY: article.excerpt,
      CATEGORY: article.category,
      AUTHOR: article.author,
      FEATURED: article.featured,
      PUBLISHED: article.published,
      TAGS: article.tags ? article.tags.join(', ') : '',
      ...article.customFields,
    };

    res.json({ data: articleData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/articles - Create new article (temporarily no auth or validation)
router.post(
  '/',
  // requireAuth, // Temporarily disabled for testing
  // validateArticle, // Temporarily disabled for testing
  // handleValidationErrors, // Temporarily disabled for testing
  async (req, res) => {
    try {
      console.log('📝 Creating article with data:', req.body);
      const articleData = {
        title: req.body.title,
        slug:
          req.body.slug ||
          req.body.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-'),
        content: req.body.content,
        excerpt: req.body.summary || req.body.excerpt,
        category: req.body.category || 'Technology',
        author: req.body.author || 'Admin',
        featured: req.body.featured || false,
        published: req.body.published !== false,
        tags: req.body.tags
          ? req.body.tags.split(',').map((t) => t.trim())
          : [],

        // SEO fields
        seo: {
          metaDescription: (
            req.body.summary ||
            req.body.excerpt ||
            ''
          ).substring(0, 160),
        },

        // Custom fields for your news platform
        customFields: {
          spot_number: req.body.spot_number,
          image_url: req.body.image_url,
          youtube_embed_url: req.body.youtube_embed_url,
          sources: req.body.sources,
          primary_source: req.body.primary_source,
          special_report_title: req.body.special_report_title,
          special_report_content: req.body.special_report_content,
          special_report_video: req.body.special_report_video,
          special_report_quotes: req.body.special_report_quotes,
          suggested_reading: req.body.suggested_reading,
          bias_analysis: req.body.bias_analysis,
          claim_source_mapping: req.body.claim_source_mapping,
          rated_sources: req.body.rated_sources,
        },
      };

      const newArticle = new Article(articleData);
      await newArticle.save();

      // Clear cache when new article is created
      clearCache();

      res.status(201).json(newArticle);
    } catch (error) {
      console.error('❌ Article creation error:', error);
      if (error.code === 11000) {
        res
          .status(400)
          .json({ error: 'Article with this slug already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
);

// PUT /api/articles/:id - Update article (protected)
router.put(
  '/:id',
  requireAuth,
  validateArticle,
  handleValidationErrors,
  async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Update article fields
      article.title = req.body.title;
      article.slug =
        req.body.slug ||
        req.body.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
      article.content = req.body.content;
      article.excerpt = req.body.summary || req.body.excerpt;
      article.category = req.body.category;
      article.author = req.body.author;
      article.featured = req.body.featured || false;
      article.published = req.body.published !== false;
      article.tags = req.body.tags
        ? req.body.tags.split(',').map((t) => t.trim())
        : [];

      // Update custom fields
      article.customFields = {
        ...article.customFields,
        spot_number: req.body.spot_number,
        image_url: req.body.image_url,
        youtube_embed_url: req.body.youtube_embed_url,
        sources: req.body.sources,
        primary_source: req.body.primary_source,
        special_report_title: req.body.special_report_title,
        special_report_content: req.body.special_report_content,
        special_report_video: req.body.special_report_video,
        special_report_quotes: req.body.special_report_quotes,
        suggested_reading: req.body.suggested_reading,
        bias_analysis: req.body.bias_analysis,
        claim_source_mapping: req.body.claim_source_mapping,
        rated_sources: req.body.rated_sources,
      };

      await article.save();

      // Clear cache when article is updated
      clearCache();

      res.json(article);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE /api/articles/:id - Delete article (protected)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await Article.findByIdAndDelete(req.params.id);

    // Clear cache when article is deleted
    clearCache();

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/articles/update - Update existing article by slug (protected)
router.post(
  '/update',
  requireAuth,
  validateArticle,
  handleValidationErrors,
  async (req, res) => {
    try {
      const originalSlug = req.body._originalSlug || req.body.slug;
      const article = await Article.findOne({ slug: originalSlug });

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Update article fields
      article.title = req.body.title;
      article.slug = req.body.new_slug || req.body.slug;
      article.content = req.body.content;
      article.excerpt = req.body.summary || req.body.excerpt;
      article.category = req.body.category;
      article.author = req.body.author;
      article.featured = req.body.featured || false;
      article.published = req.body.published !== false;
      article.tags = req.body.tags
        ? req.body.tags.split(',').map((t) => t.trim())
        : [];

      // Update custom fields
      article.customFields = {
        ...article.customFields,
        spot_number: req.body.spot_number,
        image_url: req.body.image_url,
        youtube_embed_url: req.body.youtube_embed_url,
        sources: req.body.sources,
        primary_source: req.body.primary_source,
        special_report_title: req.body.special_report_title,
        special_report_content: req.body.special_report_content,
        special_report_video: req.body.special_report_video,
        special_report_quotes: req.body.special_report_quotes,
        suggested_reading: req.body.suggested_reading,
        bias_analysis: req.body.bias_analysis,
        claim_source_mapping: req.body.claim_source_mapping,
        rated_sources: req.body.rated_sources,
      };

      await article.save();

      // Clear cache when article is updated
      clearCache();

      res.json(article);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/articles/draft - Save as draft (protected)
router.post('/draft', requireAuth, async (req, res) => {
  try {
    const existingArticle = await Article.findOne({ slug: req.body.slug });

    const articleData = {
      title: req.body.title,
      slug: req.body.slug,
      content: req.body.content || '',
      excerpt: req.body.summary || '',
      category: req.body.category || 'Technology',
      author: req.body.author || 'Admin',
      featured: false,
      published: false, // Drafts are not published
      tags: req.body.tags ? req.body.tags.split(',').map((t) => t.trim()) : [],

      customFields: {
        spot_number: req.body.spot_number,
        image_url: req.body.image_url || '',
        youtube_embed_url: req.body.youtube_embed_url || '',
        sources: req.body.sources || '',
        primary_source: req.body.primary_source || '',
        special_report_title: req.body.special_report_title || '',
        special_report_content: req.body.special_report_content || '',
        special_report_video: req.body.special_report_video || '',
        special_report_quotes: req.body.special_report_quotes || '',
        suggested_reading: req.body.suggested_reading || '',
        bias_analysis: req.body.bias_analysis || '',
        claim_source_mapping: req.body.claim_source_mapping || '',
        rated_sources: req.body.rated_sources || '',
        is_draft: true,
        draft_expires_at: req.body.draft_expires_at,
      },
    };

    let article;
    if (existingArticle) {
      // Update existing draft
      Object.assign(existingArticle, articleData);
      article = await existingArticle.save();
    } else {
      // Create new draft
      article = new Article(articleData);
      await article.save();
    }

    clearCache();
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/articles/publish-draft - Publish a draft (protected)
router.post(
  '/publish-draft',
  requireAuth,
  validateArticle,
  handleValidationErrors,
  async (req, res) => {
    try {
      const article = await Article.findOne({ slug: req.body.slug });

      if (!article) {
        return res.status(404).json({ error: 'Draft not found' });
      }

      // Update the draft to published article
      article.title = req.body.title;
      article.content = req.body.content;
      article.excerpt = req.body.summary;
      article.category = req.body.category;
      article.author = req.body.author;
      article.published = true; // Publish the article
      article.tags = req.body.tags
        ? req.body.tags.split(',').map((t) => t.trim())
        : [];

      // Update custom fields and remove draft flags
      article.customFields = {
        ...article.customFields,
        spot_number: req.body.spot_number,
        image_url: req.body.image_url,
        youtube_embed_url: req.body.youtube_embed_url,
        sources: req.body.sources,
        primary_source: req.body.primary_source,
        special_report_title: req.body.special_report_title,
        special_report_content: req.body.special_report_content,
        special_report_video: req.body.special_report_video,
        special_report_quotes: req.body.special_report_quotes,
        suggested_reading: req.body.suggested_reading,
        bias_analysis: req.body.bias_analysis,
        claim_source_mapping: req.body.claim_source_mapping,
        rated_sources: req.body.rated_sources,
        is_draft: false,
        draft_expires_at: null,
      };

      await article.save();

      clearCache();
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
