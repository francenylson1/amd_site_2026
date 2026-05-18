'use strict';

/**
 * Núcleo de processamento de vídeos: comprime MP4 com H.264 + gera poster WebP.
 * Requer ffmpeg instalado no sistema (winget install Gyan.FFmpeg).
 * Usado pelo watcher (dev) e pelo otimizador em lote (optimize-videos).
 */

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');

const execFileAsync = util.promisify(execFile);

const VIDEO_EXTS = /\.(mp4|mov|avi|mkv)$/i;

function isSourceVideo(filePath) {
  return VIDEO_EXTS.test(filePath);
}

function getPosterPath(filePath) {
  return filePath.replace(VIDEO_EXTS, '.webp');
}

function isUpToDate(srcPath, posterPath) {
  if (!fs.existsSync(posterPath)) return false;
  return fs.statSync(posterPath).mtimeMs > fs.statSync(srcPath).mtimeMs;
}

async function checkFfmpeg() {
  try {
    await execFileAsync('ffmpeg', ['-version']);
    return true;
  } catch {
    return false;
  }
}

async function processVideo(filePath) {
  if (!isSourceVideo(filePath)) return false;

  const posterPath = getPosterPath(filePath);
  if (isUpToDate(filePath, posterPath)) return false;

  const name = path.basename(filePath);
  const origSize = fs.statSync(filePath).size;
  const origKB = Math.round(origSize / 1024);

  // Passo 1: comprimir vídeo (H.264 CRF 23 + AAC 128k + faststart para web)
  process.stdout.write(`  ⏳  ${name}: comprimindo...`);
  const tmpPath = filePath + '.tmp.mp4';
  await execFileAsync('ffmpeg', [
    '-i', filePath,
    '-vcodec', 'libx264',
    '-crf', '23',
    '-preset', 'fast',
    '-acodec', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    '-y',
    tmpPath,
  ]);

  const newSize = fs.statSync(tmpPath).size;
  const newKB = Math.round(newSize / 1024);

  if (newSize < origSize) {
    fs.renameSync(tmpPath, filePath);
    const saving = Math.round((1 - newSize / origSize) * 100);
    process.stdout.write(` ${origKB}KB → ${newKB}KB (-${saving}%)\n`);
  } else {
    fs.unlinkSync(tmpPath);
    process.stdout.write(` sem ganho (já otimizado, ${origKB}KB)\n`);
  }

  // Passo 2: gerar poster WebP do primeiro frame (largura máxima 1280px)
  await execFileAsync('ffmpeg', [
    '-i', filePath,
    '-vframes', '1',
    '-vf', 'scale=1280:-1',
    '-y',
    posterPath,
  ]);

  const posterKB = Math.round(fs.statSync(posterPath).size / 1024);
  console.log(`  ✓  ${name} → ${path.basename(posterPath)} (poster ${posterKB}KB)`);

  return true;
}

module.exports = { processVideo, isSourceVideo, checkFfmpeg };
