const fs = require('fs');
const path = require('path');

// Paths
const frontendDir = path.join(__dirname, 'frontend');
const cssDir = path.join(frontendDir, 'css');
const jsDir = path.join(frontendDir, 'js');
const indexPath = path.join(frontendDir, 'index.html');
const newIndexPath = path.join(frontendDir, 'index-new.html');
const cssPath = path.join(cssDir, 'law-theme.css');

// Create directories if they don't exist
if (!fs.existsSync(cssDir)) {
  fs.mkdirSync(cssDir, { recursive: true });
  console.log(`Created CSS directory at ${cssDir}`);
}

if (!fs.existsSync(jsDir)) {
  fs.mkdirSync(jsDir, { recursive: true });
  console.log(`Created JS directory at ${jsDir}`);
}

// Copy the new index.html to the main index.html
if (fs.existsSync(newIndexPath)) {
  fs.copyFileSync(newIndexPath, indexPath);
  console.log(`Updated index.html with new version from ${newIndexPath}`);
} else {
  console.log(`New index file not found at ${newIndexPath}`);
}

console.log('Frontend update completed successfully!');