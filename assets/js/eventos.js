const API_BASE = '/api';

const CATEGORY_ICONS = {
  'campus-party':  'fa-bolt',
  'institucional': 'fa-landmark',
  'robotica':      'fa-robot',
  'escola':        'fa-star',
  'default':       'fa-calendar-star',
};

function buildEventSection(ev, index) {
  const icon = CATEGORY_ICONS[ev.category] || CATEGORY_ICONS.default;
  const delay = (index + 1) * 100;
  const slug  = `ev-${ev.id}`;

  const photosHtml = (ev.photos || []).map((ph, i) =>
    `<a href="${ph.image_url}"
        class="glightbox event-photo-item" data-category="${ev.category}"
        data-gallery="${slug}" data-title="${ph.caption || ev.title}"
        aria-label="Foto ${i + 1} — ${ev.title}">
       <img src="${ph.image_url}" alt="${ph.caption || ev.title}"
            loading="lazy" width="300" height="220">
     </a>`
  ).join('');

  const metaText = ev.description ||
    (ev.event_date ? new Date(ev.event_date).getFullYear() : '');

  return `
    <div class="event-section reveal" data-delay="${delay}">
      <div class="event-section__header">
        <div class="event-section__icon" aria-hidden="true">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div>
          <h2 class="event-section__title">${ev.title}</h2>
          ${metaText ? `<p class="event-section__meta">${metaText}</p>` : ''}
        </div>
      </div>
      <div class="events-gallery" data-gallery="eventos">
        ${photosHtml || '<p class="content-loading">Nenhuma foto cadastrada.</p>'}
      </div>
    </div>`;
}

async function loadEvents() {
  const container = document.getElementById('events-container');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const events = await res.json();

    container.innerHTML = events.map((ev, i) => buildEventSection(ev, i)).join('');

    if (typeof GLightbox !== 'undefined') {
      GLightbox({ selector: '.glightbox' });
    }

    window.AMD?.observeReveal?.();
  } catch (err) {
    container.innerHTML = `<p class="content-error">Não foi possível carregar os eventos. Tente novamente mais tarde.</p>`;
    console.error('Erro ao carregar eventos:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadEvents);
