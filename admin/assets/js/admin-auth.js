'use strict';

const API_BASE = '/api';

// ─── Login page ───────────────────────────────────────────────────────────────

const loginForm = document.getElementById('form-login');
if (loginForm) {
  // Se já tem token válido, redireciona direto para o dashboard
  if (getToken()) window.location.replace('galeria.html');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn   = document.getElementById('btn-login');
    const errEl = document.getElementById('login-error');

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    btn.disabled = true;
    btn.textContent = 'Entrando…';
    errEl.classList.remove('login-form__error--visible');

    try {
      const res  = await fetch(`${API_BASE}/admin/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showError(errEl, data.erro || 'Erro ao fazer login.');
        return;
      }

      sessionStorage.setItem('amd_admin_token', data.token);
      window.location.replace('galeria.html');
    } catch {
      showError(errEl, 'Falha de conexão com o servidor.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

const logoutBtn = document.getElementById('btn-logout');
if (logoutBtn) {
  if (!getToken()) window.location.replace('login.html');

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('amd_admin_token');
    window.location.replace('login.html');
  });

  const userEl = document.getElementById('admin-user');
  if (userEl) {
    try {
      const payload = parseJwt(getToken());
      if (payload) userEl.textContent = payload.email || '';
    } catch { /* ignora */ }
  }
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

function getToken() {
  return sessionStorage.getItem('amd_admin_token') || '';
}

function getAuthHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.add('login-form__error--visible');
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
}

// Exporta para uso no dashboard
window.AMD_ADMIN = { getToken, getAuthHeaders, API_BASE };
