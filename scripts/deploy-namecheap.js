#!/usr/bin/env node

const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables from .env file
require('dotenv').config();

/**
 * Namecheap Deployment Script
 * Automatically deploys your site to Namecheap hosting
 */

class NamecheapDeployer {
  constructor(config) {
    this.config = {
      host: config.host || process.env.FTP_HOST,
      user: config.user || process.env.FTP_USER,
      password: config.password || process.env.FTP_PASSWORD,
      port: config.port || 21,
      secure: config.secure || false,
      remoteDir: config.remoteDir || '/public_html',
      localDir: config.localDir || './public',
      ...config,
    };

    if (!this.config.host || !this.config.user || !this.config.password) {
      throw new Error(
        'FTP credentials are required. Set FTP_HOST, FTP_USER, FTP_PASSWORD environment variables or pass in config.'
      );
    }
  }

  /**
   * Deploy files to Namecheap
   */
  async deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
      console.log('🚀 Starting deployment to Namecheap...');

      // Connect to FTP server
      await client.access({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        port: this.config.port,
        secure: this.config.secure,
      });

      console.log('✅ Connected to FTP server');

      // Change to remote directory
      await client.ensureDir(this.config.remoteDir);
      console.log(`📁 Changed to remote directory: ${this.config.remoteDir}`);

      // Upload files
      await this.uploadDirectory(
        client,
        this.config.localDir,
        this.config.remoteDir
      );

      console.log('🎉 Deployment completed successfully!');
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      throw error;
    } finally {
      client.close();
    }
  }

  /**
   * Upload directory recursively
   */
  async uploadDirectory(client, localDir, remoteDir) {
    const files = fs.readdirSync(localDir);

    for (const file of files) {
      const localPath = path.join(localDir, file);
      const remotePath = `${remoteDir}/${file}`;
      const stat = fs.statSync(localPath);

      if (stat.isDirectory()) {
        // Skip node_modules and other unnecessary directories
        if (this.shouldSkipDirectory(file)) {
          console.log(`⏭️  Skipping directory: ${file}`);
          continue;
        }

        console.log(`📁 Creating directory: ${remotePath}`);
        await client.ensureDir(remotePath);
        await this.uploadDirectory(client, localPath, remotePath);
      } else {
        // Skip unnecessary files
        if (this.shouldSkipFile(file)) {
          console.log(`⏭️  Skipping file: ${file}`);
          continue;
        }

        console.log(`📄 Uploading: ${file}`);
        await client.uploadFrom(localPath, remotePath);
      }
    }
  }

  /**
   * Check if directory should be skipped
   */
  shouldSkipDirectory(dirname) {
    const skipDirs = [
      'node_modules',
      '.git',
      '.kiro',
      'scripts',
      'src',
      'config',
      'tests',
      '.vscode',
      'dist',
      'build',
      'coverage',
      'verification_results',
      '__pycache__',
    ];
    return skipDirs.includes(dirname);
  }

  /**
   * Check if file should be skipped
   */
  shouldSkipFile(filename) {
    const skipFiles = [
      '.gitignore',
      '.env',
      '.env.example',
      'package.json',
      'package-lock.json',
      'README.md',
      '.DS_Store',
      'jest.config.js',
      'webpack.config.js',
      'verification_config.json',
      'test_article.json',
      'test_article2.json',
      'my_article.json',
    ];
    const skipExtensions = ['.md', '.log', '.py', '.test.js', '.spec.js'];

    return (
      skipFiles.includes(filename) ||
      skipExtensions.some((ext) => filename.endsWith(ext))
    );
  }

  /**
   * Deploy only changed files (faster)
   */
  async deployChanges() {
    try {
      // Get list of changed files from git
      const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', {
        encoding: 'utf8',
      })
        .split('\n')
        .filter((file) => file.trim() && file.startsWith('public/'))
        .map((file) => file.replace('public/', ''));

      if (changedFiles.length === 0) {
        console.log('📝 No changes in public directory to deploy');
        return;
      }

      console.log('📋 Changed files:', changedFiles);

      const client = new ftp.Client();
      await client.access({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        port: this.config.port,
        secure: this.config.secure,
      });

      await client.ensureDir(this.config.remoteDir);

      // Upload only changed files
      for (const file of changedFiles) {
        const localPath = path.join(this.config.localDir, file);
        const remotePath = `${this.config.remoteDir}/${file}`;

        if (fs.existsSync(localPath)) {
          console.log(`📄 Uploading changed file: ${file}`);

          // Ensure remote directory exists
          const remoteDir = path.dirname(remotePath);
          await client.ensureDir(remoteDir);

          await client.uploadFrom(localPath, remotePath);
        }
      }

      client.close();
      console.log('🎉 Incremental deployment completed!');
    } catch (error) {
      console.error('❌ Incremental deployment failed:', error.message);
      throw error;
    }
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const isIncremental = args.includes('--incremental') || args.includes('-i');

  // Load config from file or environment
  let config = {};
  const configPath = path.join(__dirname, 'deploy-config.json');

  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  // Override with environment variables if they exist
  if (process.env.FTP_HOST) config.host = process.env.FTP_HOST;
  if (process.env.FTP_USER) config.user = process.env.FTP_USER;
  if (process.env.FTP_PASSWORD) config.password = process.env.FTP_PASSWORD;

  const deployer = new NamecheapDeployer(config);

  if (isIncremental) {
    deployer.deployChanges().catch(console.error);
  } else {
    deployer.deploy().catch(console.error);
  }
}

module.exports = NamecheapDeployer;
