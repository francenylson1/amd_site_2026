'use strict';

// Fase 2 — Navegação entre todas as páginas públicas
const { test, expect } = require('@playwright/test');

const PAGES = [
  { path: '/sobre.html',    title: /Sobre nós/,       h1: /Sobre o.*Aluno Maker Digital/i },
  { path: '/projetos.html', title: /Projetos/,         h1: /Nossos.*Projetos/i },
  { path: '/escolas.html',  title: /Escolas Parceiras/,h1: /Escolas.*Parceiras/i },
  { path: '/eventos.html',  title: /Eventos/,          h1: /Eventos e.*Conquistas/i },
  { path: '/cursos.html',   title: /Cursos/,           h1: /Nossos.*Cursos/i },
  { path: '/loja.html',     title: /Loja/,             h1: /Nossa.*Loja/i },
  { path: '/contato.html',  title: /Contato/,          h1: /Entre em.*Contato/i },
  { path: '/quiz.html',     title: /Quiz/,             h1: /Qual curso é/i },
];

test.describe('Navegação — todas as páginas carregam', () => {
  for (const { path, title, h1 } of PAGES) {
    test(`${path} — título e H1 corretos`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
      await expect(page.locator('h1')).toContainText(h1);
    });
  }
});

test.describe('Navegação — navbar presente e funcional em páginas internas', () => {
  test('navbar presente em sobre.html', async ({ page }) => {
    await page.goto('/sobre.html');
    await expect(page.locator('nav.navbar')).toBeVisible();
    await expect(page.getByRole('link', { name: /Aluno Maker/i }).first()).toBeVisible();
  });

  test('link da home (logo) em página interna', async ({ page }) => {
    await page.goto('/sobre.html');
    await page.locator('.navbar__logo').click();
    await expect(page).toHaveURL(/index\.html|\/$/);
  });

  test('navegação home → projetos → escolas via navbar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Projetos/i }).first().click();
    await expect(page).toHaveURL(/projetos/);
    await page.getByRole('link', { name: /Escolas/i }).first().click();
    await expect(page).toHaveURL(/escolas/);
  });

  test('navbar mobile: hamburger abre o menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/sobre.html');
    const toggle = page.locator('#nav-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('#nav-menu')).toHaveClass(/nav-open/);
  });

  test('link "Agendar visita" em páginas internas aponta para home', async ({ page }) => {
    await page.goto('/sobre.html');
    const cta = page.locator('.navbar__cta');
    await expect(cta).toHaveAttribute('href', /index\.html#agendamento/);
  });
});

test.describe('Navegação — footer com links corretos', () => {
  test('footer presente em todas as páginas', async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(path);
      await expect(page.locator('footer.footer')).toBeVisible();
    }
  });

  test('WhatsApp flutuante presente em páginas internas', async ({ page }) => {
    await page.goto('/sobre.html');
    await expect(page.locator('.whatsapp-float')).toBeVisible();
  });
});
