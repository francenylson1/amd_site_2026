'use strict';

// Acessibilidade — axe-core em todas as páginas públicas (Fase 1 + Fase 2)
// Zero violações críticas ou sérias é gate de deploy (SPEC §11, CLAUDE.md)

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const PAGES = [
  { name: 'Home',       path: '/'                  },
  { name: 'Obrigado',   path: '/obrigado.html'     },
  { name: 'Sobre',      path: '/sobre.html'        },
  { name: 'Projetos',   path: '/projetos.html'     },
  { name: 'Escolas',    path: '/escolas.html'      },
  { name: 'Eventos',    path: '/eventos.html'      },
  { name: 'Cursos',     path: '/cursos.html'       },
  { name: 'Loja',       path: '/loja.html'         },
  { name: 'Contato',    path: '/contato.html'      },
  { name: 'Quiz',       path: '/quiz.html'         },
  { name: 'Animações',  path: '/animacoes.html'    },
];

for (const { name, path } of PAGES) {
  test(`${name} — zero violações axe críticas/sérias`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    // Desabilita transitions/animations e força .reveal visible antes do scan axe.
    // Necessário em CI headless: IntersectionObserver não dispara sem scroll,
    // e transition-delay faz axe calcular cores com opacidade parcial.
    await page.evaluate(() => {
      const noAnim = document.createElement('style');
      noAnim.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; transition-delay: 0s !important; }';
      document.head.appendChild(noAnim);
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    });
    await page.waitForTimeout(100);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .analyze();

    const blockers = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (blockers.length > 0) {
      const summary = blockers
        .map((v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} elemento(s))`)
        .join('\n');
      expect(blockers, `Violações axe em ${name}:\n${summary}`).toHaveLength(0);
    }

    expect(blockers).toHaveLength(0);
  });
}
