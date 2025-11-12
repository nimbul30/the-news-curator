const ftp = require('basic-ftp');
const path = require('path');
require('dotenv').config();

async function uploadAPI() {
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

    console.log('✅ API files uploaded successfully!');
  } catch (error) {
    console.error('❌ Upload failed:', error);
  } finally {
    client.close();
  }
}

uploadAPI();
