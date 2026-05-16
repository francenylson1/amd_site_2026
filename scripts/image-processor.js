'use strict';

/**
 * Núcleo de processamento de imagens: redimensiona + gera WebP.
 * Usado pelo watcher (dev) e pelo otimizador em lote (optimize-images).
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Largura máxima por pasta de destino
const MAX_WIDTHS = {
  'assets/images/hero':     1920,
  'assets/images/projetos':  800,
  'assets/images/logo':      512,
  'assets/images/sobre':    1200,
  'assets/images/escolas':   600,
  'assets/images/eventos':  1000,
  'assets/images':           400, // fallback: depoimentos, avatares
};

function getMaxWidth(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  let maxWidth = 1200;
  let bestMatch = 0;
  for (const [dir, width] of Object.entries(MAX_WIDTHS)) {
    if (normalized.includes(dir) && dir.length > bestMatch) {
      maxWidth = width;
      bestMatch = dir.length;
    }
  }
  return maxWidth;
}

function isSourceImage(filePath) {
  return /\.(jpe?g|png)$/i.test(filePath) && !filePath.endsWith('.webp');
}

function getWebpPath(filePath) {
  return filePath.replace(/\.(jpe?g|png)$/i, '.webp');
}

function isUpToDate(srcPath, webpPath) {
  if (!fs.existsSync(webpPath)) return false;
  return fs.statSync(webpPath).mtimeMs > fs.statSync(srcPath).mtimeMs;
}

async function processImage(filePath) {
  if (!isSourceImage(filePath)) return false;

  const webpPath = getWebpPath(filePath);
  if (isUpToDate(filePath, webpPath)) return false;

  const maxWidth = getMaxWidth(filePath);
  const originalSize = fs.statSync(filePath).size;

  await sharp(filePath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(webpPath);

  const newSize = fs.statSync(webpPath).size;
  const saving = Math.round((1 - newSize / originalSize) * 100);
  const origKB = Math.round(originalSize / 1024);
  const newKB = Math.round(newSize / 1024);
  const name = path.basename(filePath);
  const webpName = path.basename(webpPath);

  console.log(`  ✓  ${name}  →  ${webpName}  (${origKB} KB → ${newKB} KB, -${saving}%)`);
  return true;
}

module.exports = { processImage, isSourceImage };
