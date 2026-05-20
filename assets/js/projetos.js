const API_BASE = '/api';

function buildProjectCard(p) {
  const tags = (p.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  const tagsHtml = tags.map(t => `<span class="tag">${t}</span>`).join('');
  const imgHtml = p.image_url
    ? `<a href="${p.image_url}" class="glightbox" data-gallery="projetos-${p.id}"
          data-title="${p.title}" aria-label="Ver foto ampliada de ${p.title}">
         <img src="${p.image_url}" alt="${p.title}" loading="lazy" width="400" height="280">
       </a>`
    : `<div class="project-card__no-img" aria-hidden="true"><i class="fa-solid fa-robot"></i></div>`;

  return `
    <article class="project-card reveal" data-delay="${(p.sort_order % 900) + 100}"
             data-category="${p.category}" tabindex="0" aria-label="Projeto: ${p.title}">
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

async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const projects = await res.json();

    grid.innerHTML = projects.map(buildProjectCard).join('');

    if (typeof GLightbox !== 'undefined') {
      GLightbox({ selector: '.glightbox' });
    }

    window.AMD?.observeReveal?.();
  } catch (err) {
    grid.innerHTML = `<p class="content-error">Não foi possível carregar os projetos. Tente novamente mais tarde.</p>`;
    console.error('Erro ao carregar projetos:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadProjects);
