'use strict';

(function () {
  const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE  = /^\(?\d{2}\)?[\s\-]?[\s]?\d{4,5}[\s\-]?\d{4}$/;

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

  function handleScheduleForm(form) {
    const fields  = form.querySelectorAll('input[required], select[required]');
    const submit  = form.querySelector('[type="submit"]');

    // Validação em tempo real
    fields.forEach((f) => {
      f.addEventListener('blur', () => validateField(f));
      f.addEventListener('input', () => {
        if (f.closest('.form-group--error')) validateField(f);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let allValid = true;
      fields.forEach((f) => { if (!validateField(f)) allValid = false; });
      if (!allValid) return;

      if (submit) {
        submit.setAttribute('aria-busy', 'true');
        submit.textContent = 'Enviando…';
      }

      // Fase 1: salva localmente e redireciona
      const data = Object.fromEntries(new FormData(form));
      data._savedAt = new Date().toISOString();
      try {
        const prev = JSON.parse(localStorage.getItem('amd_agendamentos') || '[]');
        prev.push(data);
        localStorage.setItem('amd_agendamentos', JSON.stringify(prev));
      } catch { /* storage indisponível */ }

      setTimeout(() => {
        window.location.href = 'obrigado.html';
      }, 600);
    });
  }

  function init() {
    const scheduleForm = document.getElementById('form-agendamento');
    if (scheduleForm) handleScheduleForm(scheduleForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
