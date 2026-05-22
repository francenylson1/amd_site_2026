'use strict';

(function () {
  var CACHE_KEY = 'amd_site_config';
  var CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  function buildHref(key, value) {
    if (key === 'instagram_handle') return 'https://instagram.com/' + value;
    if (key === 'youtube_handle')   return 'https://youtube.com/' + value;
    if (key === 'email_contato')    return 'mailto:' + value;
    return value;
  }

  function applyConfig(config) {
    // Atualiza textContent de elementos com data-config
    document.querySelectorAll('[data-config]').forEach(function (el) {
      var key = el.dataset.config;
      if (config[key] !== undefined && config[key] !== null) {
        el.textContent = config[key];
      }
    });

    // Atualiza href de elementos com data-config-href
    document.querySelectorAll('[data-config-href]').forEach(function (el) {
      var key = el.dataset.configHref;
      var value = config[key];
      if (!value) return;

      if (key === 'whatsapp_num') {
        // Preserva o ?text= original ao trocar só o número
        var existing = el.getAttribute('href') || '';
        var textMatch = existing.match(/(\?text=[^&]*)/);
        el.href = 'https://wa.me/' + value + (textMatch ? textMatch[1] : '');
      } else if (key === 'email_contato') {
        el.href = 'mailto:' + value;
        // Também atualiza textContent se não tiver data-config separado
        if (!el.dataset.config) el.textContent = value;
      } else {
        el.href = buildHref(key, value);
      }
    });

    // Atualiza o botão WhatsApp flutuante criado por main.js (via setTimeout para garantir que já existe no DOM)
    if (config.whatsapp_num) {
      setTimeout(function () {
        var floatBtn = document.querySelector('.whatsapp-float');
        if (floatBtn) {
          var existing = floatBtn.getAttribute('href') || '';
          floatBtn.href = existing.replace(
            /https:\/\/wa\.me\/\d+/,
            'https://wa.me/' + config.whatsapp_num
          );
        }
      }, 0);
    }
  }

  function loadConfig() {
    // Verifica cache no sessionStorage
    try {
      var cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        var parsed = JSON.parse(cached);
        if (Date.now() - parsed.ts < CACHE_TTL) {
          applyConfig(parsed.data);
          return;
        }
      }
    } catch (e) { /* ignora erro de parse ou storage */ }

    // Busca da API — falha silenciosa (mantém valores hardcoded)
    fetch('/api/content/config')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data }));
        } catch (e) { /* storage cheio */ }
        applyConfig(data);
      })
      .catch(function () { /* silencioso */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadConfig);
  } else {
    loadConfig();
  }
})();
