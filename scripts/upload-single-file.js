const ftp = require('basic-ftp');
const path = require('path');
require('dotenv').config();

async function uploadFile(localPath, remotePath) {
  const client = new ftp.Client();

  try {
    console.log('🔗 Connecting to FTP server...');
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: false,
    });

    console.log(`📄 Uploading ${localPath} to ${remotePath}...`);
    await client.uploadFrom(localPath, remotePath);

    console.log('✅ File uploaded successfully!');
  } catch (error) {
    console.error('❌ Upload failed:', error);
  } finally {
    client.close();
  }
}

// Get command line arguments
const localFile = process.argv[2];
const remoteFile = process.argv[3];

if (!localFile || !remoteFile) {
  console.error('Usage: node upload-single-file.js <local-path> <remote-path>');
  process.exit(1);
}

uploadFile(localFile, remoteFile);
