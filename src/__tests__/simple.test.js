const request = require('supertest');
const express = require('express');
const session = require('express-session');
const { basicSecurity } = require('../middleware/simple-security');

// Create simple test app
const app = express();
app.use(basicSecurity);
app.use(express.json());

// Session for testing
app.use(
  session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Test data
const testArticles = [
  {
    _id: '1',
    title: 'Test Article',
    slug: 'test-article',
    excerpt: 'Test excerpt',
    content: 'Test content',
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

describe('Simplified News Platform', () => {
  beforeEach(() => {
    app.locals.sampleArticles = [...testArticles];
  });

  describe('Basic Functionality', () => {
    it('should get articles', async () => {
      const response = await request(app).get('/api/articles').expect(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });

    it('should get categories', async () => {
      const response = await request(app).get('/api/categories').expect(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should search articles', async () => {
      const response = await request(app).get('/api/search?q=test').expect(200);
      expect(response.body.query).toBe('test');
    });

    it('should require auth for protected routes', async () => {
      await request(app)
        .post('/api/articles')
        .send({ title: 'Test' })
        .expect(401);
    });

    it('should allow admin login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should validate article creation', async () => {
      const agent = request.agent(app);

      // Login first
      await agent
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' })
        .expect(200);

      // Try to create article with missing fields
      const response = await agent
        .post('/api/articles')
        .send({ title: '' }) // Empty title
        .expect(400);

      expect(response.body.error).toBe('Please fill in all required fields');
    });
  });
});
