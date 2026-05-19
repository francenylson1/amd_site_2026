'use strict';

// Fase 3 — Módulo de Animações GPIO
// Cobre CA-GPIO-01 a CA-GPIO-05 do PRD §8.4

const { test, expect } = require('@playwright/test');

test.describe('CA-GPIO-01 — Página animacoes.html carrega corretamente', () => {
  test('título e H1 corretos', async ({ page }) => {
    await page.goto('/animacoes.html');
    await expect(page).toHaveTitle(/Animações GPIO.*Aluno Maker Digital/);
    await expect(page.locator('h1')).toContainText(/Animações/i);
  });

  test('canvas está presente e visível', async ({ page }) => {
    await page.goto('/animacoes.html');
    const canvas = page.locator('#gpio-canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box.width).toBeGreaterThan(200);
    expect(box.height).toBeGreaterThan(100);
  });

  test('painel de controle está presente', async ({ page }) => {
    await page.goto('/animacoes.html');
    await expect(page.locator('.gpio-panel')).toBeVisible();
    await expect(page.locator('#gpio-platform')).toBeVisible();
    await expect(page.locator('#gpio-animation')).toBeVisible();
  });

  test('botões de playback estão presentes', async ({ page }) => {
    await page.goto('/animacoes.html');
    await expect(page.locator('#gpio-btn-play')).toBeVisible();
    await expect(page.locator('#gpio-btn-pause')).toBeVisible();
    await expect(page.locator('#gpio-btn-stop')).toBeVisible();
  });

  test('botões de exportação estão presentes', async ({ page }) => {
    await page.goto('/animacoes.html');
    await expect(page.locator('#gpio-export-png')).toBeVisible();
    await expect(page.locator('#gpio-export-zip')).toBeVisible();
  });

  test('link Animações na navbar de animacoes.html', async ({ page }) => {
    await page.goto('/animacoes.html');
    const link = page.locator('.navbar__link--active');
    await expect(link).toContainText(/Animações/i);
  });
});

test.describe('CA-GPIO-02 — Seleção de plataforma renderiza diagrama', () => {
  test('selecionar RPi5 atualiza o canvas', async ({ page }) => {
    await page.goto('/animacoes.html');
    await page.selectOption('#gpio-platform', 'rpi5');
    await page.selectOption('#gpio-animation', 'led');
    // Aguarda o JS processar
    await page.waitForTimeout(300);
    // O select de pino deve ter opções
    const pinOptions = await page.locator('#gpio-pin option').count();
    expect(pinOptions).toBeGreaterThan(0);
  });

  test('selecionar ESP8266 popula pinos D0-D8', async ({ page }) => {
    await page.goto('/animacoes.html');
    await page.selectOption('#gpio-platform', 'esp8266');
    await page.selectOption('#gpio-animation', 'led');
    await page.waitForTimeout(300);
    const firstOption = await page.locator('#gpio-pin option').first().textContent();
    expect(firstOption).toMatch(/D0/);
  });

  test('selecionar ESP32 popula pinos GPIO', async ({ page }) => {
    await page.goto('/animacoes.html');
    await page.selectOption('#gpio-platform', 'esp32');
    await page.selectOption('#gpio-animation', 'led');
    await page.waitForTimeout(300);
    const options = await page.locator('#gpio-pin option').allTextContents();
    expect(options.some(o => o.includes('GPIO'))).toBe(true);
  });
});

test.describe('CA-GPIO-03 — Tipos de animação mostram config correta', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/animacoes.html');
    await page.selectOption('#gpio-platform', 'rpi5');
  });

  test('animação LED exibe configuração de cor e frequência', async ({ page }) => {
    await page.selectOption('#gpio-animation', 'led');
    await page.waitForTimeout(200);
    await expect(page.locator('#config-led')).not.toHaveAttribute('hidden', /.*/);
    await expect(page.locator('#gpio-led-color')).toBeVisible();
    await expect(page.locator('#gpio-blink-rate')).toBeVisible();
  });

  test('animação Servo exibe config de ângulos', async ({ page }) => {
    await page.selectOption('#gpio-animation', 'servo');
    await page.waitForTimeout(200);
    await expect(page.locator('#config-servo')).not.toHaveAttribute('hidden', /.*/);
    await expect(page.locator('#gpio-start-angle')).toBeVisible();
    await expect(page.locator('#gpio-end-angle')).toBeVisible();
  });

  test('animação Sensor exibe config de min/max', async ({ page }) => {
    await page.selectOption('#gpio-animation', 'sensor');
    await page.waitForTimeout(200);
    await expect(page.locator('#config-sensor')).not.toHaveAttribute('hidden', /.*/);
    await expect(page.locator('#gpio-min-val')).toBeVisible();
    await expect(page.locator('#gpio-max-val')).toBeVisible();
  });

  test('animação Buzzer exibe config de frequência', async ({ page }) => {
    await page.selectOption('#gpio-animation', 'buzzer');
    await page.waitForTimeout(200);
    await expect(page.locator('#config-buzzer')).not.toHaveAttribute('hidden', /.*/);
    await expect(page.locator('#gpio-frequency')).toBeVisible();
    await expect(page.locator('#gpio-waveform')).toBeVisible();
  });

  test('trocar animação oculta config da anterior', async ({ page }) => {
    await page.selectOption('#gpio-animation', 'led');
    await page.waitForTimeout(200);
    await page.selectOption('#gpio-animation', 'servo');
    await page.waitForTimeout(200);
    await expect(page.locator('#config-led')).toHaveAttribute('hidden', '');
    await expect(page.locator('#config-servo')).not.toHaveAttribute('hidden', /.*/);
  });
});

test.describe('CA-GPIO-04 — Controles de playback funcionam', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/animacoes.html');
    await page.selectOption('#gpio-platform', 'rpi5');
    await page.selectOption('#gpio-animation', 'led');
    await page.waitForTimeout(200);
  });

  test('botão Play inicia animação e atualiza status', async ({ page }) => {
    await page.click('#gpio-btn-play');
    await page.waitForTimeout(300);
    const statusText = await page.locator('#gpio-status-text').textContent();
    expect(statusText).toMatch(/Executando/i);
  });

  test('botão Play ativa Pause e Stop', async ({ page }) => {
    await page.click('#gpio-btn-play');
    await page.waitForTimeout(200);
    await expect(page.locator('#gpio-btn-pause')).not.toBeDisabled();
    await expect(page.locator('#gpio-btn-stop')).not.toBeDisabled();
    await expect(page.locator('#gpio-btn-play')).toBeDisabled();
  });

  test('botão Pause pausa animação', async ({ page }) => {
    await page.click('#gpio-btn-play');
    await page.waitForTimeout(300);
    await page.click('#gpio-btn-pause');
    await page.waitForTimeout(200);
    const statusText = await page.locator('#gpio-status-text').textContent();
    expect(statusText).toMatch(/Pausado/i);
  });

  test('botão Stop para animação', async ({ page }) => {
    await page.click('#gpio-btn-play');
    await page.waitForTimeout(300);
    await page.click('#gpio-btn-stop');
    await page.waitForTimeout(200);
    const statusText = await page.locator('#gpio-status-text').textContent();
    expect(statusText).toMatch(/Parado/i);
  });

  test('controle de velocidade altera o valor exibido', async ({ page }) => {
    await page.locator('#gpio-speed').fill('2');
    await page.locator('#gpio-speed').dispatchEvent('input');
    const val = await page.locator('#gpio-speed-val').textContent();
    expect(val).toMatch(/2/);
  });
});

test.describe('CA-GPIO-05 — Exportação PNG', () => {
  test('botão PNG dispara download', async ({ page }) => {
    await page.goto('/animacoes.html');
    await page.selectOption('#gpio-platform', 'rpi5');
    await page.selectOption('#gpio-animation', 'led');
    await page.waitForTimeout(300);

    const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
    await page.click('#gpio-export-png');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/gpio-frame.*\.png/);
  });
});

test.describe('Navegação — link Animações na navbar de todas as páginas', () => {
  const PAGES = [
    '/index.html', '/sobre.html', '/projetos.html', '/escolas.html',
    '/eventos.html', '/cursos.html', '/loja.html', '/contato.html',
  ];

  for (const path of PAGES) {
    test(`${path} tem link Animações na navbar`, async ({ page }) => {
      await page.goto(path);
      const link = page.locator('.navbar__link', { hasText: /Animações/i });
      await expect(link).toBeVisible();
      const href = await link.getAttribute('href');
      expect(href).toMatch(/animacoes\.html/);
    });
  }
});

test.describe('Acessibilidade — controles GPIO navegáveis por teclado', () => {
  test('todos os controles de playback têm aria-label', async ({ page }) => {
    await page.goto('/animacoes.html');
    for (const id of ['gpio-btn-play', 'gpio-btn-pause', 'gpio-btn-stop']) {
      const label = await page.locator(`#${id}`).getAttribute('aria-label');
      expect(label).toBeTruthy();
    }
  });

  test('selects de plataforma e animação têm aria-label', async ({ page }) => {
    await page.goto('/animacoes.html');
    const platformLabel = await page.locator('#gpio-platform').getAttribute('aria-label');
    const animLabel     = await page.locator('#gpio-animation').getAttribute('aria-label');
    expect(platformLabel).toBeTruthy();
    expect(animLabel).toBeTruthy();
  });

  test('canvas tem role=img e aria-label', async ({ page }) => {
    await page.goto('/animacoes.html');
    const canvas = page.locator('#gpio-canvas');
    await expect(canvas).toHaveAttribute('role', 'img');
    const ariaLabel = await canvas.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('status area tem aria-live', async ({ page }) => {
    await page.goto('/animacoes.html');
    const status = page.locator('[aria-live="polite"]');
    await expect(status).toBeVisible();
  });
});
