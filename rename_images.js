const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'products');

const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.jpeg')) {
    const oldPath = path.join(dir, file);
    const newName = file.toLowerCase().replace(/ /g, '_').replace('.jpeg', '.jpg');
    const newPath = path.join(dir, newName);
    
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${file} -> ${newName}`);
  }
});
