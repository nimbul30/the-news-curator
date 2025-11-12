// Simple in-memory cache for personal use
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const simpleCache = (keyPrefix) => {
  return (req, res, next) => {
    // Skip caching for admin operations
    if (req.session && req.session.isAuthenticated) {
      return next();
    }

    const key = `${keyPrefix}:${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json(cached.data);
    }

    // Store original res.json
    const originalJson = res.json;

    res.json = function (data) {
      // Cache successful responses
      if (res.statusCode === 200) {
        cache.set(key, {
          data: data,
          timestamp: Date.now(),
        });
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

// Clear cache when articles are modified
const clearCache = () => {
  cache.clear();
};

module.exports = {
  cacheArticles: simpleCache('articles'),
  cacheCategories: simpleCache('categories'),
  cacheSearch: simpleCache('search'),
  clearCache,
};
