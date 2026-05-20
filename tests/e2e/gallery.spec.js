'use strict';

// Fase 2/4.5 — Galeria de projetos e filtros (conteúdo dinâmico via API)
const { test, expect } = require('@playwright/test');

// Mock data mínimo para os testes não dependerem de backend
const MOCK_PROJECTS = [
  { id: 1, title: 'Robô Garçom', category: 'roborica', short_desc: 'Robô semi-autônomo', full_desc: 'Descrição completa', image_url: 'assets/images/projetos/robo_garcon/versao_2_5.webp', tags: 'Arduino,C++', active: true, sort_order: 10 },
  { id: 2, title: 'Braço Robótico com IA', category: 'ia', short_desc: 'Separador de frutas', full_desc: 'Descrição completa', image_url: null, tags: 'Python,OpenCV', active: true, sort_order: 30 },
  { id: 3, title: 'Lixeira Inteligente', category: 'iot', short_desc: 'Sensor de aproximação', full_desc: 'Descrição completa', image_url: null, tags: 'Arduino', active: true, sort_order: 50 },
];

const MOCK_EVENTS = [
  {
    id: 1, title: 'Campus Party Brasília', category: 'campus-party',
    description: 'Maior evento de tecnologia', event_date: null, active: true, sort_order: 10,
    photos: [
      { id: 1, event_id: 1, image_url: 'assets/images/eventos/campus_party/campus_party_BSB_i1.webp', caption: 'Foto 1', sort_order: 10 },
      { id: 2, event_id: 1, image_url: 'assets/images/eventos/campus_party/campus_party_BSB_i2.webp', caption: 'Foto 2', sort_order: 20 },
    ],
  },
  {
    id: 2, title: 'IFB Campus Gama', category: 'institucional',
    description: 'Instituto Federal 2024', event_date: '2024-01-01', active: true, sort_order: 20,
    photos: [
      { id: 3, event_id: 2, image_url: 'assets/images/eventos/IFB_gama_2024/instituto_federal_BsB_1.webp', caption: 'Foto 1', sort_order: 10 },
    ],
  },
];

test.describe('Projetos — galeria e filtros', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/projects', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PROJECTS) })
    );
    await page.goto('/projetos.html');
    // Aguarda renderização dinâmica
    await page.waitForSelector('.project-card', { timeout: 8000 });
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

  test('links de lightbox presentes nos cards com imagem', async ({ page }) => {
    const lightboxLinks = page.locator('.glightbox');
    const count = await lightboxLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Eventos — galeria por categoria', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/events', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_EVENTS) })
    );
    await page.goto('/eventos.html');
    await page.waitForSelector('.event-section', { timeout: 8000 });
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
