'use strict';

/**
 * Testes E2E backend — Fase 4
 * Com o servidor estático sem backend, chamadas à API retornam 404.
 * O forms.js ativa o fallback localStorage e o indicador amarelo.
 * O cenário de "servidor caído" é testado pela ausência do backend na suite CI.
 */

const { test, expect } = require('@playwright/test');

// ─── Formulário de contato — fallback (sem backend real) ──────────────────────

test.describe('Formulário de contato — fallback localStorage', () => {
  test('envio sem backend grava no localStorage e redireciona', async ({ page }) => {
    await page.goto('/contato');

    // Limpa localStorage antes do teste
    await page.evaluate(() => localStorage.removeItem('amd_contatos'));

    await page.fill('#nome-contato', 'Teste Fallback');
    await page.fill('#email-contato', 'fallback@teste.com');
    await page.selectOption('#assunto', 'outro');
    await page.fill('#mensagem', 'Mensagem de fallback para localStorage.');

    await page.click('#form-contato [type="submit"]');

    // Aguarda redirecionamento — pode levar até ~1.5s (fetch 404 + 1.2s delay)
    await page.waitForURL(/obrigado/, { timeout: 10000, waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/obrigado/);

    // localStorage deve conter o registro
    const stored = await page.evaluate(() => localStorage.getItem('amd_contatos'));
    const records = JSON.parse(stored || '[]');
    expect(records.length).toBeGreaterThan(0);
  });
});

// ─── Página admin/login.html ──────────────────────────────────────────────────

test.describe('Página admin/login.html', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login.html');
    await page.evaluate(() => sessionStorage.removeItem('amd_admin_token'));
  });

  test('carrega a página de login', async ({ page }) => {
    await expect(page.locator('#form-login')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#btn-login')).toBeVisible();
  });

  test('exibe erro ao tentar login com API indisponível', async ({ page }) => {
    // Estático não tem backend — simula servidor fora
    await page.route('**/api/admin/login', (route) => route.abort('connectionrefused'));

    await page.fill('#email', 'admin@amd.com');
    await page.fill('#password', 'qualquersenha');
    await page.click('#btn-login');

    const errEl = page.locator('#login-error');
    await expect(errEl).toHaveText(/conexão/, { timeout: 5000 });
  });
});
