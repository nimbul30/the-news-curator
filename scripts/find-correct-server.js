#!/usr/bin/env node

const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

/**
 * Help find the correct FTP server for your domain
 */

async function findCorrectServer() {
  console.log('🔍 Finding the correct FTP server for your domain...\n');

  // Common Namecheap FTP server patterns
  const possibleServers = [
    'thenewscurator.com',
    'ftp.thenewscurator.com',
    'www.thenewscurator.com',
    'server.thenewscurator.com',
    'host.thenewscurator.com',
    // Namecheap shared hosting servers
    'server1.web-hosting.com',
    'server2.web-hosting.com',
    'bh-in-1.webhostbox.net',
    'bh-in-2.webhostbox.net',
    'bh-in-3.webhostbox.net',
    'bh-in-4.webhostbox.net',
    'bh-in-5.webhostbox.net',
  ];

  console.log('🧪 Testing different FTP servers...\n');

  for (const server of possibleServers) {
    console.log(`🔄 Testing: ${server}`);

    const client = new ftp.Client();
    client.ftp.verbose = false; // Reduce noise

    try {
      await client.access({
        host: server,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD,
        port: 21,
        secure: false,
      });

      console.log(`✅ SUCCESS: Connected to ${server}`);

      // Check if this server has a public_html directory
      try {
        const list = await client.list();
        const hasPublicHtml = list.some(
          (item) => item.name === 'public_html' && item.isDirectory
        );

        if (hasPublicHtml) {
          console.log(`🌐 FOUND public_html directory on ${server}!`);
          console.log(`🎯 This is likely your correct web server!`);

          // Check what's in public_html
          await client.cd('public_html');
          const publicList = await client.list();
          console.log(`📁 Contents of public_html:`);
          publicList.forEach((item) => {
            const icon = item.isDirectory ? '📁' : '📄';
            console.log(`   ${icon} ${item.name}`);
          });

          client.close();
          return server;
        } else {
          console.log(`   📁 Root directory contents:`);
          list.slice(0, 5).forEach((item) => {
            const icon = item.isDirectory ? '📁' : '📄';
            console.log(`   ${icon} ${item.name}`);
          });
        }
      } catch (listError) {
        console.log(`   ❌ Cannot list directory: ${listError.message}`);
      }

      client.close();
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message.split('\n')[0]}`);
    }

    console.log(''); // Empty line for readability
  }

  console.log(
    '🔍 If none of these worked, check your Namecheap cPanel for the correct FTP server details.'
  );
}

// Run the server finder
findCorrectServer().catch(console.error);
