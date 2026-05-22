
# Próxima sessão — Deploy servidor + Fase 5

## Prompt para iniciar a sessão

```
Continuar o projeto Aluno Maker Digital.
Leia o CLAUDE.md e este NEXT_SESSION.md inteiros antes de qualquer ação.

TAREFA 1 (obrigatória): Ativar Aba Sobre + Aba Configurações no servidor de produção.

O código local está completo. Falta copiar ao servidor via SSH.
SSH: 82.112.247.253:65002  user: u562242543  senha: Amd@2018#2020

ATENÇÃO: NUNCA usar heredoc (<< 'EOF') no terminal SSH — o marcador EOF fica
literalmente dentro do arquivo e derruba o servidor. Usar SOMENTE echo linha a linha
OU copiar conteúdo via scp se disponível.

Arquivos a copiar/atualizar no servidor:
  server/controllers/aboutController.js    → ~/domains/api.alunomakerdigital.com.br/server/controllers/
  server/controllers/configController.js   → ~/domains/api.alunomakerdigital.com.br/server/controllers/
  server/routes/admin.js                   → ~/domains/api.alunomakerdigital.com.br/server/routes/
  server/routes/content.js                 → ~/domains/api.alunomakerdigital.com.br/server/routes/

Aplicar schema-v4.sql no banco:
  mysql -u u562242543_amd_user -p'Amd@2018#2020' -S /var/lib/mysql/mysql.sock u562242543_amd_db < schema-v4.sql

Sequência PM2 restart (única que funciona no Hostinger):
  pkill -f "node index.js"; pkill -f "start.sh"; pm2 delete all
  pm2 start ~/domains/api.alunomakerdigital.com.br/server/start.sh --name amd-api --interpreter bash

TAREFA 2: Iniciar Fase 5 — Gerador de Conteúdo com Claude API.
  - Usar o skill claude-api para implementação
  - Criar feature/fase-5-gerador a partir de main
  - Ver especificação completa abaixo
```

---

## Estado atual (2026-05-22)

| Fase | Status | Tag | Notas |
|---|---|---|---|
| 0 a 4.5 | ✅ Concluídas (código) | v2.5.0+ | CMS completo no repo. **Aguarda deploy SSH** |
| **Aba Sobre** | **⚠️ Código OK, servidor desatualizado** | — | aboutController.js existe localmente, não no servidor |
| **Aba Configurações** | **⚠️ Código OK, servidor desatualizado** | — | configController.js + schema-v4.sql + todas as páginas HTML atualizadas |
| **5 — Gerador Claude API** | **⏳ Próxima** | — | Iniciar após servidor atualizado |
| 6 — Publicador redes + Loja | ⏳ | — | — |

---

## O que foi implementado nesta sessão (2026-05-22)

### Backend
- `server/db/schema-v4.sql` — tabela `site_config` com 9 campos editáveis + seed
- `server/controllers/configController.js` — getConfigPublic (público), listConfig (admin com labels), updateConfig (bulk PUT)
- `server/routes/admin.js` — adicionado GET+PUT /api/admin/config
- `server/routes/content.js` — adicionado GET /api/content/config (público, sem auth)

### Admin CMS
- `admin/galeria.html` — nova aba "Configurações" com formulário para todos os campos
- `admin/assets/js/galeria.js` — loadConfig(), saveConfig(), fix try-catch no loadSobre()
- `admin/assets/css/galeria.css` — estilos para .cms-form--config, .cms-form__section-title, .cms-form__hint, .cms-loading--error

### Frontend público
- `assets/js/site-config.js` — NOVO: busca /api/content/config, cache sessionStorage 5 min, atualiza [data-config] e [data-config-href] em todos os elementos
- Todas as 11 páginas públicas atualizadas:
  - Footer: social links com `data-config-href`, contato com `data-config` + `data-config-href`
  - CTAs WhatsApp inline com `data-config-href="whatsapp_num"` (preserva ?text= original)
  - contato.html: WhatsApp, e-mail e Instagram da seção de contato com data attributes
  - `<script src="assets/js/site-config.js" defer>` adicionado antes do main.js

---

## Campos da tabela site_config

| config_key | Valor inicial | Onde é exibido |
|---|---|---|
| whatsapp_num | 5561981333875 | href de todos os links wa.me |
| whatsapp_display | (61) 9 8133-3875 | texto no footer e contato.html |
| email_contato | contato@alunomakerdigital.com.br | footer e contato.html |
| instagram_handle | alunomakerdigital | href dos links instagram |
| instagram_display | @alunomakerdigital | texto em contato.html |
| youtube_handle | @alunomakerdigital | href dos links youtube |
| endereco_rua | Quadra 203, Lote 32 — Av. Recanto das Emas | (admin apenas, referência) |
| endereco_display | Recanto das Emas, Brasília — DF | footer de todas as páginas |
| atendimento_horario | de segunda a sábado, das 8h às 18h | contato.html |

---

## Pendências do Prof. Fran (não bloqueiam)

1. **Braço Robótico com IA** (projeto #3): imagem pode estar errada. Corrigir via admin → Projetos → Editar → upload nova foto.
2. **Escola Pinheirinho Roxo**: imagens JPG em `assets/images/escolas/pinheirinho_roxo/`. Fazer upload via admin → Escolas → Editar.
3. **Fotos de cabeça para baixo na aba Sobre**: após ativar a aba, editar cada foto problemática via admin → Sobre → Editar → upload da versão corrigida. O Sharp agora auto-corrige EXIF (.rotate()).

---

## Fase 5 — Especificação completa

### Funcionalidade
No painel admin, nova página **"Gerador"** onde o Prof. Fran:
1. Seleciona o tipo (Projeto ou Evento) e o item do banco
2. Seleciona o formato (Post Instagram, Legenda TikTok, Thread X/Twitter)
3. Clica "Gerar" → Claude API cria o texto pronto para publicar
4. Pode copiar ou regenerar com instruções adicionais

### Arquivos a criar

**Backend:**
```
server/controllers/generatorController.js   ← chama Claude API com prompt caching
server/routes/admin.js                      ← adicionar POST /api/admin/generate
```

**Frontend admin:**
```
admin/gerador.html
admin/assets/js/gerador.js
admin/assets/css/gerador.css
```

### Endpoint
```
POST /api/admin/generate    (Bearer JWT obrigatório)
Body: { type, item_id, format, extra_notes }
Response: { content, tokens_in, tokens_out, cached }
```

### Modelo e caching
- Modelo: `claude-sonnet-4-6`
- Prompt caching: system prompt com contexto AMD usa `cache_control: { type: "ephemeral" }`
- Chave: `ANTHROPIC_API_KEY` no `.env` do servidor
- Rate limit: 10 req/min por IP

### Instalação
```bash
cd server && npm install @anthropic-ai/sdk
```

### Ordem de implementação
1. `npm install @anthropic-ai/sdk` no server/ local
2. Criar `generatorController.js` com prompt caching
3. Adicionar rota POST + rate limiter em admin.js
4. Criar `admin/gerador.html` + `gerador.js` + `gerador.css`
5. Adicionar link "Gerador" na sidebar de `galeria.html`
6. Copiar arquivos ao servidor via SSH (echo linha a linha)
7. Adicionar `ANTHROPIC_API_KEY` ao `.env` do servidor
8. Reiniciar PM2

---

## Referência rápida do servidor

```
SSH: 82.112.247.253:65002  user: u562242543  senha: Amd@2018#2020
Node.js: /home/u562242543/.nvm/versions/node/v20.20.2/bin/
start.sh: ~/domains/api.alunomakerdigital.com.br/server/start.sh
.env: ~/domains/api.alunomakerdigital.com.br/.env
MySQL: mysql -u u562242543_amd_user -p'Amd@2018#2020' -S /var/lib/mysql/mysql.sock u562242543_amd_db
```
