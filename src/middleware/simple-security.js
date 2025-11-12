const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

// Basic helmet configuration for personal use
const basicSecurity = helmet({
  contentSecurityPolicy: false, // Disable for easier development
  crossOriginEmbedderPolicy: false,
});

// Simple input validation for articles
const validateArticle = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
];

// Simple validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Please fill in all required fields',
      details: errors.array(),
    });
  }
  next();
};

module.exports = {
  basicSecurity,
  validateArticle,
  handleValidationErrors,
};
