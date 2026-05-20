
# Próxima sessão: Deploy Fase 4.5 + Fase 5 — Gerador com Claude API

## Prompt para iniciar a sessão

```
Deploy da Fase 4.5 — Gerenciador de Conteúdo no servidor.
Leia o CLAUDE.md e este NEXT_SESSION.md antes de qualquer ação.
Branch atual: feature/fase-4.5-cms (código pronto, 106/106 Chromium)

Passos de deploy:
1. Aplicar schema-v2.sql no MySQL do servidor via SSH
2. Reiniciar PM2 (Node.js) no servidor
3. Smoke manual: projetos.html + admin/galeria.html
4. Criar PR → merge main → tag v2.5.0
5. Atualizar CLAUDE.md: Fase 4.5 ✅ Concluída
6. Iniciar Fase 5 em nova branch a partir de main
```

---

## Estado atual (2026-05-20)

| Fase | Status | Tag | Notas |
|---|---|---|---|
| 0 a 4 | ✅ Concluídas | v0.1.1 – v2.0.0 | — |
| **4.5 — Gerenciador de Conteúdo** | **✅ Código completo** | — | Branch feature/fase-4.5-cms, aguardando deploy |
| 5 — Gerador Claude API | ⏳ | — | Só após 4.5 deployed |

---

## Deploy Fase 4.5 (passo a passo)

### 1. Push e CI
```bash
git push -u origin feature/fase-4.5-cms
# Aguardar CI verde em GitHub Actions
```

### 2. Aplicar schema no servidor via SSH
```bash
# SSH: 82.112.247.253:65002 / user: u562242543
# O schema-v2.sql foi deployado via FTP pelo CI. Aplicar:
mysql -u u562242543_amd_user -p'Amd@2018#2020' u562242543_amd_db < ~/alunomakerdigital.com.br/server/db/schema-v2.sql
```

### 3. Reiniciar Node.js
```bash
env -i HOME=/home/u562242543 PATH=/home/u562242543/.nvm/versions/node/v20.18.1/bin:/usr/bin:/bin \
  pm2 restart amd-api
```

### 4. Verificar endpoints
```bash
curl https://alunomakerdigital.com.br/api/events   | python3 -m json.tool | head -20
curl https://alunomakerdigital.com.br/api/projects | python3 -m json.tool | head -20
```

### 5. Smoke manual
- projetos.html: cards carregam dinamicamente
- eventos.html: seções de eventos aparecem
- escolas.html: cards de escolas aparecem
- admin/galeria.html: CRUD funcional com dados do banco

### 6. Merge + tag
```bash
gh api --method DELETE repos/francenylson1/amd-site-2026/branches/main/protection/enforce_admins
gh pr merge --admin --merge
gh api --method POST repos/francenylson1/amd-site-2026/branches/main/protection/enforce_admins
git tag v2.5.0 && git push origin v2.5.0
```

---

## O que foi implementado na Fase 4.5

### Backend (server/)
- `db/schema-v2.sql` — 5 tabelas: events, event_photos, projects, schools, courses + seed completo com 9 projetos, 6 eventos (19 fotos), 12 escolas
- `controllers/event|project|school|courseController.js` — CRUD completo
- `routes/content.js` — rotas públicas (GET /api/events|projects|schools|courses)
- `routes/admin.js` — expandido com 20 rotas admin (Bearer JWT)
- `index.js` — monta content routes + PUT/DELETE no CORS

### Frontend (assets/js/)
- `projetos.js`, `eventos.js`, `escolas.js`, `cursos.js` — fetch + render
- `animations.js` — expõe `window.AMD.observeReveal()`
- `gallery.js` — event delegation nos filtros (suporta conteúdo dinâmico)

### Páginas convertidas
- projetos.html, eventos.html, escolas.html, cursos.html → `<div id="xxx-grid">` + JS

### Admin
- `admin/galeria.html` — 4 abas CRUD (Eventos + Fotos | Projetos | Escolas | Cursos)
- `admin/assets/js/galeria.js`, `css/galeria.css`

### Testes (106/106 Chromium)
- `server/tests/api/content.test.js` — 6 testes, 27/27 total Vitest
- `tests/e2e/gallery.spec.js` — mocks API + waitForSelector dinâmico
- `tests/a11y/axe.spec.js` — mocks API para páginas dinâmicas

### Correções de acessibilidade
- `.btn--whatsapp` corrigido de `#25d366` para `#0f7832` (contraste 5.6:1 ≥ 4.5:1)
- `.content-error` de `#dc2626` para `#f87171` (contraste 8.3:1 no fundo escuro)

---

## Pendências para o Prof. Fran revisar após deploy

1. **Braço Robótico com IA** (projeto #3): imagem atual pode estar errada. Corrigir via `admin/galeria.html`.
2. **Imagens Pinheirinho Roxo**: em `assets/images/escolas/pinheirinho_roxo/` como JPGs brutos. Rodar `npm run images:optimize` → associar à escola via admin.

---

## Fase 5 — Gerador com Claude API (referência futura)

**Objetivo:** No painel admin, o Prof. Fran seleciona um projeto/evento e recebe copy gerada por Claude para publicar nas redes sociais.

**Arquivos a criar:**
```
server/controllers/generatorController.js
admin/gerador.html
admin/assets/js/gerador.js
```

**Dependência:** `npm install @anthropic-ai/sdk` no server/

**Modelo:** claude-sonnet-4-6 (atual Sonnet 4.6) com prompt caching para o contexto do projeto.

**Lembretes técnicos Fase 5:**
- Usar `claude-api` skill no Claude Code para implementação
- Incluir prompt caching (`cache_control: { type: "ephemeral" }`) no system prompt
- Chave API em `ANTHROPIC_API_KEY` no `.env` do servidor
- Rate limiting específico para a rota `/api/admin/generate`
