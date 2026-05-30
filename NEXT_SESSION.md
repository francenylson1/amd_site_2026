
# Próxima sessão — Deploy pendente + Fase 6 (quando produtos estiverem definidos)

## Prompt para iniciar a sessão

```
Continuar o projeto Aluno Maker Digital.
Leia o CLAUDE.md e este NEXT_SESSION.md inteiros antes de qualquer ação.

TAREFA IMEDIATA: Fazer o deploy do generatorController.js no servidor (expand inline do histórico).
TAREFA PRINCIPAL (só iniciar se os produtos já estiverem definidos): Fase 6 — Publicador de Redes Sociais + Loja.
```

---

## Estado atual (2026-05-29)

| Fase | Status | Notas |
|---|---|---|
| 0 a 5.5 | ✅ Concluídas e em produção | Blog v2.7.0 |
| **5 — Histórico expand inline** | ✅ Código pronto, **deploy pendente** | SCP generatorController.js ao servidor |
| **6 — Publicador redes + Loja** | ⏳ **Em espera** | Ver pré-requisitos abaixo |

---

## Deploy pendente — generatorController.js

A query de `listGenerations` mudou: era `LEFT(output, 200) AS output_preview`, agora é `output` (campo completo).
A coluna `output` sempre existiu na tabela `generations` — sem migration necessária.

**Sequência de deploy:**

```bash
# 1. SCP do arquivo modificado
scp -P 65002 -i ~/.ssh/amd_deploy \
  server/controllers/generatorController.js \
  u562242543@82.112.247.253:~/domains/api.alunomakerdigital.com.br/server/controllers/

# 2. SSH no servidor
ssh -p 65002 -i ~/.ssh/amd_deploy u562242543@82.112.247.253

# 3. Reiniciar PM2 (sequência segura)
ps aux | grep -E "node|start.sh" | grep -v grep | awk '{print $2}' | xargs kill -9
sleep 2
pm2 delete all
/home/u562242543/.nvm/versions/node/v20.20.2/bin/pm2 start ~/domains/api.alunomakerdigital.com.br/server/start.sh --name amd-api --interpreter bash

# 4. Verificar
pm2 status
curl https://alunomakerdigital.com.br/api/config
```

---

## Pré-requisitos para iniciar a Fase 6

**Não implementar Fase 6 sem esses itens confirmados pelo PO:**

### Catálogo (produto/conteúdo)
- [ ] Lista dos cursos que serão vendidos: título, preço, descrição, foto, vagas
- [ ] Lista dos produtos físicos (kits de robótica, material didático): nome, preço, variações (se houver)
- [ ] Decisão: produtos físicos terão variações (tamanho/cor)? → impacta schema do banco

### Mercado Pago
- [ ] Conta de desenvolvedor criada em developers.mercadopago.com.br
- [ ] Access Token de **sandbox** em mãos
- [ ] Access Token de **produção** em mãos
- [ ] Webhook URL decidida (ex: `https://alunomakerdigital.com.br/api/payments/webhook`)

### Redes Sociais (pode vir depois da loja)
- [ ] Conta Business no Instagram ativa e vinculada ao Facebook Business
- [ ] App aprovado na Meta (Instagram Graph API — pode levar semanas)
- [ ] App criado no TikTok for Developers (Content Posting API — pode levar semanas)

---

## O que foi feito na sessão de 2026-05-29

### Histórico do gerador — expand inline
- `generatorController.js`: query mudou para retornar campo `output` completo
- `admin/assets/js/gerador.js`: `renderHistory` agora gera `.history-item__summary` (clicável) + `.history-item__body` (expande com texto + botão Copiar)
- `admin/assets/css/gerador.css`: grid 4 colunas no summary + `.history-item__body[hidden] { display: none; }` (necessário para não ser sobrescrito por `display:flex`)
- Testes atualizados: `output_preview` → `output` em unit + API; novo E2E de expand/collapse
- **Totais:** 15 E2E gerador | 28 unit | 44 API | 133 E2E total — todos verdes

### Imagens otimizadas
- 241 JPGs convertidos para WebP (redução média 90%)
- Pastas cobertas: `pinheirinho_roxo/`, `altas_habilidades/`, `cef_101/`, `mirian_ervilha/`, `cef_308/`, `campus_party/`, `cef_405/`, projetos, espaço maker, etc.
- Prontas para cadastro no CMS sem nenhuma etapa adicional de otimização

### Documentação atualizada
- `CLAUDE.md`: test counts corrigidos, convenção `hidden+display:flex`, nota de imagens otimizadas
- `NEXT_SESSION.md`: este arquivo
- Memória persistente atualizada

---

## Convenções críticas a lembrar na próxima sessão

- `server/`: ESM puro — `import`/`export`, nunca `require()`
- Admin scripts: compartilham escopo global — NÃO redeclarar `const API_BASE`
- Deploy server/: NUNCA via CI/FTP. Sempre SCP manual + SSH. NUNCA heredoc no SSH
- PM2 restart: `ps aux + kill -9 por PID + pm2 delete all + pm2 start` (pkill pode matar sessão SSH)
- `hidden` + `display:flex`: adicionar `selector[hidden] { display: none; }` explícito
- Testes E2E de admin: `page.addInitScript` para injetar token JWT antes do `page.goto`
- Checkboxes ocultos: clicar no `<label>` em vez do `<input hidden>`

---

## Fase 6 — Sumário do escopo (WORKFLOW §4)

Quando os pré-requisitos estiverem prontos, a Fase 6 entrega:

1. **`admin/publicador.html`** — agendamento e publicação nas redes (Instagram + TikTok)
2. **`admin/produtos.html`** — CRUD de produtos com toggle ativo/inativo
3. **`cursos.html` + `loja.html`** — conectados ao endpoint `GET /api/products?active=true`
4. **Checkout Mercado Pago** — `POST /api/payments/checkout` (preference) + webhook de confirmação
5. **Tabela `orders`** (schema-v7.sql) + e-mail de confirmação via Brevo
6. **Tag v3.0.0** — major bump: e-commerce introduzido

Deploy final: Tag `v3.0.0`.
