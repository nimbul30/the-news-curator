const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Article = require('../models/Article');

// Create test app
const app = express();
app.use(express.json());

// Import primary sources route
app.use('/api/primary-sources', require('../routes/primary-sources'));

describe('Primary Sources Integration Tests', () => {
  let testArticleIds = [];

  beforeAll(async () => {
    // Connect to test database
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/news-platform-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    // Clean up test articles
    if (testArticleIds.length > 0) {
      await Article.deleteMany({ _id: { $in: testArticleIds } });
    }
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create fresh test articles for each test
    const articles = await Article.insertMany([
      {
        title: 'Integration Test GitHub Article 1',
        slug: 'int-test-github-1-' + Date.now(),
        excerpt: 'Article about GitHub features and updates for developers',
        content: 'Detailed content about GitHub features and developer tools.',
        category: 'Technology',
        author: 'Test Author',
        published: true,
        publishedAt: new Date('2024-01-15'),
        primary_source: 'https://github.com/blog',
      },
      {
        title: 'Integration Test GitHub Article 2',
        slug: 'int-test-github-2-' + Date.now(),
        excerpt: 'More insights from GitHub about open source development',
        content: 'Content about open source development and collaboration.',
        category: 'Technology',
        author: 'Test Author',
        published: true,
        publishedAt: new Date('2024-01-20'),
        primary_source: 'https://github.com/blog',
      },
      {
        title: 'Integration Test Nature Article',
        slug: 'int-test-nature-' + Date.now(),
        excerpt: 'Scientific research published in Nature journal',
        content: 'Detailed scientific research findings and methodology.',
        category: 'Science',
        author: 'Test Author',
        published: true,
        publishedAt: new Date('2024-01-18'),
        primary_source: 'https://www.nature.com/articles/research-2024',
      },
      {
        title: 'Integration Test Government Report',
        slug: 'int-test-gov-' + Date.now(),
        excerpt: 'Analysis of government policy report',
        content: 'Detailed analysis of government policy and implications.',
        category: 'Politics',
        author: 'Test Author',
        published: true,
        publishedAt: new Date('2024-01-22'),
        primary_source: 'Government Policy Report 2024',
      },
      {
        title: 'Integration Test Unpublished',
        slug: 'int-test-unpub-' + Date.now(),
        excerpt: 'This article should not appear in results',
        content: 'Content that should not be visible in public queries.',
        category: 'Technology',
        author: 'Test Author',
        published: false,
        publishedAt: null,
        primary_source: 'https://example.com/unpublished',
      },
    ]);

    testArticleIds = articles.map((a) => a._id);
  });

  afterEach(async () => {
    // Clean up test articles after each test
    if (testArticleIds.length > 0) {
      await Article.deleteMany({ _id: { $in: testArticleIds } });
      testArticleIds = [];
    }
  });

  describe('GET /api/primary-sources - Core Functionality', () => {
    it('should return primary sources with correct structure', async () => {
      const response = await request(app)
        .get('/api/primary-sources')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);

      // Verify structure of sources
      const githubSource = response.body.find(
        (s) => s._id && s._id.includes('github')
      );
      expect(githubSource).toBeDefined();
      expect(githubSource).toHaveProperty('_id');
      expect(githubSource).toHaveProperty('count');
      expect(githubSource).toHaveProperty('categories');
      expect(githubSource).toHaveProperty('articles');
      expect(githubSource.count).toBeGreaterThanOrEqual(2);
    });

    it('should sort sources by article count', async () => {
      const response = await request(app)
        .get('/api/primary-sources')
        .expect(200);

      // Find our test sources
      const githubSource = response.body.find(
        (s) => s._id && s._id.includes('github')
      );
      const natureSource = response.body.find(
        (s) => s._id && s._id.includes('nature')
      );

      expect(githubSource).toBeDefined();
      expect(natureSource).toBeDefined();
      expect(githubSource.count).toBeGreaterThanOrEqual(2);
      expect(natureSource.count).toBeGreaterThanOrEqual(1);
    });

    it('should filter sources by category', async () => {
      const response = await request(app)
        .get('/api/primary-sources?category=Science')
        .expect(200);

      const natureSource = response.body.find(
        (s) => s._id && s._id.includes('nature')
      );
      expect(natureSource).toBeDefined();
      expect(natureSource.categories).toContain('Science');
    });

    it('should exclude unpublished articles', async () => {
      const response = await request(app)
        .get('/api/primary-sources')
        .expect(200);

      const sources = response.body.map((s) => s._id);
      expect(sources).not.toContain('https://example.com/unpublished');
    });
  });

  describe('GET /api/primary-sources/search - Search Functionality', () => {
    it('should search primary sources by query', async () => {
      const response = await request(app)
        .get('/api/primary-sources/search?q=github')
        .expect(200);

      const githubSource = response.body.find(
        (s) => s._id && s._id.includes('github')
      );
      expect(githubSource).toBeDefined();
      expect(githubSource.count).toBeGreaterThanOrEqual(2);
    });

    it('should perform case-insensitive search', async () => {
      const response = await request(app)
        .get('/api/primary-sources/search?q=NATURE')
        .expect(200);

      const natureSource = response.body.find(
        (s) => s._id && s._id.includes('nature')
      );
      expect(natureSource).toBeDefined();
    });

    it('should support partial matching', async () => {
      const response = await request(app)
        .get('/api/primary-sources/search?q=gov')
        .expect(200);

      const govSource = response.body.find(
        (s) => s._id && s._id.includes('Government')
      );
      expect(govSource).toBeDefined();
    });

    it('should return 400 for missing query parameter', async () => {
      const response = await request(app)
        .get('/api/primary-sources/search')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/primary-sources/search?q=nonexistentxyz123')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/primary-sources/:sourceId/articles - Article Retrieval', () => {
    it('should return articles for a specific URL primary source', async () => {
      const sourceId = encodeURIComponent('https://github.com/blog');

      const response = await request(app)
        .get(`/api/primary-sources/${sourceId}/articles`)
        .expect(200);

      expect(response.body).toHaveProperty('articles');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('source');
      expect(response.body.articles.length).toBeGreaterThanOrEqual(2);

      const testArticle = response.body.articles.find((a) =>
        a.title.includes('Integration Test GitHub')
      );
      expect(testArticle).toBeDefined();
    });

    it('should handle non-URL primary sources', async () => {
      const sourceId = encodeURIComponent('Government Policy Report 2024');

      const response = await request(app)
        .get(`/api/primary-sources/${sourceId}/articles`)
        .expect(200);

      expect(response.body.articles.length).toBeGreaterThanOrEqual(1);
      const testArticle = response.body.articles.find(
        (a) => a.category === 'Politics'
      );
      expect(testArticle).toBeDefined();
    });

    it('should support pagination', async () => {
      const sourceId = encodeURIComponent('https://github.com/blog');

      const response = await request(app)
        .get(`/api/primary-sources/${sourceId}/articles?page=1&limit=1`)
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(2);
      expect(response.body.articles.length).toBe(1);
    });

    it('should sort by date by default (newest first)', async () => {
      const sourceId = encodeURIComponent('https://github.com/blog');

      const response = await request(app)
        .get(`/api/primary-sources/${sourceId}/articles`)
        .expect(200);

      expect(response.body.articles.length).toBeGreaterThanOrEqual(2);

      // Check that dates are in descending order
      const dates = response.body.articles.map((a) => new Date(a.publishedAt));
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i].getTime()).toBeGreaterThanOrEqual(
          dates[i + 1].getTime()
        );
      }
    });

    it('should return empty results for non-existent source', async () => {
      const sourceId = encodeURIComponent('https://nonexistent-xyz-123.com');

      const response = await request(app)
        .get(`/api/primary-sources/${sourceId}/articles`)
        .expect(200);

      expect(response.body.articles).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('URL and Non-URL Primary Sources', () => {
    it('should handle URL primary sources correctly', async () => {
      const response = await request(app)
        .get('/api/primary-sources')
        .expect(200);

      const urlSources = response.body.filter(
        (s) => s._id && s._id.startsWith('http')
      );
      expect(urlSources.length).toBeGreaterThan(0);

      const githubSource = urlSources.find((s) => s._id.includes('github'));
      expect(githubSource).toBeDefined();
    });

    it('should handle non-URL primary sources correctly', async () => {
      const response = await request(app)
        .get('/api/primary-sources')
        .expect(200);

      const nonUrlSources = response.body.filter(
        (s) => s._id && !s._id.startsWith('http')
      );
      expect(nonUrlSources.length).toBeGreaterThan(0);

      const govSource = nonUrlSources.find(
        (s) => s._id && s._id.includes('Government')
      );
      expect(govSource).toBeDefined();
    });
  });
});
