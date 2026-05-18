
# Próxima sessão: Fase 2 — Demais páginas públicas

## Prompt para iniciar a sessão

```
Iniciar a Fase 2 do projeto Aluno Maker Digital.
Leia o CLAUDE.md primeiro. A Fase 1 está concluída (tag v0.2.0, PR #1 merged em develop).
Antes de qualquer ação, me apresente:
1. Um plano enxuto da Fase 2 (tarefas em ordem).
2. As dependências/decisões que precisa de mim.
3. Quais comandos você vai rodar localmente.
Só comece a executar depois que eu aprovar o plano.
```

---

## Estado atual (2026-05-18)

| Fase | Status | Tag |
|---|---|---|
| 0 — Fundação | ✅ Concluída | v0.1.1 |
| 1 — Home + layout global | ✅ Concluída | v0.2.0 |
| 2 — Demais páginas públicas | ⏳ Próxima | — |

Branch atual: `develop` (limpo, CI verde)

---

## O que existe hoje

- `index.html` — home completa (7 seções)
- `obrigado.html` — confirmação de agendamento
- `assets/css/bundle.min.css` — bundle minificado (23 KB)
- `assets/js/` — 6 módulos (animations, counter, navbar, quiz, forms, main)
- Testes: 26/26 E2E + axe Chromium passando
- CI: Lint + E2E + Lighthouse CI — 6/6 verde
- Deploy automático: develop → staging | main → produção (FTP Hostinger)

---

## Páginas previstas na Fase 2 (ver PRD_AlunoMakerDigital.md)

- `cursos.html` — catálogo de cursos (cards + filtros)
- `sobre.html` — história do projeto, equipe, espaço maker
- `contato.html` (ou integrar ao form já existente na home)
- Verificar PRD para lista completa e critérios de aceite Gherkin

---

## Pendências que vieram da Fase 1

- [ ] Instalar ffmpeg: `winget install Gyan.FFmpeg`
  - Depois rodar: `npm run videos:optimize` (comprime MP4 + gera poster WebP)
  - Vídeos em `assets/videos/` ainda não foram otimizados

---

## Lembretes

- Vanilla JS — sem React, Vue ou Angular
- Todo copy, comentários e commits em pt-BR
- Rodar `npm run build:css` após qualquer mudança de CSS
- Rodar `npm run test:ci` antes de commitar para verificar E2E
- `Opus 4.7` reservado para Fases 3, 4 e 5 (decisões arquiteturais + módulo GPIO)
