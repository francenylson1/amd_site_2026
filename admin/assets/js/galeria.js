'use strict';

const API = '/api/admin';
let token = sessionStorage.getItem('amd_admin_token');

// ── Upload de imagem ──────────────────────────────────────────────────────────
async function uploadFile(fileInput, pathInput, previewEl, statusEl) {
  const file = fileInput.files[0];
  if (!file) return;

  const folder = fileInput.dataset.folder || 'projetos';

  statusEl.textContent = 'Enviando…';
  statusEl.className = 'cms-status';
  previewEl.hidden = true;

  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);

  try {
    const res = await fetch(`${API}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (res.status === 401) { sessionStorage.removeItem('amd_admin_token'); window.location.href = 'login.html'; return; }
    if (!res.ok) { const e = await res.json(); throw new Error(e.erro || 'Erro no upload.'); }

    const data = await res.json();
    pathInput.value = data.path;
    previewEl.src = '/' + data.path;
    previewEl.hidden = false;
    statusEl.textContent = data.webp ? 'Convertido para WebP ✓' : 'Salvo ✓';
    statusEl.className = 'cms-status cms-status--ok';
  } catch (err) {
    statusEl.textContent = err.message;
    statusEl.className = 'cms-status cms-status--error';
  }
}

function initUploadFields() {
  const pairs = [
    ['foto-file',        'foto-url',          'foto-preview',           'foto-upload-status'],
    ['projeto-file',     'projeto-image',     'projeto-preview',        'projeto-upload-status'],
    ['escola-file',      'escola-image',      'escola-preview',         'escola-upload-status'],
    ['curso-file',       'curso-image',       'curso-preview',          'curso-upload-status'],
    ['sobre-file',       'sobre-image',       'sobre-preview',          'sobre-upload-status'],
    ['post-cover-file',  'post-cover-image',  'post-cover-preview',     'post-cover-upload-status'],
  ];
  for (const [fileId, pathId, previewId, statusId] of pairs) {
    const fi = document.getElementById(fileId);
    if (!fi) continue;
    fi.addEventListener('change', () =>
      uploadFile(fi,
        document.getElementById(pathId),
        document.getElementById(previewId),
        document.getElementById(statusId))
    );
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function checkAuth() {
  if (!token) { window.location.href = 'login.html'; return; }
  const payload = JSON.parse(atob(token.split('.')[1]));
  const user = document.getElementById('admin-user');
  if (user) user.textContent = payload.email || '';
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    sessionStorage.removeItem('amd_admin_token');
    window.location.href = 'login.html';
  });
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
  if (res.status === 401) { sessionStorage.removeItem('amd_admin_token'); window.location.href = 'login.html'; }
  return res;
}

// ── Abas ──────────────────────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.cms-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cms-tab').forEach(b => {
        b.classList.remove('cms-tab--active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.cms-panel').forEach(p => {
        p.classList.remove('cms-panel--active');
        p.setAttribute('hidden', '');
      });
      btn.classList.add('cms-tab--active');
      btn.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(`tab-${btn.dataset.tab}`);
      panel.classList.add('cms-panel--active');
      panel.removeAttribute('hidden');
    });
  });
}

// ── Utilitários ───────────────────────────────────────────────────────────────
function setStatus(elId, msg, type = 'ok') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = msg;
  el.className = `cms-status cms-status--${type}`;
  if (msg) setTimeout(() => { el.textContent = ''; }, 4000);
}

function badge(active) {
  return `<span class="cms-badge ${active ? 'cms-badge--on' : 'cms-badge--off'}">${active ? 'Ativo' : 'Inativo'}</span>`;
}

// ── EVENTOS ───────────────────────────────────────────────────────────────────
let eventosData = [];
let fotoEventoId = null;
let fotosData    = [];

async function loadEventos() {
  const lista = document.getElementById('lista-eventos');
  const res = await apiFetch('/events');
  eventosData = await res.json();
  if (!eventosData.length) { lista.innerHTML = '<p class="cms-loading">Nenhum evento cadastrado.</p>'; return; }
  lista.innerHTML = eventosData.map(ev => `
    <div class="cms-item" data-id="${ev.id}">
      <div class="cms-item__info">
        <div class="cms-item__title">${ev.title}</div>
        <div class="cms-item__meta">
          ${ev.category} · ${(ev.photos || []).length} foto(s) · ${badge(ev.active)}
        </div>
      </div>
      <div class="cms-item__actions">
        <button class="btn-cms btn-cms--ghost btn-cms--sm" data-action="fotos" data-id="${ev.id}">Fotos</button>
        <button class="btn-cms btn-cms--ghost btn-cms--sm" data-action="editar-ev" data-id="${ev.id}">Editar</button>
        <button class="btn-cms btn-cms--danger btn-cms--sm" data-action="del-ev" data-id="${ev.id}">Excluir</button>
      </div>
    </div>`).join('');

  lista.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { action, id } = btn.dataset;
      if (action === 'editar-ev')  openFormEvento(Number(id));
      if (action === 'del-ev')     deleteEvento(Number(id));
      if (action === 'fotos')      openPainelFotos(Number(id));
    });
  });
}

function openFormEvento(id = null) {
  const form = document.getElementById('form-evento');
  document.getElementById('form-evento-titulo').textContent = id ? 'Editar evento' : 'Novo evento';
  document.getElementById('evento-id').value = id ?? '';
  const ev = id ? eventosData.find(e => e.id === id) : null;
  document.getElementById('evento-title').value       = ev?.title       ?? '';
  document.getElementById('evento-category').value    = ev?.category    ?? 'campus-party';
  document.getElementById('evento-description').value = ev?.description ?? '';
  document.getElementById('evento-date').value        = ev?.event_date  ? ev.event_date.slice(0, 10) : '';
  document.getElementById('evento-active').checked    = ev ? Boolean(ev.active) : true;
  document.getElementById('evento-sort').value        = ev?.sort_order  ?? 0;
  form.removeAttribute('hidden');
  form.scrollIntoView({ behavior: 'smooth' });
}

async function saveEvento() {
  const id    = document.getElementById('evento-id').value;
  const body  = {
    title:       document.getElementById('evento-title').value.trim(),
    category:    document.getElementById('evento-category').value,
    description: document.getElementById('evento-description').value.trim() || null,
    event_date:  document.getElementById('evento-date').value || null,
    active:      document.getElementById('evento-active').checked,
    sort_order:  Number(document.getElementById('evento-sort').value),
  };
  if (!body.title) { setStatus('evento-status', 'Título é obrigatório.', 'error'); return; }
  const res = id
    ? await apiFetch(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) })
    : await apiFetch('/events', { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) { setStatus('evento-status', 'Erro ao salvar.', 'error'); return; }
  setStatus('evento-status', 'Salvo!');
  document.getElementById('form-evento').setAttribute('hidden', '');
  loadEventos();
}

async function deleteEvento(id) {
  if (!confirm('Excluir este evento e todas as suas fotos?')) return;
  await apiFetch(`/events/${id}`, { method: 'DELETE' });
  loadEventos();
}

// ── FOTOS ─────────────────────────────────────────────────────────────────────
function openPainelFotos(eventId) {
  fotoEventoId = eventId;
  const ev = eventosData.find(e => e.id === eventId);
  document.getElementById('fotos-titulo').textContent = `Fotos — ${ev?.title ?? ''}`;
  document.getElementById('foto-evento-id').value = eventId;
  document.getElementById('foto-id').value = '';
  document.getElementById('foto-url').value = '';
  document.getElementById('foto-caption').value = '';
  document.getElementById('foto-sort').value = 0;
  document.getElementById('painel-fotos').removeAttribute('hidden');
  document.getElementById('btn-salvar-foto').textContent = 'Adicionar foto';
  document.getElementById('btn-cancelar-foto').setAttribute('hidden', '');
  loadFotos(eventId);
}

async function loadFotos(eventId) {
  const lista = document.getElementById('lista-fotos');
  lista.innerHTML = '<p class="cms-loading">Carregando…</p>';
  const res = await apiFetch(`/events`);
  const all = await res.json();
  const ev = all.find(e => e.id === eventId);
  fotosData = ev?.photos ?? [];
  if (!fotosData.length) { lista.innerHTML = '<p class="cms-loading">Nenhuma foto.</p>'; return; }
  lista.innerHTML = fotosData.map(ph => `
    <div class="cms-item cms-item--foto" data-id="${ph.id}">
      <img class="cms-item__thumb" src="/${ph.image_url}" alt="${ph.caption || ''}" loading="lazy">
      <div class="cms-item__info">${ph.caption || ph.image_url.split('/').pop()}</div>
      <div class="cms-item__actions">
        <button class="btn-cms btn-cms--ghost btn-cms--sm" data-action="editar-foto" data-id="${ph.id}">Editar</button>
        <button class="btn-cms btn-cms--danger btn-cms--sm" data-action="del-foto" data-id="${ph.id}">Excluir</button>
      </div>
    </div>`).join('');
  lista.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { action, id } = btn.dataset;
      if (action === 'editar-foto') openEditFoto(Number(id));
      if (action === 'del-foto')    deleteFoto(Number(id));
    });
  });
}

function openEditFoto(photoId) {
  const ph = fotosData.find(p => p.id === photoId);
  if (!ph) return;
  document.getElementById('foto-id').value      = photoId;
  document.getElementById('foto-url').value     = ph.image_url;
  document.getElementById('foto-caption').value = ph.caption ?? '';
  document.getElementById('foto-sort').value    = ph.sort_order;
  const prev = document.getElementById('foto-preview');
  prev.src    = '/' + ph.image_url;
  prev.hidden = false;
  document.getElementById('foto-upload-status').textContent = '';
  document.getElementById('btn-salvar-foto').textContent = 'Salvar alterações';
  document.getElementById('btn-cancelar-foto').removeAttribute('hidden');
}

async function saveFoto() {
  const photoId = document.getElementById('foto-id').value;
  const eventId = document.getElementById('foto-evento-id').value;
  const body = {
    image_url:  document.getElementById('foto-url').value.trim(),
    caption:    document.getElementById('foto-caption').value.trim() || null,
    sort_order: Number(document.getElementById('foto-sort').value),
  };
  if (!body.image_url) { setStatus('foto-status', 'Caminho da imagem é obrigatório.', 'error'); return; }
  const res = photoId
    ? await apiFetch(`/events/${eventId}/photos/${photoId}`, { method: 'PUT', body: JSON.stringify(body) })
    : await apiFetch(`/events/${eventId}/photos`, { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) { setStatus('foto-status', 'Erro ao salvar.', 'error'); return; }
  setStatus('foto-status', 'Salvo!');
  document.getElementById('foto-id').value = '';
  document.getElementById('foto-url').value = '';
  document.getElementById('foto-caption').value = '';
  document.getElementById('foto-sort').value = 0;
  document.getElementById('btn-salvar-foto').textContent = 'Adicionar foto';
  document.getElementById('btn-cancelar-foto').setAttribute('hidden', '');
  loadFotos(Number(eventId));
}

async function deleteFoto(photoId) {
  const eventId = document.getElementById('foto-evento-id').value;
  if (!confirm('Excluir esta foto?')) return;
  await apiFetch(`/events/${eventId}/photos/${photoId}`, { method: 'DELETE' });
  loadFotos(Number(eventId));
}

// ── PROJETOS ──────────────────────────────────────────────────────────────────
let projetosData = [];

async function loadProjetos() {
  const lista = document.getElementById('lista-projetos');
  const res = await apiFetch('/projects');
  projetosData = await res.json();
  if (!projetosData.length) { lista.innerHTML = '<p class="cms-loading">Nenhum projeto cadastrado.</p>'; return; }
  lista.innerHTML = projetosData.map(p => `
    <div class="cms-item" data-id="${p.id}">
      ${p.image_url ? `<img class="cms-item__thumb" src="/${p.image_url}" alt="${p.title}" loading="lazy">` : ''}
      <div class="cms-item__info">
        <div class="cms-item__title">${p.title}</div>
        <div class="cms-item__meta">${p.category} · ${badge(p.active)}</div>
      </div>
      <div class="cms-item__actions">
        <button class="btn-cms btn-cms--ghost btn-cms--sm" data-action="editar-pj" data-id="${p.id}">Editar</button>
        <button class="btn-cms btn-cms--danger btn-cms--sm" data-action="del-pj" data-id="${p.id}">Excluir</button>
      </div>
    </div>`).join('');
  lista.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { action, id } = btn.dataset;
      if (action === 'editar-pj') openFormProjeto(Number(id));
      if (action === 'del-pj')    deleteProjeto(Number(id));
    });
  });
}

function openFormProjeto(id = null) {
  document.getElementById('form-projeto-titulo').textContent = id ? 'Editar projeto' : 'Novo projeto';
  document.getElementById('projeto-id').value = id ?? '';
  const p = id ? projetosData.find(x => x.id === id) : null;
  document.getElementById('projeto-title').value    = p?.title      ?? '';
  document.getElementById('projeto-category').value = p?.category   ?? 'roborica';
  document.getElementById('projeto-short').value    = p?.short_desc ?? '';
  document.getElementById('projeto-full').value     = p?.full_desc  ?? '';
  document.getElementById('projeto-image').value    = p?.image_url  ?? '';
  document.getElementById('projeto-tags').value     = p?.tags       ?? '';
  document.getElementById('projeto-active').checked = p ? Boolean(p.active) : true;
  document.getElementById('projeto-sort').value     = p?.sort_order ?? 0;
  const pPrev = document.getElementById('projeto-preview');
  pPrev.src = p?.image_url ? '/' + p.image_url : '';
  pPrev.hidden = !p?.image_url;
  document.getElementById('projeto-upload-status').textContent = '';
  document.getElementById('form-projeto').removeAttribute('hidden');
}

async function saveProjeto() {
  const id   = document.getElementById('projeto-id').value;
  const body = {
    title:      document.getElementById('projeto-title').value.trim(),
    category:   document.getElementById('projeto-category').value,
    short_desc: document.getElementById('projeto-short').value.trim() || null,
    full_desc:  document.getElementById('projeto-full').value.trim() || null,
    image_url:  document.getElementById('projeto-image').value.trim() || null,
    tags:       document.getElementById('projeto-tags').value.trim() || null,
    active:     document.getElementById('projeto-active').checked,
    sort_order: Number(document.getElementById('projeto-sort').value),
  };
  if (!body.title) { setStatus('projeto-status', 'Título é obrigatório.', 'error'); return; }
  const res = id
    ? await apiFetch(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) })
    : await apiFetch('/projects', { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) { setStatus('projeto-status', 'Erro ao salvar.', 'error'); return; }
  setStatus('projeto-status', 'Salvo!');
  document.getElementById('form-projeto').setAttribute('hidden', '');
  loadProjetos();
}

async function deleteProjeto(id) {
  if (!confirm('Excluir este projeto?')) return;
  await apiFetch(`/projects/${id}`, { method: 'DELETE' });
  loadProjetos();
}

// ── ESCOLAS ───────────────────────────────────────────────────────────────────
let escolasData = [];

async function loadEscolas() {
  const lista = document.getElementById('lista-escolas');
  const res = await apiFetch('/schools');
  escolasData = await res.json();
  if (!escolasData.length) { lista.innerHTML = '<p class="cms-loading">Nenhuma escola cadastrada.</p>'; return; }
  lista.innerHTML = escolasData.map(s => `
    <div class="cms-item" data-id="${s.id}">
      ${s.image_url ? `<img class="cms-item__thumb" src="/${s.image_url}" alt="${s.name}" loading="lazy">` : ''}
      <div class="cms-item__info">
        <div class="cms-item__title">${s.name}</div>
        <div class="cms-item__meta">${s.location ?? ''} · ${badge(s.active)}</div>
      </div>
      <div class="cms-item__actions">
        <button class="btn-cms btn-cms--ghost btn-cms--sm" data-action="editar-es" data-id="${s.id}">Editar</button>
        <button class="btn-cms btn-cms--danger btn-cms--sm" data-action="del-es" data-id="${s.id}">Excluir</button>
      </div>
    </div>`).join('');
  lista.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { action, id } = btn.dataset;
      if (action === 'editar-es') openFormEscola(Number(id));
      if (action === 'del-es')    deleteEscola(Number(id));
    });
  });
}

function openFormEscola(id = null) {
  document.getElementById('form-escola-titulo').textContent = id ? 'Editar escola' : 'Nova escola';
  document.getElementById('escola-id').value = id ?? '';
  const s = id ? escolasData.find(x => x.id === id) : null;
  document.getElementById('escola-name').value        = s?.name         ?? '';
  document.getElementById('escola-location').value    = s?.location     ?? '';
  document.getElementById('escola-description').value = s?.description  ?? '';
  document.getElementById('escola-image').value       = s?.image_url    ?? '';
  document.getElementById('escola-since').value       = s?.year_since   ?? '';
  document.getElementById('escola-levels').value      = s?.levels       ?? '';
  document.getElementById('escola-icon').value        = s?.icon_variant ?? 'default';
  document.getElementById('escola-active').checked    = s ? Boolean(s.active) : true;
  document.getElementById('escola-sort').value        = s?.sort_order   ?? 0;
  const sPrev = document.getElementById('escola-preview');
  sPrev.src = s?.image_url ? '/' + s.image_url : '';
  sPrev.hidden = !s?.image_url;
  document.getElementById('escola-upload-status').textContent = '';
  document.getElementById('form-escola').removeAttribute('hidden');
}

async function saveEscola() {
  const id   = document.getElementById('escola-id').value;
  const body = {
    name:         document.getElementById('escola-name').value.trim(),
    location:     document.getElementById('escola-location').value.trim() || null,
    description:  document.getElementById('escola-description').value.trim() || null,
    image_url:    document.getElementById('escola-image').value.trim() || null,
    year_since:   document.getElementById('escola-since').value.trim() || null,
    levels:       document.getElementById('escola-levels').value.trim() || null,
    icon_variant: document.getElementById('escola-icon').value,
    active:       document.getElementById('escola-active').checked,
    sort_order:   Number(document.getElementById('escola-sort').value),
  };
  if (!body.name) { setStatus('escola-status', 'Nome é obrigatório.', 'error'); return; }
  const res = id
    ? await apiFetch(`/schools/${id}`, { method: 'PUT', body: JSON.stringify(body) })
    : await apiFetch('/schools', { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) { setStatus('escola-status', 'Erro ao salvar.', 'error'); return; }
  setStatus('escola-status', 'Salvo!');
  document.getElementById('form-escola').setAttribute('hidden', '');
  loadEscolas();
}

async function deleteEscola(id) {
  if (!confirm('Excluir esta escola?')) return;
  await apiFetch(`/schools/${id}`, { method: 'DELETE' });
  loadEscolas();
}

// ── CURSOS ────────────────────────────────────────────────────────────────────
let cursosData = [];

async function loadCursos() {
  const lista = document.getElementById('lista-cursos');
  const res = await apiFetch('/courses');
  cursosData = await res.json();
  if (!cursosData.length) { lista.innerHTML = '<p class="cms-loading">Nenhum curso cadastrado.</p>'; return; }
  lista.innerHTML = cursosData.map(c => `
    <div class="cms-item" data-id="${c.id}">
      ${c.image_url ? `<img class="cms-item__thumb" src="/${c.image_url}" alt="${c.title}" loading="lazy">` : ''}
      <div class="cms-item__info">
        <div class="cms-item__title">${c.title}</div>
        <div class="cms-item__meta">${c.category} · ${c.level} · ${badge(c.active)}</div>
      </div>
      <div class="cms-item__actions">
        <button class="btn-cms btn-cms--ghost btn-cms--sm" data-action="editar-cu" data-id="${c.id}">Editar</button>
        <button class="btn-cms btn-cms--danger btn-cms--sm" data-action="del-cu" data-id="${c.id}">Excluir</button>
      </div>
    </div>`).join('');
  lista.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { action, id } = btn.dataset;
      if (action === 'editar-cu') openFormCurso(Number(id));
      if (action === 'del-cu')    deleteCurso(Number(id));
    });
  });
}

function openFormCurso(id = null) {
  document.getElementById('form-curso-titulo').textContent = id ? 'Editar curso' : 'Novo curso';
  document.getElementById('curso-id').value = id ?? '';
  const c = id ? cursosData.find(x => x.id === id) : null;
  document.getElementById('curso-title').value         = c?.title       ?? '';
  document.getElementById('curso-category').value      = c?.category    ?? 'alunos';
  document.getElementById('curso-level').value         = c?.level       ?? 'iniciante';
  document.getElementById('curso-duration').value      = c?.duration    ?? '';
  document.getElementById('curso-description').value   = c?.description ?? '';
  document.getElementById('curso-image').value         = c?.image_url   ?? '';
  document.getElementById('curso-price').value         = c?.price       ?? '';
  document.getElementById('curso-price-active').checked = c ? Boolean(c.price_active) : false;
  document.getElementById('curso-active').checked      = c ? Boolean(c.active) : true;
  document.getElementById('curso-sort').value          = c?.sort_order  ?? 0;
  const cPrev = document.getElementById('curso-preview');
  cPrev.src = c?.image_url ? '/' + c.image_url : '';
  cPrev.hidden = !c?.image_url;
  document.getElementById('curso-upload-status').textContent = '';
  document.getElementById('form-curso').removeAttribute('hidden');
}

async function saveCurso() {
  const id   = document.getElementById('curso-id').value;
  const price = document.getElementById('curso-price').value;
  const body = {
    title:        document.getElementById('curso-title').value.trim(),
    category:     document.getElementById('curso-category').value,
    level:        document.getElementById('curso-level').value,
    duration:     document.getElementById('curso-duration').value.trim() || null,
    description:  document.getElementById('curso-description').value.trim() || null,
    image_url:    document.getElementById('curso-image').value.trim() || null,
    price:        price ? Number(price) : null,
    price_active: document.getElementById('curso-price-active').checked,
    active:       document.getElementById('curso-active').checked,
    sort_order:   Number(document.getElementById('curso-sort').value),
  };
  if (!body.title) { setStatus('curso-status', 'Título é obrigatório.', 'error'); return; }
  const res = id
    ? await apiFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) })
    : await apiFetch('/courses', { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) { setStatus('curso-status', 'Erro ao salvar.', 'error'); return; }
  setStatus('curso-status', 'Salvo!');
  document.getElementById('form-curso').setAttribute('hidden', '');
  loadCursos();
}

async function deleteCurso(id) {
  if (!confirm('Excluir este curso?')) return;
  await apiFetch(`/courses/${id}`, { method: 'DELETE' });
  loadCursos();
}

// ── SOBRE ─────────────────────────────────────────────────────────────────────
let sobreData = [];

const SECTION_LABEL = { professor: 'Foto do Professor', espaco: 'Espaço Maker' };

async function loadSobre() {
  const lista = document.getElementById('lista-sobre');
  lista.innerHTML = '<p class="cms-loading">Carregando fotos…</p>';
  try {
    const res = await apiFetch('/about-photos');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    sobreData = await res.json();
  } catch (err) {
    lista.innerHTML = `<p class="cms-loading cms-loading--error">Erro ao carregar fotos (${err.message}). Verifique se o servidor está atualizado.</p>`;
    return;
  }
  if (!sobreData.length) { lista.innerHTML = '<p class="cms-loading">Nenhuma foto cadastrada.</p>'; return; }
  lista.innerHTML = sobreData.map(p => `
    <div class="cms-item" data-id="${p.id}">
      <img class="cms-item__thumb" src="/${p.image_url}" alt="${p.alt_text || ''}" loading="lazy">
      <div class="cms-item__info">
        <div class="cms-item__title">${p.alt_text || p.image_url.split('/').pop()}</div>
        <div class="cms-item__meta">${SECTION_LABEL[p.section] ?? p.section} · ${badge(p.active)}</div>
      </div>
      <div class="cms-item__actions">
        <button class="btn-cms btn-cms--ghost btn-cms--sm" data-action="editar-sb" data-id="${p.id}">Editar</button>
        <button class="btn-cms btn-cms--danger btn-cms--sm" data-action="del-sb"    data-id="${p.id}">Excluir</button>
      </div>
    </div>`).join('');
  lista.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { action, id } = btn.dataset;
      if (action === 'editar-sb') openFormSobre(Number(id));
      if (action === 'del-sb')    deleteSobre(Number(id));
    });
  });
}

function openFormSobre(id = null) {
  document.getElementById('form-sobre-titulo').textContent = id ? 'Editar foto' : 'Nova foto';
  document.getElementById('sobre-id').value = id ?? '';
  const p = id ? sobreData.find(x => x.id === id) : null;
  document.getElementById('sobre-section').value = p?.section   ?? 'espaco';
  document.getElementById('sobre-image').value   = p?.image_url ?? '';
  document.getElementById('sobre-alt').value     = p?.alt_text  ?? '';
  document.getElementById('sobre-active').checked = p ? Boolean(p.active) : true;
  document.getElementById('sobre-sort').value    = p?.sort_order ?? 0;
  const prev = document.getElementById('sobre-preview');
  prev.src = p?.image_url ? '/' + p.image_url : '';
  prev.hidden = !p?.image_url;
  document.getElementById('sobre-upload-status').textContent = '';
  document.getElementById('form-sobre').removeAttribute('hidden');
  document.getElementById('form-sobre').scrollIntoView({ behavior: 'smooth' });
}

async function saveSobre() {
  const id   = document.getElementById('sobre-id').value;
  const body = {
    section:    document.getElementById('sobre-section').value,
    image_url:  document.getElementById('sobre-image').value.trim(),
    alt_text:   document.getElementById('sobre-alt').value.trim() || null,
    active:     document.getElementById('sobre-active').checked,
    sort_order: Number(document.getElementById('sobre-sort').value),
  };
  if (!body.image_url) { setStatus('sobre-status', 'Imagem é obrigatória.', 'error'); return; }
  const res = id
    ? await apiFetch(`/about-photos/${id}`, { method: 'PUT', body: JSON.stringify(body) })
    : await apiFetch('/about-photos', { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) { setStatus('sobre-status', 'Erro ao salvar.', 'error'); return; }
  setStatus('sobre-status', 'Salvo!');
  document.getElementById('form-sobre').setAttribute('hidden', '');
  loadSobre();
}

async function deleteSobre(id) {
  if (!confirm('Excluir esta foto da página Sobre?')) return;
  await apiFetch(`/about-photos/${id}`, { method: 'DELETE' });
  loadSobre();
}

// ── CONFIGURAÇÕES ─────────────────────────────────────────────────────────────
const CONFIG_KEYS = [
  'whatsapp_num', 'whatsapp_display', 'email_contato',
  'instagram_handle', 'instagram_display', 'youtube_handle', 'tiktok_handle', 'x_handle',
  'endereco_rua', 'endereco_display', 'atendimento_horario',
];

async function loadConfig() {
  try {
    const res = await apiFetch('/config');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    rows.forEach(row => {
      const el = document.getElementById(`cfg-${row.config_key}`);
      if (el) el.value = row.config_value ?? '';
    });
  } catch (err) {
    setStatus('config-status', `Erro ao carregar configurações (${err.message}).`, 'error');
  }
}

async function saveConfig() {
  const body = {};
  CONFIG_KEYS.forEach(key => {
    const el = document.getElementById(`cfg-${key}`);
    if (el) body[key] = el.value.trim();
  });
  try {
    const res = await apiFetch('/config', { method: 'PUT', body: JSON.stringify(body) });
    if (!res.ok) { setStatus('config-status', 'Erro ao salvar.', 'error'); return; }
    setStatus('config-status', 'Configurações salvas! As páginas serão atualizadas na próxima visita.');
    // Limpa cache do site-config.js para forçar atualização
    try { sessionStorage.removeItem('amd_site_config'); } catch (e) { /* ignora */ }
  } catch (err) {
    setStatus('config-status', 'Erro ao salvar.', 'error');
  }
}

// ── Inicialização ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initTabs();

  // Botões de abertura dos formulários
  document.getElementById('btn-novo-evento')  ?.addEventListener('click', () => openFormEvento());
  document.getElementById('btn-novo-projeto') ?.addEventListener('click', () => openFormProjeto());
  document.getElementById('btn-nova-escola')  ?.addEventListener('click', () => openFormEscola());
  document.getElementById('btn-novo-curso')   ?.addEventListener('click', () => openFormCurso());
  document.getElementById('btn-nova-sobre')   ?.addEventListener('click', () => openFormSobre());
  document.getElementById('btn-salvar-config')?.addEventListener('click', saveConfig);

  // Salvar
  document.getElementById('btn-salvar-evento')  ?.addEventListener('click', saveEvento);
  document.getElementById('btn-salvar-projeto') ?.addEventListener('click', saveProjeto);
  document.getElementById('btn-salvar-escola')  ?.addEventListener('click', saveEscola);
  document.getElementById('btn-salvar-curso')   ?.addEventListener('click', saveCurso);
  document.getElementById('btn-salvar-foto')    ?.addEventListener('click', saveFoto);
  document.getElementById('btn-salvar-sobre')   ?.addEventListener('click', saveSobre);

  // Cancelar
  document.getElementById('btn-cancelar-evento')  ?.addEventListener('click', () => document.getElementById('form-evento').setAttribute('hidden', ''));
  document.getElementById('btn-cancelar-projeto') ?.addEventListener('click', () => document.getElementById('form-projeto').setAttribute('hidden', ''));
  document.getElementById('btn-cancelar-escola')  ?.addEventListener('click', () => document.getElementById('form-escola').setAttribute('hidden', ''));
  document.getElementById('btn-cancelar-curso')   ?.addEventListener('click', () => document.getElementById('form-curso').setAttribute('hidden', ''));
  document.getElementById('btn-cancelar-sobre')   ?.addEventListener('click', () => document.getElementById('form-sobre').setAttribute('hidden', ''));
  document.getElementById('btn-cancelar-foto')    ?.addEventListener('click', () => {
    document.getElementById('foto-id').value = '';
    document.getElementById('foto-url').value = '';
    document.getElementById('foto-caption').value = '';
    document.getElementById('foto-preview').hidden = true;
    document.getElementById('foto-upload-status').textContent = '';
    document.getElementById('btn-salvar-foto').textContent = 'Adicionar foto';
    document.getElementById('btn-cancelar-foto').setAttribute('hidden', '');
  });

  // Fechar painel de fotos
  document.getElementById('btn-fechar-fotos')?.addEventListener('click', () => {
    document.getElementById('painel-fotos').setAttribute('hidden', '');
    fotoEventoId = null;
  });

  // Inicializa campos de upload
  initUploadFields();

  document.getElementById('btn-novo-post')   ?.addEventListener('click', () => openFormPost(null));
  document.getElementById('btn-salvar-post') ?.addEventListener('click', savePost);
  document.getElementById('btn-cancelar-post')?.addEventListener('click', () => {
    document.getElementById('form-post').setAttribute('hidden', '');
    document.getElementById('post-cover-preview').hidden = true;
    document.getElementById('post-cover-upload-status').textContent = '';
  });

  // Carrega todas as listas ao iniciar
  loadEventos();
  loadProjetos();
  loadEscolas();
  loadCursos();
  loadSobre();
  loadConfig();
  loadBlogPosts();

  // Pré-preencher aba Blog quando vindo do Gerador (?tab=blog&pre_title=...&pre_content=...)
  const params = new URLSearchParams(window.location.search);
  if (params.get('tab') === 'blog') {
    const blogTab = document.getElementById('btn-tab-blog');
    blogTab?.click();
    const preTitle   = params.get('pre_title')   || '';
    const preContent = params.get('pre_content') || '';
    if (preTitle || preContent) {
      loadBlogPosts().then(() => {
        openFormPost(null);
        if (preTitle)   document.getElementById('post-title').value   = preTitle;
        if (preContent) document.getElementById('post-content').value = preContent;
      });
    }
  }

  // Recarrega lista ao mudar de aba
  document.querySelectorAll('.cms-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab === 'eventos')  loadEventos();
      if (tab === 'projetos') loadProjetos();
      if (tab === 'escolas')  loadEscolas();
      if (tab === 'cursos')   loadCursos();
      if (tab === 'sobre')    loadSobre();
      if (tab === 'config')   loadConfig();
      if (tab === 'blog')     loadBlogPosts();
    });
  });
});

// ── BLOG ──────────────────────────────────────────────────────────────────────
let blogPostsData = [];

function blogStatusBadge(status) {
  return status === 'published'
    ? '<span class="cms-badge cms-badge--on">Publicado</span>'
    : '<span class="cms-badge cms-badge--off">Rascunho</span>';
}

async function loadBlogPosts() {
  const lista = document.getElementById('lista-posts');
  if (!lista) return;
  const res = await apiFetch('/posts');
  blogPostsData = await res.json();
  if (!blogPostsData.length) {
    lista.innerHTML = '<p class="cms-loading">Nenhum post cadastrado.</p>';
    return;
  }
  lista.innerHTML = blogPostsData.map(p => `
    <div class="cms-item" data-id="${p.id}">
      <div class="cms-item__info">
        <div class="cms-item__title">${p.title}</div>
        <div class="cms-item__meta">${blogStatusBadge(p.status)} · ${p.slug}</div>
      </div>
      <div class="cms-item__actions">
        <a class="btn-cms btn-cms--ghost btn-cms--sm" href="../blog-post.html?slug=${encodeURIComponent(p.slug)}" target="_blank" rel="noopener">Ver</a>
        <button class="btn-cms btn-cms--ghost btn-cms--sm" data-action="editar-post" data-id="${p.id}">Editar</button>
        <button class="btn-cms btn-cms--danger btn-cms--sm" data-action="del-post" data-id="${p.id}">Excluir</button>
      </div>
    </div>`).join('');

  lista.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { action, id } = btn.dataset;
      if (action === 'editar-post') openFormPost(Number(id));
      if (action === 'del-post')    deleteBlogPost(Number(id));
    });
  });
}

function slugifyTitle(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function openFormPost(id = null) {
  const form = document.getElementById('form-post');
  document.getElementById('form-post-titulo').textContent = id ? 'Editar post' : 'Novo post';
  document.getElementById('post-id').value = id ?? '';
  const p = id ? blogPostsData.find(x => x.id === id) : null;
  document.getElementById('post-title').value      = p?.title       ?? '';
  document.getElementById('post-slug').value       = p?.slug        ?? '';
  document.getElementById('post-excerpt').value    = p?.excerpt     ?? '';
  document.getElementById('post-content').value    = p?.content     ?? '';
  document.getElementById('post-cover-image').value = p?.cover_image ?? '';
  document.getElementById('post-youtube-id').value = p?.youtube_id  ?? '';
  document.getElementById('post-status').value     = p?.status      ?? 'draft';
  document.getElementById('post-cover-preview').hidden = !p?.cover_image;
  if (p?.cover_image) document.getElementById('post-cover-preview').src = '/' + p.cover_image;
  setStatus('post-status-msg', '');
  form.removeAttribute('hidden');
  form.scrollIntoView({ behavior: 'smooth' });

  // Auto-gerar slug ao digitar título (apenas em criação)
  if (!id) {
    document.getElementById('post-title').oninput = function () {
      if (!document.getElementById('post-slug').value) {
        document.getElementById('post-slug').placeholder = slugifyTitle(this.value) || 'gerado-automaticamente-do-titulo';
      }
    };
  } else {
    document.getElementById('post-title').oninput = null;
  }
}

async function savePost() {
  const id      = document.getElementById('post-id').value;
  const title   = document.getElementById('post-title').value.trim();
  const slug    = document.getElementById('post-slug').value.trim();
  const content = document.getElementById('post-content').value.trim();

  if (!title) { setStatus('post-status-msg', 'Título é obrigatório.', 'error'); return; }
  if (!content) { setStatus('post-status-msg', 'Conteúdo é obrigatório.', 'error'); return; }

  const body = {
    title,
    slug: slug || undefined,
    excerpt:      document.getElementById('post-excerpt').value.trim()    || undefined,
    content,
    cover_image:  document.getElementById('post-cover-image').value.trim() || undefined,
    youtube_id:   document.getElementById('post-youtube-id').value.trim() || undefined,
    status:       document.getElementById('post-status').value,
  };

  setStatus('post-status-msg', 'Salvando…');
  const res = await apiFetch(id ? `/posts/${id}` : '/posts', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    setStatus('post-status-msg', err.erro || 'Erro ao salvar.', 'error');
    return;
  }
  setStatus('post-status-msg', 'Salvo com sucesso!');
  document.getElementById('form-post').setAttribute('hidden', '');
  loadBlogPosts();
}

async function deleteBlogPost(id) {
  if (!confirm('Excluir este post? Esta ação não pode ser desfeita.')) return;
  const res = await apiFetch(`/posts/${id}`, { method: 'DELETE' });
  if (!res.ok) { alert('Erro ao excluir.'); return; }
  loadBlogPosts();
}
