'use strict';

const API_BASE = '/api';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function buildCard(post) {
  const cover = post.cover_image
    ? `<img src="${post.cover_image}" alt="Capa do post ${post.title}" class="blog-card__cover" loading="lazy" width="640" height="200">`
    : `<div class="blog-card__cover-placeholder" aria-hidden="true"><i class="fa-solid fa-newspaper"></i></div>`;

  return `
    <article class="blog-card reveal">
      <a href="blog-post.html?slug=${encodeURIComponent(post.slug)}" aria-label="Ler post: ${post.title}">
        ${cover}
      </a>
      <div class="blog-card__body">
        <time class="blog-card__date" datetime="${post.published_at || post.created_at}">
          ${formatDate(post.published_at || post.created_at)}
        </time>
        <h2 class="blog-card__title">${post.title}</h2>
        ${post.excerpt ? `<p class="blog-card__excerpt">${post.excerpt}</p>` : ''}
        <a href="blog-post.html?slug=${encodeURIComponent(post.slug)}" class="blog-card__link">
          Ler artigo →
        </a>
      </div>
    </article>`;
}

function renderPagination(page, pages) {
  const nav = document.getElementById('blog-pagination');
  if (!nav) return;
  if (pages <= 1) { nav.hidden = true; return; }

  nav.hidden = false;
  nav.innerHTML = `
    <button class="blog-pagination__btn" id="btn-prev" ${page <= 1 ? 'disabled' : ''} aria-label="Página anterior">
      ← Anterior
    </button>
    <span class="blog-pagination__info">Página ${page} de ${pages}</span>
    <button class="blog-pagination__btn" id="btn-next" ${page >= pages ? 'disabled' : ''} aria-label="Próxima página">
      Próxima →
    </button>`;

  nav.querySelector('#btn-prev')?.addEventListener('click', () => loadPosts(page - 1));
  nav.querySelector('#btn-next')?.addEventListener('click', () => loadPosts(page + 1));
}

async function loadPosts(page = 1) {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  grid.innerHTML = '<p class="blog-loading">Carregando posts…</p>';

  try {
    const res = await fetch(`${API_BASE}/posts?page=${page}&limit=9`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { posts, pages } = await res.json();

    if (!posts.length) {
      grid.innerHTML = '<p class="blog-empty">Nenhum post publicado ainda. Volte em breve!</p>';
      return;
    }

    grid.innerHTML = posts.map(buildCard).join('');
    renderPagination(page, pages);
    window.AMD?.observeReveal?.();
  } catch {
    grid.innerHTML = '<p class="blog-error">Não foi possível carregar os posts. Tente novamente mais tarde.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => loadPosts(1));
