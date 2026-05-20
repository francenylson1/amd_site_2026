const API_BASE = '/api';

const ICON_VARIANTS = {
  purple: 'school-card__icon--purple',
  gold:   'school-card__icon--gold',
  default: '',
};

const ICON_FA = {
  purple: 'fa-hands-asl-interpreting',
  gold:   'fa-star',
  default: 'fa-school',
};

function buildSchoolCard(s, index) {
  const delay = (index + 1) * 50 + 50;
  const iconClass = ICON_VARIANTS[s.icon_variant] || '';
  const iconFa    = ICON_FA[s.icon_variant]    || ICON_FA.default;

  const photoHtml = s.image_url
    ? `<div class="school-card__photo">
         <img src="${s.image_url}" alt="Atividade de robótica no ${s.name}"
              loading="lazy" width="380" height="220">
       </div>`
    : '';

  const levelsHtml = s.levels
    ? s.levels.split(',').map(l => {
        const isSpecial = l.trim().includes('Inclusão') || l.trim().includes('especial') || l.trim().includes('Inicial');
        const cls = isSpecial ? 'badge--primary' : 'badge--secondary';
        return `<span class="badge ${cls}">${l.trim()}</span>`;
      }).join('')
    : '';

  const sinceBadge = s.year_since
    ? `<span class="badge badge--primary">Desde ${s.year_since}</span>`
    : '';

  return `
    <article class="school-card reveal" data-delay="${delay}" id="${s.name.toLowerCase().replace(/\s+/g, '-')}">
      <div class="school-card__header">
        <div class="school-card__icon ${iconClass}" aria-hidden="true">
          <i class="fa-solid ${iconFa}"></i>
        </div>
        <div>
          <h3 class="school-card__name">${s.name}</h3>
          ${s.location ? `<span class="school-card__location">
            <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
            ${s.location}
          </span>` : ''}
        </div>
      </div>
      ${photoHtml}
      <p class="school-card__desc">${s.description || ''}</p>
      <div class="school-card__badge">
        ${sinceBadge}
        ${levelsHtml}
      </div>
    </article>`;
}

async function loadSchools() {
  const grid = document.getElementById('schools-grid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/schools`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const schools = await res.json();

    grid.innerHTML = schools.map((s, i) => buildSchoolCard(s, i)).join('');

    window.AMD?.observeReveal?.();
  } catch (err) {
    grid.innerHTML = `<p class="content-error">Não foi possível carregar as escolas. Tente novamente mais tarde.</p>`;
    console.error('Erro ao carregar escolas:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadSchools);
