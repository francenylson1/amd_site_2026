'use strict';

(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  function init() {
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  // Expõe para páginas com conteúdo renderizado dinamicamente
  window.AMD = window.AMD || {};
  window.AMD.observeReveal = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
