const ftp = require('basic-ftp');
require('dotenv').config();

class LiveSiteCleanup {
  constructor() {
    this.client = new ftp.Client();
    this.client.ftp.verbose = true;
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

  async removeFile(filePath) {
    try {
      await this.client.remove(filePath);
      console.log(`🗑️  Removed: ${filePath}`);
      return true;
    } catch (error) {
      if (error.code === 550) {
        console.log(`⚠️  File not found (already removed): ${filePath}`);
      } else {
        console.log(`❌ Failed to remove ${filePath}: ${error.message}`);
      }
      return false;
    }
  }

  async removeDirectory(dirPath) {
    try {
      await this.client.removeDir(dirPath);
      console.log(`🗑️  Removed directory: ${dirPath}`);
      return true;
    } catch (error) {
      if (error.code === 550) {
        console.log(`⚠️  Directory not found (already removed): ${dirPath}`);
      } else {
        console.log(
          `❌ Failed to remove directory ${dirPath}: ${error.message}`
        );
      }
      return false;
    }
  }

  async cleanupLiveSite() {
    console.log('🧹 Starting live site cleanup...');

    // Files to remove (based on our local cleanup)
    const filesToRemove = [
      // Clean-Sweep Processor
      'clean-sweep-processor.html',

      // Verification System
      'verification-dashboard.html',
      'verification-preview.html',

      // Transparency System
      'transparency.html',
      'transparency-report.html',
      'transparency-page.html',

      // Content Manager and Unused Pages
      'content-manager.html',
      'sample-index.html',
      'index-clean.html',
      'login.html',

      // Unused Data Files
      'autofill_data.json',
      'instructions.txt',

      // Test and temporary files
      'task-8-execution-summary.md',
      'create-new.html',
      'create-simple.html',
      'simple-test.html',
      'article-new-test.html',
      'article-final.html',
      'check-articles.html',
      'article-fixed.html',
      'article-new.html',
      'article-page.html',
      'detailed-test.html',
      'run-comprehensive-test.html',
      'simple-create.html',
      'reading-suggestions-article.html',
      'verify.html',
    ];

    // Directories to remove
    const directoriesToRemove = ['external-program'];

    let removedFiles = 0;
    let removedDirs = 0;

    // Remove files
    for (const file of filesToRemove) {
      if (await this.removeFile(file)) {
        removedFiles++;
      }
      // Small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Remove directories
    for (const dir of directoriesToRemove) {
      if (await this.removeDirectory(dir)) {
        removedDirs++;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Cleanup completed!`);
    console.log(`📄 Files removed: ${removedFiles}/${filesToRemove.length}`);
    console.log(
      `📁 Directories removed: ${removedDirs}/${directoriesToRemove.length}`
    );
  }

  async disconnect() {
    this.client.close();
    console.log('🔌 Disconnected from FTP server');
  }
}

async function main() {
  const cleanup = new LiveSiteCleanup();

  if (await cleanup.connect()) {
    await cleanup.cleanupLiveSite();
    await cleanup.disconnect();
  }
}

main().catch(console.error);
