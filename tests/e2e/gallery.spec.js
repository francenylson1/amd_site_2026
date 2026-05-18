'use strict';

// Fase 2 — Galeria de projetos e filtros client-side
const { test, expect } = require('@playwright/test');

test.describe('Projetos — galeria e filtros', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projetos.html');
  });

  test('página carrega com título correto', async ({ page }) => {
    await expect(page).toHaveTitle(/Projetos.*Aluno Maker Digital/);
  });

  test('filtros existem e têm "Todos" ativo por padrão', async ({ page }) => {
    const filterBtns = page.locator('.filter-btn');
    await expect(filterBtns).toHaveCount(5);
    await expect(filterBtns.first()).toHaveClass(/filter-btn--active/);
    await expect(filterBtns.first()).toHaveAttribute('aria-pressed', 'true');
  });

  test('todos os cards de projetos estão visíveis por padrão', async ({ page }) => {
    const cards = page.locator('.project-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
  });

  test('filtro "Robótica" exibe apenas cards dessa categoria e oculta os demais', async ({ page }) => {
    await page.getByRole('button', { name: /Robótica/i }).click();

    const roboticCards = page.locator('[data-category="roborica"]');
    const otherCards   = page.locator('[data-category="ia"]');
    await expect(roboticCards.first()).toBeVisible();
    await expect(otherCards.first()).not.toBeVisible();
  });

  test('filtro "Todos" restaura todos os cards', async ({ page }) => {
    await page.getByRole('button', { name: /Robótica/i }).click();
    await page.getByRole('button', { name: /Todos/i }).click();

    const cards = page.locator('.project-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
  });

  test('botão de filtro ativo recebe aria-pressed="true"', async ({ page }) => {
    await page.getByRole('button', { name: /IoT/i }).click();
    await expect(page.getByRole('button', { name: /IoT/i })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /Todos/i })).toHaveAttribute('aria-pressed', 'false');
  });

  test('links de lightbox presentes nos cards', async ({ page }) => {
    const lightboxLinks = page.locator('.glightbox');
    const count = await lightboxLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Eventos — galeria por categoria', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/eventos.html');
  });

  test('seções de eventos estão presentes', async ({ page }) => {
    const sections = page.locator('.event-section');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
  });

  test('imagens de eventos carregam', async ({ page }) => {
    const imgs = page.locator('.event-photo-item img');
    const count = await imgs.count();
    expect(count).toBeGreaterThan(0);
  });
});
