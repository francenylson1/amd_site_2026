
# Próxima sessão: Fase 5 — Gerador de Conteúdo com Claude API

## Prompt para iniciar a sessão

```
Iniciar a Fase 5 do projeto Aluno Maker Digital: Gerador de Conteúdo com Claude API.
Leia o CLAUDE.md e este NEXT_SESSION.md inteiros antes de qualquer ação.
Branch de trabalho: criar feature/fase-5-gerador a partir de main.

Contexto essencial:
- A Fase 4.5 (CMS) está 100% concluída e em produção (v2.5.0).
- O admin já existe em admin/login.html → redireciona para admin/galeria.html após login.
- A API pública já retorna projetos, eventos, escolas e cursos do banco MySQL.
- O objetivo da Fase 5 é: no admin, o Prof. Fran seleciona um projeto ou evento
  e recebe copy gerada por Claude para publicar nas redes sociais (Instagram/TikTok).
- Usar o skill claude-api para implementação — inclui prompt caching obrigatório.
```

---

## Estado atual (2026-05-20)

| Fase | Status | Tag | Notas |
|---|---|---|---|
| 0 a 4 | ✅ Concluídas | v0.1.1 – v2.0.0 | — |
| 4.5 — Gerenciador de Conteúdo | ✅ Concluída | v2.5.0 | CMS no ar. Upload WebP. Home dinâmica. |
| **5 — Gerador Claude API** | **⏳ Próxima** | — | **Esta sessão** |
| 6 — Publicador redes + Loja | ⏳ | — | — |

---

## Pendências da Fase 4.5 para o Prof. Fran (não bloqueiam a Fase 5)

1. **Braço Robótico com IA** (projeto #3): imagem pode estar errada. Corrigir via admin → Projetos → Editar → upload nova foto.
2. **Escola Pinheirinho Roxo**: imagens em `assets/images/escolas/pinheirinho_roxo/` (JPGs brutos). Fazer upload via admin → Escolas → Editar.

---

## O que a Fase 5 deve entregar

### Funcionalidade principal
No painel admin, uma nova aba/página **"Gerador"** onde o Prof. Fran:
1. Seleciona o tipo de conteúdo (Projeto ou Evento) e o item do banco
2. Seleciona o formato de saída (Post Instagram, Legenda TikTok, Thread X/Twitter)
3. Clica "Gerar" → Claude API cria o texto pronto para publicar
4. Pode copiar ou regenerar com instruções adicionais

### Arquivos a criar

**Backend:**
```
server/controllers/generatorController.js   ← chama Claude API
server/routes/admin.js                      ← adicionar POST /api/admin/generate
```

**Frontend admin:**
```
admin/gerador.html                          ← interface do gerador
admin/assets/js/gerador.js                  ← lógica: select item → POST → exibe resultado
admin/assets/css/gerador.css                ← estilos
```

**Banco (opcional):**
```
server/db/schema-v3.sql                     ← tabela generations (histórico)
```

---

## Especificação técnica

### Endpoint
```
POST /api/admin/generate    (Bearer JWT obrigatório)
Body: {
  type:        "project" | "event",
  item_id:     number,
  format:      "instagram" | "tiktok" | "twitter",
  extra_notes: string (opcional — instruções adicionais do Prof. Fran)
}
Response: {
  content:    string,   ← texto gerado
  tokens_in:  number,
  tokens_out: number,
  cached:     boolean
}
```

### Modelo Claude
- **Modelo:** `claude-sonnet-4-6` (Sonnet 4.6 atual)
- **Prompt caching:** system prompt com contexto do AMD deve usar `cache_control: { type: "ephemeral" }`
- **Chave API:** `ANTHROPIC_API_KEY` no `.env` do servidor

### System prompt sugerido (com caching)
```
Você é o assistente de comunicação do Aluno Maker Digital, projeto de robótica
educacional para escolas públicas do Recanto das Emas, Brasília, DF.
Fundado em 2018 pelo Prof. Francenylson.
Slogan: "Tecnologia que transforma vidas."
Tom: esperançoso, protagonismo dos alunos, nunca linguagem negativa.
Público: pais, professores, gestores escolares, potenciais parceiros.
```

### Instalação da dependência
```bash
cd server && npm install @anthropic-ai/sdk
```

### Rate limiting
- Adicionar limiter específico para `/api/admin/generate`: 10 req/min por IP (evitar custos acidentais)

---

## Tabela de histórico (opcional mas recomendado)

```sql
CREATE TABLE IF NOT EXISTS generations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  type        ENUM('project','event') NOT NULL,
  item_id     INT NOT NULL,
  format      VARCHAR(50) NOT NULL,
  content     TEXT NOT NULL,
  tokens_in   INT DEFAULT 0,
  tokens_out  INT DEFAULT 0,
  cached      BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Ordem de implementação

1. `npm install @anthropic-ai/sdk` no server/
2. Adicionar `ANTHROPIC_API_KEY` ao `.env` do servidor (via SSH)
3. Criar `generatorController.js` com prompt caching
4. Adicionar rota `POST /api/admin/generate` + rate limiter
5. Criar `admin/gerador.html` com select de tipo/item/formato + área de output
6. Criar `admin/assets/js/gerador.js`
7. Adicionar link "Gerador" na sidebar de `galeria.html`
8. Testes Vitest para o controller (mockar @anthropic-ai/sdk)
9. Deploy: upload Node.js files + reiniciar PM2 + ANTHROPIC_API_KEY no servidor

---

## Referência rápida do servidor

```
SSH: 82.112.247.253:65002  user: u562242543  senha: Amd@2018#2020
Node.js: /home/u562242543/.nvm/versions/node/v20.20.2/bin/
PM2 restart (sequência correta):
  pkill -f "node index.js" && pkill -f "start.sh"
  pm2 delete all
  pm2 start ~/domains/api.alunomakerdigital.com.br/server/start.sh --name amd-api --interpreter bash
  pm2 save
API pública: alunomakerdigital.com.br/api/ (PHP proxy → localhost:3000)
Admin: alunomakerdigital.com.br/admin/login.html → galeria.html
```
