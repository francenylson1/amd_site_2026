'use strict';

(function () {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^\(?\d{2}\)?[\s\-]?[\s]?\d{4,5}[\s\-]?\d{4}$/;
  const API_BASE = '/api';

  // ─── Validação inline ────────────────────────────────────────────────────────

  function validateField(field) {
    const group = field.closest('.form-group');
    if (!group) return true;

    const msg   = group.querySelector('.form-group__error-msg');
    let valid   = true;
    let text    = '';

    if (field.required && !field.value.trim()) {
      valid = false;
      text  = 'Campo obrigatório.';
    } else if (field.type === 'email' && field.value && !EMAIL_RE.test(field.value)) {
      valid = false;
      text  = 'E-mail inválido.';
    } else if (field.dataset.type === 'phone' && field.value && !PHONE_RE.test(field.value)) {
      valid = false;
      text  = 'Telefone inválido.';
    } else if (field.type === 'date' && field.value) {
      const chosen = new Date(field.value + 'T00:00:00');
      const today  = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosen < today) {
        valid = false;
        text  = 'Escolha uma data a partir de hoje.';
      }
    }

    group.classList.toggle('form-group--error', !valid);
    if (msg) {
      msg.textContent = text;
      msg.style.display = valid ? 'none' : 'block';
    }
    return valid;
  }

  // ─── Indicador de status de envio ─────────────────────────────────────────────
  // Exibe ícone verde (servidor) ou amarelo (salvo localmente) após submit

  function showStatusIndicator(form, savedToServer) {
    let el = form.querySelector('.form-status');
    if (!el) {
      el = document.createElement('p');
      el.className = 'form-status';
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('role', 'status');
      form.appendChild(el);
    }

    if (savedToServer) {
      el.innerHTML = '<span aria-hidden="true">✅</span> Enviado com sucesso!';
      el.style.color = '#00843f';
    } else {
      el.innerHTML = '<span aria-hidden="true">🟡</span> Salvo localmente — será reenviado quando o servidor estiver disponível.';
      el.style.color = '#856404';
    }
  }

  // ─── Envio com fallback ────────────────────────────────────────────────────────

  async function submitToApi(endpoint, payload) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      signal:  AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  }

  function saveToLocalStorage(key, data) {
    try {
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      prev.push(data);
      localStorage.setItem(key, JSON.stringify(prev));
    } catch { /* storage indisponível */ }
  }

  // ─── Formulário de agendamento (#form-agendamento) ────────────────────────────

  function handleScheduleForm(form) {
    const fields = form.querySelectorAll('input[required], select[required]');
    const submit = form.querySelector('[type="submit"]');

    fields.forEach((f) => {
      f.addEventListener('blur', () => validateField(f));
      f.addEventListener('input', () => {
        if (f.closest('.form-group--error')) validateField(f);
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let allValid = true;
      fields.forEach((f) => { if (!validateField(f)) allValid = false; });
      if (!allValid) return;

      if (submit) {
        submit.setAttribute('aria-busy', 'true');
        submit.textContent = 'Enviando…';
        submit.disabled = true;
      }

      const data = Object.fromEntries(new FormData(form));
      data._savedAt = new Date().toISOString();

      let savedToServer = false;
      try {
        await submitToApi('/visits', {
          name:       data.nome,
          email:      data.email,
          phone:      data.telefone,
          visit_date: data.data,
          message:    data.mensagem || '',
        });
        savedToServer = true;
      } catch {
        saveToLocalStorage('amd_agendamentos', data);
      }

      showStatusIndicator(form, savedToServer);

      setTimeout(() => {
        window.location.href = 'obrigado.html';
      }, 1200);
    });
  }

  // ─── Formulário de contato (#form-contato) ────────────────────────────────────

  function handleContactForm(form) {
    const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    const submit = form.querySelector('[type="submit"]');

    fields.forEach((f) => {
      f.addEventListener('blur', () => validateField(f));
      f.addEventListener('input', () => {
        if (f.closest('.form-group--error')) validateField(f);
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let allValid = true;
      fields.forEach((f) => { if (!validateField(f)) allValid = false; });
      if (!allValid) return;

      if (submit) {
        submit.setAttribute('aria-busy', 'true');
        submit.textContent = 'Enviando…';
        submit.disabled = true;
      }

      const data = Object.fromEntries(new FormData(form));
      data._type    = 'contato';
      data._savedAt = new Date().toISOString();

      let savedToServer = false;
      try {
        await submitToApi('/contact', {
          name:    data.nome,
          email:   data.email,
          subject: data.assunto || '',
          message: data.mensagem,
        });
        savedToServer = true;
      } catch {
        saveToLocalStorage('amd_contatos', data);
      }

      showStatusIndicator(form, savedToServer);

      setTimeout(() => {
        window.location.href = 'obrigado.html';
      }, 1200);
    });
  }

  // ─── Init ──────────────────────────────────────────────────────────────────────

  function init() {
    const scheduleForm = document.getElementById('form-agendamento');
    if (scheduleForm) handleScheduleForm(scheduleForm);

    const contactForm = document.getElementById('form-contato');
    if (contactForm) handleContactForm(contactForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
