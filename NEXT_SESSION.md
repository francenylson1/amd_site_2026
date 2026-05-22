
# Próxima sessão — Fase 5: Gerador de Conteúdo com Claude API

## Prompt para iniciar a sessão

```
Continuar o projeto Aluno Maker Digital.
Leia o CLAUDE.md e este NEXT_SESSION.md inteiros antes de qualquer ação.

TAREFA: Implementar a Fase 5 — Gerador de Conteúdo com Claude API.
Usar o skill claude-api para implementação.
Criar branch feature/fase-5-gerador a partir de main.
Ver especificação completa abaixo.
```

---

## Estado atual (2026-05-22)

| Fase | Status | Notas |
|---|---|---|
| 0 a 4 | ✅ Concluídas | — |
| 4.5 — CMS | ✅ Concluída e em produção | 6 abas: Eventos, Projetos, Escolas, Cursos, Sobre, Configurações |
| **5 — Gerador Claude API** | **⏳ Próxima** | — |
| 6 — Publicador redes + Loja | ⏳ | — |

---

## O que foi entregue na Fase 4.5 (sessão 2026-05-22)

### Aba Sobre
- `aboutController.js` no servidor (GET público + CRUD admin)
- Tabela `about_photos` com 7 fotos (schema-v3.sql aplicado)
- `loadSobre()` com try-catch — mostra erro claro se servidor desatualizado

### Aba Configurações
- Tabela `site_config` com 9 campos editáveis (schema-v4.sql)
- `configController.js` — GET público `/api/config` + GET+PUT admin `/api/admin/config`
- Formulário CMS com campos: WhatsApp, e-mail, Instagram, YouTube, endereço, horário

### site-config.js (todas as páginas públicas)
- Busca `/api/config`, cache sessionStorage 5 min
- Atualiza `[data-config]` (textContent) e `[data-config-href]` (href)
- Cobre footer de todas as 11 páginas + CTAs WhatsApp inline + contato.html

### Credenciais servidor
```
SSH: 82.112.247.253:65002  user: u562242543  senha: Amd@2018#2020
Admin CMS: francenylson@gmail.com / Amd@2018#2020
MySQL: mysql -u u562242543_amd_user -p'Amd@2018#2020' -S /var/lib/mysql/mysql.sock u562242543_amd_db
Chave SSH deploy: ~/.ssh/amd_deploy (gerada em 2026-05-22, adicionada ao authorized_keys do servidor)
```

---

## Pendências do Prof. Fran (não bloqueiam a Fase 5)

1. **Braço Robótico com IA** (projeto #3): imagem pode estar errada → admin → Projetos → Editar → upload
2. **Escola Pinheirinho Roxo**: imagens JPG em `assets/images/escolas/pinheirinho_roxo/` → admin → Escolas → Editar
3. **Fotos aba Sobre**: após entrar no admin, verificar se alguma foto está de cabeça para baixo → Editar → upload da versão corrigida (Sharp auto-corrige EXIF)

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
- Rate limit: 10 req/min por IP (separado do loginLimiter)

### Instalação
```bash
cd server && npm install @anthropic-ai/sdk
```

### Ordem de implementação
1. Criar branch `feature/fase-5-gerador`
2. `npm install @anthropic-ai/sdk` no server/ local
3. Criar `generatorController.js` com prompt caching
4. Adicionar rota POST + rate limiter em admin.js
5. Criar `admin/gerador.html` + `gerador.js` + `gerador.css`
6. Adicionar link "Gerador" na sidebar de `galeria.html`
7. Testar localmente com `npm run server:dev`
8. Copiar ao servidor via SCP (chave `~/.ssh/amd_deploy` já configurada)
9. `npm install @anthropic-ai/sdk` no servidor
10. Adicionar `ANTHROPIC_API_KEY` ao `start.sh` do servidor (linha a linha via echo — NUNCA heredoc)
11. Reiniciar PM2 com sequência segura (ver CLAUDE.md)

---

## Referência rápida do servidor

```
SSH: 82.112.247.253:65002  user: u562242543  senha: Amd@2018#2020
Chave SSH: ~/.ssh/amd_deploy (já configurada — usar scp/ssh -i ~/.ssh/amd_deploy -p 65002)
Node.js: /home/u562242543/.nvm/versions/node/v20.20.2/bin/
server/: ~/domains/api.alunomakerdigital.com.br/server/
public_html/: ~/domains/alunomakerdigital.com.br/public_html/
.env: ~/domains/api.alunomakerdigital.com.br/.env
PM2 restart seguro: ps aux | grep -E "node|start.sh" | grep -v grep | awk "{print $2}" | xargs kill -9 && sleep 2 && pm2 delete all && pm2 start ~/domains/api.alunomakerdigital.com.br/server/start.sh --name amd-api --interpreter bash
```
