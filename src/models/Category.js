const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
      enum: {
        values: ['Politics', 'Science', 'Technology', 'Business'],
        message:
          'Category must be one of: Politics, Science, Technology, Business',
      },
    },

    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens',
      ],
    },

    description: {
      type: String,
      required: [true, 'Category description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      minlength: [10, 'Description must be at least 10 characters long'],
    },

    color: {
      type: String,
      required: [true, 'Category color is required'],
      match: [
        /^#[0-9A-Fa-f]{6}$/,
        'Color must be a valid hex color code (e.g., #FF5733)',
      ],
      default: '#007bff',
    },

    articleCount: {
      type: Number,
      default: 0,
      min: [0, 'Article count cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
categorySchema.index({ slug: 1 });
categorySchema.index({ name: 1 });

// Pre-save middleware to generate slug from name if not provided
categorySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  }
  next();
});

// Static method to update article count for a category
categorySchema.statics.updateArticleCount = async function (categoryName) {
  const Article = mongoose.model('Article');
  const count = await Article.countDocuments({ category: categoryName });

  return this.findOneAndUpdate(
    { name: categoryName },
    { articleCount: count },
    { new: true }
  );
};

// Static method to get all categories with article counts
categorySchema.statics.getAllWithCounts = function () {
  return this.find({}).sort({ name: 1 });
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
