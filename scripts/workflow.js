#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Complete Workflow Automation
 * Handles template generation, building, and deployment
 */

class WorkflowManager {
  constructor() {
    this.scriptsDir = __dirname;
    this.rootDir = path.join(__dirname, '..');
  }

  /**
   * Run command and log output
   */
  runCommand(command, description) {
    console.log(`\n🔄 ${description}...`);
    try {
      const output = execSync(command, {
        cwd: this.rootDir,
        encoding: 'utf8',
        stdio: 'inherit',
      });
      console.log(`✅ ${description} completed`);
      return output;
    } catch (error) {
      console.error(`❌ ${description} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Full deployment workflow
   */
  async fullDeploy() {
    console.log('🚀 Starting full deployment workflow...\n');

    try {
      // Step 1: Install dependencies if needed
      if (!fs.existsSync(path.join(this.rootDir, 'node_modules'))) {
        this.runCommand('npm install', 'Installing dependencies');
      }

      // Step 2: Generate pages from config
      this.runCommand(
        'npm run create-pages',
        'Generating pages from templates'
      );

      // Step 3: Deploy to Namecheap
      this.runCommand('npm run deploy', 'Deploying to Namecheap');

      console.log('\n🎉 Full deployment workflow completed successfully!');
    } catch (error) {
      console.error('\n💥 Deployment workflow failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Quick deployment for changes only
   */
  async quickDeploy() {
    console.log('⚡ Starting quick deployment workflow...\n');

    try {
      // Deploy only changed files
      this.runCommand('npm run deploy-changes', 'Deploying changed files');

      console.log('\n🎉 Quick deployment completed successfully!');
    } catch (error) {
      console.error('\n💥 Quick deployment failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Setup workflow - first time setup
   */
  async setup() {
    console.log('🔧 Setting up deployment workflow...\n');

    try {
      // Install dependencies
      this.runCommand('npm install', 'Installing dependencies');

      // Create .env file template
      const envTemplate = `# Namecheap FTP Credentials
FTP_HOST=your-domain.com
FTP_USER=your-ftp-username
FTP_PASSWORD=your-ftp-password
`;

      const envPath = path.join(this.rootDir, '.env');
      if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, envTemplate);
        console.log('📝 Created .env template file');
      }

      // Make scripts executable
      const scriptFiles = [
        'template-generator.js',
        'deploy-namecheap.js',
        'workflow.js',
      ];

      for (const script of scriptFiles) {
        const scriptPath = path.join(this.scriptsDir, script);
        if (fs.existsSync(scriptPath)) {
          execSync(`chmod +x "${scriptPath}"`);
        }
      }

      console.log('\n✅ Setup completed!');
      console.log('\n📋 Next steps:');
      console.log('1. Edit .env file with your Namecheap FTP credentials');
      console.log(
        '2. Edit scripts/deploy-config.json with your hosting details'
      );
      console.log('3. Run: npm run build-and-deploy');
    } catch (error) {
      console.error('\n💥 Setup failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI Usage
if (require.main === module) {
  const workflow = new WorkflowManager();
  const command = process.argv[2];

  switch (command) {
    case 'setup':
      workflow.setup();
      break;
    case 'full':
    case 'deploy':
      workflow.fullDeploy();
      break;
    case 'quick':
    case 'changes':
      workflow.quickDeploy();
      break;
    default:
      console.log(`
Usage: node workflow.js <command>

Commands:
  setup     - First time setup (install deps, create config files)
  full      - Full deployment (generate pages + deploy all files)
  quick     - Quick deployment (deploy only changed files)

Examples:
  node workflow.js setup
  node workflow.js full
  node workflow.js quick
      `);
  }
}

module.exports = WorkflowManager;
