'use strict';

// Acessibilidade — axe-core em todas as páginas públicas da Fase 1
// Zero violações críticas ou sérias é gate de deploy (SPEC §11, CLAUDE.md)

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const PAGES = [
  { name: 'Home',       path: '/'              },
  { name: 'Obrigado',   path: '/obrigado.html' },
];

for (const { name, path } of PAGES) {
  test(`${name} — zero violações axe críticas/sérias`, async ({ page }) => {
    await page.goto(path);

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
