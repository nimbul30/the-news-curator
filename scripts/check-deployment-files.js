#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Check what files will be deployed to FTP
 * This helps verify your file structure is optimized
 */

class DeploymentChecker {
  constructor() {
    this.publicDir = path.join(__dirname, '../public');
    this.filesToDeploy = [];
    this.filesToSkip = [];
  }

  /**
   * Check if directory should be skipped (same logic as deploy script)
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
   * Check if file should be skipped (same logic as deploy script)
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
   * Scan directory recursively
   */
  scanDirectory(dirPath, relativePath = '') {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const relativeFilePath = path
        .join(relativePath, file)
        .replace(/\\/g, '/');
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (this.shouldSkipDirectory(file)) {
          this.filesToSkip.push(`📁 ${relativeFilePath}/ (directory)`);
          continue;
        }
        this.scanDirectory(fullPath, relativeFilePath);
      } else {
        if (this.shouldSkipFile(file)) {
          this.filesToSkip.push(`📄 ${relativeFilePath}`);
        } else {
          this.filesToDeploy.push(`📄 ${relativeFilePath}`);
        }
      }
    }
  }

  /**
   * Run the check
   */
  check() {
    console.log('🔍 Checking deployment file structure...\n');

    // Check if public directory exists
    if (!fs.existsSync(this.publicDir)) {
      console.error('❌ Public directory not found!');
      return;
    }

    // Scan from project root
    this.scanDirectory(path.join(__dirname, '..'));

    // Display results
    console.log('✅ FILES THAT WILL BE DEPLOYED:');
    console.log('================================');
    this.filesToDeploy.forEach((file) => console.log(file));

    console.log('\n⏭️  FILES THAT WILL BE SKIPPED:');
    console.log('===============================');
    this.filesToSkip.forEach((file) => console.log(file));

    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log(`✅ Files to deploy: ${this.filesToDeploy.length}`);
    console.log(`⏭️  Files to skip: ${this.filesToSkip.length}`);
    console.log(
      `📁 Total files checked: ${
        this.filesToDeploy.length + this.filesToSkip.length
      }`
    );

    // Check for important files
    const hasIndex = this.filesToDeploy.some((f) => f.includes('index.html'));
    const hasAssets = this.filesToDeploy.some((f) => f.includes('assets/'));
    const hasCSS = this.filesToDeploy.some((f) => f.includes('css/'));
    const hasJS = this.filesToDeploy.some((f) => f.includes('js/'));

    console.log('\n🎯 ESSENTIAL FILES CHECK:');
    console.log('=========================');
    console.log(`${hasIndex ? '✅' : '❌'} index.html found`);
    console.log(`${hasAssets ? '✅' : '❌'} Assets directory found`);
    console.log(`${hasCSS ? '✅' : '❌'} CSS files found`);
    console.log(`${hasJS ? '✅' : '❌'} JavaScript files found`);

    if (hasIndex && hasAssets && hasCSS && hasJS) {
      console.log('\n🎉 Your file structure is optimized for deployment!');
    } else {
      console.log('\n⚠️  Some essential files might be missing.');
    }
  }
}

// Run the check
const checker = new DeploymentChecker();
checker.check();
