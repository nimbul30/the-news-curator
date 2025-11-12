const express = require('express');
const { login } = require('../middleware/auth');
// No additional middleware needed for personal use
const router = express.Router();

// POST /api/auth/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Username and password are required',
      });
    }

    const isValid = await login(username, password);

    if (isValid) {
      req.session.isAuthenticated = true;
      req.session.username = username;

      res.json({
        success: true,
        message: 'Login successful',
        user: { username },
      });
    } else {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid username or password',
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login',
    });
  }
});

// POST /api/auth/logout - Admin logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Logout failed',
        message: 'An error occurred during logout',
      });
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  });
});

// GET /api/auth/status - Check authentication status
router.get('/status', (req, res) => {
  if (req.session && req.session.isAuthenticated) {
    res.json({
      authenticated: true,
      user: { username: req.session.username },
    });
  } else {
    res.json({
      authenticated: false,
    });
  }
});

module.exports = router;
