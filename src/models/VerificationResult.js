const mongoose = require('mongoose');

const verificationResultSchema = new mongoose.Schema(
  {
    // Core content fields
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      trim: true,
    },

    // Source information
    sources: [
      {
        type: String,
        trim: true,
      },
    ],
    primarySource: {
      type: String,
      trim: true,
    },

    // Analysis fields
    biasAnalysis: String,
    claimSourceMapping: String,
    ratedSources: String,
    suggestedReading: String,

    // Special report fields
    specialReportTitle: String,
    specialReportContent: String,
    specialReportQuotes: String,

    // Metadata
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // Verification metadata
    verificationTool: {
      type: String,
      default: 'external-verification-tool',
    },
    verificationVersion: String,
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
    },

    // Status tracking
    status: {
      type: String,
      enum: ['pending_review', 'loaded', 'published', 'archived', 'rejected'],
      default: 'pending_review',
    },

    // Timestamps
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    loadedAt: Date,
    publishedAt: Date,

    // Relationships
    loadedByUser: {
      type: String,
      trim: true,
    },
    publishedArticleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
    },

    // Additional metadata
    originalData: {
      type: mongoose.Schema.Types.Mixed,
      select: false, // Don't include by default
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
verificationResultSchema.index({ status: 1, verifiedAt: -1 });
verificationResultSchema.index({ title: 'text', content: 'text' });

// Virtual for age
verificationResultSchema.virtual('age').get(function () {
  return Date.now() - this.verifiedAt;
});

// Virtual for formatted verification date
verificationResultSchema.virtual('verifiedAtFormatted').get(function () {
  return this.verifiedAt.toLocaleDateString();
});

// Instance methods
verificationResultSchema.methods.markAsLoaded = function (userId) {
  this.status = 'loaded';
  this.loadedAt = new Date();
  this.loadedByUser = userId;
  return this.save();
};

verificationResultSchema.methods.markAsPublished = function (articleId) {
  this.status = 'published';
  this.publishedAt = new Date();
  this.publishedArticleId = articleId;
  return this.save();
};

// Static methods
verificationResultSchema.statics.getPendingVerifications = function () {
  return this.find({ status: 'pending_review' })
    .sort({ verifiedAt: -1 })
    .limit(50);
};

verificationResultSchema.statics.getRecentVerifications = function (
  limit = 20
) {
  return this.find()
    .sort({ verifiedAt: -1 })
    .limit(limit)
    .populate('publishedArticleId', 'title slug');
};

verificationResultSchema.statics.createFromExternalTool = function (data) {
  return this.create({
    title: data.title,
    content: data.content,
    summary: data.summary,
    sources: Array.isArray(data.sources)
      ? data.sources
      : data.sources
      ? data.sources.split('\n').filter((s) => s.trim())
      : [],
    primarySource: data.primary_source || data.primarySource,
    biasAnalysis: data.bias_analysis || data.biasAnalysis,
    claimSourceMapping: data.claim_source_mapping || data.claimSourceMapping,
    ratedSources: data.rated_sources || data.ratedSources,
    suggestedReading: data.suggested_reading || data.suggestedReading,
    specialReportTitle: data.special_report_title || data.specialReportTitle,
    specialReportContent:
      data.special_report_content || data.specialReportContent,
    specialReportQuotes: data.special_report_quotes || data.specialReportQuotes,
    tags: Array.isArray(data.tags)
      ? data.tags
      : data.tags
      ? data.tags.split(',').map((t) => t.trim())
      : [],
    verificationTool: data.tool_name || data.verificationTool,
    verificationVersion: data.tool_version || data.verificationVersion,
    confidenceScore: data.confidence_score || data.confidenceScore,
    originalData: data,
  });
};

module.exports = mongoose.model('VerificationResult', verificationResultSchema);
