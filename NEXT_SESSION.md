
# Próxima sessão — Fase 6 (quando produtos estiverem definidos)

## Prompt para iniciar a sessão

```
Continuar o projeto Aluno Maker Digital.
Leia o CLAUDE.md e este NEXT_SESSION.md inteiros antes de qualquer ação.

TAREFA: Verificar pré-requisitos da Fase 6 com o PO e, se confirmados,
iniciar a Fase 6 — Publicador de Redes Sociais + Loja.
```

---

## Estado atual (2026-05-30)

| Fase | Status | Tag | Notas |
|---|---|---|---|
| 0 a 5.5 | ✅ Concluídas e em produção | v2.7.0 | |
| 5 — Histórico expand inline | ✅ Concluído e em produção | — | Commit `9306ca8`, deploy manual feito |
| **6 — Publicador redes + Loja** | ⏳ **Aguardando pré-requisitos** | v3.0.0 | Ver seção abaixo |

---

## Pré-requisitos para iniciar a Fase 6

**Confirmar com o PO antes de escrever qualquer código:**

### Catálogo (obrigatório)
- [ ] Lista dos **cursos** que serão vendidos: título, preço, descrição, foto, vagas
- [ ] Lista dos **produtos físicos** (kits de robótica, material didático): nome, preço
- [ ] Decisão: produtos físicos terão variações (tamanho/cor)? → impacta schema do banco

### Mercado Pago (obrigatório para loja)
- [ ] Conta de desenvolvedor criada em `developers.mercadopago.com.br`
- [ ] **Access Token de sandbox** disponível
- [ ] **Access Token de produção** disponível

### Redes Sociais (pode vir depois da loja)
- [ ] Conta Business no Instagram vinculada ao Facebook Business Manager
- [ ] App aprovado na Meta (Instagram Graph API — aprovação pode levar semanas)
- [ ] App criado no TikTok for Developers (Content Posting API — aprovação pode levar semanas)

---

## O que foi entregue nas últimas sessões

### Sessão 2026-05-29 / 2026-05-30
- **Histórico expand inline no gerador:** clicar no item expande texto completo + botão Copiar
- **241 imagens JPG** convertidas para WebP (escolas + campus_party + outras)
- **Deploy completo:** `generatorController.js` no servidor via SCP, PM2 reiniciado, imagens via FTP/CI
- **CI verde:** Lighthouse + Lint + 133 E2E Chromium — todos passando
- **Smoke check produção:** home, API, blog e imagens novas todas respondendo 200

### Aviso de manutenção futura (não urgente)
`actions/checkout@v4` e `actions/setup-node@v4` no CI serão forçados para Node.js 24
a partir de **16 de junho de 2026**. Atualizar `.github/workflows/ci.yml` e `deploy.yml`
antes dessa data (trocar para `@v5` ou adicionar `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`).

---

## Fase 6 — Escopo completo (WORKFLOW §4)

1. **`admin/publicador.html`** — agendamento e publicação nas redes (Instagram + TikTok)
2. **`admin/produtos.html`** — CRUD de produtos com toggle ativo/inativo
3. **`cursos.html` + `loja.html`** — conectados ao endpoint `GET /api/products?active=true`
4. **Checkout Mercado Pago** — `POST /api/payments/checkout` (preference) + webhook de confirmação
5. **Tabela `orders`** (`schema-v7.sql`) + e-mail de confirmação via Brevo
6. **Tag `v3.0.0`** — major bump: e-commerce introduzido

---

## Convenções críticas a lembrar

- `server/`: ESM puro — `import`/`export`, nunca `require()`
- Admin scripts: compartilham escopo global — NÃO redeclarar `const API_BASE`
- Deploy `server/`: NUNCA via CI/FTP — sempre SCP manual + SSH + PM2 restart
- PM2 restart seguro: `ps aux + kill -9 por PID + pm2 delete all + pm2 start`
- Branch protection `main`: desabilitar `enforce_admins` temporariamente para push direto
- Elementos com `display:flex` precisam de `selector[hidden] { display: none; }` explícito
- Testes E2E admin: `page.addInitScript` para injetar token JWT antes do `page.goto`
