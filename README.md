# Aluno Maker Digital — amd_site_2026

Plataforma de robótica educacional para escolas públicas do Recanto das Emas, DF.

**Responsável:** Professor Francenylson  
**Domínio:** alunomakerdigital.com.br  
**Stack:** HTML5 + CSS3 + Vanilla JS (Fases 1–3) | Node.js + MySQL (Fase 4+)

---

## Pré-requisitos

- Node.js v24.x LTS
- Git

## Configuração do ambiente local

```bash
git clone https://github.com/francenylson1/amd_site_2026.git
cd amd_site_2026
npm install
npx playwright install --with-deps
```

## Comandos disponíveis

```bash
npm run dev          # Servidor local em http://localhost:5500
npm test             # Testes E2E com Playwright (todos os browsers)
npm run test:ci      # Testes E2E apenas Chromium (CI local)
npm run lint         # ESLint + Stylelint
npm run lint:js      # Apenas ESLint (assets/js)
npm run lint:css     # Apenas Stylelint (assets/css)
npm run format       # Prettier (corrige formatação)
npm run format:check # Prettier (só verifica, não corrige)
npx lhci autorun     # Lighthouse CI (requer servidor no ar)
```

## Branches

| Branch | Ambiente | Trigger de deploy |
|---|---|---|
| `main` | Produção — alunomakerdigital.com.br | Tag `vN.M.P` |
| `develop` | Staging — staging.alunomakerdigital.com.br | Push/merge |
| `feature/*` | Local | PR para `develop` |
| `hotfix/*` | Local | PR para `main` + merge-back `develop` |

## Deploy

- **Staging:** merge em `develop` → CI verde → FTP automático via GitHub Actions.
- **Produção:** criar snapshot manual → tag `vN.M.P` em `main` → CI verde → FTP automático.
- **Rollback:** restaurar snapshot via Hostinger File Manager (ver WORKFLOW §5.3).

## Estrutura

Ver `SPEC_TECNICA_AlunoMakerDigital.md` §3 para a estrutura completa de pastas.

## Documentação canônica

- `PRD_AlunoMakerDigital.md` — o que o produto é e critérios de aceite.
- `SPEC_TECNICA_AlunoMakerDigital.md` — como implementar.
- `WORKFLOW_AlunoMakerDigital.md` — em que ordem e quando deployar.
- `CLAUDE.md` — entrada de sessão Claude Code (estado atual + regras).
