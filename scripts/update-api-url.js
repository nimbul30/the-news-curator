const fs = require('fs');
const path = require('path');

function updateApiUrl(newUrl) {
  const indexPath = path.join(__dirname, '../public/index.html');
  let content = fs.readFileSync(indexPath, 'utf8');

  // Replace the localhost URL with the new Railway URL
  content = content.replace(
    'http://localhost:3001/api/articles',
    `${newUrl}/api/articles`
  );

  fs.writeFileSync(indexPath, content);
  console.log(`✅ Updated API URL to: ${newUrl}/api/articles`);
}

// Get URL from command line argument
const newUrl = process.argv[2];
if (!newUrl) {
  console.error('Usage: node update-api-url.js <railway-url>');
  console.error('Example: node update-api-url.js https://your-app.railway.app');
  process.exit(1);
}

updateApiUrl(newUrl);
