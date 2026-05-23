
# Próxima sessão — Fase 5: Gerador de Conteúdo com Claude API

## Prompt para iniciar a sessão

```
Continuar o projeto Aluno Maker Digital.
Leia o CLAUDE.md e este NEXT_SESSION.md inteiros antes de qualquer ação.

TAREFA: Implementar a Fase 5 — Gerador de Conteúdo com Claude API.
Usar o skill /claude-api para implementação.
Criar branch feature/fase-5-gerador a partir de main.
Seguir a análise de ajustes e a especificação completa abaixo.
```

---

## Estado atual (2026-05-22)

| Fase | Status | Notas |
|---|---|---|
| 0 a 4.5 | ✅ Concluídas e em produção | CMS 6 abas validado em produção |
| **5 — Gerador Claude API** | **⏳ Próxima** | — |
| 6 — Publicador redes + Loja | ⏳ | — |

---

## Análise de ajustes antes de iniciar a Fase 5

### Pontos a decidir antes de implementar

**1. Onde o gerador fica no admin?**
- Opção A: Nova página separada `admin/gerador.html` com link na sidebar do `galeria.html`
- Opção B: Nova aba dentro de `galeria.html` (consistente com o padrão atual)
- **Recomendação:** Opção A — o gerador tem UX diferente das abas CRUD e merece página própria.

**2. Quais formatos de conteúdo gerar?**
- Post Instagram (legenda + sugestão de hashtags)
- Legenda TikTok (mais curta, tom jovem)
- Thread X/Twitter (sequência de tweets)
- **Pode expandir na Fase 6** (publicador direto nas redes)

**3. O prompt base do Claude — o que incluir?**
- Contexto do projeto AMD (missão, público-alvo, tom de voz)
- Dados do item selecionado (título, descrição, tags, escola parceira)
- Instruções por formato
- **Cache:** o system prompt com contexto AMD é fixo → ideal para prompt caching

**4. Segurança da ANTHROPIC_API_KEY**
- Chave fica APENAS no `start.sh` do servidor (nunca no repo)
- Variável já carregada pelo PM2 via `start.sh`
- Adicionar via SSH com `echo` linha a linha (nunca heredoc)

**5. Rate limiting**
- Gerar conteúdo é caro em tokens — limitar a 10 req/hora por IP (não por minuto)
- Separar do `loginLimiter` existente

**6. Feedback ao usuário durante geração**
- A API Claude pode demorar 5-15s
- Mostrar spinner/skeleton durante a chamada
- Exibir tokens usados e se houve cache hit (informação útil para o Prof. Fran controlar custos)

### Decisões técnicas confirmadas (do SPEC)
- Modelo: `claude-sonnet-4-6`
- Prompt caching: `cache_control: { type: "ephemeral" }` no system prompt
- SDK: `@anthropic-ai/sdk` (instalar no server/)
- Rate limit: 10 req/hora por IP

---

## Fase 5 — Especificação completa

### Funcionalidade
No painel admin, nova página **"Gerador"** (`admin/gerador.html`) onde o Prof. Fran:
1. Seleciona o tipo (Projeto ou Evento) e o item do banco
2. Seleciona o formato (Post Instagram, Legenda TikTok, Thread X/Twitter)
3. Opcionalmente adiciona instruções extras ("foque nos alunos do 6º ano", "tom mais formal")
4. Clica "Gerar" → Claude cria o texto pronto para publicar
5. Pode copiar com um clique ou regenerar com novas instruções

### Arquivos a criar

**Backend:**
```
server/controllers/generatorController.js
```

**Modificar:**
```
server/routes/admin.js   ← adicionar POST /api/admin/generate + rateLimiter
```

**Frontend admin:**
```
admin/gerador.html
admin/assets/js/gerador.js
admin/assets/css/gerador.css
```

**Modificar:**
```
admin/galeria.html   ← adicionar link "Gerador" na sidebar
```

### Endpoint
```
POST /api/admin/generate    (Bearer JWT obrigatório)
Body:  { type: "projeto"|"evento", item_id: number, format: "instagram"|"tiktok"|"twitter", extra_notes?: string }
Response: { content: string, tokens_in: number, tokens_out: number, cached: boolean }
```

### generatorController.js — estrutura
```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Você é o assistente de marketing do projeto Aluno Maker Digital...
[contexto AMD completo aqui]`;

const FORMAT_INSTRUCTIONS = {
  instagram: `Crie uma legenda para Instagram...`,
  tiktok: `Crie uma legenda para TikTok...`,
  twitter: `Crie uma thread para X/Twitter com 3 a 5 tweets...`,
};

export async function generate(req, res) {
  const { type, item_id, format, extra_notes } = req.body;
  // 1. Buscar item do banco (projeto ou evento)
  // 2. Montar user prompt com dados do item
  // 3. Chamar Claude API com prompt caching no system
  // 4. Retornar { content, tokens_in, tokens_out, cached }
}
```

### Instalação local
```bash
cd server && npm install @anthropic-ai/sdk
```

### Ordem de implementação
1. Criar branch `feature/fase-5-gerador` a partir de main
2. `cd server && npm install @anthropic-ai/sdk`
3. Criar `generatorController.js` com prompt caching
4. Atualizar `server/routes/admin.js` (rota + rate limiter 10/hora)
5. Criar `admin/gerador.html` + `gerador.js` + `gerador.css`
6. Adicionar link "Gerador" na sidebar de `galeria.html`
7. Testar localmente (`npm run server:dev` + `ANTHROPIC_API_KEY=sk-ant-... npm run server:dev`)
8. Commit + PR
9. Deploy via SCP (chave `~/.ssh/amd_deploy` já configurada)
10. Adicionar `ANTHROPIC_API_KEY` ao `start.sh` no servidor via echo linha a linha
11. Reiniciar PM2 com sequência segura (ver CLAUDE.md)

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
server/: ~/domains/api.alunomakerdigital.com.br/server/
public_html/: ~/domains/alunomakerdigital.com.br/public_html/

PM2 restart seguro:
  export PATH="/home/u562242543/.nvm/versions/node/v20.20.2/bin:$PATH"
  ps aux | grep -E "node|start.sh" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null
  sleep 2 && pm2 delete all
  pm2 start ~/domains/api.alunomakerdigital.com.br/server/start.sh --name amd-api --interpreter bash
```
