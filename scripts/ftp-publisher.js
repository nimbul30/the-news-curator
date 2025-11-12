const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class FTPPublisher {
  constructor() {
    this.client = new ftp.Client();
    this.client.ftp.verbose = false; // Set to true for debugging
  }

  async connect() {
    try {
      await this.client.access({
        host: process.env.FTP_HOST || 'ftp.thenewscurator.com',
        user: process.env.FTP_USER || 'deploy@thenewscurator.com',
        password: process.env.FTP_PASSWORD,
        secure: false,
      });
      console.log('✅ Connected to FTP server');
      return true;
    } catch (error) {
      console.error('❌ FTP connection failed:', error.message);
      return false;
    }
  }

  async publishArticle(articleData) {
    try {
      console.log('📝 Publishing article:', articleData.title);

      // Generate article HTML file
      const articleHtml = this.generateArticleHTML(articleData);
      const fileName = `${articleData.slug}.html`;
      const tempFilePath = path.join(__dirname, '..', 'temp', fileName);

      // Ensure temp directory exists
      const tempDir = path.dirname(tempFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Write article to temp file
      fs.writeFileSync(tempFilePath, articleHtml);

      // Upload to FTP
      await this.client.uploadFrom(tempFilePath, fileName);
      console.log(`📤 Uploaded: ${fileName}`);

      // Update articles.json
      await this.updateArticlesJSON(articleData);

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      console.log('✅ Article published successfully');
      return { success: true, fileName: fileName };
    } catch (error) {
      console.error('❌ Publishing failed:', error);
      throw error;
    }
  }

  async updateArticlesJSON(articleData) {
    try {
      // Download current articles.json
      const tempJsonPath = path.join(__dirname, '..', 'temp', 'articles.json');

      let articles = [];
      try {
        await this.client.downloadTo(tempJsonPath, 'api/articles.json');
        const jsonContent = fs.readFileSync(tempJsonPath, 'utf8');
        articles = JSON.parse(jsonContent);
      } catch (error) {
        console.log('No existing articles.json found, creating new one');
        articles = [];
      }

      // Add or update article
      const existingIndex = articles.findIndex(
        (a) => a.slug === articleData.slug
      );
      const articleEntry = {
        title: articleData.title,
        slug: articleData.slug,
        excerpt: articleData.excerpt || '',
        category: articleData.category,
        author: articleData.author,
        publishedAt: articleData.publishedAt || new Date().toISOString(),
        viewCount:
          existingIndex >= 0 ? articles[existingIndex].viewCount || 0 : 0,
        customFields: {
          spot_number: articleData.spot_number,
        },
      };

      if (existingIndex >= 0) {
        articles[existingIndex] = articleEntry;
      } else {
        articles.push(articleEntry);
      }

      // Sort by spot_number, then by publishedAt
      articles.sort((a, b) => {
        const aSpot = a.customFields?.spot_number || 999;
        const bSpot = b.customFields?.spot_number || 999;
        if (aSpot !== bSpot) return aSpot - bSpot;
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      });

      // Write updated articles.json
      fs.writeFileSync(tempJsonPath, JSON.stringify(articles, null, 2));

      // Upload updated articles.json
      await this.client.uploadFrom(tempJsonPath, 'api/articles.json');
      console.log('📤 Updated articles.json');

      // Clean up temp file
      fs.unlinkSync(tempJsonPath);
    } catch (error) {
      console.error('❌ Failed to update articles.json:', error);
      throw error;
    }
  }

  generateArticleHTML(articleData) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${articleData.title} - The News Curator</title>
    <link href="/css/main.css" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              'pr-background': '#6b7d91',
              'pr-nav': '#d8d3c4',
              'pr-primary': '#182a38',
              'pr-secondary': '#757d7f',
              'pr-text-accent': '#eae7db',
              'card-bg': '#eae7db',
            },
            fontFamily: {
              display: ['Playfair Display', 'serif'],
              body: ['Roboto', 'sans-serif'],
            },
          },
        },
      };
    </script>
</head>
<body class="bg-pr-background font-body">
    <!-- Navigation -->
    <nav class="bg-pr-nav shadow-lg">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-4">
                    <img src="/assets/logo.png" alt="The News Curator" class="h-10 w-auto">
                    <h1 class="text-2xl font-display font-bold text-pr-primary">The News Curator</h1>
                </div>
                <div class="hidden md:flex space-x-6">
                    <a href="/" class="text-pr-primary hover:text-pr-secondary transition-colors">Home</a>
                    <a href="/world.html" class="text-pr-primary hover:text-pr-secondary transition-colors">World</a>
                    <a href="/politics.html" class="text-pr-primary hover:text-pr-secondary transition-colors">Politics</a>
                    <a href="/business.html" class="text-pr-primary hover:text-pr-secondary transition-colors">Business</a>
                    <a href="/technology.html" class="text-pr-primary hover:text-pr-secondary transition-colors">Technology</a>
                    <a href="/about.html" class="text-pr-primary hover:text-pr-secondary transition-colors">About</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Article Content -->
    <main class="container mx-auto px-4 py-8">
        <article class="max-w-4xl mx-auto bg-card-bg rounded-lg shadow-lg overflow-hidden">
            ${
              articleData.image_url
                ? `
            <div class="w-full h-64 md:h-96 overflow-hidden">
                <img src="${articleData.image_url}" alt="${articleData.title}" class="w-full h-full object-cover">
            </div>
            `
                : ''
            }
            
            <div class="p-6 md:p-8">
                <header class="mb-6">
                    <div class="flex items-center space-x-4 text-sm text-pr-secondary mb-4">
                        <span class="bg-pr-primary text-white px-3 py-1 rounded-full">${
                          articleData.category
                        }</span>
                        <span>By ${articleData.author}</span>
                        <span>${new Date(
                          articleData.publishedAt || Date.now()
                        ).toLocaleDateString()}</span>
                    </div>
                    <h1 class="text-3xl md:text-4xl font-display font-bold text-pr-primary mb-4">${
                      articleData.title
                    }</h1>
                    ${
                      articleData.excerpt
                        ? `<p class="text-lg text-pr-secondary leading-relaxed">${articleData.excerpt}</p>`
                        : ''
                    }
                </header>

                ${
                  articleData.youtube_embed_url
                    ? `
                <div class="mb-6">
                    <div class="aspect-w-16 aspect-h-9">
                        <iframe src="${articleData.youtube_embed_url}" frameborder="0" allowfullscreen class="w-full h-64 md:h-96 rounded-lg"></iframe>
                    </div>
                </div>
                `
                    : ''
                }

                <div class="prose prose-lg max-w-none text-pr-primary">
                    ${articleData.content}
                </div>

                ${
                  articleData.sources
                    ? `
                <div class="mt-8 p-4 bg-pr-background bg-opacity-10 rounded-lg">
                    <h3 class="font-bold text-pr-primary mb-2">Sources</h3>
                    <div class="text-sm text-pr-secondary whitespace-pre-line">${articleData.sources}</div>
                </div>
                `
                    : ''
                }

                ${
                  articleData.tags
                    ? `
                <div class="mt-6 flex flex-wrap gap-2">
                    ${articleData.tags
                      .split(',')
                      .map(
                        (tag) =>
                          `<span class="bg-pr-secondary text-white px-3 py-1 rounded-full text-sm">${tag.trim()}</span>`
                      )
                      .join('')}
                </div>
                `
                    : ''
                }
            </div>
        </article>
    </main>

    <!-- Footer -->
    <footer class="bg-pr-primary text-pr-text-accent py-8 mt-12">
        <div class="container mx-auto px-4 text-center">
            <p>&copy; 2024 The News Curator. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;
  }

  async disconnect() {
    this.client.close();
    console.log('🔌 Disconnected from FTP server');
  }
}

module.exports = FTPPublisher;
