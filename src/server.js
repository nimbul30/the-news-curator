const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const config = require('../config/environment');
const { basicSecurity } = require('./middleware/simple-security');
const dbConnection = require('../config/database');

const app = express();

// Basic security for personal use
app.use(basicSecurity);

// Basic middleware
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

// Add request logging to debug browser issues
app.use((req, res, next) => {
  console.log(
    `📥 ${req.method} ${req.url} - User-Agent: ${req
      .get('User-Agent')
      ?.substring(0, 50)}...`
  );
  next();
});

app.use(express.json({ limit: '10mb' })); // Add size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.MONGODB_URI || 'mongodb://localhost:27017/news-platform',
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Sample data for testing
const sampleArticles = [
  {
    _id: '1',
    title: 'The Future of Artificial Intelligence',
    slug: 'future-of-artificial-intelligence',
    excerpt: 'Exploring how AI will reshape our world in the coming decades.',
    content:
      'Artificial Intelligence is rapidly evolving and transforming various industries. From healthcare to transportation, AI is making significant impacts on how we live and work. This article explores the potential future developments in AI technology and their implications for society.',
    category: 'Technology',
    author: 'Jane Smith',
    featured: true,
    published: true,
    viewCount: 1250,
    tags: ['AI', 'Technology', 'Future'],
    publishedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    _id: '2',
    title: 'Climate Change and Global Policy',
    slug: 'climate-change-global-policy',
    excerpt: 'An analysis of international efforts to combat climate change.',
    content:
      'Climate change remains one of the most pressing challenges of our time. This article examines the various international policies and agreements aimed at reducing greenhouse gas emissions and mitigating the effects of global warming.',
    category: 'Politics',
    author: 'John Doe',
    featured: false,
    published: true,
    viewCount: 890,
    tags: ['Climate', 'Politics', 'Environment'],
    publishedAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    _id: '3',
    title: 'Breakthrough in Quantum Computing',
    slug: 'breakthrough-quantum-computing',
    excerpt: 'Scientists achieve new milestone in quantum computing research.',
    content:
      'Researchers at leading universities have made significant progress in quantum computing, bringing us closer to practical applications of this revolutionary technology. This breakthrough could transform computing as we know it.',
    category: 'Science',
    author: 'Dr. Sarah Johnson',
    featured: true,
    published: true,
    viewCount: 2100,
    tags: ['Quantum', 'Computing', 'Science'],
    publishedAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    _id: '4',
    title: 'Economic Trends in 2024',
    slug: 'economic-trends-2024',
    excerpt:
      'Key economic indicators and market predictions for the year ahead.',
    content:
      'As we progress through 2024, several economic trends are emerging that could shape global markets. This analysis covers inflation, employment rates, and market volatility.',
    category: 'Business',
    author: 'Michael Brown',
    featured: false,
    published: false,
    viewCount: 675,
    tags: ['Economy', 'Markets', 'Finance'],
    publishedAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
];

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles-mongo'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/search', require('./routes/search'));
app.use('/api/verification', require('./routes/verification'));
app.use('/api/primary-sources', require('./routes/primary-sources'));

// Serve specific HTML files
app.get('/create.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/create.html'));
});

app.get('/verification-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/verification-dashboard.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Serve frontend for all other routes (but not static files)
app.get('*', (req, res, next) => {
  // Skip if it's a static file request
  if (req.path.includes('.') && !req.path.endsWith('.html')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB first
    await dbConnection.connect();

    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${config.PORT}`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
      console.log(`💾 Database: Connected to MongoDB`);
      console.log(`📝 Sample articles loaded: ${sampleArticles.length}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Export sample data for routes
app.locals.sampleArticles = sampleArticles;

module.exports = app;
