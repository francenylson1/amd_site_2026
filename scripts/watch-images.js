'use strict';

/**
 * Watcher automático de imagens.
 * Iniciado por `npm run dev` — roda em segundo plano enquanto você desenvolve.
 * Toda imagem JPG/PNG adicionada em assets/images/ é convertida para WebP automaticamente.
 */

const chokidar = require('chokidar');
const path = require('path');
const { processImage, isSourceImage } = require('./image-processor');

const WATCH_GLOB = 'assets/images/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}';

console.log('\n🖼   Watcher de imagens ativo');
console.log('     Monitorando: assets/images/**/*.{jpg,jpeg,png}');
console.log('     Toda imagem adicionada será convertida para WebP automaticamente.\n');

const watcher = chokidar.watch(WATCH_GLOB, {
  persistent: true,
  ignoreInitial: false, // processa imagens já existentes ao iniciar
  awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
});

async function handle(filePath) {
  if (!isSourceImage(filePath)) return;
  try {
    await processImage(filePath);
  } catch (err) {
    console.error(`  ✗  ${path.basename(filePath)}: ${err.message}`);
  }
}

watcher
  .on('add', handle)
  .on('change', handle)
  .on('error', err => console.error('  Watcher error:', err));
