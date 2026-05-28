const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TARGET_DIR = path.join(__dirname, 'public', 'products');
const MAX_WIDTH = 1600; // Generous width for premium zoom quality
const QUALITY = 82;     // Crisp detail with highly optimized file size

async function optimizeImages() {
  if (!fs.existsSync(TARGET_DIR)) {
    console.error(`Target directory not found: ${TARGET_DIR}`);
    return;
  }

  const files = fs.readdirSync(TARGET_DIR);
  console.log(`Scanning ${files.length} files in ${TARGET_DIR}...\n`);

  let totalSavedBytes = 0;
  let totalOriginalBytes = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      continue;
    }

    const filePath = path.join(TARGET_DIR, file);
    const stats = fs.statSync(filePath);
    const originalSize = stats.size;
    totalOriginalBytes += originalSize;

    // Skip small images (< 150 KB) to avoid unnecessary processing
    if (originalSize < 150 * 1024 && file !== 'Urban Vein logo.png') {
      console.log(`Skipping ${file} (already small: ${(originalSize / 1024).toFixed(1)} KB)`);
      continue;
    }

    console.log(`Processing ${file} (Original: ${(originalSize / (1024 * 1024)).toFixed(2)} MB)...`);

    try {
      const tempPath = path.join(TARGET_DIR, `temp_${file}`);
      const image = sharp(filePath);
      const metadata = await image.metadata();

      // Setup resize options: fit inside MAX_WIDTH but do not upscale
      const resizeOptions = metadata.width > MAX_WIDTH ? { width: MAX_WIDTH, withoutEnlargement: true } : null;

      let pipeline = image;
      if (resizeOptions) {
        pipeline = pipeline.resize(resizeOptions);
      }

      if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({
          quality: QUALITY,
          progressive: true,
          mozjpeg: true // Better compression using mozjpeg algorithm
        });
      } else if (ext === '.png') {
        pipeline = pipeline.png({
          quality: QUALITY,
          compressionLevel: 9,
          palette: true // Quantize color palette for smaller size
        });
      }

      await pipeline.toFile(tempPath);

      const newStats = fs.statSync(tempPath);
      const optimizedSize = newStats.size;

      // Replace original file with optimized file
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);

      const saved = originalSize - optimizedSize;
      totalSavedBytes += saved;

      console.log(`✓ Optimized ${file}: ${(originalSize / 1024).toFixed(1)} KB -> ${(optimizedSize / 1024).toFixed(1)} KB | Saved: ${(saved / (1024 * 1024)).toFixed(2)} MB (${((saved / originalSize) * 100).toFixed(1)}% reduction)`);
    } catch (err) {
      console.error(`✗ Error processing ${file}:`, err.message);
    }
  }

  console.log('\n--- Optimization Complete ---');
  console.log(`Original total size: ${(totalOriginalBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Total saved space: ${(totalSavedBytes / (1024 * 1024)).toFixed(2)} MB (${((totalSavedBytes / totalOriginalBytes) * 100).toFixed(1)}% reduction)`);
}

optimizeImages();
