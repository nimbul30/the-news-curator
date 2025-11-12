const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const config = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3002,

  // Database configuration
  MONGODB_URI:
    process.env.MONGODB_URI || 'mongodb://localhost:27017/news-platform',

  // Session configuration
  SESSION_SECRET: process.env.SESSION_SECRET || 'fallback-secret-change-me',

  // Admin authentication
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',

  // Application settings
  APP_NAME: process.env.APP_NAME || 'Modern News Platform',
  APP_URL: process.env.APP_URL || 'http://localhost:3002',

  // Derived settings
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// Validate required environment variables
const requiredVars = ['MONGODB_URI', 'SESSION_SECRET'];
const missingVars = requiredVars.filter((varName) => !config[varName]);

if (missingVars.length > 0) {
  console.error(
    'Missing required environment variables:',
    missingVars.join(', ')
  );
  console.error('Please check your .env file or environment configuration');
  process.exit(1);
}

module.exports = config;
