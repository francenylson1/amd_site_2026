'use strict';

/**
 * Otimizador de vídeos em lote — processa TODOS os vídeos existentes e encerra.
 * Use: npm run videos:optimize
 *
 * Quando usar:
 *  - Primeira vez, para vídeos já nas pastas antes de rodar npm run dev
 *  - Após copiar muitos vídeos de uma vez
 *  - Para regenerar posters após mudar parâmetros
 */

const fs = require('fs');
const path = require('path');
const { processVideo, isSourceVideo, checkFfmpeg } = require('./video-processor');

function findVideos(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findVideos(full, results);
    } else if (isSourceVideo(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

async function main() {
  console.log('\n🔧  Otimizador de vídeos em lote\n');

  const hasFfmpeg = await checkFfmpeg();
  if (!hasFfmpeg) {
    console.error('  ✗  ffmpeg não encontrado. Instale com: winget install Gyan.FFmpeg\n');
    process.exit(1);
  }

  const videos = findVideos('assets/videos');

  if (videos.length === 0) {
    console.log('  Nenhum vídeo MP4/MOV/AVI/MKV encontrado em assets/videos/.');
    console.log('  Coloque seus vídeos nas pastas e rode novamente.\n');
    return;
  }

  console.log(`  Encontrados: ${videos.length} vídeo(s)\n`);
  console.log('  (Processamento pode levar vários minutos — ffmpeg comprime frame a frame)\n');

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const videoPath of videos) {
    try {
      const didProcess = await processVideo(videoPath);
      if (didProcess) processed++;
      else skipped++;
    } catch (err) {
      console.error(`  ✗  ${path.basename(videoPath)}: ${err.message}`);
      errors++;
    }
  }

  console.log('\n  Resultado:');
  console.log(`    ✓ Processados: ${processed}`);
  if (skipped) console.log(`    → Ignorados (poster já atualizado): ${skipped}`);
  if (errors)  console.log(`    ✗ Erros: ${errors}`);
  console.log('');
}

main();
