#!/usr/bin/env node

const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

/**
 * Test FTP Connection to Namecheap
 * This script helps you verify your FTP credentials work
 */

async function testConnection() {
  // Load config
  let config = {};
  const configPath = path.join(__dirname, 'deploy-config.json');

  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  // Use environment variables if available
  const ftpConfig = {
    host: config.host || process.env.FTP_HOST,
    user: config.user || process.env.FTP_USER,
    password: config.password || process.env.FTP_PASSWORD,
    port: config.port || 21,
    secure: config.secure || false,
  };

  if (!ftpConfig.host || !ftpConfig.user || !ftpConfig.password) {
    console.error('❌ Missing FTP credentials!');
    console.log('\n📋 Please set your credentials in one of these ways:');
    console.log('1. Edit .env file with your FTP details');
    console.log('2. Edit scripts/deploy-config.json');
    console.log('\nRequired fields:');
    console.log('- FTP_HOST (your domain, e.g., yourdomain.com)');
    console.log('- FTP_USER (your FTP username)');
    console.log('- FTP_PASSWORD (your FTP password)');
    return;
  }

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('🔄 Testing FTP connection...');
    console.log(`📡 Connecting to: ${ftpConfig.host}`);
    console.log(`👤 Username: ${ftpConfig.user}`);

    await client.access(ftpConfig);
    console.log('✅ FTP connection successful!');

    // Test directory listing
    console.log('\n📁 Listing root directory:');
    const list = await client.list();
    list.forEach((item) => {
      const type = item.isDirectory ? '📁' : '📄';
      console.log(`${type} ${item.name}`);
    });

    // Check if public_html exists
    const publicHtmlExists = list.some(
      (item) => item.name === 'public_html' && item.isDirectory
    );
    if (publicHtmlExists) {
      console.log('\n✅ Found public_html directory - ready for deployment!');
    } else {
      console.log(
        '\n⚠️  No public_html directory found. Your files might go in the root directory.'
      );
    }
  } catch (error) {
    console.error('❌ FTP connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Double-check your FTP credentials in Namecheap cPanel');
    console.log('2. Make sure FTP access is enabled for your hosting');
    console.log('3. Try using your domain name as the host');
    console.log('4. Some hosts use different ports (try 22 for SFTP)');
  } finally {
    client.close();
  }
}

// Run the test
testConnection().catch(console.error);
