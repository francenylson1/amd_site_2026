
# Próxima sessão: Fase 5 — Gerador de Conteúdo com Claude API

## Prompt para iniciar a sessão

```
Iniciar a Fase 5 do projeto Aluno Maker Digital: Gerador de Conteúdo com Claude API.
Leia o CLAUDE.md e este arquivo antes de qualquer ação.
Fase 4 concluída (backend + admin). Branch de trabalho: feature/fase-5-gerador-claude-api (criar a partir de develop).
```

---

## Estado atual (2026-05-19)

| Fase | Status | Tag | Notas |
|---|---|---|---|
| 0 — Fundação | ✅ Concluída | v0.1.1 | — |
| 1 — Home + layout global | ✅ Concluída | v0.2.0 | — |
| 2 — Demais páginas públicas | ✅ Concluída | v0.3.0 | 12 escolas, logo tricolor, mapa corrigido |
| 3 — Módulo GPIO (animações) | ✅ Concluída | v0.4.0 | animacoes.html + animations-gpio.js. 104/104 E2E + axe 11 páginas |
| 4 — Backend + Admin mínimo | ✅ Concluída | v2.0.0 (pendente merge) | server/ ESM, admin/ JWT, forms.js fallback |
| 5 — Gerador com Claude API | ⏳ Próxima | — | — |

---

## O que foi feito na Fase 4 (2026-05-19)

### Backend Node.js + Express (server/)
- `server/index.js`: Entry point ESM, helmet, CORS restrito, JSON limit 100kb
- `server/db/connection.js`: mysql2/promise pool
- `server/db/schema.sql`: DDL MySQL (visits, contacts, admin_users, feature_flags)
- `server/middleware/auth.js`: JWT verify (requireAuth)
- `server/middleware/rateLimiter.js`: 5 tentativas/15min em /api/admin/login
- `server/middleware/validate.js`: validateContact, validateVisit + utilitários exportados
- `server/services/emailService.js`: Nodemailer + Brevo SMTP (silencia se SMTP_USER vazio)
- `server/controllers/`: contactController, visitController, adminController (login), featureFlagController
- `server/routes/api.js`: POST /api/contact, POST /api/visits, GET /api/feature-flags
- `server/routes/admin.js`: POST /api/admin/login (rate-limited), GET /api/admin/contacts (auth), GET /api/admin/visits (auth)

### Painel Admin (admin/)
- `admin/login.html`: login standalone com Bearer token JWT em sessionStorage
- `admin/index.html`: dashboard com métricas (total contatos, visitas, pendentes) + tabelas
- `admin/assets/css/admin.css`: CSS autônomo (não incluso no bundle front)
- `admin/assets/js/admin-auth.js`: login/logout + redirect guards + exposição window.AMD_ADMIN
- `admin/assets/js/admin-dashboard.js`: fetch contatos e agendamentos + escape XSS

### Migração forms.js
- Tenta POST /api/* antes de gravar em localStorage
- Em caso de falha: fallback localStorage + indicador amarelo (`.form-status`)
- AbortSignal.timeout(8000) para não bloquear o UX

### Testes
- `server/tests/unit/validators.test.js`: 13 testes Vitest
- `server/tests/api/contact.test.js`: 5 testes Supertest
- `server/tests/api/visits.test.js`: 5 testes Supertest
- `server/tests/api/admin.test.js`: 11 testes Supertest
- `tests/e2e/backend.spec.js`: 4 testes Playwright (fallback contato, agendamento, admin login)
- **Total: 34/34 Vitest + 108/108 E2E Chromium verdes**

### Pendente para deploy (DoD Fase 4)
- [ ] Configurar MySQL na Hostinger Business e aplicar schema.sql
- [ ] Criar usuário admin: `INSERT INTO admin_users (email, password_hash) VALUES ('francenylson@gmail.com', bcrypt12rounds)`
- [ ] Preencher `.env` com DB_HOST, DB_PASS, JWT_SECRET, SMTP_USER, SMTP_PASS
- [ ] Deploy do server/ no Node.js da Hostinger (App na Hostinger → Node.js)
- [ ] Smoke manual: formulário → MySQL → e-mail Fran → admin lista registro
- [ ] Merge PR → tag `v2.0.0`

### Observação merge (branch protection)
```bash
gh api --method DELETE repos/francenylson1/amd_site_2026/branches/main/protection/enforce_admins
gh pr merge N --merge --admin
gh api --method POST repos/francenylson1/amd_site_2026/branches/main/protection/enforce_admins
```

---

## Fase 5 — Escopo (WORKFLOW §5 + SPEC §14.1)

### Objetivo
Adicionar ao admin a ferramenta de geração de conteúdo para redes sociais e blog usando Claude API (Anthropic SDK).

### Tarefas (do WORKFLOW)
1. Criar branch `feature/fase-5-gerador-claude-api` a partir de `develop`
2. Implementar `admin/gerador.html` com formulário: tema + tipo de conteúdo
3. Implementar `POST /api/admin/generate` (protegido por JWT) que chama Anthropic SDK
4. Gerar 5 formatos automaticamente:
   - Blog longo (Português BR, 800–1200 palavras)
   - Roteiro TikTok 30–60s (texto + hashtags)
   - Legenda Instagram + 30 hashtags
   - Thread X com 5 tweets
   - Mensagem WhatsApp
5. Gravar em tabela `generations` (theme, type, output_json, cost_usd)
6. Implementar `GET /api/admin/generations` — histórico com custo acumulado
7. Exibir custo estimado no dashboard principal
8. Testes: unit (prompt builder), API (mock Anthropic SDK), E2E (form → generate → exibe)
9. Merge PR → tag `v2.1.0`

### Spec técnica chave (SPEC §14.1)
- **Endpoint:** `POST /api/admin/generate` (Fase 5)
- **SDK:** `@anthropic-ai/sdk` (não `openai`)
- **Modelo:** `claude-sonnet-4-6` (último disponível — ver CLAUDE.md da sessão)
- **Auth:** Bearer JWT (mesmo middleware `requireAuth` da Fase 4)
- **Variável:** `ANTHROPIC_API_KEY` em `.env`
- **Custo:** registrar `cost_usd` baseado nos usage tokens retornados pelo SDK

---

## Lembretes

- Vanilla JS no front — sem React, Vue ou Angular
- Todo copy e commits em pt-BR
- `server/` usa ESM (`"type": "module"`) — não usar `require()`
- `npm run test:unit` e `npm run test:api` antes de commitar (server/)
- `npm run test:ci` antes de commitar (front)
- gh CLI em `C:\Program Files\GitHub CLI\gh.exe`
- Imagens Pinheirinho Roxo em `assets/images/escolas/pinheirinho_roxo/` (aguardando WebP)
- `icon-192.png` faltando no manifest (404 não crítico)
