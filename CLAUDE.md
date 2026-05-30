# CLAUDE.md — Aluno Maker Digital

> Entry point para qualquer sessão Claude Code neste projeto. Leia antes de tocar qualquer arquivo.

## Documentos canônicos (fonte da verdade)

Os três documentos abaixo, na raiz, são autoritativos. Em conflito, eles vencem.

1. **`PRD_AlunoMakerDigital.md`** (v2.1) — o que o produto é, para quem, critérios de aceite Gherkin por feature, métricas.
2. **`SPEC_TECNICA_AlunoMakerDigital.md`** (v2.2) — como implementar: stack, estrutura, módulo GPIO, estratégia de testes, CI/CD, segurança.
3. **`WORKFLOW_AlunoMakerDigital.md`** (v1.1) — em que ordem: fases 0 a 6 (inclui 4.5 CMS e 5.5 Blog), DoD por fase, procedimentos de deploy/rollback.

Documentos antigos vivem em `docs_rascunhos_old/` — referência histórica, não fonte de verdade.

## Regras invioláveis

1. **Vanilla JS no front.** Sem React, Vue, Angular. Dependências runtime apenas via CDN (Swiper, GLightbox, JSZip, Font Awesome). devDependencies só para testes/lint.
2. **Idioma do projeto: português do Brasil.** Copy, comentários significativos, mensagens de erro ao usuário e commits em pt-BR. Nomes de variáveis/funções/classes em inglês técnico padrão.
3. **Testes são gates, não decoração.** Falha em Playwright (E2E das jornadas críticas), Lighthouse CI (Perf ≥ 85, A11y ≥ 95, Best Practices ≥ 90, SEO ≥ 95) ou axe-core (zero violações críticas/sérias) **bloqueia deploy**.
4. **Nenhuma fase quebra a anterior.** Features em construção ficam atrás de feature flag (`data-feature` + `data-enabled="false"` no front; tabela `feature_flags` no back) até o DoD ser cumprido.

## Estado atual do projeto

| Fase | Status | Tag | Notas |
|---|---|---|---|
| 0 — Fundação documental e ambiente | ✅ Concluída | v0.1.1 | Repo Git + CI verde + placeholder no ar (produção + staging) |
| 1 — Home + layout global | ✅ Concluída | v0.2.0 | Home completa, 120/120 E2E, bundle CSS. Lighthouse ≥ 85 em staging |
| 2 — Demais páginas públicas | ✅ Concluída | v0.3.0 | 8 páginas + quiz.html + gallery.js. 70/70 E2E Chromium + axe 10 páginas verdes |
| 3 — Módulo GPIO (animações) | ✅ Concluída | v0.4.0 | animacoes.html + animations-gpio.js. 104/104 E2E + axe 11 páginas verdes |
| 4 — Backend + Admin mínimo | ✅ Concluída | v2.0.0 | API pública via PHP proxy, PM2 + start.sh, MySQL via socket |
| 4.5 — Gerenciador de Conteúdo | ✅ Concluída | v2.5.0+ | CMS 6 abas + site_config. Testado e validado em produção (2026-05-22) |
| 5 — Gerador com Claude API | ✅ Concluída | v2.6.0 | PR #20 mergeado. 116/116 testes. Deploy em produção (2026-05-27). |
| 5.5 — Blog do site | ✅ Concluída | v2.7.0 | PR #21 mergeado. 197 testes. Deploy em produção (2026-05-27). schema-v6 aplicado. |
| 6 — Publicador redes + Loja | ⏳ | v3.0.0 | Publicação automática nas redes + e-commerce |

## Comandos úteis

```bash
npm install                        # instala todas as devDependencies
npx playwright install             # baixa todos os browsers para testes locais
npm run dev                        # servidor + watchers (CSS, imagens, vídeos) em http://localhost:5500
npm run build:css                  # gera assets/css/bundle.min.css (rode antes de commitar CSS)
npm run server:install             # instala dependências em server/ (na primeira vez)
npm run server:dev                 # inicia backend com --watch na porta 3000
npm run server:start               # inicia backend em produção
npm run test:unit                  # Vitest — testes unitários (validators)
npm run test:api                   # Vitest — testes de API (Supertest)
npm test                           # Playwright — todos os browsers (e2e + axe)
npm run test:ci                    # Playwright — só Chromium (CI)
npm run lint                       # ESLint + Stylelint
npm run format                     # Prettier (corrige)
npm run images:optimize            # converte todas as imagens JPG/PNG para WebP em lote
npm run videos:optimize            # comprime MP4 + gera poster WebP (requer ffmpeg)
npx lhci autorun --config=tests/lighthouse/lighthouserc.json  # Lighthouse CI local
```

## Convenções emergentes

- **ESLint:** usa flat config (`eslint.config.mjs`) — ESLint v10 não suporta `.eslintrc.json`.
- **Dev server:** `serve` (npm) na porta 5500 — substitui Live Server da extensão VS Code.
- **Specs E2E:** usar `require()` (CommonJS) em `*.spec.js` — `playwright.config.js` é CommonJS.
- **Slogan oficial:** "Tecnologia que transforma vidas." (confirmado pelo PO em 2026-05-16).
- **Lighthouse CI:** sempre passar `--config=tests/lighthouse/lighthouserc.json`; usa `npx serve` puro como startServerCommand (sem watchers para não distorcer métricas).
- **Lighthouse local vs produção:** FCP local ~4.5s (throttled mobile simulation + 3 domínios externos). Em produção (HTTPS + HTTP/2 + CDN Hostinger) o score ≥ 85 é atingível.
- **CSS:** arquivos-fonte em `assets/css/*.css`; bundle minificado em `assets/css/bundle.min.css`. Sempre rodar `npm run build:css` após alterar qualquer CSS. O watcher de CSS reconstrói automaticamente durante `npm run dev`.
- **Stylelint:** exclui `bundle.min.css` do lint (arquivo gerado).
- **Playwright testDir:** `./tests` com `testMatch` para `**/e2e/**/*.spec.js` e `**/a11y/**/*.spec.js`.
- **ffmpeg:** instalar via `winget install Gyan.FFmpeg` — requerido pelo watcher de vídeos (Opção A).
- **WhatsApp:** número `5561981333875` definido como constante em `assets/js/main.js`.
- **Páginas internas:** todas usam navbar com links para páginas (não âncoras da home). Link ativo marcado com `.navbar__link--active`.
- **GLightbox:** carregado via CDN apenas nas páginas que usam (projetos.html, eventos.html). Script `defer` após `gallery.js`.
- **gallery.js:** usa `container.closest('section')` para escopo dos `[data-category]` — filtros e items são irmãos, não pai-filho.
- **forms.js:** suporta `#form-agendamento` (home) e `#form-contato` (contato.html). Ambos gravam em localStorage com chaves distintas.
- **serve strip .html:** o servidor local remove extensão `.html` das URLs — specs E2E usam regex sem `.html` (ex: `/obrigado/` não `/obrigado\.html/`).
- **Logo navbar:** texto tricolor com fundo branco — `.logo-aluno` (verde `#00843f`), `.logo-maker` (vermelho `#d32f2f`), `.logo-digital` (azul `#0066ff`). Fonte Orbitron. Cores atendem WCAG AA 4.5:1 em fundo branco.
- **Mapa:** iframe Google Maps está em `contato.html` (endereço: Quadra 203 Lote 32, Recanto das Emas, CEP 72610-300). Removido de `escolas.html`.
- **cursos.html:** seção `#cursos-dinamicos` oculta via `hidden` — cursos.js a exibe automaticamente quando API retornar cursos com `active=TRUE`.
- **school-card__icon--purple:** variante roxa para escolas de inclusão (ex: CEF 106).
- **Escolas cadastradas:** CEF 101, CEF 113, CEF 206, CEF 308, CEF 405, CEM 804, EC 203, EC 401, Colégio Militar, Pinheirinho Roxo (Ed. Infantil), CeD 104, CEF 106 (surdos/mudos).
- **Imagens de escolas:** todas as pastas (`pinheirinho_roxo/`, `altas_habilidades/`, `cef_101/`, `mirian_ervilha/`, `cef_308/`, campus_party etc.) já otimizadas para WebP em 2026-05-29. Prontas para cadastro no CMS.
- **Branch protection main:** requer 1 review de terceiros — dono do repo não pode aprovar o próprio PR. Workaround: desabilitar `enforce_admins` via API temporariamente (`gh api --method DELETE repos/.../branches/main/protection/enforce_admins`), fazer merge com `--admin`, reativar com `--method POST`.
- **gpio.css:** incluído no bundle; ordem no `build:css`: `variables → main → animations → components → gpio → responsive`.
- **JSZip CDN:** `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js` — carregado apenas em `animacoes.html`.
- **AnimationController.state:** `'idle' | 'running' | 'paused' | 'stopped'` — transições: idle→running(play), running→paused(pause), running/paused→stopped(stop).
- **contato.spec.js:** teste de mapa usa `iframe[title*="Localização"]` (não "Mapa") para bater com o title real do iframe.
- **contato.html campos obrigatórios:** nome-contato, email-contato, assunto (select), mensagem — o select#assunto é required e deve ser preenchido em testes E2E.
- **server/:** ESM (`"type": "module"`). Todos os arquivos usam `import`/`export`; `require()` proibido.
- **Vitest API tests:** mocks CJS/ESM com `{ ...pool, default: pool }` para que `require()` e `import default` compartilhem a mesma instância de vi.fn().
- **admin/login.html:** standalone (sem navbar), token JWT em `sessionStorage.amd_admin_token`.
- **admin/index.html:** redireciona automaticamente para galeria.html via meta refresh (entrada principal agora é login.html → galeria.html).
- **admin/galeria.html:** gerenciador de conteúdo com 6 abas — Eventos, Projetos, Escolas, Cursos, Sobre, Configurações. CRUD completo com JWT.
- **Aba Sobre:** ativa em produção. Tabela `about_photos` com 7 fotos (seed schema-v3.sql). `aboutController.js` no servidor. `loadSobre()` tem try-catch.
- **Aba Configurações:** ativa em produção. Tabela `site_config` com 11 campos (schema-v4.sql + schema-v4-patch1.sql). `configController.js` no servidor. Rota pública `GET /api/config` e admin `GET+PUT /api/admin/config`.
- **site-config.js:** script em `assets/js/site-config.js` que busca `/api/config` (rota correta — montada em `/api`, não `/api/content`), usa cache sessionStorage 5 min, e atualiza `[data-config]` (textContent) e `[data-config-href]` (href). Adicionado a TODAS as páginas públicas. Botão WhatsApp flutuante atualizado via setTimeout(0).
- **TikTok e X (Twitter):** campos `tiktok_handle` e `x_handle` adicionados ao `site_config` via `schema-v4-patch1.sql` (aplicado em 2026-05-23). Aba Configurações do admin exibe e salva esses campos. `contato.html` exibe TikTok e X na seção de contato e no rodapé do footer.
- **CI/CD NÃO copia server/:** o pipeline FTP só sobe arquivos estáticos (public_html). Arquivos Node.js em `server/` precisam ser copiados manualmente ao servidor via SSH. NUNCA usar heredoc (`<< 'EOF'`) no terminal SSH — o marcador fica literalmente dentro do arquivo. Usar `echo "linha" >> arquivo` linha a linha.
- **FTP dotfiles:** FTP-Deploy-Action não sobe dotfiles (ex: `.htaccess`) em subpastas de forma confiável. Solução: `deploy.yml` tem passo `appleboy/ssh-action` que regrava `api/.htaccess` após cada deploy em produção. Secrets SSH já configurados no GitHub Actions: `SSH_HOST`, `SSH_USER`, `SSH_PORT`, `SSH_PRIVATE_KEY`.
- **Hostinger paths:** site principal em `~/domains/alunomakerdigital.com.br/public_html/` (NÃO `~/public_html/`). Backend Node.js em `~/domains/api.alunomakerdigital.com.br/server/`.
- **Sharp .rotate():** adicionado ao uploadController para auto-corrigir EXIF (fotos de cabeça para baixo). Pasta `sobre` adicionada aos ALLOWED_FOLDERS.
- **forms.js fallback:** tenta POST /api/* com AbortSignal.timeout(8000); em caso de falha → localStorage + indicador amarelo `.form-status`.
- **robots.txt:** já bloqueia `/admin/` desde a Fase 0.
- **MySQL via socket:** `DB_SOCKET=/var/lib/mysql/mysql.sock` — Hostinger só permite conexão localhost via socket Unix. `db/connection.js` usa `socketPath` quando `DB_SOCKET` está setado.
- **dotenv e `#`:** valores `.env` com `#` devem ser entre aspas duplas (ex: `DB_PASS="Amd@2018#2020"`). dotenv trata `#` sem aspas como início de comentário.
- **PM2 + ESM:** PM2 não inicia ESM diretamente via ecosystem. Solução: `start.sh` bash wrapper que exporta todas as vars e faz `exec node index.js`. PM2 usa `--interpreter bash`.
- **PHP proxy (domínio principal):** `api/index.php` + `api/.htaccess` estão no REPO e são deployados para `alunomakerdigital.com.br/api/`. Roteia `/api/*` para `localhost:3000` sem CORS (mesma origem).
- **PHP proxy (api. subdomain):** `api-proxy/api/index.php` + `.htaccess` no repo; deployados para `api.alunomakerdigital.com.br/public_html/api/` via step separado no deploy.yml com secret `FTP_DIR_API`.
- **API_BASE:** sempre `/api` (relativo). Sem diferença localhost/produção.
- **Deploy:** FTP_DIR_PROD → domínio principal. FTP_DIR_API → subdomínio api.*. FTP_DIR_STAGING → staging.
- **Credenciais servidor:** SSH `82.112.247.253:65002` user `u562242543`. Scripts sensíveis (`start.sh`, `ecosystem.config.cjs`) ficam APENAS no servidor, não no repo.
- **WhatsApp CTA:** seção `#agendamento` na home usa `.whatsapp-cta` + `.btn--whatsapp` em vez de form. Link: `wa.me/5561981333875?text=...`.
- **gallery.js:** usa event delegation — relê `[data-category]` a cada clique de filtro, suportando conteúdo dinâmico (Fase 4.5).
- **animations.js:** expõe `window.AMD.observeReveal()` para páginas com conteúdo renderizado via JS.
- **Conteúdo dinâmico:** projetos/eventos/escolas/cursos rendem via `fetch('/api/...')` em JS. DB armazena paths relativos de imagem (`assets/images/...`).
- **schema-v2.sql:** 5 novas tabelas (events, event_photos, projects, schools, courses) + seed dos dados hardcoded. Aplicar via SSH + MySQL.
- **Regra de exibição de cursos:** `active=FALSE` → oculto; `active=TRUE + price_active=FALSE` → badge "Em breve"; `active=TRUE + price_active=TRUE` → com preço (Fase 6).
- **Upload de imagem:** `POST /api/admin/upload` via Multer (15MB, image/*) + Sharp → WebP qualidade 82. Salva em `public_html/assets/images/{folder}/{timestamp}-{random}.webp`. Pasta controlada pelo campo `folder` (eventos/projetos/escolas/cursos). `IMAGES_DIR` env var para sobrescrever destino.
- **Proxy PHP multipart:** `api/index.php` usa `CURLFile` para reencaminhar uploads ao Node.js (php://input fica vazio para multipart/form-data).
- **home-projetos.js:** busca `/api/projects` e renderiza os 3 primeiros (por sort_order) na seção "Projetos em Destaque" da home. Controle via admin → Projetos → campo Ordem.
- **PM2 restart no Hostinger:** `pm2 restart` falha silenciosamente (EADDRINUSE). Sequência correta: `ps aux | grep -E "node|start.sh" | grep -v grep | awk "{print \$2}" | xargs kill -9` + `sleep 2` + `pm2 delete all` + `pm2 start start.sh --name amd-api --interpreter bash`. Node.js path: `/home/u562242543/.nvm/versions/node/v20.20.2/bin/`. IMPORTANTE: `pkill` pode matar a sessão SSH — usar `ps aux + kill -9` por PID é mais seguro.
- **Rate limiter login:** em memória (express-rate-limit) — bloqueio de 5 tentativas/15 min por IP. Para resetar: matar TODOS os processos Node e reiniciar PM2 limpo (`ps aux | grep node | grep -v grep | awk "{print \$2}" | xargs kill -9`).
- **Senha admin:** `Amd@2018#2020` — bcrypt hash na tabela `admin_users`. Para resetar via Node.js no servidor: `node -e "require('bcrypt').hash('nova',12).then(h => console.log(h))"` e então UPDATE via mysql.
- **site-config.js:** busca `/api/config` (montado em `app.use('/api', contentRoutes)` — NÃO `/api/content/config`). Cache sessionStorage 5 min. Atualiza `[data-config]` (textContent) e `[data-config-href]` (href) em todas as páginas. Preserva `?text=` dos CTAs WhatsApp.
- **Admin fluxo:** `login.html` → após login → `galeria.html` (direto). `index.html` redireciona para `galeria.html` via meta refresh.
- **Escopo global admin (scripts regulares):** `admin-auth.js` e outros scripts admin compartilham o escopo global (`window`). NÃO redeclarar variáveis com `const`/`let` que já existam em outro script (ex: `const API_BASE` estava em ambos e causou SyntaxError). Usar apenas nomes únicos ou aproveitar o que já foi declarado.
- **admin/gerador.html + gerador.js + gerador.css:** Fase 5 — Gerador de Conteúdo com Claude API. Usa `API_BASE` e `getToken()` herdados de `admin-auth.js` (sem redeclarar). Inicialização via IIFE síncrona (scripts no fim do body — DOMContentLoaded desnecessário).
- **generatorController.js:** model `claude-sonnet-4-6`, prompt caching no system prompt, 5 formatos, custo USD calculado e salvo na tabela `generations`. Rate limits: 10/h + 30/dia por IP (separado do loginLimiter). `listGenerations` retorna campo `output` completo (não truncado — query usa `output`, não `LEFT(output,200)`).
- **Histórico do gerador — expand inline:** clicar em `.history-item__summary` abre/fecha `.history-item__body` com o texto completo + botão Copiar. `.history-item__body[hidden] { display: none; }` é regra explícita necessária para não ser sobrescrita pelo `display:flex` do mesmo seletor.
- **Admin CSS hidden override:** qualquer elemento com `display:flex` ou `display:grid` explícito via CSS precisa de regra `selector[hidden] { display: none; }` para que o atributo HTML `hidden` funcione corretamente no Playwright e no browser.
- **ANTHROPIC_API_KEY:** NUNCA no repo. Adicionar ao `start.sh` no servidor com `echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> start.sh`.
- **PHP proxy timeout:** `CURLOPT_TIMEOUT => 120` em `api/index.php` — aumentado de 30 para 120s em 2026-05-27 porque Claude API pode levar >30s especialmente na criação de cache do system prompt.
- **gallery-images endpoint:** `GET /api/admin/gallery-images` retorna URLs únicas de imagens via UNION ALL em 5 tabelas (event_photos, projects, schools, about_photos, blog_posts). Handler `listGalleryImages` em `uploadController.js`.
- **Photo picker no gerador:** `admin/gerador.html` tem seletor de foto de capa (abas Galeria + Upload). JS em `gerador.js`: `initPhotoPicker`, `loadGalleryImages`, `selectCover`, `handleCoverUpload`. Foto selecionada é passada como `pre_cover` ao redirecionar para o CMS (galeria.html).
- **fetchItemContext colunas corretas:** `projects` usa `CONCAT_WS(" ", short_desc, full_desc) AS description` (não há coluna `description`). `courses` usa `title, description` (não `name`). Já corrigido no `generatorController.js`.
- **schema-v5.sql:** tabela `generations` — aplicar em produção via SSH + MySQL antes de reiniciar o servidor.
- **Gerador — deploy manual:** SCP `server/controllers/generatorController.js` + `server/db/schema-v5.sql` → servidor; aplicar schema; adicionar ANTHROPIC_API_KEY ao start.sh; reiniciar PM2 com sequência segura.
- **schema-v6.sql:** tabela `blog_posts` — aplicar em produção via SSH + MySQL antes de reiniciar o servidor.
- **Blog — deploy concluído (2026-05-27):** schema-v6 aplicado em produção, sanitize-html instalado no servidor, blogController.js + rotas deployados via SCP, PM2 reiniciado.
- **sanitize-html:** dependência npm do server/ para sanitização de conteúdo HTML dos posts do blog. Instalar no servidor antes de reiniciar.
- **serve strip .html (dev) + query string:** serve redireciona /blog-post.html?slug=X → /blog-post (sem query). Testes E2E usam /blog-post?slug=X (sem .html). Links no app usam blog-post.html?slug=X (produção sem rewriting). Blog posts em produção acessados via blog-post.html?slug=... funcionam normalmente.

## Paths críticos

- `assets/css/bundle.min.css` — CSS único minificado usado em produção (gerado por `npm run build:css`).
- `assets/js/main.js` — inicialização global: partículas, WhatsApp flutuante, slider depoimentos.
- `tests/e2e/home.spec.js` — 25 testes E2E cobrindo todas as jornadas críticas da home.
- `tests/e2e/navigation.spec.js` — navegação entre todas as 9 páginas públicas (inclui animacoes.html).
- `tests/e2e/gallery.spec.js` — filtros client-side e lightbox (projetos + eventos).
- `tests/e2e/contato.spec.js` — formulário de contato + quiz dedicado.
- `tests/a11y/axe.spec.js` — zero violações axe críticas/sérias (gate de deploy).
- `tests/lighthouse/lighthouserc.json` — thresholds Lighthouse CI.
- `tests/manual-checklists/home-smoke.md` — checklist pré-deploy (4 browsers).
- `scripts/watch-css.js` — watcher que reconstrói bundle.min.css ao salvar qualquer .css.
- `scripts/watch-images.js` — converte JPG/PNG para WebP automaticamente.
- `scripts/watch-videos.js` — comprime MP4 + gera poster WebP (requer ffmpeg).
- `.env.example` — template de variáveis (Fase 4+). Copiar para `.env` com credenciais reais.
- `server/index.js` — entry point ESM; `npm run server:start` ou `npm run server:dev`.
- `server/db/schema.sql` — DDL MySQL: visits, contacts, admin_users, feature_flags.
- `server/db/schema-v2.sql` — Fase 4.5: 5 novas tabelas + seed com dados migrados do HTML.
- `server/db/schema-v3.sql` — tabela `about_photos` + seed das 7 fotos da sobre.html. Aplicado no banco de produção em 2026-05-22.
- `server/db/schema-v4.sql` — tabela `site_config` + seed dos 9 campos editáveis. Já aplicado em produção (2026-05-22).
- `server/controllers/configController.js` — CRUD site_config (GET público `/api/config`, GET+PUT admin `/api/admin/config`).
- `assets/js/site-config.js` — carrega `/api/config`, cache sessionStorage 5 min, atualiza [data-config] e [data-config-href] em todas as páginas públicas.
- `server/controllers/aboutController.js` — CRUD about_photos. No repo e no servidor de produção.
- `assets/js/sobre.js` — carrega fotos do banco dinamicamente na sobre.html.
- `server/middleware/validate.js` — validadores isValidEmail, isValidPhone, isValidDate, isFutureOrToday.
- `server/services/emailService.js` — Nodemailer + Brevo SMTP.
- `server/routes/content.js` — rotas públicas: GET /api/events|projects|schools|courses.
- `server/controllers/eventController.js` — CRUD eventos + fotos.
- `server/controllers/projectController.js` — CRUD projetos.
- `server/controllers/schoolController.js` — CRUD escolas.
- `server/controllers/courseController.js` — CRUD cursos.
- `admin/login.html` — página de login admin (standalone).
- `admin/index.html` — dashboard admin (contatos + agendamentos).
- `admin/galeria.html` — gerenciador de conteúdo: 6 abas CRUD (Eventos, Projetos, Escolas, Cursos, Sobre, Configurações).
- `admin/assets/js/galeria.js` — lógica do gerenciador.
- `admin/assets/css/galeria.css` — estilos do gerenciador.
- `assets/js/projetos.js` — fetch + render dos project-cards (flip).
- `assets/js/eventos.js` — fetch + render por grupo de evento + GLightbox.
- `assets/js/escolas.js` — fetch + render dos school-cards.
- `assets/js/cursos.js` — fetch + render dos course-cards.
- `assets/js/home-projetos.js` — busca /api/projects, renderiza 3 primeiros na home.
- `server/controllers/uploadController.js` — upload Multer + Sharp WebP, escreve em public_html/assets/images/.
- `admin/assets/js/admin-auth.js` — login/logout + redirect para galeria.html após autenticação.
- `server/tests/unit/validators.test.js` — 13 testes Vitest (validadores).
- `server/tests/unit/generator.test.js` — 8 testes Vitest (generatorController: validações + chamada Claude).
- `server/tests/api/*.test.js` — 44 testes Supertest (contratos de endpoint, inclui generator.test.js e blog.test.js).
- `server/controllers/generatorController.js` — gera conteúdo via Claude API, persiste na tabela generations.
- `server/db/schema-v5.sql` — tabela `generations` (Fase 5). Aplicar em produção antes do deploy do server/.
- `admin/gerador.html` + `admin/assets/js/gerador.js` + `admin/assets/css/gerador.css` — Fase 5: UI do gerador.
- `tests/e2e/gerador.spec.js` — 15 testes E2E com mock de rede (inclui 4 photo picker + 1 expand inline do histórico).
- `server/controllers/blogController.js` — CRUD blog_posts com sanitize-html e slugify automático.
- `server/db/schema-v6.sql` — tabela `blog_posts` (Fase 5.5). Aplicar em produção antes do deploy do server/.
- `blog.html` + `assets/js/blog.js` — listagem pública de posts paginada.
- `blog-post.html` + `assets/js/blog-post.js` — post individual com embed YouTube click-to-load.
- `assets/css/blog.css` — estilos do blog (incluídos no bundle).
- `tests/e2e/blog.spec.js` — 12 testes E2E (listagem, post individual, admin CRUD).
- `tests/e2e/backend.spec.js` — 4 testes E2E Playwright (fallback + admin).
- `eslint.config.mjs` — configuração ESLint v10 (flat config).
- `.github/workflows/ci.yml` — pipeline: lint + E2E + Lighthouse.
- `.github/workflows/deploy.yml` — FTP automático para staging/produção.
- `animacoes.html` — visualizador GPIO (Fase 3): canvas 800×500 + painel de controle.
- `assets/js/animations-gpio.js` — módulo GPIO: GPIOTemplate, RPi5/ESP8266/ESP32, AnimationController, LED/Servo/Sensor/Buzzer.
- `assets/css/gpio.css` — estilos do módulo GPIO (incluído no bundle).
- `tests/e2e/gpio.spec.js` — 32 testes E2E cobrindo CA-GPIO-01 a CA-GPIO-05 + acessibilidade.
- `api/index.php` + `api/.htaccess` — proxy PHP no domínio principal (no repo, deployado via FTP_DIR_PROD).
- `api-proxy/api/index.php` + `.htaccess` — proxy PHP para api.* subdomain (no repo, deployado via FTP_DIR_API).

## Manutenção deste arquivo

`CLAUDE.md` deve ser atualizado **obrigatoriamente ao final de cada fase** — é item explícito do DoD no `WORKFLOW`. O que atualizar:

- **Estado atual do projeto** — marcar fase como concluída, registrar tag de release.
- **Comandos úteis** — incluir npm scripts, comandos Playwright/Lighthouse, scripts de deploy que surgiram.
- **Convenções emergentes** — padrões reais que apareceram no código.
- **Paths críticos** — arquivos novos que toda sessão futura precisa conhecer de imediato.

**NUNCA inflar este arquivo.** Conteúdo extenso vai para PRD/SPEC/WORKFLOW. Aqui é apenas índice + regras invioláveis + estado.
