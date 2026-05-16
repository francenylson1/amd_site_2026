'use strict';

const { test, expect } = require('@playwright/test');

// Sanity check da Fase 0 — valida que o placeholder está no ar e acessível.
// Remover ou substituir pelo home.spec.js na Fase 1.
test('placeholder carrega com título correto', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Aluno Maker Digital/);
});

test('placeholder exibe slogan oficial', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Tecnologia que transforma vidas.')).toBeVisible();
});
