const express = require('express');
const { requireAuth } = require('../middleware/auth');
const VerificationResult = require('../models/VerificationResult');
const Article = require('../models/Article');
const router = express.Router();

// POST /api/verification/submit - Submit verification results from external tool or URL
router.post('/submit', async (req, res) => {
  try {
    console.log('Received verification submission:', req.body);

    let verificationResult;

    // Check if this is just a URL submission
    if (req.body.url && !req.body.title) {
      // Create a pending verification entry for URL processing
      verificationResult = await VerificationResult.create({
        title: `Pending: ${req.body.url}`,
        content: 'This article is pending verification processing.',
        summary: 'Article submitted for verification and awaiting processing.',
        sources: [req.body.url],
        primarySource: req.body.url,
        status: 'pending_review',
        originalData: { url: req.body.url, submitted_at: new Date() },
      });
    } else {
      // Process complete verification data
      verificationResult = await VerificationResult.createFromExternalTool(
        req.body
      );
    }

    res.status(201).json({
      success: true,
      id: verificationResult._id,
      status: verificationResult.status,
      message:
        verificationResult.status === 'pending_review'
          ? 'URL submitted for verification processing'
          : 'Verification result saved successfully',
    });
  } catch (error) {
    console.error('Error saving verification result:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to save verification result',
    });
  }
});

// GET /api/verification/pending - Get pending verification results (protected)
router.get('/pending', requireAuth, async (req, res) => {
  try {
    const pendingResults = await VerificationResult.getPendingVerifications();

    res.json({
      success: true,
      count: pendingResults.length,
      data: pendingResults,
    });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/verification/recent - Get recent verification results (protected)
router.get('/recent', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const recentResults = await VerificationResult.getRecentVerifications(
      limit
    );

    res.json({
      success: true,
      count: recentResults.length,
      data: recentResults,
    });
  } catch (error) {
    console.error('Error fetching recent verifications:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/verification/:id - Get specific verification result (protected)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const verificationResult = await VerificationResult.findById(req.params.id);

    if (!verificationResult) {
      return res.status(404).json({
        success: false,
        message: 'Verification result not found',
      });
    }

    res.json({
      success: true,
      data: verificationResult,
    });
  } catch (error) {
    console.error('Error fetching verification result:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/verification/:id/load - Mark verification as loaded (protected)
router.post('/:id/load', requireAuth, async (req, res) => {
  try {
    const verificationResult = await VerificationResult.findById(req.params.id);

    if (!verificationResult) {
      return res.status(404).json({
        success: false,
        message: 'Verification result not found',
      });
    }

    if (verificationResult.status !== 'pending_review') {
      return res.status(400).json({
        success: false,
        message: `Cannot load verification with status: ${verificationResult.status}`,
      });
    }

    await verificationResult.markAsLoaded(
      req.session.user?.username || 'unknown'
    );

    res.json({
      success: true,
      data: verificationResult,
      message: 'Verification result loaded successfully',
    });
  } catch (error) {
    console.error('Error loading verification result:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/verification/:id/publish - Mark verification as published (protected)
router.post('/:id/publish', requireAuth, async (req, res) => {
  try {
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: 'Article ID is required',
      });
    }

    const verificationResult = await VerificationResult.findById(req.params.id);

    if (!verificationResult) {
      return res.status(404).json({
        success: false,
        message: 'Verification result not found',
      });
    }

    await verificationResult.markAsPublished(articleId);

    res.json({
      success: true,
      data: verificationResult,
      message: 'Verification result marked as published',
    });
  } catch (error) {
    console.error('Error marking verification as published:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/verification/:id - Delete/archive verification result (protected)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const verificationResult = await VerificationResult.findById(req.params.id);

    if (!verificationResult) {
      return res.status(404).json({
        success: false,
        message: 'Verification result not found',
      });
    }

    // Archive instead of delete to maintain audit trail
    verificationResult.status = 'archived';
    await verificationResult.save();

    res.json({
      success: true,
      message: 'Verification result archived successfully',
    });
  } catch (error) {
    console.error('Error archiving verification result:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/verification/stats/summary - Get verification statistics (protected)
router.get('/stats/summary', requireAuth, async (req, res) => {
  try {
    const stats = await VerificationResult.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = {
      total: 0,
      pending_review: 0,
      loaded: 0,
      published: 0,
      archived: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      summary[stat._id] = stat.count;
      summary.total += stat.count;
    });

    // Get recent activity
    const recentActivity = await VerificationResult.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status updatedAt');

    res.json({
      success: true,
      data: {
        summary,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Error fetching verification stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
