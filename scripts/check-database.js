const mongoose = require('mongoose');
const Article = require('../src/models/Article');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/thenewscurator', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Count total articles
    const totalCount = await Article.countDocuments();
    console.log(`📊 Total articles in database: ${totalCount}`);

    // Count published articles
    const publishedCount = await Article.countDocuments({ published: true });
    console.log(`📰 Published articles: ${publishedCount}`);

    // Count draft articles
    const draftCount = await Article.countDocuments({
      $or: [{ published: false }, { 'customFields.is_draft': true }],
    });
    console.log(`📝 Draft articles: ${draftCount}`);

    // Get all articles
    const allArticles = await Article.find().sort({ createdAt: -1 }).limit(10);
    console.log(`\n📋 Recent articles (last 10):`);

    if (allArticles.length === 0) {
      console.log('❌ No articles found in database!');
    } else {
      allArticles.forEach((article, index) => {
        console.log(
          `${index + 1}. "${article.title}" (${article.slug}) - Published: ${
            article.published
          }`
        );
      });
    }

    // Check database collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`\n📚 Database collections:`);
    collections.forEach((col) => {
      console.log(`- ${col.name}`);
    });
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

checkDatabase();
