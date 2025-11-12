const dbConnection = require('./database');
const { Article, Category } = require('../src/models');

class DatabaseSeeder {
  constructor() {
    this.categories = [
      {
        name: 'Politics',
        slug: 'politics',
        description:
          'Political news, government updates, and policy discussions',
        color: '#dc3545',
      },
      {
        name: 'Science',
        slug: 'science',
        description:
          'Scientific discoveries, research findings, and technological breakthroughs',
        color: '#28a745',
      },
      {
        name: 'Technology',
        slug: 'technology',
        description:
          'Tech industry news, product launches, and innovation updates',
        color: '#007bff',
      },
      {
        name: 'Business',
        slug: 'business',
        description: 'Business news, market updates, and economic analysis',
        color: '#ffc107',
      },
    ];

    this.sampleArticles = [
      {
        title: 'The Future of Artificial Intelligence in Healthcare',
        content:
          'Artificial intelligence is revolutionizing healthcare by enabling more accurate diagnoses, personalized treatment plans, and efficient drug discovery processes. Recent advances in machine learning algorithms have shown promising results in medical imaging, where AI systems can detect diseases like cancer with accuracy rates comparable to or exceeding those of human specialists. The integration of AI in healthcare is not just about replacing human expertise but augmenting it to provide better patient outcomes.',
        excerpt:
          'Exploring how AI is transforming healthcare through improved diagnostics and personalized medicine.',
        category: 'Technology',
        author: 'Dr. Sarah Johnson',
        featured: true,
        tags: ['AI', 'Healthcare', 'Machine Learning', 'Medical Technology'],
      },
      {
        title: 'Climate Change Policy: A Global Perspective',
        content:
          'As nations worldwide grapple with the escalating climate crisis, policy makers are implementing various strategies to reduce carbon emissions and promote sustainable development. The recent international climate summit highlighted the urgent need for coordinated global action, with countries committing to ambitious targets for renewable energy adoption and carbon neutrality. However, the challenge lies in balancing economic growth with environmental protection.',
        excerpt:
          'Analyzing global climate policies and their impact on sustainable development goals.',
        category: 'Politics',
        author: 'Michael Chen',
        featured: true,
        tags: ['Climate Change', 'Policy', 'Environment', 'Sustainability'],
      },
      {
        title: 'Breakthrough in Quantum Computing Research',
        content:
          'Scientists at leading research institutions have achieved a significant milestone in quantum computing, demonstrating quantum supremacy in solving complex mathematical problems. This breakthrough could revolutionize fields such as cryptography, drug discovery, and financial modeling. The new quantum processor can perform calculations that would take classical computers thousands of years to complete.',
        excerpt:
          'Scientists achieve quantum supremacy with implications for multiple industries.',
        category: 'Science',
        author: 'Prof. Emily Rodriguez',
        featured: false,
        tags: ['Quantum Computing', 'Research', 'Technology', 'Innovation'],
      },
      {
        title: 'Market Volatility and Investment Strategies',
        content:
          'Recent market fluctuations have prompted investors to reassess their portfolios and risk management strategies. Financial experts recommend diversification across asset classes and geographic regions to mitigate potential losses. The current economic climate, influenced by geopolitical tensions and inflation concerns, requires careful analysis and strategic planning for both individual and institutional investors.',
        excerpt:
          'Expert insights on navigating market volatility and optimizing investment portfolios.',
        category: 'Business',
        author: 'Robert Williams',
        featured: false,
        tags: ['Investment', 'Market Analysis', 'Finance', 'Risk Management'],
      },
    ];
  }

  async seedCategories() {
    try {
      console.log('🌱 Seeding categories...');

      // Clear existing categories
      await Category.deleteMany({});

      // Insert new categories
      const createdCategories = await Category.insertMany(this.categories);
      console.log(`✅ Created ${createdCategories.length} categories`);

      return createdCategories;
    } catch (error) {
      console.error('❌ Error seeding categories:', error);
      throw error;
    }
  }

  async seedArticles() {
    try {
      console.log('🌱 Seeding articles...');

      // Clear existing articles
      await Article.deleteMany({});

      // Insert new articles
      const createdArticles = await Article.insertMany(this.sampleArticles);
      console.log(`✅ Created ${createdArticles.length} articles`);

      // Update category article counts
      for (const category of this.categories) {
        await Category.updateArticleCount(category.name);
      }

      return createdArticles;
    } catch (error) {
      console.error('❌ Error seeding articles:', error);
      throw error;
    }
  }

  async seedAll() {
    try {
      console.log('🚀 Starting database seeding...');

      // Connect to database
      await dbConnection.connect();

      // Seed categories first
      await this.seedCategories();

      // Then seed articles
      await this.seedArticles();

      console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      console.error('💥 Database seeding failed:', error);
      process.exit(1);
    }
  }

  async clearAll() {
    try {
      console.log('🧹 Clearing all data...');

      await Article.deleteMany({});
      await Category.deleteMany({});

      console.log('✅ All data cleared');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }
}

// Create seeder instance
const seeder = new DatabaseSeeder();

// Export for use in other modules
module.exports = seeder;

// Allow running this script directly
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'seed':
      seeder.seedAll().then(() => process.exit(0));
      break;
    case 'clear':
      seeder.clearAll().then(() => process.exit(0));
      break;
    case 'categories':
      seeder.seedCategories().then(() => process.exit(0));
      break;
    case 'articles':
      seeder.seedArticles().then(() => process.exit(0));
      break;
    default:
      console.log(
        'Usage: node config/seed.js [seed|clear|categories|articles]'
      );
      process.exit(1);
  }
}
