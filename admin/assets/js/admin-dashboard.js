'use strict';

const { API_BASE, getAuthHeaders } = window.AMD_ADMIN;

const STATUS_LABEL = { pending: 'Pendente', confirmed: 'Confirmado', cancelled: 'Cancelado' };
const STATUS_CLASS = { pending: 'badge--pending', confirmed: 'badge--confirmed', cancelled: 'badge--cancelled' };

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = String(dateStr).split('T')[0].split('-');
  return `${d}/${m}/${y}`;
}

// ─── Contatos ─────────────────────────────────────────────────────────────────

async function loadContacts() {
  const tbody = document.getElementById('table-contacts');
  const metricEl = document.getElementById('metric-contacts');

  try {
    const res  = await fetch(`${API_BASE}/admin/contacts`, { headers: getAuthHeaders() });
    if (res.status === 401) { window.location.replace('login.html'); return; }
    const data = await res.json();

    if (metricEl) metricEl.textContent = data.length;

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">Nenhum contato ainda.</td></tr>';
      return;
    }

    tbody.innerHTML = data.map((c) => `
      <tr>
        <td>${c.id}</td>
        <td>${esc(c.name)}</td>
        <td><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></td>
        <td>${esc(c.subject || '—')}</td>
        <td>${fmt(c.created_at)}</td>
      </tr>
    `).join('');
  } catch {
    tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">Erro ao carregar contatos.</td></tr>';
  }
}

// ─── Agendamentos ─────────────────────────────────────────────────────────────

async function loadVisits() {
  const tbody = document.getElementById('table-visits');
  const metricEl  = document.getElementById('metric-visits');
  const pendingEl = document.getElementById('metric-pending');

  try {
    const res  = await fetch(`${API_BASE}/admin/visits`, { headers: getAuthHeaders() });
    if (res.status === 401) { window.location.replace('login.html'); return; }
    const data = await res.json();

    if (metricEl)  metricEl.textContent  = data.length;
    if (pendingEl) pendingEl.textContent = data.filter((v) => v.status === 'pending').length;

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="admin-empty">Nenhum agendamento ainda.</td></tr>';
      return;
    }

    tbody.innerHTML = data.map((v) => `
      <tr>
        <td>${v.id}</td>
        <td>${esc(v.name)}</td>
        <td><a href="mailto:${esc(v.email)}">${esc(v.email)}</a></td>
        <td>${fmtDate(v.visit_date)}</td>
        <td><span class="badge ${STATUS_CLASS[v.status] || ''}">${STATUS_LABEL[v.status] || v.status}</span></td>
        <td>${fmt(v.created_at)}</td>
      </tr>
    `).join('');
  } catch {
    tbody.innerHTML = '<tr><td colspan="6" class="admin-empty">Erro ao carregar agendamentos.</td></tr>';
  }
}

// ─── Escape XSS ───────────────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  loadContacts();
  loadVisits();

  document.getElementById('btn-refresh-contacts')?.addEventListener('click', loadContacts);
  document.getElementById('btn-refresh-visits')?.addEventListener('click', loadVisits);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
