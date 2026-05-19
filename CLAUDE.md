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
| 0 — Fundação documental e ambiente | ✅ Concluída | v0.1.1 | Repo Git + CI verde + placeholder no ar (produção + staging) |
| 1 — Home + layout global | ✅ Concluída | v0.2.0 | Home completa, 120/120 E2E, bundle CSS. Lighthouse ≥ 85 em staging |
| 2 — Demais páginas públicas | ✅ Concluída | v0.3.0 | 8 páginas + quiz.html + gallery.js. 70/70 E2E Chromium + axe 10 páginas verdes |
| 3 — Módulo GPIO (animações) | ⏳ | — | — |
| 4 — Backend + Admin mínimo | ⏳ | — | — |
| 5 — Gerador com Claude API | ⏳ | — | — |
| 6 — Publicador redes + Loja | ⏳ | — | — |

## Comandos úteis

```bash
npm install                        # instala todas as devDependencies
npx playwright install             # baixa todos os browsers para testes locais
npm run dev                        # servidor + watchers (CSS, imagens, vídeos) em http://localhost:5500
npm run build:css                  # gera assets/css/bundle.min.css (rode antes de commitar CSS)
npm test                           # Playwright — todos os browsers (e2e + axe)
npm run test:ci                    # Playwright — só Chromium (CI)
npm run lint                       # ESLint + Stylelint
npm run format                     # Prettier (corrige)
npm run images:optimize            # converte todas as imagens JPG/PNG para WebP em lote
npm run videos:optimize            # comprime MP4 + gera poster WebP (requer ffmpeg)
npx lhci autorun --config=tests/lighthouse/lighthouserc.json  # Lighthouse CI local
```

## Convenções emergentes

- **ESLint:** usa flat config (`eslint.config.mjs`) — ESLint v10 não suporta `.eslintrc.json`.
- **Dev server:** `serve` (npm) na porta 5500 — substitui Live Server da extensão VS Code.
- **Specs E2E:** usar `require()` (CommonJS) em `*.spec.js` — `playwright.config.js` é CommonJS.
- **Slogan oficial:** "Tecnologia que transforma vidas." (confirmado pelo PO em 2026-05-16).
- **Lighthouse CI:** sempre passar `--config=tests/lighthouse/lighthouserc.json`; usa `npx serve` puro como startServerCommand (sem watchers para não distorcer métricas).
- **Lighthouse local vs produção:** FCP local ~4.5s (throttled mobile simulation + 3 domínios externos). Em produção (HTTPS + HTTP/2 + CDN Hostinger) o score ≥ 85 é atingível.
- **CSS:** arquivos-fonte em `assets/css/*.css`; bundle minificado em `assets/css/bundle.min.css`. Sempre rodar `npm run build:css` após alterar qualquer CSS. O watcher de CSS reconstrói automaticamente durante `npm run dev`.
- **Stylelint:** exclui `bundle.min.css` do lint (arquivo gerado).
- **Playwright testDir:** `./tests` com `testMatch` para `**/e2e/**/*.spec.js` e `**/a11y/**/*.spec.js`.
- **ffmpeg:** instalar via `winget install Gyan.FFmpeg` — requerido pelo watcher de vídeos (Opção A).
- **WhatsApp:** número `5561981333875` definido como constante em `assets/js/main.js`.
- **Páginas internas:** todas usam navbar com links para páginas (não âncoras da home). Link ativo marcado com `.navbar__link--active`.
- **GLightbox:** carregado via CDN apenas nas páginas que usam (projetos.html, eventos.html). Script `defer` após `gallery.js`.
- **gallery.js:** usa `container.closest('section')` para escopo dos `[data-category]` — filtros e items são irmãos, não pai-filho.
- **forms.js:** suporta `#form-agendamento` (home) e `#form-contato` (contato.html). Ambos gravam em localStorage com chaves distintas.
- **serve strip .html:** o servidor local remove extensão `.html` das URLs — specs E2E usam regex sem `.html` (ex: `/obrigado/` não `/obrigado\.html/`).

## Paths críticos

- `assets/css/bundle.min.css` — CSS único minificado usado em produção (gerado por `npm run build:css`).
- `assets/js/main.js` — inicialização global: partículas, WhatsApp flutuante, slider depoimentos.
- `tests/e2e/home.spec.js` — 25 testes E2E cobrindo todas as jornadas críticas da home.
- `tests/e2e/navigation.spec.js` — navegação entre todas as 8 páginas públicas.
- `tests/e2e/gallery.spec.js` — filtros client-side e lightbox (projetos + eventos).
- `tests/e2e/contato.spec.js` — formulário de contato + quiz dedicado.
- `tests/a11y/axe.spec.js` — zero violações axe críticas/sérias (gate de deploy).
- `tests/lighthouse/lighthouserc.json` — thresholds Lighthouse CI.
- `tests/manual-checklists/home-smoke.md` — checklist pré-deploy (4 browsers).
- `scripts/watch-css.js` — watcher que reconstrói bundle.min.css ao salvar qualquer .css.
- `scripts/watch-images.js` — converte JPG/PNG para WebP automaticamente.
- `scripts/watch-videos.js` — comprime MP4 + gera poster WebP (requer ffmpeg).
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
