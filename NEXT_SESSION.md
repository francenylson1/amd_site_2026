
# Próxima sessão: concluir Fase 2 → merge PR #2 → Fase 3

## Prompt para iniciar a sessão

```
Continuar o projeto Aluno Maker Digital a partir do smoke manual da Fase 2.
Leia o CLAUDE.md e este arquivo antes de qualquer ação.
PR #2 está aberto: feat(fase-2) — 8 páginas públicas.
Preciso finalizar o smoke manual, corrigir eventuais problemas,
aprovar o Lighthouse CI e fazer o merge em develop → tag v0.3.0 → main.
```

---

## Estado atual (2026-05-18)

| Fase | Status | Tag | Notas |
|---|---|---|---|
| 0 — Fundação | ✅ Concluída | v0.1.1 | — |
| 1 — Home + layout global | ✅ Concluída | v0.2.0 | — |
| 2 — Demais páginas públicas | 🔄 Em revisão | — | PR #2 aberto, smoke pendente |
| 3 — Módulo GPIO (animações) | ⏳ Próxima | — | — |

Branch: `feature/fase-2-paginas-publicas`  
PR: https://github.com/francenylson1/amd_site_2026/pull/2  
Base do PR: `develop`

---

## O que foi feito nesta sessão

### Páginas criadas
- `sobre.html` — missão/visão/valores, bio Prof. Fran, timeline 2018–2025, inclusão TEA
- `projetos.html` — 9 projetos, filtros client-side 5 categorias, GLightbox
- `escolas.html` — 9 school-cards com fotos reais + iframe Google Maps estático
- `eventos.html` — 6 eventos com galeria por seção (Campus Party, IFB, CLDF, CMB, etc.)
- `cursos.html` — catálogo completo + consultoria + assinatura, todos "Em breve"
- `loja.html` — kit didático + camiseta, CTA WhatsApp
- `contato.html` — formulário validado + localStorage + mapa embed
- `quiz.html` — página dedicada reutilizando `quiz.js` existente

### Arquivos modificados
- `assets/js/gallery.js` — NOVO: filtros client-side + GLightbox init
- `assets/js/forms.js` — atualizado: suporte ao `#form-contato`
- `assets/css/components.css` — +~600 linhas novos componentes
- `assets/css/responsive.css` — responsivo das páginas internas
- `assets/css/bundle.min.css` — rebuilt
- `index.html` — navbar atualizada com links para todas as páginas
- `sitemap.xml` — 10 URLs com prioridades
- `.gitignore` — `assets/videos/` e `*.mp4` excluídos
- `CLAUDE.md` — Fase 2 marcada ✅, convenções novas registradas

### Testes
- `tests/e2e/navigation.spec.js` — 14 testes de navegação
- `tests/e2e/gallery.spec.js` — 9 testes de galeria/filtros
- `tests/e2e/contato.spec.js` — 11 testes de formulário + quiz dedicado
- `tests/a11y/axe.spec.js` — expandido para 10 páginas
- **Resultado: 70/70 E2E Chromium + axe 10 páginas — todos verdes**

---

## Pendências desta sessão (para resolver amanhã)

### 1. Smoke manual (🔴 não iniciado)
Checklist completo em `tests/manual-checklists/fase2-smoke.md`.

Roteiro resumido (Chrome Desktop → Chrome Mobile → Firefox → Safari):
- sobre.html: timeline, fotos, CTA
- projetos.html: filtros client-side, flip card, GLightbox
- escolas.html: mapa embed, 9 cards com imagens
- eventos.html: galerias por evento, GLightbox
- cursos.html: cards Em breve, quiz CTA, WhatsApp
- loja.html: 2 produtos, botão WhatsApp
- contato.html: validação de formulário, redireciona para obrigado.html
- quiz.html: 3 perguntas → resultado → refazer

### 2. Lighthouse CI nas novas páginas (🔴 não rodado)
```bash
npx lhci autorun --config=tests/lighthouse/lighthouserc.json
```
Gate: Performance ≥ 85, A11y ≥ 95, BP ≥ 90, SEO ≥ 95 em todas as páginas.

### 3. CI do GitHub Actions (🔴 aguardando)
Acompanhar em: https://github.com/francenylson1/amd_site_2026/actions

### 4. Após smoke + Lighthouse aprovados
```bash
# Merge PR #2 via GitHub (approve → merge → delete branch)
# Tag em main:
git checkout main
git pull origin main
git tag v0.3.0 -m "Fase 2: site institucional completo"
git push origin v0.3.0
# Atualizar CLAUDE.md: Fase 2 tag = v0.3.0
```

---

## Convenções novas desta fase (já no CLAUDE.md)

- `gallery.js` usa `container.closest('section')` para escopo dos `[data-category]`
- Servidor `serve` strip `.html` — specs E2E usam regex sem `.html`
- GLightbox via CDN só em projetos.html e eventos.html
- Navbar interna com `.navbar__link--active` na página corrente
- Google Maps: iframe estático (sem chave API) — decisão do PO
- Vídeos NÃO versionados no Git — ficam apenas locais, hospedar externamente na Fase 4

---

## Lembretes

- Vanilla JS — sem React, Vue ou Angular
- Todo copy e commits em pt-BR
- Rodar `npm run build:css` após qualquer mudança de CSS
- `npm run test:ci` antes de qualquer commit novo
- gh CLI em `C:\Program Files\GitHub CLI\gh.exe` (adicionar ao PATH antes de usar)
