const request = require('supertest');
const express = require('express');
const session = require('express-session');

// Create test app without starting server
const app = express();
app.use(express.json());

// Session configuration for testing
app.use(
  session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Sample test data
const testArticles = [
  {
    _id: '1',
    title: 'Test Article',
    slug: 'test-article',
    excerpt: 'This is a test excerpt with enough characters',
    content:
      'This is test content with sufficient length for validation requirements.',
    category: 'Technology',
    author: 'Test Author',
    featured: false,
    viewCount: 0,
    tags: ['test'],
    publishedAt: new Date(),
    updatedAt: new Date(),
  },
];

app.locals.sampleArticles = testArticles;

// Import routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/articles', require('../routes/articles'));
app.use('/api/categories', require('../routes/categories'));
app.use('/api/search', require('../routes/search'));

describe('Article API', () => {
  beforeEach(() => {
    // Reset test data
    app.locals.sampleArticles = [...testArticles];
  });

  describe('GET /api/articles', () => {
    it('should return all articles', async () => {
      const response = await request(app).get('/api/articles').expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Test Article');
    });
  });

  describe('GET /api/articles/:slug', () => {
    it('should return article by slug', async () => {
      const response = await request(app)
        .get('/api/articles/test-article')
        .expect(200);

      expect(response.body.title).toBe('Test Article');
    });

    it('should return 404 for non-existent article', async () => {
      await request(app).get('/api/articles/non-existent').expect(404);
    });
  });

  describe('POST /api/articles', () => {
    it('should require authentication for creating articles', async () => {
      const newArticle = {
        title: 'New Test Article',
        excerpt: 'This is a new test excerpt with enough characters',
        content:
          'This is new test content with sufficient length for validation.',
        category: 'Science',
        author: 'New Author',
        featured: true,
      };

      await request(app).post('/api/articles').send(newArticle).expect(401);
    });

    it('should create article when authenticated', async () => {
      const agent = request.agent(app);

      // Login first
      await agent
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        })
        .expect(200);

      const newArticle = {
        title: 'New Test Article',
        excerpt: 'This is a new test excerpt with enough characters',
        content:
          'This is new test content with sufficient length for validation.',
        category: 'Science',
        author: 'New Author',
        featured: true,
      };

      const response = await agent
        .post('/api/articles')
        .send(newArticle)
        .expect(201);

      expect(response.body.title).toBe(newArticle.title);
      expect(response.body.slug).toBe('new-test-article');
    });
  });
});

describe('Categories API', () => {
  beforeEach(() => {
    app.locals.sampleArticles = [...testArticles];
  });

  describe('GET /api/categories', () => {
    it('should return categories with counts', async () => {
      const response = await request(app).get('/api/categories').expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Technology');
      expect(response.body[0].count).toBe(1);
    });
  });
});

describe('Search API', () => {
  beforeEach(() => {
    app.locals.sampleArticles = [...testArticles];
  });

  describe('GET /api/search', () => {
    it('should search articles by query', async () => {
      const response = await request(app).get('/api/search?q=test').expect(200);

      expect(response.body.query).toBe('test');
      expect(response.body.results).toHaveLength(1);
    });

    it('should return error for missing query', async () => {
      await request(app).get('/api/search').expect(400);
    });
  });
});
