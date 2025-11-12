const mongoose = require('mongoose');
const Article = require('../src/models/Article');
require('dotenv').config();

async function checkSpotNumbers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get articles with spot numbers
    const articlesWithSpots = await Article.find({
      'customFields.spot_number': { $exists: true, $ne: null },
    }).sort({ 'customFields.spot_number': 1 });

    console.log(`\n📍 Articles with spot numbers assigned:`);
    if (articlesWithSpots.length === 0) {
      console.log('❌ No articles have spot numbers assigned!');
    } else {
      articlesWithSpots.forEach((article) => {
        console.log(
          `Spot ${article.customFields.spot_number}: "${article.title}"`
        );
      });
    }

    // Get all articles to see which ones don't have spots
    const allArticles = await Article.find({ published: true });
    const articlesWithoutSpots = allArticles.filter(
      (article) => !article.customFields.spot_number
    );

    console.log(`\n📄 Articles without spot numbers:`);
    articlesWithoutSpots.forEach((article) => {
      console.log(`- "${article.title}"`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkSpotNumbers();
