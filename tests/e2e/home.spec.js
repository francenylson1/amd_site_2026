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
    await expect(page.getByText('Tecnologia que transforma vidas.')).toBeVisible();
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
    await page.locator('.quiz__option').first().click();
    await page.waitForTimeout(400);
    const step2 = page.locator('#quiz-step-1');
    await expect(step2).toHaveClass(/active/);
  });

  test('quiz completo exibe resultado com botão para cursos', async ({ page }) => {
    // Responde as 3 perguntas
    for (let i = 0; i < 3; i++) {
      await page.locator('.quiz__option').first().click();
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
      await page.locator('.quiz__option').first().click();
      await page.waitForTimeout(400);
    }
    await page.locator('#quiz-restart').click();
    await expect(page.locator('#quiz-step-0')).toHaveClass(/active/);
  });
});

test.describe('Home — Formulário de agendamento', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#agendamento').scrollIntoViewIfNeeded();
  });

  test('formulário de agendamento presente', async ({ page }) => {
    await expect(page.locator('#form-agendamento')).toBeVisible();
  });

  test('submit sem campos mostra erros de validação', async ({ page }) => {
    await page.locator('[type="submit"]').click();
    const errors = page.locator('.form-group--error');
    await expect(errors.first()).toBeVisible();
  });

  test('e-mail inválido mostra erro', async ({ page }) => {
    await page.fill('#nome',  'Teste Silva');
    await page.fill('#email', 'nao-e-email');
    await page.locator('#email').blur();
    await expect(page.locator('#email').locator('..').locator('.form-group__error-msg')).toBeVisible();
  });

  test('formulário válido redireciona para obrigado.html', async ({ page }) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = futureDate.toISOString().split('T')[0];

    await page.fill('#nome',  'Teste Aluno');
    await page.fill('#email', 'teste@teste.com');
    await page.selectOption('#perfil', 'aluno');
    await page.fill('#data',  dateStr);

    await page.locator('[type="submit"]').click();
    await page.waitForURL('**/obrigado.html', { timeout: 5000 });
    await expect(page).toHaveURL(/obrigado\.html/);
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
