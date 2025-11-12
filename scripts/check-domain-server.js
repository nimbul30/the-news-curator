#!/usr/bin/env node

const { execSync } = require('child_process');

/**
 * Check what server your domain actually points to
 */

function checkDomainServer() {
  console.log('🔍 Checking what server your domain points to...\n');

  try {
    // Get the IP address your domain points to
    console.log('🌐 Checking DNS for thenewscurator.com:');
    const nslookup = execSync('nslookup thenewscurator.com', {
      encoding: 'utf8',
    });
    console.log(nslookup);

    // Try to get more detailed DNS info
    console.log('\n🔍 Checking A records:');
    try {
      const dig = execSync('nslookup -type=A thenewscurator.com', {
        encoding: 'utf8',
      });
      console.log(dig);
    } catch (error) {
      console.log('Could not get detailed DNS info');
    }
  } catch (error) {
    console.log('❌ Could not check DNS:', error.message);
    console.log(
      '\n💡 This means we need to get the correct FTP server from your Namecheap hosting panel'
    );
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Log into your Namecheap account');
  console.log('2. Go to "Hosting List" (not Domain List)');
  console.log('3. Find your hosting package for thenewscurator.com');
  console.log('4. Get the FTP server details from cPanel');
  console.log('5. Update your .env file with the correct FTP server');
}

checkDomainServer();
