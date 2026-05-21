const API_BASE = '/api';
const HOME_PROJECTS_LIMIT = 3;

function buildHomeProjectCard(p, index) {
  const delays = [100, 200, 300];
  const delay  = delays[index] ?? (index + 1) * 100;
  const tags   = (p.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  const tagsHtml = tags.map(t => `<span class="tag">${t}</span>`).join('');

  const imgHtml = p.image_url
    ? `<img src="${p.image_url}" alt="${p.title}" loading="lazy" width="400" height="250">`
    : `<div class="project-card__no-img" aria-hidden="true"><i class="fa-solid fa-robot"></i></div>`;

  return `
    <article class="project-card reveal" data-delay="${delay}"
             tabindex="0" aria-label="Projeto: ${p.title}">
      <div class="project-card__inner">
        <div class="project-card__front">
          ${imgHtml}
          <div class="project-card__front-info">
            <h3>${p.title}</h3>
            <p>${p.short_desc || ''}</p>
          </div>
          <div class="project-card__flip-hint" aria-hidden="true">
            <i class="fa-solid fa-rotate"></i> ver mais
          </div>
        </div>
        <div class="project-card__back">
          <h3>${p.title}</h3>
          <p>${p.full_desc || p.short_desc || ''}</p>
          <div class="project-card__tags">${tagsHtml}</div>
        </div>
      </div>
    </article>`;
}

async function loadHomeProjects() {
  const grid = document.getElementById('home-projects-grid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const projects = await res.json();

    const featured = projects.slice(0, HOME_PROJECTS_LIMIT);
    if (!featured.length) return;

    grid.innerHTML = featured.map((p, i) => buildHomeProjectCard(p, i)).join('');
    window.AMD?.observeReveal?.();
  } catch {
    // Falha silenciosa na home — a seção fica vazia em vez de mostrar erro
  }
}

document.addEventListener('DOMContentLoaded', loadHomeProjects);
