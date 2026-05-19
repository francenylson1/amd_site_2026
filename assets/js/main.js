'use strict';

// WhatsApp: número e mensagem pré-definida (PRD §7.1)
const WHATSAPP_NUMBER = '5561981333875';
const WHATSAPP_MSG    = encodeURIComponent('Olá! Vi o site do Aluno Maker Digital e quero saber mais sobre os projetos e cursos.');

// ---- Partículas no hero ----
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function makeParticle() {
    return {
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    Math.random() * 1.5 + 0.5,
      dx:   (Math.random() - 0.5) * 0.4,
      dy:   (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    };
  }

  function initParticlesArray() {
    const count = Math.floor((canvas.width * canvas.height) / 8000);
    particles   = Array.from({ length: Math.min(count, 120) }, makeParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    // Linhas entre partículas próximas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx  = particles[i].x - particles[j].x;
        const dy  = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth   = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  // Pausa quando fora da viewport (economiza bateria)
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) { animId = requestAnimationFrame(draw); }
      else { cancelAnimationFrame(animId); }
    },
    { threshold: 0 }
  );
  observer.observe(canvas);

  resize();
  initParticlesArray();

  window.addEventListener('resize', () => {
    resize();
    initParticlesArray();
  }, { passive: true });
}

// ---- WhatsApp flutuante ----
function initWhatsApp() {
  const btn = document.createElement('a');
  btn.href      = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;
  btn.target    = '_blank';
  btn.rel       = 'noopener noreferrer';
  btn.className = 'whatsapp-float';
  btn.setAttribute('aria-label', 'Fale conosco pelo WhatsApp');
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.304A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.943 7.943 0 01-4.049-1.109l-.29-.173-2.954.774.788-2.875-.189-.295A7.963 7.963 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
    </svg>
  `;
  document.body.appendChild(btn);
}

// ---- Depoimentos slider ----
function initTestimonials() {
  const cards = document.querySelectorAll('.testimonial-card');
  const dots  = document.querySelectorAll('.testimonials-dot');
  if (!cards.length) return;

  let current  = 0;
  let interval;

  function goTo(idx) {
    cards[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (idx + cards.length) % cards.length;
    cards[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startAuto() {
    interval = setInterval(() => goTo(current + 1), 5000);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(interval);
      goTo(i);
      startAuto();
    });
  });

  startAuto();
}

// ---- Scroll indicator ----
function initScrollIndicator() {
  const el = document.querySelector('.scroll-indicator');
  if (el) {
    el.addEventListener('click', () => {
      const target = document.querySelector('#impacto');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// ---- Inicialização ----
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initWhatsApp();
  initTestimonials();
  initScrollIndicator();
});
