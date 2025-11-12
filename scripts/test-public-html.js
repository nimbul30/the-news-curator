#!/usr/bin/env node

const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

/**
 * Test connection to public_html directory
 */

async function testPublicHtml() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('🔄 Testing connection to public_html directory...\n');

    // Connect
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: 21,
      secure: false,
    });

    console.log('✅ Connected to FTP server\n');

    // Try to access public_html
    console.log('📁 Checking for public_html directory...');

    try {
      await client.cd('/public_html');
      console.log('✅ Successfully accessed /public_html directory!');

      // List contents
      console.log('\n📋 Contents of public_html:');
      const list = await client.list();

      if (list.length === 0) {
        console.log('   📂 Directory is empty - perfect for deployment!');
      } else {
        list.forEach((item) => {
          const icon = item.isDirectory ? '📁' : '📄';
          console.log(`   ${icon} ${item.name}`);
        });
      }

      console.log('\n🎯 This is the correct directory for your website files!');
      console.log(
        '🚀 Your website will be accessible at: https://thenewscurator.com/'
      );
    } catch (cdError) {
      console.log('❌ Cannot access /public_html directory');
      console.log('🔍 Let me check what directories are available...');

      // List root directory
      const rootList = await client.list();
      console.log('\n📁 Available directories in root:');
      rootList.forEach((item) => {
        if (item.isDirectory) {
          console.log(`   📁 ${item.name}/`);
          if (
            item.name.toLowerCase().includes('public') ||
            item.name.toLowerCase().includes('www') ||
            item.name.toLowerCase().includes('html')
          ) {
            console.log(`      🌐 ← This might be your web directory!`);
          }
        }
      });
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    client.close();
  }
}

// Run the test
testPublicHtml().catch(console.error);
