const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import Article model
const Article = require('../src/models/Article');

async function exportArticles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Fetch all published articles
    const articles = await Article.find({ published: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    console.log(`📊 Found ${articles.length} published articles`);

    // Transform articles for JSON export
    const exportData = articles.map((article) => ({
      id: article._id.toString(),
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || article.summary || '',
      category: article.category,
      author: article.author,
      publishedAt: article.publishedAt || article.createdAt,
      viewCount: article.viewCount || 0,
      customFields: {
        spot_number: article.spot_number,
        image_url: article.image_url,
        youtube_embed_url: article.youtube_embed_url || '',
        sources: article.sources || '',
        primary_source: article.primary_source || '',
        special_report_title: article.special_report_title || '',
        special_report_content: article.special_report_content || '',
        special_report_video: article.special_report_video || '',
        special_report_quotes: article.special_report_quotes || '',
        suggested_reading: article.suggested_reading || '',
        bias_analysis: article.bias_analysis || '',
        claim_source_mapping: article.claim_source_mapping || '',
        rated_sources: article.rated_sources || '',
        is_draft: false,
      },
      image_url: article.image_url,
    }));

    // Write to public/api/articles.json
    const outputPath = path.join(__dirname, '../public/api/articles.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log(`✅ Exported ${exportData.length} articles to ${outputPath}`);
    console.log('\n📋 Articles by spot number:');

    exportData
      .filter((a) => a.customFields.spot_number)
      .sort((a, b) => a.customFields.spot_number - b.customFields.spot_number)
      .forEach((a) => {
        console.log(`  Spot ${a.customFields.spot_number}: ${a.title}`);
      });

    await mongoose.connection.close();
    console.log('\n✅ Export complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

exportArticles();
