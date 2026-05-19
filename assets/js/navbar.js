'use strict';

(function () {
  function init() {
    const navbar  = document.getElementById('navbar');
    const toggle  = document.getElementById('nav-toggle');
    const menu    = document.getElementById('nav-menu');
    const links   = menu ? menu.querySelectorAll('.navbar__link') : [];

    if (!navbar) return;

    // Sticky ao scroll
    const onScroll = () => {
      navbar.classList.toggle('sticky', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Hamburger
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Fecha ao clicar em link
      links.forEach((link) => {
        link.addEventListener('click', closeMenu);
      });

      // Fecha ao clicar fora
      document.addEventListener('click', (e) => {
        if (menu.classList.contains('nav-open') &&
            !menu.contains(e.target) &&
            !toggle.contains(e.target)) {
          closeMenu();
        }
      });

      // Fecha com Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('nav-open')) closeMenu();
      });
    }

    function closeMenu() {
      if (!menu || !toggle) return;
      menu.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    // Marca link ativo pelo pathname
    const path = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (href && href.includes(path)) link.classList.add('active');
      if (path === 'index.html' || path === '' || path === '/') {
        if (href === 'index.html' || href === '#' || href === './') {
          link.classList.add('active');
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
