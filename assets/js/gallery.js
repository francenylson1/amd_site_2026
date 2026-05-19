'use strict';

(function () {
  function initGalleryFilter(container) {
    const filterBtns = container.querySelectorAll('[data-filter]');
    if (!filterBtns.length) return;

    // Procura itens na seção pai; fallback para o documento inteiro
    const scope = container.closest('section') || document;
    const items = scope.querySelectorAll('[data-category]');

    if (!items.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => {
          b.classList.remove('filter-btn--active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('filter-btn--active');
        btn.setAttribute('aria-pressed', 'true');

        const filter = btn.dataset.filter;

        items.forEach((item) => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.style.display = match ? '' : 'none';
          item.setAttribute('aria-hidden', match ? 'false' : 'true');
        });
      });
    });
  }

  function initLightbox() {
    if (typeof GLightbox === 'undefined') return;
    GLightbox({ selector: '.glightbox', touchNavigation: true, loop: true });
  }

  function init() {
    document.querySelectorAll('[data-gallery]').forEach(initGalleryFilter);
    initLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
