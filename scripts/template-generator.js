#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Template Generator for The News Curator
 * Creates new pages using article.html as a template
 */

class TemplateGenerator {
  constructor() {
    this.templatePath = path.join(__dirname, '../public/article.html');
    this.outputDir = path.join(__dirname, '../public');
  }

  /**
   * Create a new page from template
   * @param {Object} options - Page configuration
   * @param {string} options.filename - Output filename (without .html)
   * @param {string} options.title - Page title
   * @param {string} options.content - Main content HTML
   * @param {string} options.layout - Layout type: 'single', 'two-column', 'full-width'
   */
  createPage(options) {
    const { filename, title, content, layout = 'single' } = options;

    if (!filename || !title || !content) {
      throw new Error('filename, title, and content are required');
    }

    // Read template
    let template = fs.readFileSync(this.templatePath, 'utf8');

    // Replace title
    template = template.replace(
      /<title>.*?<\/title>/,
      `<title>${title} - The News Curator</title>`
    );

    // Generate main content based on layout
    const mainContent = this.generateMainContent(content, layout);

    // Replace main content section
    template = template.replace(/<main[\s\S]*?<\/main>/, mainContent);

    // Write new file
    const outputPath = path.join(this.outputDir, `${filename}.html`);
    fs.writeFileSync(outputPath, template);

    console.log(`✅ Created: ${outputPath}`);
    return outputPath;
  }

  /**
   * Generate main content with specified layout
   */
  generateMainContent(content, layout) {
    switch (layout) {
      case 'single':
        return `<main class="container mx-auto w-full max-w-4xl flex-grow px-4 py-8 md:py-12">
        <div class="max-w-3xl mx-auto">
          ${content}
        </div>
      </main>`;

      case 'two-column':
        return `<main class="container mx-auto w-full max-w-6xl flex-grow px-4 py-8 md:py-12">
        <div class="grid grid-cols-12 gap-8 lg:gap-12">
          <div class="col-span-12 lg:col-span-8">
            ${content}
          </div>
          <aside class="col-span-12 lg:col-span-4">
            <div class="sticky top-24 space-y-8">
              <!-- Sidebar content -->
              <div class="bg-white/50 dark:bg-background-dark/50 p-6 rounded-lg border border-text-secondary/20">
                <h3 class="font-display text-lg font-bold text-accent dark:text-gray-200 mb-3">
                  Related Information
                </h3>
                <p class="text-text-primary/90 dark:text-gray-300">
                  Additional content can be added here.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>`;

      case 'full-width':
        return `<main class="w-full flex-grow">
        ${content}
      </main>`;

      default:
        throw new Error(`Unknown layout: ${layout}`);
    }
  }

  /**
   * Create multiple pages from a configuration file
   */
  createFromConfig(configPath) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const results = [];

    for (const pageConfig of config.pages) {
      try {
        const result = this.createPage(pageConfig);
        results.push({ success: true, file: result });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          config: pageConfig,
        });
      }
    }

    return results;
  }
}

// CLI Usage
if (require.main === module) {
  const generator = new TemplateGenerator();

  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: node template-generator.js [options]

Options:
  --config <file>     Create pages from JSON config file
  --filename <name>   Page filename (without .html)
  --title <title>     Page title
  --content <html>    Main content HTML
  --layout <type>     Layout: single, two-column, full-width (default: single)

Examples:
  node template-generator.js --filename contact --title "Contact Us" --content "<h1>Contact</h1><p>Get in touch</p>"
  node template-generator.js --config pages-config.json
    `);
    process.exit(1);
  }

  // Parse arguments
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    if (key && value) {
      options[key] = value;
    }
  }

  try {
    if (options.config) {
      const results = generator.createFromConfig(options.config);
      console.log('Batch creation results:', results);
    } else {
      generator.createPage(options);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = TemplateGenerator;
