'use strict';

// Fase 1 — Jornadas críticas da Home page
// Cobre: navegação, contadores, quiz, agendamento, acessibilidade básica

const { test, expect } = require('@playwright/test');

test.describe('Home — carregamento e estrutura', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('título correto', async ({ page }) => {
    await expect(page).toHaveTitle(/Aluno Maker Digital/);
  });

  test('slogan oficial visível no hero', async ({ page }) => {
    await expect(page.locator('.hero__subtitle')).toContainText('Tecnologia que transforma vidas.');
  });

  test('navbar fixa presente e acessível', async ({ page }) => {
    const nav = page.locator('nav.navbar');
    await expect(nav).toBeVisible();
  });

  test('hero: dois CTAs visíveis', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Agende uma visita gratuita/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Conheça os projetos/i })).toBeVisible();
  });

  test('WhatsApp flutuante injetado', async ({ page }) => {
    await expect(page.locator('.whatsapp-float')).toBeVisible();
  });
});

test.describe('Home — Contadores de impacto', () => {
  test('seção de impacto visível ao rolar', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('#impacto');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
  });

  test('quatro contadores existem', async ({ page }) => {
    await page.goto('/');
    const counters = page.locator('.counter-item');
    await expect(counters).toHaveCount(4);
  });
});

test.describe('Home — Projetos em destaque', () => {
  test('três cards de projeto existem', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.project-card');
    await expect(cards).toHaveCount(3);
  });

  test('card revela verso ao hover (Robô Garçom)', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('.project-card').first();
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await expect(card.locator('.project-card__back')).toBeVisible();
  });
});

test.describe('Home — Quiz interativo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#quiz').scrollIntoViewIfNeeded();
  });

  test('primeira pergunta visível', async ({ page }) => {
    await expect(page.locator('.quiz__question.active').first()).toBeVisible();
  });

  test('selecionando opção avança para próxima pergunta', async ({ page }) => {
    await page.locator('.quiz__question.active .quiz__option').first().click();
    await page.waitForTimeout(400);
    const step2 = page.locator('#quiz-step-1');
    await expect(step2).toHaveClass(/active/);
  });

  test('quiz completo exibe resultado com botão para cursos', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.locator('.quiz__question.active .quiz__option').first().click();
      await page.waitForTimeout(400);
    }

    const result = page.locator('.quiz__result.active');
    await expect(result).toBeVisible();

    const cta = result.locator('a.btn--primary');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /cursos\.html/);
  });

  test('botão "refazer" reinicia o quiz', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      const opt = page.locator('.quiz__question.active .quiz__option').first();
      await expect(opt).toBeVisible({ timeout: 2000 });
      await opt.click();
      await page.waitForTimeout(400);
    }
    await page.locator('#quiz-restart').click();
    await expect(page.locator('#quiz-step-0')).toHaveClass(/active/);
  });
});

// Fase 4.5: seção #agendamento virou WhatsApp CTA (PR #13, 2026-05-20)
test.describe('Home — CTA de agendamento (WhatsApp)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#agendamento').scrollIntoViewIfNeeded();
  });

  test('seção de agendamento está presente', async ({ page }) => {
    await expect(page.locator('#agendamento')).toBeVisible();
  });

  test('botão WhatsApp de agendamento presente com link correto', async ({ page }) => {
    const btn = page.locator('#agendamento .btn--whatsapp');
    await expect(btn).toBeVisible();
    const href = await btn.getAttribute('href');
    expect(href).toMatch(/wa\.me\/5561981333875/);
  });

  test('texto de agendamento via WhatsApp visível', async ({ page }) => {
    const section = page.locator('#agendamento');
    await expect(section.locator('h2')).toBeVisible();
  });
});

test.describe('Home — Escolas parceiras', () => {
  test('grid de escolas visível', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('#escolas');
    await section.scrollIntoViewIfNeeded();
    const cards = page.locator('.partner-card');
    await expect(cards).toHaveCount(9);
  });
});

test.describe('Home — Navbar mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('botão hamburger presente no mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#nav-toggle')).toBeVisible();
  });

  test('menu abre ao clicar no hamburger', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-toggle').click();
    await expect(page.locator('#nav-menu')).toHaveClass(/nav-open/);
  });

  test('menu fecha ao clicar em link', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-toggle').click();
    await page.locator('#nav-menu .navbar__link').first().click();
    await expect(page.locator('#nav-menu')).not.toHaveClass(/nav-open/);
  });
});

test.describe('Home — Acessibilidade básica', () => {
  test('lang="pt-BR" definido', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  });

  test('todas as imagens têm alt text', async ({ page }) => {
    await page.goto('/');
    const imgs = page.locator('img');
    const count = await imgs.count();
    for (let i = 0; i < count; i++) {
      const alt = await imgs.nth(i).getAttribute('alt');
      expect(alt, `img[${i}] sem alt`).not.toBeNull();
    }
  });

  test('main landmark presente', async ({ page }) => {
    await page.goto('/obrigado.html');
    await expect(page.locator('main')).toBeVisible();
  });
});
