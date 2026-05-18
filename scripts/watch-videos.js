'use strict';

/**
 * Watcher automático de vídeos.
 * Iniciado por `npm run dev` — roda em segundo plano enquanto você desenvolve.
 * Todo MP4/MOV/AVI/MKV adicionado em assets/videos/ é comprimido e gera poster WebP.
 * Requer ffmpeg instalado: winget install Gyan.FFmpeg
 */

const chokidar = require('chokidar');
const path = require('path');
const { processVideo, isSourceVideo, checkFfmpeg } = require('./video-processor');

const WATCH_GLOB = 'assets/videos/**/*.{mp4,mov,avi,mkv,MP4,MOV,AVI,MKV}';

async function start() {
  const hasFfmpeg = await checkFfmpeg();

  if (!hasFfmpeg) {
    console.log('\n⚠   Watcher de vídeos: ffmpeg não encontrado.');
    console.log('     Instale com: winget install Gyan.FFmpeg');
    console.log('     Vídeos não serão processados até que o ffmpeg esteja disponível.\n');
    return;
  }

  console.log('\n🎬  Watcher de vídeos ativo');
  console.log('     Monitorando: assets/videos/**/*.{mp4,mov,avi,mkv}');
  console.log('     Novos vídeos serão comprimidos (H.264) e gerarão poster WebP.\n');

  const watcher = chokidar.watch(WATCH_GLOB, {
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 200 },
  });

  async function handle(filePath) {
    if (!isSourceVideo(filePath)) return;
    try {
      await processVideo(filePath);
    } catch (err) {
      console.error(`  ✗  ${path.basename(filePath)}: ${err.message}`);
    }
  }

  watcher
    .on('add', handle)
    .on('change', handle)
    .on('error', err => console.error('  Watcher error:', err));
}

start();
