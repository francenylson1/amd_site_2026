/* gerador.js — Fase 5: Gerador de Conteúdo com Claude API */
// API_BASE e getToken() herdados do escopo global via admin-auth.js

const FORMAT_LABELS = {
  instagram: { icon: '📸', label: 'Instagram' },
  tiktok:    { icon: '🎵', label: 'TikTok' },
  twitter:   { icon: '🐦', label: 'X / Twitter' },
  whatsapp:  { icon: '💬', label: 'WhatsApp' },
  blog:      { icon: '📝', label: 'Blog' },
};

const ITEM_TYPE_LABELS = {
  projeto: 'Projetos',
  evento:  'Eventos',
  curso:   'Cursos',
};

function getToken() {
  return sessionStorage.getItem('amd_admin_token');
}

async function apiFetch(endpoint, opts = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...opts.headers,
    },
    ...opts,
  });
  if (res.status === 401) {
    sessionStorage.removeItem('amd_admin_token');
    location.href = 'login.html';
    return;
  }
  return res;
}

// ─── Fonte de conteúdo ─────────────────────────────────────
function initSourceTabs() {
  const tabs = document.querySelectorAll('.source-tab');
  const panels = document.querySelectorAll('.source-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('source-tab--active'));
      panels.forEach(p => p.classList.remove('source-panel--active'));
      tab.classList.add('source-tab--active');
      document.getElementById(`source-${tab.dataset.source}`).classList.add('source-panel--active');
    });
  });
}

// ─── Carrega itens do banco quando tipo muda ───────────────
async function loadItems(type) {
  const select = document.getElementById('item-id');
  select.innerHTML = '<option value="">Carregando...</option>';
  select.disabled = true;

  const endpointMap = {
    projeto: '/admin/projects',
    evento:  '/admin/events',
    curso:   '/admin/courses',
  };

  const res = await apiFetch(endpointMap[type]);
  if (!res || !res.ok) {
    select.innerHTML = '<option value="">Erro ao carregar</option>';
    return;
  }
  const data = await res.json();
  const items = data.projects || data.events || data.courses || [];

  if (!items.length) {
    select.innerHTML = '<option value="">Nenhum item cadastrado</option>';
    select.disabled = true;
    return;
  }

  select.innerHTML = '<option value="">Selecione...</option>'
    + items.map(i => `<option value="${i.id}">${i.title || i.name}</option>`).join('');
  select.disabled = false;
}

function initItemTypeSelect() {
  const typeSelect = document.getElementById('item-type');
  typeSelect.addEventListener('change', () => {
    if (typeSelect.value) loadItems(typeSelect.value);
  });
}

// ─── Geração ───────────────────────────────────────────────
function buildPayload() {
  const activeTab = document.querySelector('.source-tab--active');
  const source = activeTab?.dataset.source || 'theme';

  const formats = [...document.querySelectorAll('.format-check input:checked')]
    .map(el => el.value);

  const payload = { source, formats };

  if (source === 'item') {
    payload.item_type = document.getElementById('item-type').value;
    payload.item_id   = parseInt(document.getElementById('item-id').value, 10);
  } else {
    payload.theme = document.getElementById('theme-input').value.trim();
  }

  const extraNotes = document.getElementById('extra-notes').value.trim();
  if (extraNotes) payload.extra_notes = extraNotes;

  return payload;
}

function validate(payload) {
  if (!payload.formats.length) return 'Selecione ao menos um formato.';
  if (payload.source === 'item') {
    if (!payload.item_type) return 'Selecione o tipo de conteúdo.';
    if (!payload.item_id)   return 'Selecione um item.';
  }
  if (payload.source === 'theme' && !payload.theme) return 'Informe o tema.';
  return null;
}

function setLoading(loading) {
  const btn = document.getElementById('btn-gerar');
  const spinner = btn.querySelector('.spinner');
  const label   = btn.querySelector('.btn-label');
  btn.disabled = loading;
  spinner.hidden = !loading;
  label.textContent = loading ? 'Gerando...' : '✨ Gerar conteúdo';
}

function showAlert(msg) {
  let el = document.getElementById('gen-alert');
  if (!el) {
    el = document.createElement('div');
    el.id = 'gen-alert';
    el.className = 'gen-alert gen-alert--error';
    document.getElementById('btn-gerar').insertAdjacentElement('afterend', el);
  }
  el.textContent = msg;
  el.hidden = false;
}

function hideAlert() {
  const el = document.getElementById('gen-alert');
  if (el) el.hidden = true;
}

function renderResults(results) {
  const area = document.getElementById('results-area');
  if (!results.length) {
    area.innerHTML = '<div class="results-empty"><span class="results-empty__icon">📭</span>Nenhum resultado.</div>';
    return;
  }

  area.innerHTML = results.map(r => {
    const { icon, label } = FORMAT_LABELS[r.format] || { icon: '📄', label: r.format };
    const cost = (r.cost_usd * 100).toFixed(4);
    const cacheTag = r.cached ? '<span class="cache-hit">cache hit</span>' : '';
    const safeContent = escapeHtml(r.content);

    return `
      <div class="result-card" data-format="${r.format}">
        <div class="result-card__header">
          <span class="result-card__format">${icon} ${label}</span>
          <div class="result-card__meta">
            ${cacheTag}
            <span>${r.tokens_in + r.tokens_out} tokens | ¢${cost}</span>
            <button class="btn-copy" data-content="${escapeAttr(r.content)}">Copiar</button>
          </div>
        </div>
        <div class="result-card__body">
          <pre class="result-card__text">${safeContent}</pre>
        </div>
      </div>
    `;
  }).join('');

  // Botões de copiar
  area.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.content;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✓ Copiado!';
        btn.classList.add('btn-copy--copied');
        setTimeout(() => {
          btn.textContent = 'Copiar';
          btn.classList.remove('btn-copy--copied');
        }, 2000);
      });
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

async function handleGenerate() {
  hideAlert();
  const payload = buildPayload();
  const err = validate(payload);
  if (err) { showAlert(err); return; }

  setLoading(true);
  document.getElementById('results-area').innerHTML =
    '<div class="results-empty"><span class="spinner" style="width:2rem;height:2rem;border-width:3px;border-color:#e5e7eb;border-top-color:#00843f;"></span><span>Claude está gerando o conteúdo...</span></div>';

  const res = await apiFetch('/admin/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setLoading(false);

  if (!res) return;

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    showAlert(body.erro || `Erro ${res.status} ao gerar.`);
    document.getElementById('results-area').innerHTML =
      '<div class="results-empty"><span class="results-empty__icon">⚠️</span>Não foi possível gerar.</div>';
    return;
  }

  const data = await res.json();
  renderResults(data.results || []);
  loadHistory(); // atualiza histórico e custo do mês
}

// ─── Histórico e custo ─────────────────────────────────────
async function loadHistory() {
  const res = await apiFetch('/admin/generations');
  if (!res || !res.ok) return;
  const data = await res.json();

  renderHistory(data.generations || []);
  updateCostBadge(parseFloat(data.month_cost || 0));
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
       + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function renderHistory(items) {
  const list = document.getElementById('history-list');
  if (!items.length) {
    list.innerHTML = '<p class="history-empty">Nenhuma geração ainda.</p>';
    return;
  }

  list.innerHTML = items.map(g => {
    const { icon, label } = FORMAT_LABELS[g.format] || { icon: '📄', label: g.format };
    const preview = escapeHtml((g.output_preview || '').replace(/\n/g, ' ').substring(0, 80));
    const date    = formatDate(g.created_at);
    return `
      <div class="history-item" title="${preview}">
        <span class="history-item__format">${icon} ${label}</span>
        <span class="history-item__preview">${preview}</span>
        <span class="history-item__date">${date}</span>
      </div>
    `;
  }).join('');
}

function updateCostBadge(costUsd) {
  const badge = document.getElementById('cost-badge');
  const alert  = costUsd > 5;
  badge.className = `cost-badge${alert ? ' cost-badge--alert' : ''}`;
  badge.innerHTML = `${alert ? '⚠️' : '💰'} Custo do mês: US$ ${costUsd.toFixed(4)}${alert ? ' — limite próximo!' : ''}`;
}

// ─── Init ──────────────────────────────────────────────────
// Scripts estão ao final do <body>, DOM já está disponível
(function init() {
  if (!getToken()) { location.href = 'login.html'; return; }

  initSourceTabs();
  initItemTypeSelect();

  document.getElementById('btn-gerar').addEventListener('click', handleGenerate);

  loadHistory();
}());
