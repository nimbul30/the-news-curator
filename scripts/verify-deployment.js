#!/usr/bin/env node

const ftp = require('basic-ftp');
require('dotenv').config();

/**
 * Verify files are in the correct location
 */

async function verifyDeployment() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    console.log('🔍 Verifying deployment in public_html...\n');

    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: 21,
      secure: false,
    });

    console.log('✅ Connected to FTP server\n');

    // Check public_html directory
    await client.cd('/public_html');
    console.log('📁 Contents of /public_html/:');

    const list = await client.list();
    const importantFiles = [
      'index.html',
      'article.html',
      'about.html',
      'test.html',
    ];

    console.log('\n🔍 Looking for key files:');
    importantFiles.forEach((filename) => {
      const found = list.find((item) => item.name === filename);
      if (found) {
        console.log(`✅ ${filename} - Found (${found.size} bytes)`);
      } else {
        console.log(`❌ ${filename} - Missing`);
      }
    });

    console.log('\n📁 All files in public_html:');
    list.forEach((item) => {
      const icon = item.isDirectory ? '📁' : '📄';
      const size = item.isDirectory ? '' : ` (${item.size} bytes)`;
      console.log(`${icon} ${item.name}${size}`);
    });

    // Check if there are subdirectories that might be the real web root
    const directories = list.filter((item) => item.isDirectory);
    if (directories.length > 0) {
      console.log('\n🔍 Checking subdirectories for potential web roots:');
      for (const dir of directories) {
        if (['www', 'html', 'htdocs', 'web'].includes(dir.name.toLowerCase())) {
          console.log(`🌐 Found potential web directory: ${dir.name}`);
          try {
            await client.cd(dir.name);
            const subList = await client.list();
            console.log(`   Contents of ${dir.name}:`);
            subList.slice(0, 5).forEach((item) => {
              const icon = item.isDirectory ? '📁' : '📄';
              console.log(`   ${icon} ${item.name}`);
            });
            await client.cd('..');
          } catch (error) {
            console.log(`   ❌ Cannot access ${dir.name}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    client.close();
  }
}

verifyDeployment().catch(console.error);
