const API_BASE = '/api';

const LEVEL_LABELS = {
  iniciante:     'Iniciante',
  intermediario: 'Intermediário',
  avancado:      'Avançado',
};

const CATEGORY_LABELS = {
  alunos:      'Para alunos',
  professores: 'Para professores',
  escola:      'Para escolas',
};

function buildCourseCard(c, index) {
  const delay = (index + 1) * 100;
  const levelLabel = LEVEL_LABELS[c.level] || c.level;
  const catLabel   = CATEGORY_LABELS[c.category] || c.category;

  const imgHtml = c.image_url
    ? `<div class="course-card__img">
         <img src="${c.image_url}" alt="${c.title}" loading="lazy" width="380" height="220">
       </div>`
    : '';

  const priceHtml = c.price_active && c.price
    ? `<p class="course-card__price">R$ ${Number(c.price).toFixed(2).replace('.', ',')}</p>`
    : `<span class="badge badge--secondary">Em breve</span>`;

  return `
    <article class="course-card reveal" data-delay="${delay}">
      ${imgHtml}
      <div class="course-card__body">
        <div class="course-card__meta">
          <span class="badge badge--primary">${catLabel}</span>
          <span class="badge badge--secondary">${levelLabel}</span>
          ${c.duration ? `<span class="badge badge--secondary">${c.duration}</span>` : ''}
        </div>
        <h3 class="course-card__title">${c.title}</h3>
        <p class="course-card__desc">${c.description || ''}</p>
        ${priceHtml}
      </div>
    </article>`;
}

async function loadCourses() {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/courses`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const courses = await res.json();

    if (courses.length === 0) return; // mantém seção "em construção" visível

    const section = document.getElementById('cursos-dinamicos');
    grid.innerHTML = courses.map((c, i) => buildCourseCard(c, i)).join('');
    if (section) section.removeAttribute('hidden');
    window.AMD?.observeReveal?.();
  } catch (err) {
    console.error('Erro ao carregar cursos:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadCourses);
