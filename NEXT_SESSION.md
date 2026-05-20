
# Próxima sessão: Fase 5 — Gerador de Conteúdo com Claude API

## Prompt para iniciar a sessão

```
Continuar o projeto Aluno Maker Digital — Fase 5: Gerador de conteúdo com Claude API.
Leia o CLAUDE.md e este arquivo NEXT_SESSION.md antes de qualquer ação.
Branch de trabalho: criar feature/fase-5-gerador-claude-api a partir de develop.
```

---

## Estado atual (2026-05-20)

| Fase | Status | Tag | Notas |
|---|---|---|---|
| 0 — Fundação | ✅ Concluída | v0.1.1 | — |
| 1 — Home + layout global | ✅ Concluída | v0.2.0 | — |
| 2 — Demais páginas públicas | ✅ Concluída | v0.3.0 | — |
| 3 — Módulo GPIO (animações) | ✅ Concluída | v0.4.0 | — |
| 4 — Backend + Admin | ✅ Concluída | v2.0.0 | Deploy completo em produção |
| 5 — Gerador com Claude API | ⏳ Próxima | — | — |

---

## ✅ O que está em produção (Fase 4 + hotfixes)

### Arquitetura atual

```
Browser (alunomakerdigital.com.br)
  → /api/* → api/index.php (proxy PHP, sem CORS)
  → localhost:3000 → Node.js Express (PM2 + start.sh)
  → MySQL via /var/lib/mysql/mysql.sock
```

### Endpoints funcionando

| Endpoint | Status |
|---|---|
| `GET /api/health` | ✅ 200 |
| `POST /api/contact` | ✅ 201 + MySQL + e-mail Brevo |
| `POST /api/admin/login` | ✅ JWT token |
| `GET /api/admin/contacts` | ✅ Bearer auth |
| `GET /api/admin/visits` | ✅ Bearer auth |

### Painel admin
- URL: `https://alunomakerdigital.com.br/admin/login.html`
- Email: `francenylson@gmail.com` | Senha: `Amd@2026!Admin`

### Mudanças da sessão de hoje (2026-05-20)
- Formulário de agendamento substituído por **CTA WhatsApp** (`.whatsapp-cta` + `.btn--whatsapp`)
- PHP proxy movido para o domínio principal (`api/index.php` no repo) — elimina CORS
- FTP_DIR_PROD corrigido para domínio principal
- `API_BASE = '/api'` (relativo) em todos os JS

---

## ⚠️ Pendência operacional (não bloqueia Fase 5)

**Crontab de restart:** configurar via hPanel → Avançado → Tarefas Cron (o usuário já sabe, mas ainda não confirmou que fez):
```
Tipo: Personalizado
Comando: /home/u562242543/restart-api.sh
Frequência: A cada 5 minutos
```

---

## Fase 5 — Escopo completo

### Objetivo
Adicionar ao painel admin um gerador de conteúdo educacional que usa a Claude API para produzir textos em 5 formatos diferentes a partir de um tema informado.

### Tarefas

1. **Branch:** `feature/fase-5-gerador-claude-api` a partir de `develop`

2. **Banco de dados** — nova tabela:
```sql
CREATE TABLE generations (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  theme        VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  output_json  JSON         NOT NULL,
  cost_usd     DECIMAL(10,6) DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. **Backend** — novos endpoints em `server/routes/admin.js`:
   - `POST /api/admin/generate` — recebe `{ theme, content_type }`, chama `claude-sonnet-4-6`, retorna 5 formatos
   - `GET /api/admin/generations` — histórico com custo acumulado

4. **Frontend** — `admin/gerador.html`:
   - Formulário: campo tema + select tipo de conteúdo
   - Exibição dos 5 formatos gerados: blog, TikTok, Instagram, X thread, WhatsApp
   - Botão copiar por formato
   - Histórico com custo total da conta

5. **Testes:**
   - Vitest unitário para o prompt builder
   - Supertest para os endpoints (mock da Anthropic SDK)
   - E2E: gerador carrega, submit com API mockada

6. **Merge PR → tag `v2.1.0`**

### 5 formatos de saída esperados
```json
{
  "blog": "texto longo com título e parágrafos...",
  "tiktok": "roteiro curto com ganchos...",
  "instagram": "legenda com emojis e hashtags...",
  "x_thread": "fio de 5 tweets...",
  "whatsapp": "mensagem informal para grupo de pais..."
}
```

### Custo estimado por geração
~$0.003 USD por chamada com `claude-sonnet-4-6` (input ~200 tokens + output ~800 tokens)

---

## Arquivos críticos no servidor (não no repo)

| Arquivo | Localização |
|---|---|
| `start.sh` | `~/domains/api.alunomakerdigital.com.br/server/` |
| `.env` | `~/domains/api.alunomakerdigital.com.br/` |
| `restart-api.sh` | `~/` |

### Reiniciar servidor (se necessário)
```bash
# Via Python+paramiko (sem SSH interativo):
# Usar o script Python com env -i HOME=... PATH=... pm2 start start.sh --interpreter bash
# Ver NEXT_SESSION anterior para o script completo

# Ou via SSH direto:
ssh -p 65002 u562242543@82.112.247.253
env -i HOME=/home/u562242543 PATH=/home/u562242543/.nvm/versions/node/v20.20.2/bin:/usr/local/bin:/usr/bin:/bin \
  /home/u562242543/.nvm/versions/node/v20.20.2/bin/pm2 start \
  /home/u562242543/domains/api.alunomakerdigital.com.br/server/start.sh \
  --name amd-api --interpreter bash
```

### Adicionar ANTHROPIC_API_KEY ao servidor
Para a Fase 5 funcionar, adicionar no `.env` do servidor:
```
ANTHROPIC_API_KEY=sk-ant-...
```
E atualizar o `start.sh` com a mesma variável.

---

## Lembretes
- Vanilla JS no front — sem React, Vue ou Angular
- Todo copy e commits em pt-BR
- `server/` usa ESM (`"type": "module"`) — não usar `require()`
- PM2 via `start.sh` bash wrapper (NÃO ecosystem direto com node — ESM bug)
- `API_BASE = '/api'` (relativo) — nunca URL absoluta
- `npm run test:unit` e `npm run test:api` antes de commitar server/
- `npm run test:ci` antes de commitar front
- gh CLI em `C:\Program Files\GitHub CLI\gh.exe`
- SSH via Python+paramiko: `/c/Users/User/AppData/Local/Programs/Python/Python311/python.exe`
