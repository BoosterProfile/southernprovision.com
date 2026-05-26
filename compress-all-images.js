#!/usr/bin/env node
/**
 * compress-all-images.js
 * Converts all .png/.jpg/.jpeg images in the project to .webp at 75% quality,
 * updates HTML references (src and CSS url()), and deletes the originals.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = __dirname;
const SKIP_DIRS = ['node_modules', 'temporary screenshots', '.git'];
const IMG_EXTS = ['.png', '.jpg', '.jpeg'];
const HTML_EXTS = ['.html'];

// ---- 1. Recursively find files ----
function findFiles(dir, extensions) {
  const results = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return results; }
  for (const entry of entries) {
    if (SKIP_DIRS.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(full, extensions));
    } else if (extensions.includes(path.extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

// ---- 2. Convert one image to WebP ----
async function convertToWebP(imgPath) {
  const dir = path.dirname(imgPath);
  const ext = path.extname(imgPath);
  const base = path.basename(imgPath, ext);
  const webpPath = path.join(dir, base + '.webp');

  if (fs.existsSync(webpPath)) {
    console.log(`  SKIP (already exists): ${path.relative(PROJECT_ROOT, webpPath)}`);
    return webpPath;
  }

  try {
    await sharp(imgPath).webp({ quality: 75 }).toFile(webpPath);
    const origSize = fs.statSync(imgPath).size;
    const newSize = fs.statSync(webpPath).size;
    const saved = Math.round((1 - newSize / origSize) * 100);
    console.log(`  OK: ${path.relative(PROJECT_ROOT, imgPath)} → .webp (${saved}% smaller)`);
    return webpPath;
  } catch (err) {
    console.error(`  ERROR: ${path.relative(PROJECT_ROOT, imgPath)}: ${err.message}`);
    return null;
  }
}

// ---- 3. Build a map of basename → new basename for fast HTML replacement ----
function updateHTMLFiles(conversions) {
  // Build a set of (origBasename → webpBasename) pairs
  const renames = conversions.map(({ original, webp }) => ({
    origBase: path.basename(original),
    webpBase: path.basename(webp),
    origExt: path.extname(original),
  }));

  const htmlFiles = findFiles(PROJECT_ROOT, HTML_EXTS);

  for (const htmlPath of htmlFiles) {
    let content = fs.readFileSync(htmlPath, 'utf8');
    const before = content;

    for (const { origBase, webpBase } of renames) {
      // Escape special regex chars in the filename
      const escaped = origBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Replace in src="...filename..." (not in href= for favicons)
      content = content.replace(
        new RegExp(`(src=["'][^"']*?)${escaped}`, 'g'),
        (m, pre) => pre + webpBase
      );
      // Replace in CSS url('...') and url("...")
      content = content.replace(
        new RegExp(`(url\\(["']?[^"')]*?)${escaped}`, 'g'),
        (m, pre) => pre + webpBase
      );
    }

    if (content !== before) {
      fs.writeFileSync(htmlPath, content, 'utf8');
      console.log(`  HTML refs updated: ${path.relative(PROJECT_ROOT, htmlPath)}`);
    }
  }
}

// ---- 4. Add loading="lazy" decoding="async" to all img tags in all HTML files ----
function addLazyLoadingToAllHTML() {
  const htmlFiles = findFiles(PROJECT_ROOT, HTML_EXTS);
  for (const htmlPath of htmlFiles) {
    let content = fs.readFileSync(htmlPath, 'utf8');
    const before = content;

    content = content.replace(/<img\b([^>]*?)(\s*\/?>)/gi, (match, attrs, closing) => {
      let updated = attrs;
      if (!/decoding\s*=/i.test(updated)) updated += ' decoding="async"';
      if (!/loading\s*=/i.test(updated)) updated += ' loading="lazy"';
      return `<img${updated}${closing}`;
    });

    if (content !== before) {
      fs.writeFileSync(htmlPath, content, 'utf8');
      console.log(`  Lazy loading added: ${path.relative(PROJECT_ROOT, htmlPath)}`);
    }
  }
}

// ---- Main ----
(async () => {
  console.log('=== compress-all-images.js ===\n');

  const imageFiles = findFiles(PROJECT_ROOT, IMG_EXTS);
  console.log(`Found ${imageFiles.length} image(s) to process.\n`);

  const conversions = [];
  const toDelete = [];

  for (const imgPath of imageFiles) {
    process.stdout.write(`Converting: ${path.relative(PROJECT_ROOT, imgPath)}\n`);
    const webpPath = await convertToWebP(imgPath);
    if (webpPath) {
      conversions.push({ original: imgPath, webp: webpPath });
      toDelete.push(imgPath);
    }
  }

  console.log(`\n=== Updating HTML references (${conversions.length} conversions) ===\n`);
  updateHTMLFiles(conversions);

  console.log('\n=== Adding lazy loading / decoding to all HTML ===\n');
  addLazyLoadingToAllHTML();

  console.log('\n=== Deleting original images ===\n');
  for (const imgPath of toDelete) {
    try {
      fs.unlinkSync(imgPath);
      console.log(`  Deleted: ${path.relative(PROJECT_ROOT, imgPath)}`);
    } catch (err) {
      console.error(`  Could not delete ${imgPath}: ${err.message}`);
    }
  }

  console.log('\n=== Done! ===');
  console.log(`Converted: ${conversions.length} images`);
  console.log(`Deleted:   ${toDelete.length} originals`);
})();
