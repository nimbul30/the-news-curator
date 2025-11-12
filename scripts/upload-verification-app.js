const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function uploadVerificationApp() {
  const client = new ftp.Client();

  try {
    // Connect to FTP
    await client.access({
      host: process.env.FTP_HOST || 'ftp.thenewscurator.com',
      user: process.env.FTP_USER || 'deploy@thenewscurator.com',
      password: process.env.FTP_PASSWORD,
      secure: false,
    });

    console.log('✅ Connected to FTP server');

    // Create AI-Verification-Script directory
    try {
      await client.ensureDir('AI-Verification-Script');
      console.log('📁 Created/ensured AI-Verification-Script directory');
    } catch (error) {
      console.log('📁 Directory already exists or created');
    }

    // Upload verifier.html
    const verifierPath = path.join(
      __dirname,
      '..',
      'public',
      'AI Verification Script',
      'verifier.html'
    );
    await client.uploadFrom(
      verifierPath,
      'AI-Verification-Script/verifier.html'
    );
    console.log('📤 Uploaded verifier.html');

    // Upload api-integration.js
    const apiPath = path.join(
      __dirname,
      '..',
      'public',
      'AI Verification Script',
      'api-integration.js'
    );
    await client.uploadFrom(
      apiPath,
      'AI-Verification-Script/api-integration.js'
    );
    console.log('📤 Uploaded api-integration.js');

    console.log('✅ AI Verification app uploaded successfully!');
    console.log(
      '🌐 Access at: https://thenewscurator.com/AI-Verification-Script/verifier.html'
    );
  } catch (error) {
    console.error('❌ Upload failed:', error);
  } finally {
    client.close();
  }
}

uploadVerificationApp();
