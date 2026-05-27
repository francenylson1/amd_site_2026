
# Próxima sessão — Fase 6: Publicador de Redes + Loja

## Prompt para iniciar a sessão

```
Continuar o projeto Aluno Maker Digital.
Leia o CLAUDE.md e este NEXT_SESSION.md inteiros antes de qualquer ação.

TAREFA: Iniciar a Fase 6 — Publicador de Redes Sociais + Loja.
```

---

## Estado atual (2026-05-27)

| Fase | Status | Notas |
|---|---|---|
| 0 a 4.5 | ✅ Concluídas e em produção | CMS 6 abas validado |
| 5 — Gerador Claude API | ✅ Concluída + produção | PR #20 mergeado, v2.6.0, ANTHROPIC_API_KEY no start.sh |
| 5.5 — Blog do site | ✅ Concluída + produção | PR #21 mergeado, v2.7.0, schema-v6 aplicado em produção |
| **6 — Publicador redes + Loja** | **⏳ Próxima** | Ver WORKFLOW Fase 6 |

---

## Fase 5.5 — O que foi entregue (não refazer)

### Backend
- `server/controllers/blogController.js` — CRUD completo, sanitize-html, slugify
- `server/db/schema-v6.sql` — tabela `blog_posts` (aplicada em produção em 2026-05-27)
- `server/routes/content.js` — GET /api/posts + GET /api/posts/:slug
- `server/routes/admin.js` — GET/POST/PUT/DELETE /api/admin/posts

### Frontend público
- `blog.html` — listagem de posts com cards paginados
- `blog-post.html` — post individual com embed YouTube click-to-load
- `assets/js/blog.js` — fetch + render cards, paginação
- `assets/js/blog-post.js` — fetch por slug, YouTube thumbnail + iframe lazy
- `assets/css/blog.css` — estilos blog (incluídos no bundle)

### Admin
- `admin/galeria.html` — 7ª aba "Blog" com CRUD completo
- `admin/assets/js/galeria.js` — loadBlogPosts, openFormPost, savePost, deleteBlogPost
- `admin/assets/js/gerador.js` — botão "Publicar no Blog" no result-card de format=blog

### Testes (197 total: 128 E2E + 27 unit + 42 API)
- `server/tests/unit/blog.test.js` — 7 testes unitários
- `server/tests/api/blog.test.js` — 9 testes Supertest
- `tests/e2e/blog.spec.js` — 12 testes E2E

### Navbar + Footer
Blog adicionado à navbar e footer de todas as 10 páginas públicas.

---

## Convenções críticas a lembrar

- `server/`: ESM puro — `import`/`export`, nunca `require()`
- Admin scripts: compartilham escopo global — NÃO redeclarar `const API_BASE` ou outras variáveis que já existem em `admin-auth.js`
- Testes E2E de admin: usar `page.addInitScript` para injetar token JWT falso no sessionStorage antes do `page.goto`
- Checkboxes com `display: none` (CSS): nos testes E2E, clicar no `<label>` em vez do `<input>` (Playwright não interage com elementos invisíveis)
- Deploy server/: NUNCA via CI/FTP. Sempre SCP manual + SSH. NUNCA heredoc no SSH.
- ANTHROPIC_API_KEY: NUNCA no repo, apenas no start.sh do servidor
- `serve` strip .html: o servidor local redireciona `/blog-post.html?slug=foo` para `/blog-post` (301, sem query string). Testes E2E devem usar `/blog-post?slug=foo` (sem .html). Links no HTML usam `.html` (produção funciona sem reescrita).
- `sanitize-html`: instalado em produção em 2026-05-27. Versão no package.json deve bater com node_modules no servidor.

---

## Deploy da Fase 5.5 já feito em produção (2026-05-27)

Sequência executada:
1. SCP: blogController.js → server/controllers/
2. SCP: content.js + admin.js → server/routes/
3. SCP: package.json → server/
4. SCP: schema-v6.sql → /tmp/
5. SSH: `npm install sanitize-html --save`
6. SSH: `mysql ... < /tmp/schema-v6.sql`
7. SSH: `pm2 delete all && pm2 start start.sh --name amd-api --interpreter bash`
8. Validação: `GET /api/posts` retornou `{"posts":[],"total":0,"page":1,"pages":0}` ✅
