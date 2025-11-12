const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function uploadAPIFiles() {
  const client = new ftp.Client();

  try {
    console.log('🔗 Connecting to FTP server...');
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: false,
    });

    console.log('📁 Creating /api directory...');
    try {
      await client.ensureDir('/api');
    } catch (error) {
      console.log('Directory might already exist, continuing...');
    }

    console.log('📄 Uploading articles.json...');
    await client.uploadFrom(
      path.join(__dirname, '../public/api/articles.json'),
      '/api/articles.json'
    );

    console.log('📁 Creating /api/articles directory...');
    try {
      await client.ensureDir('/api/articles');
    } catch (error) {
      console.log('Directory might already exist, continuing...');
    }

    // Upload individual article files
    const articlesDir = path.join(__dirname, '../public/api/articles');
    const files = fs.readdirSync(articlesDir);

    console.log(`📄 Uploading ${files.length} individual article files...`);
    for (const file of files) {
      if (file.endsWith('.json')) {
        console.log(`  Uploading ${file}...`);
        await client.uploadFrom(
          path.join(articlesDir, file),
          `/api/articles/${file}`
        );
      }
    }

    console.log('✅ All API files uploaded successfully!');
  } catch (error) {
    console.error('❌ Upload failed:', error);
  } finally {
    client.close();
  }
}

uploadAPIFiles();
