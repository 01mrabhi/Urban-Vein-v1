const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'products');

const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file === 'Urban Vein logo.png' || file === 'lookbook1.jpg' || file === 'lookbook2.jpg') {
    return; // skip non-product images
  }
  
  const oldPath = path.join(dir, file);
  // Convert to lowercase, replace spaces with underscores, replace .jpeg with .jpg
  const newName = file.toLowerCase()
    .replace(/\s+/g, '_')
    .replace('.jpeg', '.jpg');
    
  const newPath = path.join(dir, newName);
  
  if (oldPath !== newPath) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: "${file}" -> "${newName}"`);
  }
});
