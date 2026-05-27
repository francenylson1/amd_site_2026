'use strict';

const { test, expect } = require('@playwright/test');

const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MX0.fake';

const MOCK_POSTS = [
  {
    id: 1,
    slug: 'robotica-nas-escolas',
    title: 'Robótica nas escolas públicas',
    excerpt: 'Como a robótica transforma a educação.',
    cover_image: null,
    youtube_id: null,
    published_at: '2026-05-20T10:00:00.000Z',
    created_at: '2026-05-20T10:00:00.000Z',
    status: 'published',
  },
  {
    id: 2,
    slug: 'programacao-para-criancas',
    title: 'Programação para crianças',
    excerpt: 'Aprender a programar desde cedo.',
    cover_image: 'assets/images/blog/capa.webp',
    youtube_id: 'dQw4w9WgXcQ',
    published_at: '2026-05-22T14:00:00.000Z',
    created_at: '2026-05-22T14:00:00.000Z',
    status: 'published',
    content: '<p>Conteúdo do post sobre programação.</p>',
  },
];

async function mockBlogPublic(page) {
  await page.route(/\/api\/posts/, async route => {
    const url = route.request().url();
    const slugMatch = url.match(/\/posts\/([^?#]+)/);
    if (slugMatch) {
      const slug = decodeURIComponent(slugMatch[1]);
      const post = MOCK_POSTS.find(p => p.slug === slug);
      if (post) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(post) });
      return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ erro: 'Post não encontrado.' }) });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ posts: MOCK_POSTS, total: 2, page: 1, pages: 1 }),
    });
  });
}

async function mockBlogAdmin(page) {
  await page.route('**/api/admin/posts', async route => {
    const method = route.request().method();
    if (method === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_POSTS) });
    }
    if (method === 'POST') {
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 99, slug: 'novo-post' }) });
    }
  });
  await page.route('**/api/admin/posts/**', async route => {
    const method = route.request().method();
    if (method === 'PUT')    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    if (method === 'DELETE') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
}

test.describe('Blog — Listagem pública (blog.html)', () => {
  test.beforeEach(async ({ page }) => {
    await mockBlogPublic(page);
  });

  test('página carrega com título e H1 corretos', async ({ page }) => {
    await page.goto('/blog.html');
    await expect(page).toHaveTitle(/Blog.*Aluno Maker Digital/);
    await expect(page.locator('h1')).toContainText('Blog');
  });

  test('exibe cards dos posts publicados', async ({ page }) => {
    await page.goto('/blog.html');
    const cards = page.locator('.blog-card');
    await expect(cards).toHaveCount(2);
    await expect(cards.first()).toContainText('Robótica nas escolas públicas');
  });

  test('link "Ler artigo" aponta para blog-post.html com slug correto', async ({ page }) => {
    await page.goto('/blog.html');
    const link = page.locator('.blog-card__link').first();
    await expect(link).toHaveAttribute('href', /blog-post\.html\?slug=robotica-nas-escolas/);
  });

  test('Blog está na navbar', async ({ page }) => {
    await page.goto('/blog.html');
    const navLink = page.locator('.navbar__menu a[href="blog.html"]');
    await expect(navLink).toBeVisible();
  });

  test('Blog está no footer', async ({ page }) => {
    await page.goto('/blog.html');
    const footerLink = page.locator('.footer__links a[href="blog.html"]');
    await expect(footerLink).toBeVisible();
  });
});

test.describe('Blog — Post individual (blog-post.html)', () => {
  test.beforeEach(async ({ page }) => {
    await mockBlogPublic(page);
  });

  test('exibe título e conteúdo do post pelo slug', async ({ page }) => {
    await page.goto('/blog-post?slug=programacao-para-criancas');
    await expect(page.locator('.post-hero__title')).toContainText('Programação para crianças');
    const content = page.locator('#post-content');
    await expect(content).toBeVisible();
    await expect(content).toContainText('programação');
  });

  test('exibe miniatura YouTube para post com youtube_id', async ({ page }) => {
    await page.goto('/blog-post?slug=programacao-para-criancas');
    const video = page.locator('#yt-wrapper');
    await expect(video).toBeVisible();
    const thumb = video.locator('.post-video__thumb');
    await expect(thumb).toHaveAttribute('src', /youtube\.com\/vi\/dQw4w9WgXcQ/);
  });

  test('player YouTube carrega ao clicar na miniatura', async ({ page }) => {
    await page.goto('/blog-post?slug=programacao-para-criancas');
    await page.locator('#yt-wrapper').click();
    const iframe = page.locator('#yt-wrapper iframe');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('src', /youtube\.com\/embed\/dQw4w9WgXcQ/);
  });

  test('exibe erro para slug inexistente', async ({ page }) => {
    await page.goto('/blog-post?slug=nao-existe');
    await expect(page.locator('.blog-error')).toBeVisible();
  });
});

test.describe('Blog — Aba Blog no admin (galeria.html)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((token) => {
      sessionStorage.setItem('amd_admin_token', token);
    }, MOCK_TOKEN);

    // Mock de todos os endpoints de conteúdo necessários para galeria.html carregar
    await page.route('**/api/admin/events',      r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('**/api/admin/projects',     r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('**/api/admin/schools',      r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('**/api/admin/courses',      r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('**/api/admin/about-photos', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('**/api/admin/config',       r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await mockBlogAdmin(page);
  });

  test('aba Blog existe e pode ser clicada', async ({ page }) => {
    await page.goto('/admin/galeria.html');
    const blogTab = page.locator('[data-tab="blog"]');
    await expect(blogTab).toBeVisible();
    await blogTab.click();
    await expect(page.locator('#tab-blog')).not.toHaveAttribute('hidden');
  });

  test('lista posts na aba Blog', async ({ page }) => {
    await page.goto('/admin/galeria.html');
    await page.locator('[data-tab="blog"]').click();
    const lista = page.locator('#lista-posts');
    await expect(lista).toContainText('Robótica nas escolas públicas');
    await expect(lista).toContainText('Programação para crianças');
  });

  test('abre formulário ao clicar "+ Novo post"', async ({ page }) => {
    await page.goto('/admin/galeria.html');
    await page.locator('[data-tab="blog"]').click();
    await page.locator('#btn-novo-post').click();
    await expect(page.locator('#form-post')).not.toHaveAttribute('hidden');
    await expect(page.locator('#post-title')).toBeVisible();
    await expect(page.locator('#post-content')).toBeVisible();
  });
});
