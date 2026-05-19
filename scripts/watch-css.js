'use strict';

/**
 * Watcher de CSS: reconstrói bundle.min.css ao salvar qualquer arquivo CSS.
 * Iniciado por `npm run dev` — roda em segundo plano enquanto você desenvolve.
 */

const chokidar = require('chokidar');
const { execFile } = require('child_process');
const path = require('path');

const CSS_FILES = [
  'assets/css/variables.css',
  'assets/css/main.css',
  'assets/css/animations.css',
  'assets/css/components.css',
  'assets/css/gpio.css',
  'assets/css/responsive.css',
];

const OUTPUT = 'assets/css/bundle.min.css';

function build() {
  execFile('npx', ['cleancss', '-o', OUTPUT, ...CSS_FILES], (err, stdout, stderr) => {
    const ts = new Date().toLocaleTimeString('pt-BR');
    if (err) {
      console.error(`  ✗  [CSS] Erro ao gerar bundle: ${err.message}`);
    } else {
      const fs = require('fs');
      const kb = Math.round(fs.statSync(OUTPUT).size / 1024);
      console.log(`  ✓  [CSS] bundle.min.css atualizado (${kb} KB) — ${ts}`);
    }
  });
}

console.log('\n🎨  Watcher de CSS ativo');
console.log(`     Monitorando: assets/css/*.css → ${OUTPUT}\n`);

// Build inicial
build();

const watcher = chokidar.watch('assets/css/*.css', {
  ignored: /bundle\.min\.css/,
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
});

watcher
  .on('change', (filePath) => {
    console.log(`  ↺  [CSS] ${path.basename(filePath)} alterado — reconstruindo...`);
    build();
  })
  .on('error', (err) => console.error('  Watcher CSS error:', err));
