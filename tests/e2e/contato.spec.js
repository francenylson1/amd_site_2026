'use strict';

// Fase 2 — Formulário de contato e validações
const { test, expect } = require('@playwright/test');

test.describe('Contato — carregamento', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contato.html');
  });

  test('página carrega com título correto', async ({ page }) => {
    await expect(page).toHaveTitle(/Contato.*Aluno Maker Digital/);
  });

  test('formulário de contato existe', async ({ page }) => {
    await expect(page.locator('#form-contato')).toBeVisible();
  });

  test('todos os campos obrigatórios existem', async ({ page }) => {
    await expect(page.locator('#nome-contato')).toBeVisible();
    await expect(page.locator('#email-contato')).toBeVisible();
    await expect(page.locator('#assunto')).toBeVisible();
    await expect(page.locator('#mensagem')).toBeVisible();
  });

  test('mapa embed está presente', async ({ page }) => {
    await expect(page.locator('iframe[title*="Localização"]')).toBeVisible();
  });

  test('informações de contato visíveis', async ({ page }) => {
    await expect(page.locator('.contact-info')).toBeVisible();
  });
});

test.describe('Contato — validação do formulário', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contato.html');
  });

  test('submeter formulário vazio exibe erros de validação', async ({ page }) => {
    await page.locator('#form-contato button[type="submit"]').click();
    const errorMsgs = page.locator('.form-group--error');
    await expect(errorMsgs).toHaveCount(4);
  });

  test('e-mail inválido exibe mensagem de erro', async ({ page }) => {
    await page.locator('#nome-contato').fill('João');
    await page.locator('#email-contato').fill('email-invalido');
    await page.locator('#email-contato').blur();
    await expect(page.locator('#email-contato').locator('..').locator('.form-group__error-msg')).toBeVisible();
  });

  test('formulário válido redireciona para obrigado.html', async ({ page }) => {
    await page.locator('#nome-contato').fill('João Testador');
    await page.locator('#email-contato').fill('joao@teste.com');
    await page.locator('#assunto').selectOption('cursos');
    await page.locator('#mensagem').fill('Gostaria de informações sobre os cursos disponíveis.');
    await page.locator('#form-contato button[type="submit"]').click();
    await expect(page).toHaveURL(/obrigado/, { timeout: 5000 });
  });

  test('dado válido salvo no localStorage após envio', async ({ page }) => {
    await page.locator('#nome-contato').fill('Teste Local');
    await page.locator('#email-contato').fill('teste@local.com');
    await page.locator('#assunto').selectOption('outro');
    await page.locator('#mensagem').fill('Mensagem de teste com mais de dez caracteres.');
    await page.locator('#form-contato button[type="submit"]').click();
    await page.waitForURL(/obrigado/);
    await page.goto('/contato.html');
    const stored = await page.evaluate(() => localStorage.getItem('amd_contatos'));
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[parsed.length - 1].nome).toBe('Teste Local');
  });
});

test.describe('Quiz — página dedicada', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz.html');
  });

  test('página do quiz carrega', async ({ page }) => {
    await expect(page).toHaveTitle(/Quiz.*Aluno Maker Digital/);
  });

  test('quiz é renderizado na página', async ({ page }) => {
    await expect(page.locator('#quiz-container')).toBeVisible();
    await expect(page.locator('.quiz__question.active')).toBeVisible();
  });

  test('quiz fluxo completo na página dedicada: 3 respostas → resultado', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.locator('.quiz__question.active .quiz__option').first().click();
      await page.waitForTimeout(400);
    }
    await expect(page.locator('.quiz__result.active')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#quiz-result-name')).not.toBeEmpty();
  });
});
