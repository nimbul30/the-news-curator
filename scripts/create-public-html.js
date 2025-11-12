#!/usr/bin/env node

const ftp = require('basic-ftp');
require('dotenv').config();

/**
 * Create public_html directory and deploy there
 */

async function createPublicHtml() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('🔄 Creating public_html directory and deploying...\n');

    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: 21,
      secure: false,
    });

    console.log('✅ Connected to FTP server\n');

    // Try to create public_html directory
    try {
      await client.ensureDir('/public_html');
      console.log('✅ Created/ensured public_html directory exists');

      // Upload a test file to public_html
      const testContent = `<!DOCTYPE html>
<html>
<head>
    <title>Test - The News Curator</title>
</head>
<body>
    <h1>Success! This is the correct directory!</h1>
    <p>Your website files should go in the public_html directory.</p>
    <p>If you see this, your FTP is working correctly.</p>
</body>
</html>`;

      // Write test file locally
      const fs = require('fs');
      fs.writeFileSync('test-public-html.html', testContent);

      // Upload to public_html
      await client.uploadFrom(
        'test-public-html.html',
        '/public_html/test.html'
      );
      console.log('✅ Uploaded test file to public_html/test.html');

      // Clean up local test file
      fs.unlinkSync('test-public-html.html');

      console.log(
        '\n🌐 Now try visiting: https://thenewscurator.com/test.html'
      );
      console.log(
        '🎯 If you see the test page, then public_html is the correct directory!'
      );
    } catch (error) {
      console.log('❌ Could not create public_html directory:', error.message);
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    client.close();
  }
}

createPublicHtml().catch(console.error);
