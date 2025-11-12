const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'General',
        'World',
        'Technology',
        'Business',
        'Economy',
        'Environment',
        'Education',
        'Law & Crime',
        'Science',
        'Politics',
      ],
    },
    author: {
      type: String,
      required: true,
      default: 'Admin',
    },

    // Position and Media
    spot_number: {
      type: mongoose.Schema.Types.Mixed, // Allows both numbers and strings (letters)
      default: null,
    },
    tags: {
      type: String,
      default: '',
    },
    image_url: {
      type: String,
      default: '',
    },
    youtube_embed_url: {
      type: String,
      default: '',
    },

    // Content
    excerpt: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
    },

    // Sources & Verification
    sources: {
      type: String,
      default: '',
    },
    primary_source: {
      type: String,
      default: '',
    },

    // Special Report Section
    special_report_title: {
      type: String,
      default: '',
    },
    special_report_content: {
      type: String,
      default: '',
    },
    special_report_video: {
      type: String,
      default: '',
    },
    special_report_quotes: {
      type: String,
      default: '',
    },

    // Comprehensive Analysis Fields
    suggested_reading: {
      type: String,
      default: '',
    },
    bias_analysis: {
      type: String,
      default: '',
    },
    claim_source_mapping: {
      type: String,
      default: '',
    },
    rated_sources: {
      type: String,
      default: '',
    },

    // Publication Status
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },

    // AI Verification Data
    verification_score: {
      type: String,
      default: '',
    },
    fact_check_results: {
      type: String,
      default: '',
    },
    credibility_rating: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Index for better query performance
articleSchema.index({ slug: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ published: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ spot_number: 1 });
articleSchema.index({ primary_source: 1 });
articleSchema.index({ primary_source: 1, published: 1 });

// Pre-save middleware to update the updatedAt field
articleSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Method to generate URL-friendly slug
articleSchema.methods.generateSlug = function () {
  return this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50);
};

// Static method to find published articles
articleSchema.statics.findPublished = function () {
  return this.find({ published: true }).sort({ publishedAt: -1 });
};

// Static method to find by category
articleSchema.statics.findByCategory = function (category) {
  return this.find({ category: category, published: true }).sort({
    publishedAt: -1,
  });
};

// Static method to find by position
articleSchema.statics.findByPosition = function (position) {
  return this.find({ spot_number: position, published: true }).sort({
    publishedAt: -1,
  });
};

module.exports = mongoose.model('Article', articleSchema);
