
# Próxima sessão — Fase 5: Gerador de Conteúdo com Claude API

## Prompt para iniciar a sessão

```
Continuar o projeto Aluno Maker Digital.
Leia o CLAUDE.md e este NEXT_SESSION.md inteiros antes de qualquer ação.

TAREFA: Implementar a Fase 5 — Gerador de Conteúdo com Claude API.
Usar o skill /claude-api para implementação.
Criar branch feature/fase-5-gerador a partir de main.
A especificação abaixo é única e já reconciliada com PRD §7.12, SPEC §14.3 e WORKFLOW Fase 5.
```

---

## Estado atual (2026-05-26)

| Fase | Status | Notas |
|---|---|---|
| 0 a 4.5 | ✅ Concluídas e em produção | CMS 6 abas validado em produção |
| **5 — Gerador Claude API** | **⏳ Próxima** | Spec reconciliada (este doc) |
| 5.5 — Blog do site | ⏳ Depois da 5 | Destino do "blog longo" |
| 6 — Publicador redes + Loja | ⏳ | Publicação automática nas redes |

### Revisão documental (sessão 2026-05-26)

Os 4 documentos canônicos + CLAUDE.md foram **reconciliados** antes da Fase 5, porque divergiam entre si e do código real (causa das features esquecidas nas fases anteriores). Principais correções: Fase 4.5 inserida no PRD/WORKFLOW; versões alinhadas (PRD v2.1, SPEC v2.2, WORKFLOW v1.1); stack real (sharp sim, express-validator não); entry `server/index.js`; deploy via GitHub Actions+SSH; e a **Fase 5 unificada** (este doc bate com PRD/SPEC/WORKFLOW).

---

## Decisões travadas (confirmadas com o PO)

- **Entrada híbrida:** o usuário escolhe a cada uso — selecionar item do banco (projeto/evento/curso) **ou** digitar tema livre.
- **5 formatos selecionáveis:** Instagram (legenda + hashtags), TikTok (roteiro/legenda), X/Twitter (thread), WhatsApp (mensagem), Blog (post longo).
- **Seletor de fotos:** anexar fotos do banco ou enviar novas (Sharp → WebP). **Sem vídeo no site** (vídeo vai para as redes na Fase 6).
- **Histórico + custo:** tabela `generations` (`schema-v5.sql`); persistir `cost_usd`, `tokens_in/out`, `cached`; badge de custo do mês + alerta > US$5/mês.
- **Rate limit:** 10/hora **e** 30/dia por IP (limiter separado do `loginLimiter`).
- **Modelo:** `claude-sonnet-4-6` via `@anthropic-ai/sdk`, com prompt caching (`cache_control: ephemeral`) no system prompt (contexto AMD fixo).
- **Segurança:** `ANTHROPIC_API_KEY` apenas no `start.sh` do servidor (nunca no repo).
- **Posição no admin:** página separada `admin/gerador.html` com link na sidebar do `galeria.html`.
- **Publicação nas redes:** Fase 6 (a Fase 5 só gera/salva).

---

## Fase 5 — Especificação completa

### Funcionalidade
Nova página **"Gerador"** (`admin/gerador.html`) onde o Prof. Fran:
1. Escolhe a **fonte**: item do banco (seleciona tipo + item) **ou** tema livre (digita).
2. Marca um ou mais **formatos** (Instagram, TikTok, X, WhatsApp, Blog).
3. Opcionalmente anexa **fotos** (do banco ou upload) e adiciona instruções extras.
4. Clica "Gerar" → Claude cria o texto de cada formato → exibido em cards, com botão copiar.
5. Vê tokens usados / cache hit e o custo; consulta o **histórico**.

### Arquivos a criar
**Backend:** `server/db/schema-v5.sql` (tabela `generations`), `server/controllers/generatorController.js`
**Frontend admin:** `admin/gerador.html`, `admin/assets/js/gerador.js`, `admin/assets/css/gerador.css`

### Arquivos a modificar
`server/routes/admin.js` (rotas + novo rate limiter 10/h e 30/dia), `admin/galeria.html` (link "Gerador" na sidebar)

### Endpoints
```
POST /api/admin/generate    (Bearer JWT)
Body: {
  source: "item" | "theme",
  item_type?: "projeto"|"evento"|"curso",   // se source=item
  item_id?: number,                          // se source=item
  theme?: string,                            // se source=theme
  formats: ("instagram"|"tiktok"|"twitter"|"whatsapp"|"blog")[],
  photo_ids?: number[],
  extra_notes?: string
}
Response: { results: [{ format, content, tokens_in, tokens_out, cached, cost_usd }] }

GET /api/admin/generations  (Bearer JWT)  → histórico + custo do mês
```

### generations (schema-v5.sql) — ver SPEC §14.2 para o DDL completo
Colunas: `source`, `item_type`, `item_id`, `theme`, `format`, `output`, `tokens_in`, `tokens_out`, `cached`, `cost_usd`, `created_at`.

### generatorController.js — estrutura
```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// System prompt FIXO (contexto AMD + diretrizes do PRD §3) → prompt caching
const SYSTEM_PROMPT = `Você é o assistente de marketing do Aluno Maker Digital...`;

const FORMAT_INSTRUCTIONS = {
  instagram: `Legenda para Instagram + ~30 hashtags...`,
  tiktok:    `Roteiro/legenda para TikTok 30–60s, tom jovem...`,
  twitter:   `Thread para X com 3 a 5 tweets...`,
  whatsapp:  `Mensagem curta de WhatsApp...`,
  blog:      `Post de blog longo (título + corpo)...`,
};

export async function generate(req, res) {
  const { source, item_type, item_id, theme, formats, photo_ids, extra_notes } = req.body;
  // 1. source=item → buscar registro no banco; source=theme → usar theme
  // 2. Para cada formato: chamar Claude com system cacheado (cache_control: ephemeral)
  // 3. Calcular cost_usd; persistir em generations
  // 4. Retornar { results: [...] }
}

export async function listGenerations(req, res) { /* histórico + custo do mês */ }
```
**Diretriz crítica:** todo texto deve respeitar o PRD §3 (esperança, protagonismo, nunca conotação negativa ao público em vulnerabilidade).

### Ordem de implementação
1. Criar branch `feature/fase-5-gerador` a partir de main.
2. `cd server && npm install @anthropic-ai/sdk`.
3. Criar `server/db/schema-v5.sql` e aplicar no MySQL (local e, no deploy, produção).
4. Criar `generatorController.js` (entrada híbrida, 5 formatos, prompt caching, persistência + custo).
5. Atualizar `server/routes/admin.js` (POST /generate, GET /generations, rate limiter 10/h e 30/dia).
6. Criar `admin/gerador.html` + `gerador.js` + `gerador.css` (fonte item/tema, checkboxes de formato, seletor de fotos, spinner, tokens/cache, copiar, histórico, badge de custo).
7. Adicionar link "Gerador" na sidebar de `galeria.html`.
8. Testes: unit (mock Anthropic), API (Supertest), E2E (gerar → copiar → histórico).
9. Testar localmente: `ANTHROPIC_API_KEY=sk-ant-... npm run server:dev`.
10. Commit + PR.
11. Deploy `server/` via SCP (chave `~/.ssh/amd_deploy`); aplicar `schema-v5.sql` no MySQL de produção.
12. Adicionar `ANTHROPIC_API_KEY` ao `start.sh` no servidor via echo linha a linha (nunca heredoc).
13. Reiniciar PM2 com a sequência segura (ver CLAUDE.md).

---

## Fase 5.5 — Blog do site (depois da Fase 5)

Destino do "blog longo" gerado na Fase 5. Escopo fechado:
- **Tabela** `blog_posts` (`schema-v6.sql`): título, slug, resumo, corpo, capa, `video_embed_url` (YouTube opcional), status (rascunho/publicado), datas.
- **Backend:** `blogController.js` — público `GET /api/posts` (publicados) e `GET /api/posts/:slug`; admin CRUD `/api/admin/posts`.
- **Front:** `blog.html` (listagem) + página de post; `assets/js/blog.js`; renderização via `fetch`.
- **Admin:** aba de CRUD de posts em `galeria.html`; o Gerador salva "blog longo" como rascunho.
- **Vídeo:** somente embed YouTube com click-to-load (nunca self-hosted — gate Lighthouse).
- **Tag:** v2.7.0 (a Fase 5 é v2.6.0).

---

## Pendências do Prof. Fran (não bloqueiam a Fase 5)

1. **Braço Robótico com IA** (projeto #3): verificar se imagem está correta → admin → Projetos → Editar
2. **Escola Pinheirinho Roxo**: fazer upload das imagens via admin → Escolas → Editar
3. **Fotos de cabeça para baixo na aba Sobre**: verificar cada foto → Editar → upload da versão corrigida

---

## Referência rápida do servidor

```
SSH: ssh -p 65002 -i ~/.ssh/amd_deploy u562242543@82.112.247.253
Admin CMS: alunomakerdigital.com.br/admin/login.html  →  francenylson@gmail.com / Amd@2018#2020
MySQL: mysql -u u562242543_amd_user -p'Amd@2018#2020' -S /var/lib/mysql/mysql.sock u562242543_amd_db
server/: ~/domains/api.alunomakerdigital.com.br/server/   (entry: index.js, ESM)
public_html/: ~/domains/alunomakerdigital.com.br/public_html/

PM2 restart seguro:
  export PATH="/home/u562242543/.nvm/versions/node/v20.20.2/bin:$PATH"
  ps aux | grep -E "node|start.sh" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null
  sleep 2 && pm2 delete all
  pm2 start ~/domains/api.alunomakerdigital.com.br/server/start.sh --name amd-api --interpreter bash
```
