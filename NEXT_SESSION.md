
# Próxima sessão: Fase 5 — Gerador com Claude API

## Prompt para iniciar a sessão

```
Continuar o projeto Aluno Maker Digital — Fase 5: Gerador com Claude API.
Leia o CLAUDE.md e este arquivo antes de qualquer ação.
Branch atual: feature/fase-4-backend-admin (merge pendente → v2.0.0)
```

---

## Estado atual (2026-05-20)

| Fase | Status | Tag | Notas |
|---|---|---|---|
| 0 — Fundação | ✅ Concluída | v0.1.1 | — |
| 1 — Home + layout global | ✅ Concluída | v0.2.0 | — |
| 2 — Demais páginas públicas | ✅ Concluída | v0.3.0 | — |
| 3 — Módulo GPIO (animações) | ✅ Concluída | v0.4.0 | — |
| 4 — Backend + Admin mínimo | ✅ Deploy completo | v2.0.0 (merge pendente) | API pública funcionando |
| 5 — Gerador com Claude API | ⏳ Próxima | — | — |

---

## ✅ Fase 4 concluída em 2026-05-20

### O que está funcionando em produção

| Endpoint | Status |
|---|---|
| `GET https://api.alunomakerdigital.com.br/api/health` | ✅ `{"status":"ok"}` |
| `POST https://api.alunomakerdigital.com.br/api/contact` | ✅ 201 + MySQL + e-mail |
| `POST https://api.alunomakerdigital.com.br/api/visits` | ✅ 201 + MySQL + e-mail |
| `POST https://api.alunomakerdigital.com.br/api/admin/login` | ✅ JWT token |
| `GET https://api.alunomakerdigital.com.br/api/admin/contacts` | ✅ lista com Bearer |
| `GET https://api.alunomakerdigital.com.br/api/admin/visits` | ✅ lista com Bearer |

### Arquitetura do servidor

```
Requisição externa → Hostinger CDN (hcdn)
  → Apache em ~/domains/api.alunomakerdigital.com.br/public_html/
  → api/.htaccess (RewriteRule → index.php)
  → api/index.php (PHP proxy curl para localhost:3000)
  → Node.js Express (PM2 com start.sh bash wrapper)
  → MySQL via Unix socket /var/lib/mysql/mysql.sock
```

### Arquivos críticos no SERVIDOR (não no repo)

| Arquivo | Localização | Função |
|---|---|---|
| `start.sh` | `~/domains/api.alunomakerdigital.com.br/server/` | Bash wrapper com env vars — inicia o Node.js |
| `ecosystem.config.cjs` | `~/domains/api.alunomakerdigital.com.br/server/` | Config PM2 (fallback) |
| `.env` | `~/domains/api.alunomakerdigital.com.br/` | Vars de ambiente (com aspas em valores com `#`) |
| `api/index.php` | `~/domains/api.alunomakerdigital.com.br/public_html/api/` | PHP proxy |
| `api/.htaccess` | `~/domains/api.alunomakerdigital.com.br/public_html/api/` | Rewrite → index.php |
| `restart-api.sh` | `~/` | Script de restart (se PM2 cair) |

### Comandos para reiniciar o servidor (se necessário)

```bash
ssh -p 65002 u562242543@82.112.247.253

# Verificar estado
/home/u562242543/.nvm/versions/node/v20.20.2/bin/pm2 list

# Matar tudo e reiniciar
pkill -9 -f node 2>/dev/null; sleep 2
env -i HOME=/home/u562242543 PATH=/home/u562242543/.nvm/versions/node/v20.20.2/bin:/usr/local/bin:/usr/bin:/bin \
  /home/u562242543/.nvm/versions/node/v20.20.2/bin/pm2 kill 2>/dev/null; sleep 2
env -i HOME=/home/u562242543 PATH=/home/u562242543/.nvm/versions/node/v20.20.2/bin:/usr/local/bin:/usr/bin:/bin \
  /home/u562242543/.nvm/versions/node/v20.20.2/bin/pm2 start \
  /home/u562242543/domains/api.alunomakerdigital.com.br/server/start.sh \
  --name amd-api --interpreter bash
```

### Admin do painel
- **URL:** `https://alunomakerdigital.com.br/admin/login.html`
- **Email:** `francenylson@gmail.com`
- **Senha:** `Amd@2026!Admin`

---

## ⚠️ Pendências menores (não bloqueiam Fase 5)

### 1. Merge PR #7 e tag v2.0.0
```bash
gh api --method DELETE repos/francenylson1/amd_site_2026/branches/main/protection/enforce_admins
gh pr merge 7 --merge --admin
gh api --method POST repos/francenylson1/amd_site_2026/branches/main/protection/enforce_admins
git tag v2.0.0 && git push --tags
```

### 2. Crontab de restart (manual via hPanel)
`crontab` não disponível via SSH. Configurar via Hostinger hPanel → Avançado → Tarefas Cron:
```
*/5 * * * * /home/u562242543/restart-api.sh
```

### 3. Smoke manual do formulário
- Preencher formulário de contato em `https://alunomakerdigital.com.br/contato.html`
- Verificar entrada no MySQL e e-mail recebido em `francenylson@gmail.com`
- Acessar `https://alunomakerdigital.com.br/admin/login.html` e ver o contato no painel

---

## Fase 5 — Escopo

1. Branch `feature/fase-5-gerador-claude-api` a partir de `develop`
2. `admin/gerador.html` — formulário tema + tipo de conteúdo
3. `POST /api/admin/generate` — chama Anthropic SDK (claude-sonnet-4-6)
4. Gera 5 formatos: blog, TikTok, Instagram, X thread, WhatsApp
5. Tabela `generations` (theme, type, output_json, cost_usd)
6. `GET /api/admin/generations` — histórico + custo acumulado
7. Merge PR → tag `v2.1.0`

---

## Lembretes
- Vanilla JS no front — sem React, Vue ou Angular
- Todo copy e commits em pt-BR
- `server/` usa ESM (`"type": "module"`) — não usar `require()`
- PM2 via `start.sh` bash wrapper (NÃO ecosystem direto com node interpreter — ESM bug)
- `npm run test:unit` e `npm run test:api` antes de commitar (server/)
- gh CLI em `C:\Program Files\GitHub CLI\gh.exe`
- `DB_SOCKET=/var/lib/mysql/mysql.sock` obrigatório no .env do servidor Hostinger
