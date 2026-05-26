'use strict';

/**
 * Testes E2E — Gerador de Conteúdo (Fase 5)
 * Usa mock de rede para interceptar chamadas à API Claude.
 */

const { test, expect } = require('@playwright/test');

const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MX0.fake';

async function injectToken(page) {
  await page.addInitScript((token) => {
    sessionStorage.setItem('amd_admin_token', token);
  }, MOCK_TOKEN);
}

test.describe('Gerador de Conteúdo — UI', () => {
  test.beforeEach(async ({ page }) => {
    // Intercepta chamadas à API para não depender do backend real
    await page.route('**/api/admin/generations', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ generations: [], month_cost: '0.0000' }),
      });
    });
    await page.route('**/api/admin/generate', async route => {
      const body = JSON.parse(route.request().postData() || '{}');
      const formats = body.formats || [];
      const results = formats.map(f => ({
        format: f,
        content: `Conteúdo mockado para ${f}. Tecnologia que transforma vidas!`,
        tokens_in: 300,
        tokens_out: 80,
        cached: true,
        cost_usd: 0.000900,
      }));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results }),
      });
    });

    await injectToken(page);
    await page.goto('/admin/gerador.html');
  });

  test('carrega a página com formulário completo', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Gerador');
    await expect(page.locator('.source-tabs')).toBeVisible();
    await expect(page.locator('.format-grid')).toBeVisible();
    await expect(page.locator('#btn-gerar')).toBeVisible();
    await expect(page.locator('#results-area')).toBeVisible();
    await expect(page.locator('#history-list')).toBeVisible();
  });

  test('muda para aba tema livre', async ({ page }) => {
    await page.click('[data-source="theme"]');
    await expect(page.locator('#source-theme')).toHaveClass(/source-panel--active/);
    await expect(page.locator('#source-item')).not.toHaveClass(/source-panel--active/);
    await expect(page.locator('#theme-input')).toBeVisible();
  });

  test('exibe alerta quando nenhum formato selecionado', async ({ page }) => {
    await page.click('[data-source="theme"]');
    await page.fill('#theme-input', 'Robótica nas escolas');
    await page.click('#btn-gerar');

    const alert = page.locator('#gen-alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/formato/i);
  });

  test('exibe alerta quando tema está vazio', async ({ page }) => {
    await page.click('[data-source="theme"]');
    await page.click('label.format-check:has(input[value="instagram"])');
    await page.click('#btn-gerar');

    const alert = page.locator('#gen-alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/tema/i);
  });

  test('gera conteúdo com tema livre e exibe resultado', async ({ page }) => {
    await page.click('[data-source="theme"]');
    await page.fill('#theme-input', 'Campus Party Brasília 2023');
    await page.click('label.format-check:has(input[value="instagram"])');

    await page.click('#btn-gerar');

    // Aguarda resultado aparecer
    const resultCard = page.locator('.result-card').first();
    await expect(resultCard).toBeVisible({ timeout: 8000 });
    await expect(resultCard).toContainText('Instagram');
    await expect(resultCard).toContainText('Tecnologia que transforma vidas');
  });

  test('botão copiar está presente no resultado', async ({ page }) => {
    await page.click('[data-source="theme"]');
    await page.fill('#theme-input', 'Robótica');
    await page.click('label.format-check:has(input[value="whatsapp"])');
    await page.click('#btn-gerar');

    await expect(page.locator('.result-card .btn-copy')).toBeVisible({ timeout: 8000 });
  });

  test('gera múltiplos formatos e exibe todos os cards', async ({ page }) => {
    await page.click('[data-source="theme"]');
    await page.fill('#theme-input', 'Semana da Computação');
    await page.click('label.format-check:has(input[value="instagram"])');
    await page.click('label.format-check:has(input[value="whatsapp"])');

    await page.click('#btn-gerar');

    await expect(page.locator('.result-card')).toHaveCount(2, { timeout: 8000 });
  });

  test('exibe histórico de gerações (mockado)', async ({ page }) => {
    // O histórico é carregado no init com as gerações retornadas pelo mock ([] neste caso)
    const historyEl = page.locator('#history-list');
    await expect(historyEl).toBeVisible();
    // Com array vazio, deve exibir mensagem de nenhum registro
    await expect(historyEl).toContainText(/nenhuma|carregando/i);
  });

  test('exibe badge de custo do mês', async ({ page }) => {
    await expect(page.locator('#cost-badge')).toBeVisible();
    await expect(page.locator('#cost-badge')).toContainText('US$');
  });

  test('sidebar tem link para Gerador de Conteúdo', async ({ page }) => {
    const link = page.locator('.admin-sidebar__link[href="gerador.html"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveClass(/active/);
  });
});
