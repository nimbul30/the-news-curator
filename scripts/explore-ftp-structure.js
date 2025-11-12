#!/usr/bin/env node

const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

/**
 * Explore FTP directory structure to find the correct web root
 */

async function exploreFTPStructure() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('🔍 Exploring FTP directory structure...\n');

    // Connect
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: 21,
      secure: false,
    });

    console.log('✅ Connected to FTP server\n');

    // Function to list directory contents recursively
    async function exploreDirectory(dirPath, depth = 0) {
      if (depth > 2) return; // Limit depth to avoid infinite recursion

      const indent = '  '.repeat(depth);
      console.log(`${indent}📁 ${dirPath}/`);

      try {
        await client.cd(dirPath);
        const list = await client.list();

        for (const item of list) {
          if (item.isDirectory) {
            console.log(`${indent}  📁 ${item.name}/`);

            // Look for common web directories
            if (
              ['public_html', 'www', 'htdocs', 'web', 'html'].includes(
                item.name.toLowerCase()
              )
            ) {
              console.log(`${indent}    🌐 ← POTENTIAL WEB ROOT!`);

              // Explore this directory
              try {
                await client.cd(item.name);
                const webList = await client.list();
                console.log(`${indent}    Contents:`);
                webList.forEach((webItem) => {
                  const icon = webItem.isDirectory ? '📁' : '📄';
                  console.log(`${indent}      ${icon} ${webItem.name}`);
                });
                await client.cd('..');
              } catch (error) {
                console.log(`${indent}    ❌ Cannot access ${item.name}`);
              }
            }
          } else {
            console.log(`${indent}  📄 ${item.name}`);
          }
        }
      } catch (error) {
        console.log(`${indent}❌ Cannot list directory: ${error.message}`);
      }
    }

    // Start exploration from root
    await exploreDirectory('/');

    // Check if we can find index.html in current location
    console.log('\n🔍 Looking for index.html in current directory...');
    const rootList = await client.list();
    const hasIndex = rootList.some((item) => item.name === 'index.html');

    if (hasIndex) {
      console.log('✅ index.html found in root directory!');
      console.log(
        '🌐 Your website should be accessible at: https://thenewscurator.com/'
      );
    } else {
      console.log('❌ index.html not found in root directory');
      console.log(
        '🔍 You may need to deploy to a subdirectory like public_html/'
      );
    }
  } catch (error) {
    console.error('❌ FTP exploration failed:', error.message);
  } finally {
    client.close();
  }
}

// Run the exploration
exploreFTPStructure().catch(console.error);
