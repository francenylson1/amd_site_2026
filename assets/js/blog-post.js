'use strict';

const API_BASE = '/api';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function buildYouTubeEmbed(youtubeId) {
  const thumb = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  return `
    <div class="post-video" id="yt-wrapper" role="button" tabindex="0"
         aria-label="Reproduzir vídeo do YouTube">
      <img src="${thumb}" alt="Miniatura do vídeo" class="post-video__thumb" loading="lazy" width="760" height="427">
      <div class="post-video__play" aria-hidden="true">
        <div class="post-video__play-icon"></div>
      </div>
    </div>`;
}

function activateYouTubeEmbed(youtubeId) {
  const wrapper = document.getElementById('yt-wrapper');
  if (!wrapper) return;

  function load() {
    wrapper.innerHTML = `
      <div class="post-video__iframe-wrap">
        <iframe
          src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0"
          title="Vídeo do post"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>`;
  }

  wrapper.addEventListener('click', load);
  wrapper.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') load(); });
}

function renderPost(post) {
  const article = document.getElementById('post-article');
  if (!article) return;

  const coverHtml = post.cover_image
    ? `<img src="${post.cover_image}" alt="Capa do post: ${post.title}" class="post-cover" width="1200" height="440" loading="eager">`
    : '';

  const videoHtml = post.youtube_id ? buildYouTubeEmbed(post.youtube_id) : '';

  article.innerHTML = `
    <section class="post-hero" aria-label="${post.title}">
      <div class="container">
        <div class="post-hero__meta">
          <a href="blog.html" class="post-hero__back" aria-label="Voltar para o blog">← Blog</a>
          <time class="post-hero__date" datetime="${post.published_at || post.created_at}">
            ${formatDate(post.published_at || post.created_at)}
          </time>
        </div>
        <h1 class="post-hero__title">${post.title}</h1>
      </div>
    </section>

    <div class="container">
      ${coverHtml}
      ${videoHtml}
      <div class="post-content" id="post-content">
        ${post.content}
      </div>
    </div>`;

  document.title = `${post.title} — Aluno Maker Digital`;

  if (post.youtube_id) activateYouTubeEmbed(post.youtube_id);
}

async function loadPost() {
  const slug = new URLSearchParams(window.location.search).get('slug');
  const article = document.getElementById('post-article');

  if (!slug) {
    if (article) article.innerHTML = `<div class="container"><p class="blog-error" style="padding-top:100px">Post não especificado. <a href="blog.html">Voltar ao blog</a>.</p></div>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}`);
    if (res.status === 404) throw new Error('not-found');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const post = await res.json();
    renderPost(post);
  } catch (err) {
    const msg = err.message === 'not-found'
      ? `Post não encontrado. <a href="blog.html">Ver todos os posts</a>.`
      : `Não foi possível carregar o post. <a href="blog.html">Voltar ao blog</a>.`;
    if (article) article.innerHTML = `<div class="container"><p class="blog-error" style="padding-top:100px">${msg}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadPost);
