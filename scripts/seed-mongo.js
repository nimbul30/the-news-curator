const mongoose = require('mongoose');
const Article = require('../src/models/Article');
const config = require('../config/environment');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing articles
    await Article.deleteMany({});
    console.log('Cleared existing articles');

    // Sample articles with your custom fields
    const sampleArticles = [
      {
        title: 'The Future of Artificial Intelligence',
        slug: 'future-of-artificial-intelligence',
        excerpt:
          'Exploring how AI will reshape our world in the coming decades.',
        content: `# The Future of Artificial Intelligence

Artificial Intelligence is rapidly evolving and transforming various industries. From healthcare to transportation, AI is making significant impacts on how we live and work.

## Key Developments

The recent breakthroughs in machine learning and neural networks have opened up new possibilities that were once considered science fiction.

## Impact on Society

This article explores the potential future developments in AI technology and their implications for society.`,
        category: 'Technology',
        author: 'Jane Smith',
        featured: true,
        published: true,
        tags: ['AI', 'Technology', 'Future'],
        customFields: {
          spot_number: 1,
          image_url:
            'https://via.placeholder.com/800x600/6b7d91/eae7db?text=AI+Future',
          sources: 'MIT Technology Review, Nature AI, Stanford AI Lab',
          primary_source: 'MIT Technology Review - AI Trends 2024',
          special_report_title: 'AI Revolution: What Experts Predict',
          special_report_content:
            'Leading AI researchers share their insights on the transformative potential of artificial intelligence in the next decade. From autonomous vehicles to medical diagnostics, AI is poised to revolutionize multiple sectors.',
          suggested_reading:
            'For deeper understanding of AI developments, we recommend exploring the latest research from Stanford AI Lab and MIT CSAIL. These institutions are at the forefront of AI innovation and regularly publish groundbreaking studies.',
          bias_analysis:
            'This article presents a balanced view of AI development, acknowledging both opportunities and challenges. Sources include academic institutions and peer-reviewed research.',
          claim_source_mapping:
            'AI transforming industries - MIT Technology Review 2024\nBreakthroughs in neural networks - Nature AI Journal\nSocietal implications - Stanford AI Ethics Report',
          rated_sources:
            'MIT Technology Review [Tier 1] - Peer-reviewed technology publication\nNature AI [Tier 1] - Academic journal with rigorous peer review\nStanford AI Lab [Tier 1] - Leading academic research institution',
        },
      },
      {
        title: 'Climate Change and Global Policy',
        slug: 'climate-change-global-policy',
        excerpt:
          'An analysis of international efforts to combat climate change.',
        content: `# Climate Change and Global Policy

Climate change remains one of the most pressing challenges of our time. This article examines the various international policies and agreements aimed at reducing greenhouse gas emissions and mitigating the effects of global warming.

## International Agreements

The Paris Agreement and subsequent climate summits have established frameworks for global cooperation.

## Policy Effectiveness

Recent studies show mixed results in policy implementation across different nations.`,
        category: 'Politics',
        author: 'John Doe',
        featured: false,
        published: true,
        tags: ['Climate', 'Politics', 'Environment'],
        customFields: {
          spot_number: 2,
          image_url:
            'https://via.placeholder.com/800x600/6b7d91/eae7db?text=Climate+Policy',
          sources:
            'IPCC Reports, UN Climate Change, Environmental Policy Institute',
          primary_source: 'IPCC Sixth Assessment Report',
          special_report_title:
            'Global Climate Action: Progress and Challenges',
          special_report_content:
            'An in-depth look at how different countries are implementing climate policies and the effectiveness of international cooperation in addressing global warming.',
          suggested_reading:
            'The IPCC reports provide comprehensive scientific assessments of climate change. For policy analysis, the Environmental Policy Institute offers detailed studies on implementation strategies.',
          bias_analysis:
            'Sources include international scientific bodies and policy research institutions. Analysis focuses on factual policy outcomes rather than political positions.',
          claim_source_mapping:
            'International cooperation frameworks - UN Climate Change\nPolicy effectiveness studies - Environmental Policy Institute\nScientific consensus on climate change - IPCC Reports',
          rated_sources:
            'IPCC Reports [Tier 1] - International scientific assessment body\nUN Climate Change [Tier 2] - Official international organization\nEnvironmental Policy Institute [Tier 2] - Research institution',
        },
      },
      {
        title: 'Breakthrough in Quantum Computing',
        slug: 'breakthrough-quantum-computing',
        excerpt:
          'Scientists achieve new milestone in quantum computing research.',
        content: `# Breakthrough in Quantum Computing

Researchers at leading universities have made significant progress in quantum computing, bringing us closer to practical applications of this revolutionary technology.

## The Breakthrough

Recent developments in quantum error correction have solved long-standing challenges in the field.

## Future Applications

This breakthrough could transform computing as we know it, with applications in cryptography, drug discovery, and complex simulations.`,
        category: 'Science',
        author: 'Dr. Sarah Johnson',
        featured: true,
        published: true,
        tags: ['Quantum', 'Computing', 'Science'],
        customFields: {
          spot_number: 3,
          image_url:
            'https://via.placeholder.com/800x600/6b7d91/eae7db?text=Quantum+Computing',
          sources: 'Nature Physics, IBM Research, Google Quantum AI',
          primary_source: 'Nature Physics - Quantum Error Correction Study',
          special_report_title: 'Quantum Leap: The Race for Quantum Supremacy',
          special_report_content:
            'Major tech companies and research institutions are competing to achieve practical quantum computing. This report examines the current state of the technology and its potential impact.',
          suggested_reading:
            'For technical details, Nature Physics publishes cutting-edge quantum research. IBM and Google regularly share updates on their quantum computing progress through their research blogs.',
          bias_analysis:
            'Coverage focuses on peer-reviewed scientific research and official company announcements. Technical claims are verified against multiple independent sources.',
          claim_source_mapping:
            'Quantum error correction breakthrough - Nature Physics\nPractical applications timeline - IBM Research\nTechnology comparison - Google Quantum AI',
          rated_sources:
            'Nature Physics [Tier 1] - Peer-reviewed scientific journal\nIBM Research [Tier 2] - Corporate research division\nGoogle Quantum AI [Tier 2] - Corporate research team',
        },
      },
    ];

    // Insert sample articles
    const insertedArticles = await Article.insertMany(sampleArticles);
    console.log(`Inserted ${insertedArticles.length} sample articles`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
