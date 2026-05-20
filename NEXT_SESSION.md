
# Próxima sessão: Deploy Fase 4 — Finalizar API em produção

## Prompt para iniciar a sessão

```
Continuar o deploy da Fase 4 do projeto Aluno Maker Digital.
Leia o CLAUDE.md e este arquivo antes de qualquer ação.
O código está pronto e testado. O problema restante é roteamento externo da API na Hostinger.
Branch ativo: feature/fase-4-backend-admin
```

---

## Estado atual (2026-05-20)

| Fase | Status | Tag | Notas |
|---|---|---|---|
| 0 — Fundação | ✅ Concluída | v0.1.1 | — |
| 1 — Home + layout global | ✅ Concluída | v0.2.0 | — |
| 2 — Demais páginas públicas | ✅ Concluída | v0.3.0 | — |
| 3 — Módulo GPIO (animações) | ✅ Concluída | v0.4.0 | — |
| 4 — Backend + Admin mínimo | 🔶 Código pronto, deploy parcial | v2.0.0 (pendente merge) | Ver pendências abaixo |
| 5 — Gerador com Claude API | ⏳ Próxima | — | — |

---

## ✅ O que foi concluído nesta sessão (2026-05-20)

### Código (100% pronto e testado)
- `server/` ESM completo: Express 4, JWT, bcrypt, helmet, rate-limit, Nodemailer/Brevo
- `server/db/schema.sql`: DDL MySQL aplicado na Hostinger
- `admin/login.html` + `admin/index.html`: painel JWT funcional
- `assets/js/forms.js`: POST API → fallback localStorage → indicador visual
- **34/34 Vitest + 108/108 E2E Chromium verdes**
- PR #7 aberto no GitHub (feature/fase-4-backend-admin → develop)

### Infraestrutura (parcialmente concluída)
- ✅ MySQL configurado na Hostinger (banco `u562242543_amd_db`, 4 tabelas criadas)
- ✅ `.env` criado com credenciais reais (DB, JWT, Brevo SMTP)
- ✅ Brevo SMTP testado e funcionando (e-mail de teste enviado)
- ✅ NVM + Node.js 20.20.2 instalado no servidor via SSH
- ✅ `server/` transferido para `~/domains/api.alunomakerdigital.com.br/server/`
- ✅ `npm install` executado no Linux (binários nativos compilados)
- ✅ Servidor responde `{"status":"ok"}` internamente na porta 3000
- ✅ `api.alunomakerdigital.com.br` existe com Apache configurado
- ⚠️ `nohup node index.js` iniciado — **pode precisar reiniciar amanhã**

---

## ❌ Pendências críticas para amanhã

### 1. API não acessível externamente (problema principal)
O servidor Node.js funciona em `localhost:3000` mas não chega ao mundo externo.

**Diagnóstico:**
- `curl -sk https://api.alunomakerdigital.com.br/api/health` retorna "This Page Does Not Exist" (página da Hostinger)
- PHP proxy (`index.php`) em `public_html/` não é executado para paths `/api/*`
- Hostinger CDN intercepta antes do Apache para paths desconhecidos
- `mod_proxy` bloqueado (503 na tentativa)
- Phusion Passenger instalado (`PASSENGER_INSTANCE_REGISTRY_DIR=/var/passenger`) — não testado completamente

**Tentativas já feitas (não repetir):**
- `.htaccess` com `RewriteRule` → falhou (não chega ao Apache)
- `.htaccess` com `ProxyPass` → 503 (mod_proxy bloqueado)
- PHP proxy via `index.php` → Hostinger CDN intercepta antes
- PM2 → crashava 199x (era conflito de porta, não bug do código)

**Estado do servidor agora:**
```
SSH: ssh -p 65002 u562242543@82.112.247.253
Senha: Amd@2018#2020
Servidor: ~/domains/api.alunomakerdigital.com.br/server/
.env: ~/domains/api.alunomakerdigital.com.br/.env
public_html: tem index.php (proxy PHP) + .htaccess
Node.js: pode estar rodando ou não (verificar com: cat ~/node-server.log)
```

**Próximas tentativas sugeridas (em ordem):**

**Opção A — Passenger via .htaccess (mais promissora):**
```bash
cat > ~/domains/api.alunomakerdigital.com.br/public_html/.htaccess << 'EOF'
PassengerEnabled On
PassengerNodejs /home/u562242543/.nvm/versions/node/v20.20.2/bin/node
PassengerStartupFile /home/u562242543/domains/api.alunomakerdigital.com.br/server/index.js
PassengerAppRoot /home/u562242543/domains/api.alunomakerdigital.com.br
PassengerAppType node
EOF
```
Passenger está instalado (`PASSENGER_INSTANCE_REGISTRY_DIR=/var/passenger`). Pode funcionar.

**Opção B — Contato com suporte Hostinger:**
Abrir ticket: "A aplicação Node.js `api.alunomakerdigital.com.br` foi criada via wizard mas o vhost não foi completamente configurado. Preciso que o Passenger seja configurado para servir `~/domains/api.alunomakerdigital.com.br/server/index.js` com Node.js `/home/u562242543/.nvm/versions/node/v20.20.2/bin/node`."

**Opção C — Deletar e refazer wizard completamente:**
Deletar `api.alunomakerdigital.com.br` no painel → Sites → Node.js → wizard novamente, desta vez clicar "Implantar" sem hesitar.

### 2. Usuário admin não criado
Após a API funcionar, criar o admin via SSH:
```bash
# Gerar hash bcrypt no servidor
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd ~/domains/api.alunomakerdigital.com.br/server
node -e "
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash('SENHA_ADMIN_AQUI', 12);
console.log(hash);
"
# Depois inserir no MySQL via phpMyAdmin:
# INSERT INTO admin_users (email, password_hash) VALUES ('francenylson@gmail.com', 'HASH_GERADO');
```

### 3. Smoke manual (após API funcionar)
- Preencher formulário de contato → verificar MySQL → verificar e-mail Fran
- Preencher agendamento → verificar MySQL → verificar e-mail Fran
- Acessar admin/login.html → logar → ver painel com dados

### 4. Merge PR e tag
```bash
gh api --method DELETE repos/francenylson1/amd_site_2026/branches/main/protection/enforce_admins
gh pr merge 7 --merge --admin
gh api --method POST repos/francenylson1/amd_site_2026/branches/main/protection/enforce_admins
git tag v2.0.0 && git push --tags
```

---

## Credenciais e configurações do servidor

| Item | Valor |
|---|---|
| SSH host | `82.112.247.253` |
| SSH porta | `65002` |
| SSH usuário | `u562242543` |
| SSH senha | `Amd@2018#2020` |
| MySQL banco | `u562242543_amd_db` |
| MySQL usuário | `u562242543_amd_user` |
| MySQL host (interno) | `localhost` |
| Node.js | `/home/u562242543/.nvm/versions/node/v20.20.2/bin/node` |
| Servidor app | `~/domains/api.alunomakerdigital.com.br/server/` |
| .env | `~/domains/api.alunomakerdigital.com.br/.env` |
| public_html | `~/domains/api.alunomakerdigital.com.br/public_html/` |
| Log Node.js | `~/node-server.log` |

---

## Como reiniciar o servidor Node.js (amanhã)

```bash
ssh -p 65002 u562242543@82.112.247.253
# Ativar NVM
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
# Matar processo anterior se existir
pkill -f "node index.js" 2>/dev/null
sleep 1
# Iniciar
cd ~/domains/api.alunomakerdigital.com.br/server
nohup node index.js > ~/node-server.log 2>&1 &
disown
sleep 2 && cat ~/node-server.log
```

---

## Fase 5 — Escopo (quando Fase 4 estiver 100% no ar)

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
- `npm run test:unit` e `npm run test:api` antes de commitar (server/)
- `npm run test:ci` antes de commitar (front)
- gh CLI em `C:\Program Files\GitHub CLI\gh.exe`
