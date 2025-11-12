// Simple authentication middleware
// For production, implement proper authentication with JWT or sessions

const requireAuth = (req, res, next) => {
  // For now, we'll skip authentication to get the system working
  // In production, implement proper authentication here

  // Mock user for development
  req.user = {
    id: 'dev-user',
    username: 'admin',
    role: 'admin',
  };

  // Mock session for development
  if (!req.session) {
    req.session = {};
  }
  req.session.user = req.user;

  next();
};

const optionalAuth = (req, res, next) => {
  // Optional authentication - doesn't block if not authenticated
  req.user = {
    id: 'dev-user',
    username: 'admin',
    role: 'admin',
  };

  if (!req.session) {
    req.session = {};
  }
  req.session.user = req.user;

  next();
};

module.exports = {
  requireAuth,
  optionalAuth,
};
