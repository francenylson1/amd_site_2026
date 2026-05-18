'use strict';

/**
 * Otimizador em lote — processa TODAS as imagens existentes e encerra.
 * Use: npm run images:optimize
 *
 * Quando usar:
 *  - Primeira vez, para imagens já nas pastas antes de rodar npm run dev
 *  - Após copiar muitas fotos de uma vez (ex: importação de álbum)
 *  - Para regenerar WebPs após mudar parâmetros de qualidade
 */

const { glob } = require('node:path');
const fs = require('fs');
const path = require('path');
const { processImage, isSourceImage } = require('./image-processor');

async function findImages() {
  // Busca recursiva manual (sem glob externo para manter dependências mínimas)
  const results = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (isSourceImage(entry.name)) {
        results.push(full);
      }
    }
  }
  walk('assets/images');
  return results;
}

async function main() {
  console.log('\n🔧  Otimizador de imagens em lote\n');

  const images = await findImages();

  if (images.length === 0) {
    console.log('  Nenhuma imagem JPG/PNG encontrada em assets/images/.');
    console.log('  Coloque suas fotos nas pastas e rode novamente.\n');
    return;
  }

  console.log(`  Encontradas: ${images.length} imagem(ns)\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const imgPath of images) {
    try {
      const didProcess = await processImage(imgPath);
      if (didProcess) processed++;
      else { skipped++; }
    } catch (err) {
      console.error(`  ✗  ${path.basename(imgPath)}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n  Resultado:`);
  console.log(`    ✓ Processadas: ${processed}`);
  if (skipped)  console.log(`    → Ignoradas (WebP já atualizado): ${skipped}`);
  if (errors)   console.log(`    ✗ Erros: ${errors}`);
  console.log('');
}

main();
