# CLAUDE.md — Aluno Maker Digital

> Entry point para qualquer sessão Claude Code neste projeto. Leia antes de tocar qualquer arquivo.

## Documentos canônicos (fonte da verdade)

Os três documentos abaixo, na raiz, são autoritativos. Em conflito, eles vencem.

1. **`PRD_AlunoMakerDigital.md`** (v2.0) — o que o produto é, para quem, critérios de aceite Gherkin por feature, métricas.
2. **`SPEC_TECNICA_AlunoMakerDigital.md`** (v2.0) — como implementar: stack, estrutura, módulo GPIO, estratégia de testes, CI/CD, segurança.
3. **`WORKFLOW_AlunoMakerDigital.md`** (v1.0) — em que ordem: 7 fases (0 a 6), DoD por fase, procedimentos de deploy/rollback.

Documentos antigos vivem em `docs_rascunhos_old/` — referência histórica, não fonte de verdade.

## Regras invioláveis

1. **Vanilla JS no front.** Sem React, Vue, Angular. Dependências runtime apenas via CDN (Swiper, GLightbox, JSZip, Font Awesome). devDependencies só para testes/lint.
2. **Idioma do projeto: português do Brasil.** Copy, comentários significativos, mensagens de erro ao usuário e commits em pt-BR. Nomes de variáveis/funções/classes em inglês técnico padrão.
3. **Testes são gates, não decoração.** Falha em Playwright (E2E das jornadas críticas), Lighthouse CI (Perf ≥ 85, A11y ≥ 95, Best Practices ≥ 90, SEO ≥ 95) ou axe-core (zero violações críticas/sérias) **bloqueia deploy**.
4. **Nenhuma fase quebra a anterior.** Features em construção ficam atrás de feature flag (`data-feature` + `data-enabled="false"` no front; tabela `feature_flags` no back) até o DoD ser cumprido.

## Estado atual do projeto

| Fase | Status | Tag | Notas |
|---|---|---|---|
| 0 — Fundação documental e ambiente | ✅ Concluída | v0.1.0 | Repo Git + CI + placeholder no ar |
| 1 — Home + layout global | ⏳ | — | — |
| 2 — Demais páginas públicas | ⏳ | — | — |
| 3 — Módulo GPIO (animações) | ⏳ | — | — |
| 4 — Backend + Admin mínimo | ⏳ | — | — |
| 5 — Gerador com Claude API | ⏳ | — | — |
| 6 — Publicador redes + Loja | ⏳ | — | — |

## Comandos úteis (a preencher por fase)

```bash
npm install                   # instala todas as devDependencies
npx playwright install chromium  # baixa o browser para testes locais
npm run dev                   # servidor local em http://localhost:5500 (serve)
npm test                      # Playwright — todos os browsers
npm run test:ci               # Playwright — só Chromium (CI)
npm run lint                  # ESLint + Stylelint
npm run format                # Prettier (corrige)
npx lhci autorun              # Lighthouse CI (sobe servidor automaticamente)
```

## Convenções emergentes

- **ESLint:** usa flat config (`eslint.config.mjs`) — ESLint v10 não suporta `.eslintrc.json`.
- **Dev server:** `serve` (npm) na porta 5500 — substitui Live Server da extensão VS Code.
- **Specs E2E:** usar `require()` (CommonJS) em `*.spec.js` — `playwright.config.js` é CommonJS.
- **Slogan oficial:** "Tecnologia que transforma vidas." (confirmado pelo PO em 2026-05-16).

## Paths críticos

- `tests/e2e/*.spec.js` — testes End-to-End Playwright.
- `tests/e2e/placeholder.spec.js` — sanity check Fase 0 (remover na Fase 1).
- `tests/lighthouse/lighthouserc.json` — thresholds Lighthouse CI.
- `tests/manual-checklists/*.md` — checklists pré-deploy.
- `.env.example` — template de variáveis (Fase 4+).
- `eslint.config.mjs` — configuração ESLint v10 (flat config).
- `.github/workflows/ci.yml` — pipeline: lint + E2E + Lighthouse.
- `.github/workflows/deploy.yml` — FTP automático para staging/produção.

## Manutenção deste arquivo

`CLAUDE.md` deve ser atualizado **obrigatoriamente ao final de cada fase** — é item explícito do DoD no `WORKFLOW`. O que atualizar:

- **Estado atual do projeto** — marcar fase como concluída, registrar tag de release.
- **Comandos úteis** — incluir npm scripts, comandos Playwright/Lighthouse, scripts de deploy que surgiram.
- **Convenções emergentes** — padrões reais que apareceram no código.
- **Paths críticos** — arquivos novos que toda sessão futura precisa conhecer de imediato.

**NUNCA inflar este arquivo.** Conteúdo extenso vai para PRD/SPEC/WORKFLOW. Aqui é apenas índice + regras invioláveis + estado.
