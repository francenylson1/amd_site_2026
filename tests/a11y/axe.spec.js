'use strict';

// Acessibilidade — axe-core em todas as páginas públicas (Fase 1 + Fase 2 + Fase 4.5)
// Zero violações críticas ou sérias é gate de deploy (SPEC §11, CLAUDE.md)

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// Mock data para páginas com conteúdo dinâmico
const MOCK_PROJECTS = [
  { id: 1, title: 'Robô Garçom', category: 'roborica', short_desc: 'Robô semi-autônomo', full_desc: 'Descrição', image_url: null, tags: 'Arduino', active: true, sort_order: 10 },
];
const MOCK_EVENTS = [
  { id: 1, title: 'Campus Party', category: 'campus-party', description: 'Evento', event_date: null, active: true, sort_order: 10,
    photos: [{ id: 1, event_id: 1, image_url: 'assets/images/eventos/campus_party/campus_party_BSB_i1.webp', caption: 'Foto 1', sort_order: 10 }] },
];
const MOCK_SCHOOLS = [
  { id: 1, name: 'CEF 101', location: 'Recanto das Emas', description: 'Escola parceira.', image_url: null, year_since: '2018', levels: 'Anos Finais', icon_variant: 'default', active: true, sort_order: 10 },
];
const MOCK_COURSES = [];

const API_MOCKS = {
  '/projetos.html': [
    { pattern: '**/api/projects', body: MOCK_PROJECTS },
  ],
  '/eventos.html': [
    { pattern: '**/api/events', body: MOCK_EVENTS },
  ],
  '/escolas.html': [
    { pattern: '**/api/schools', body: MOCK_SCHOOLS },
  ],
  '/cursos.html': [
    { pattern: '**/api/courses', body: MOCK_COURSES },
  ],
};

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
    // Registra mocks para páginas com conteúdo dinâmico
    const mocks = API_MOCKS[path];
    if (mocks) {
      for (const { pattern, body } of mocks) {
        await page.route(pattern, route =>
          route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
        );
      }
    }

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
