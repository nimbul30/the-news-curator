const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Article = require('../src/models/Article');
require('dotenv').config();

async function exportArticlesToJSON() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all published articles
    const articles = await Article.find({ published: true })
      .sort({ 'customFields.spot_number': 1, publishedAt: -1 })
      .select(
        'title slug excerpt category author customFields publishedAt viewCount content'
      );

    console.log(`📄 Found ${articles.length} published articles`);

    // Create API directory if it doesn't exist
    const apiDir = path.join(__dirname, '../public/api');
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }

    // Export all articles
    const articlesData = articles.map((article) => ({
      id: article._id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      author: article.author,
      publishedAt: article.publishedAt,
      viewCount: article.viewCount,
      customFields: article.customFields,
      // Add image_url at root level for compatibility
      image_url: article.customFields?.image_url,
    }));

    // Write articles.json
    fs.writeFileSync(
      path.join(apiDir, 'articles.json'),
      JSON.stringify(articlesData, null, 2)
    );
    console.log('✅ Created public/api/articles.json');

    // Export individual articles for article pages
    const articlesDir = path.join(apiDir, 'articles');
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir, { recursive: true });
    }

    for (const article of articles) {
      const fullArticle = {
        id: article._id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        author: article.author,
        publishedAt: article.publishedAt,
        viewCount: article.viewCount,
        customFields: article.customFields,
        image_url: article.customFields?.image_url,
      };

      fs.writeFileSync(
        path.join(articlesDir, `${article.slug}.json`),
        JSON.stringify(fullArticle, null, 2)
      );
    }
    console.log(`✅ Created ${articles.length} individual article files`);

    // Show articles with spot numbers
    const articlesWithSpots = articlesData.filter(
      (a) => a.customFields?.spot_number
    );
    console.log('\n📍 Articles with spot numbers:');
    articlesWithSpots
      .sort((a, b) => a.customFields.spot_number - b.customFields.spot_number)
      .forEach((article) => {
        console.log(
          `  Spot ${article.customFields.spot_number}: "${article.title}"`
        );
      });
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

exportArticlesToJSON();
