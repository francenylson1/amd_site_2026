'use strict';

(function () {
  const DURATION = 2000; // ms

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  function init() {
    const section = document.querySelector('.counters');
    if (!section) return;

    const counters = section.querySelectorAll('[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          counters.forEach(animateCounter);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(section);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
