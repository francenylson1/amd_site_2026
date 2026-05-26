# Workflow de Execução — Aluno Maker Digital

**Versão:** 1.1
**Data:** 2026-05-26 (atualizado — Fase 4.5 documentada, Fase 5 reconciliada, nova Fase 5.5 Blog)
**Responsável:** Professor Francenylson
**Documentos companheiros:** `PRD_AlunoMakerDigital.md` v2.1, `SPEC_TECNICA_AlunoMakerDigital.md` v2.2
**Status:** Em vigor

---

## Sumário

1. Princípios Invioláveis
2. Modelo Geral de Trabalho
3. Macro-fluxo (7 etapas adaptadas)
4. Fases de Implantação (Fase 0 a Fase 6)
5. Procedimentos de Deploy e Rollback
6. Ciclo PDCA Mensal
7. Calendário Editorial
8. Matriz de Responsabilidades
9. Riscos e Mitigações
10. Indicadores de Execução
11. Glossário

---

## 1. Princípios Invioláveis

Este workflow opera sob 5 regras inegociáveis:

1. **Cada fase termina com um sistema funcional em produção.** Nunca se entra na fase seguinte com a anterior quebrada ou pela metade.
2. **Nenhuma fase quebra a anterior.** Features em construção ficam ocultas via *feature flag* até estarem completas; o site visível ao público permanece estável durante toda a evolução.
3. **Gate de fase = DoD cumprido + testes verdes + aprovação humana.** Não há atalhos.
4. **Validação e testes são gates, não etapas finais.** Falha em Lighthouse, axe-core ou Playwright bloqueia o deploy.
5. **Toda mudança em produção tem snapshot de rollback prévio.** O caminho de volta é tão importante quanto o de ida.

---

## 2. Modelo Geral de Trabalho

```
┌───────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Feature  │ → │ Develop  │ → │ Staging  │ → │ Produção │ → │  PDCA    │
│  branch   │   │ (verde)  │   │ validado │   │ liberada │   │ mensal   │
└───────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
     │              │               │               │              │
     ├ código       ├ E2E           ├ smoke         ├ smoke         ├ KPIs
     ├ testes       ├ Lighthouse    ├ manual        ├ pós-deploy    ├ ajustes
     └ CA Gherkin   ├ axe-core      └ aprovação     └ monitoramento └ próximo
                    └ revisão                                          ciclo
```

**Cada iteração de feature segue o ciclo:**
1. Leitura do PRD (critérios de aceite da feature).
2. Implementação na branch `feature/*`.
3. Testes locais (E2E + Lighthouse na página afetada).
4. Pull Request → revisão (humana ou Claude Code) → merge em `develop`.
5. CI roda toda a suíte → deploy automático em staging.
6. Smoke manual em staging → preenchimento do checklist.
7. Tag `vN.M` em `main` → deploy em produção → smoke pós-deploy.

---

## 3. Macro-fluxo (7 etapas adaptadas do workflow_simples.pdf)

| Etapa | Atividade | Aplicação no projeto |
|---|---|---|
| 1. Descoberta e Estratégia | Briefing + PRD | Já concluído (`BRIEFING_COMPLETO_V2`, `PRD`) |
| 2. Planejamento UX | Mapa do site + user flows + wireframes Lo-Fi | Fase 0 / pré-Fase 1 |
| 3. Especificação Técnica | Stack, modelagem, API, infra | Concluído (`SPEC v2.0`) |
| 4. Design de Interface (UI) | Style guide + protótipo Hi-Fi | Style guide já no SPEC §7; protótipos por página entram no início de cada fase |
| 5. Desenvolvimento (Build) | Front-end + back-end + integração | Distribuído nas Fases 1–6 |
| 6. Testes e QA | Funcional + técnico + acessibilidade + performance | Embutido em cada fase como gate |
| 7. Lançamento e Evolução | Deploy + monitoramento + PDCA | Procedimentos no §5 + ciclo PDCA no §6 |

---

## 4. Fases de Implantação

### Estrutura comum a cada fase

Cada fase abaixo segue o mesmo template:

- **Objetivo**
- **Entradas** (pré-requisitos da fase)
- **Tarefas** (lista executável e ordenada)
- **Critérios de Aceite** (referência ao PRD)
- **Testes obrigatórios**
- **Definition of Done**
- **Estado funcional ao final**

---

### FASE 0 — Fundação Documental e Ambiente

**Objetivo:** Preparar todo o terreno para que o desenvolvimento comece com qualidade desde o primeiro commit.

**Entradas:**
- BRIEFING aprovado (já concluído).
- Acesso à conta Hostinger Business.
- Acesso ao domínio `alunomakerdigital.com.br`.

**Tarefas:**
1. Aprovar PRD, SPEC e este WORKFLOW.
2. Criar repositório Git local em `C:\Users\User\Desktop\amd_site_2026` e remoto (GitHub privado).
3. Instalar Node.js 20 LTS, VS Code com extensões recomendadas (Live Server, ESLint, Prettier, Stylelint).
4. Inicializar `package.json` apenas com devDependencies de testes (Playwright, Lighthouse CI, axe-core, ESLint, Prettier, Stylelint).
5. Configurar `.gitignore`, `.env.example`, `.prettierrc`, `eslint.config.mjs` (flat config), `playwright.config.js`, `lighthouserc.json`.
6. Criar estrutura de pastas conforme SPEC §3 (incluindo `/tests/`).
7. Configurar GitHub Actions com workflows `ci.yml` e `deploy.yml`.
8. Configurar Hostinger: subdomínio `staging.alunomakerdigital.com.br` apontando para diretório separado, e-mails profissionais, Git Deploy ou FTP automatizado.
9. Definir slogan oficial (3 candidatos no PRD §2 — escolher e atualizar).
10. Configurar Google Analytics 4 e WhatsApp Business.

**Critérios de Aceite:**
- Repositório versionado com primeiro commit válido.
- `npm install` instala todas as devDependencies sem erro.
- `npx playwright test` roda (mesmo sem specs) sem erro de configuração.
- `npx lhci autorun` aceita o `lighthouserc.json` sem erro.
- Domínio e subdomínio resolvem para diretórios distintos na Hostinger.

**Testes obrigatórios:**
- Sanity check do pipeline CI (push de commit vazio → workflow verde).

**Definition of Done:**
- [ ] PRD, SPEC e WORKFLOW aprovados pelo responsável.
- [ ] Slogan oficial confirmado.
- [ ] Repositório com CI configurado e verde.
- [ ] Staging e produção acessíveis (com placeholder "em construção").
- [ ] Ambiente local reproduzível por documentação no README.
- [ ] `CLAUDE.md` criado/atualizado com paths, convenções e estado ao final desta fase.

**Estado funcional ao final:** Página "em construção" no ar em produção; pipeline pronto para receber código.

---

### FASE 1 — Fundação do Site (Home + Layout Global)

**Objetivo:** Publicar a home institucional com identidade visual completa, navbar, footer, WhatsApp flutuante e jornadas básicas. Site mínimo viável para começar a divulgar.

**Entradas:** Fase 0 concluída.

**Tarefas:**
1. Implementar `assets/css/variables.css`, `main.css`, `components.css`, `animations.css`, `responsive.css`.
2. Implementar `assets/js/main.js` (init + WhatsApp flutuante) e `navbar.js` (sticky + hamburger).
3. Implementar `assets/js/animations.js` (Intersection Observer) e `counter.js`.
4. Implementar `index.html` com: hero (partículas + typewriter), contadores animados, grid de projetos destaque (3 cards), seção "Venha nos visitar" com formulário simulado, slider de depoimentos, parceiros/escolas.
5. Implementar `obrigado.html` mínimo (necessário para o fluxo de agendamento).
6. Otimizar imagens (WebP + fallback) e gravar 1–3 vídeos curtos dos robôs (background da seção de visita).
7. Adicionar meta tags + Open Graph + Schema.org `EducationalOrganization` na home.
8. Criar `sitemap.xml`, `robots.txt`, `manifest.json`.
9. Escrever specs Playwright: `tests/e2e/home.spec.js`.
10. Configurar Lighthouse CI para coletar a home em staging.
11. Preencher checklist manual `tests/manual-checklists/home-smoke.md` em 4 browsers.

**Critérios de Aceite (do PRD §7.1):**
- CA-Hero, CA-Contadores, CA-Agendamento, CA-WhatsApp.

**Testes obrigatórios:**
- E2E: `home.spec.js` em Chromium, Firefox, WebKit, mobile-chrome, mobile-safari.
- Lighthouse: Performance ≥ 85, A11y ≥ 95, BP ≥ 90, SEO ≥ 95.
- axe-core: 0 violações sérias/críticas.
- Smoke manual cross-browser: 4 ambientes, checklist assinado.

**Definition of Done:**
- [ ] Home navegável em staging em mobile e desktop.
- [ ] Todos os testes acima verdes.
- [ ] Formulário de agendamento valida e redireciona para `obrigado.html` (envio simulado, grava em localStorage).
- [ ] Lighthouse aprovado.
- [ ] Checklist manual assinado.
- [ ] `CLAUDE.md` atualizado com paths, convenções e estado ao final desta fase.

**Estado funcional ao final:** Home institucional pública no ar em `alunomakerdigital.com.br`. Pronta para receber tráfego de TikTok/Instagram.

**Deploy 1:** Tag `v1.0.0`.

---

### FASE 2 — Páginas Públicas Restantes

**Objetivo:** Completar o site institucional com todas as 9 páginas públicas (sem `animacoes.html`, que entra na Fase 3).

**Entradas:** Fase 1 deployada e estável.

**Tarefas:**
1. Implementar `sobre.html` — missão, visão, valores, perfil do professor, timeline, inclusão.
2. Implementar `projetos.html` — galeria com filtros por categoria + GLightbox + cards flip.
3. Implementar `escolas.html` — mapa Google Maps + 7 cards de escolas.
4. Implementar `eventos.html` — galeria de eventos por categoria.
5. Implementar `cursos.html` — catálogo com badges "Em breve" (todos inativos até Fase 6).
6. Implementar `loja.html` — catálogo de produtos físicos com CTA WhatsApp.
7. Implementar `contato.html` — formulário com validação + Google Maps.
8. Implementar `quiz.js` (Home + página própria se necessário) + `gallery.js` + `forms.js` (envio simulado com fallback localStorage).
9. Atualizar navbar com todos os links.
10. Atualizar `sitemap.xml` com todas as URLs.
11. Escrever specs E2E: `quiz.spec.js`, `gallery.spec.js`, `contato.spec.js`, `navigation.spec.js`.
12. Rodar Lighthouse em cada nova página.
13. Preencher checklist manual para cada página.

**Critérios de Aceite (do PRD §7.2 a §7.9):** todos.

**Testes obrigatórios:**
- E2E em todas as páginas.
- Lighthouse em todas as páginas: thresholds atingidos.
- axe-core em todas as páginas: 0 violações sérias/críticas.
- Smoke manual nas páginas críticas (home, projetos, contato, cursos) em 4 ambientes.

**Definition of Done:**
- [ ] Todas as 9 páginas no ar em produção.
- [ ] Navegação 100% funcional entre páginas.
- [ ] Filtros de galeria funcionam sem reload.
- [ ] Quiz recomenda curso corretamente.
- [ ] Formulário de contato valida e redireciona.
- [ ] Todos os testes verdes; checklists assinados.
- [ ] `CLAUDE.md` atualizado com paths, convenções e estado ao final desta fase.

**Estado funcional ao final:** Site institucional COMPLETO no ar, sem backend ainda. Formulários armazenam em localStorage como rastro de leads (visível em sessão do navegador) — solução temporária até Fase 4.

**Deploy 2:** Tag `v1.1.0`.

---

### FASE 3 — Módulo de Animações GPIO

**Objetivo:** Entregar a ferramenta diferencial do projeto — criador de animações de circuitos para Raspberry Pi 5, NodeMCU ESP8266 e ESP-32.

**Entradas:** Fase 2 deployada e estável.

**Tarefas:**
1. Implementar `animacoes.html` (layout: painel de controle + canvas conforme SPEC §6.4).
2. Implementar `assets/js/animations-gpio.js` com:
   - Classe `GPIOTemplate` (base abstrata).
   - Classes `RPi5Template`, `ESP8266Template`, `ESP32Template`.
   - Classe `AnimationController`.
   - Classes `LEDAnimation`, `ServoAnimation`, `SensorAnimation`, `BuzzerAnimation`.
3. Implementar exportação:
   - PNG do frame atual.
   - ZIP de sequência (via JSZip CDN) com README.txt incluído.
4. Adicionar link na navbar (visível apenas no menu, sem destaque excessivo — ferramenta interna/educacional).
5. Atualizar `sitemap.xml`.
6. Escrever spec E2E: `tests/e2e/gpio.spec.js` cobrindo CA-GPIO-01 a CA-GPIO-05.
7. Validação de acessibilidade: foco visível em todos os controles, navegação por teclado completa, ARIA labels em botões de play/pause/stop.
8. Smoke manual em Chrome, Firefox, Safari (desktop) + Chrome Android + Safari iOS.
9. Gravar vídeo tutorial curto (60s) demonstrando o uso → publicar no Instagram/TikTok.

**Critérios de Aceite (do PRD §8.4):** CA-GPIO-01 a CA-GPIO-05.

**Testes obrigatórios:**
- E2E: `gpio.spec.js` em Chromium, Firefox, WebKit.
- Lighthouse em `animacoes.html`.
- axe-core em `animacoes.html`.
- Smoke manual cross-browser específico para o módulo (canvas + downloads).

**Definition of Done:**
- [ ] Módulo funcional em produção.
- [ ] Exportação PNG funciona em Chrome, Firefox, Safari.
- [ ] Exportação ZIP gera arquivo válido com frames sequenciais.
- [ ] Performance: ≥ 30 FPS desktop, ≥ 20 FPS mobile.
- [ ] Vídeo tutorial publicado nas redes.
- [ ] Acessibilidade validada (teclado + axe-core).
- [ ] `CLAUDE.md` atualizado com paths, convenções e estado ao final desta fase.

**Estado funcional ao final:** Site institucional + módulo GPIO no ar. Diferencial competitivo do projeto disponível para produção de conteúdo.

**Deploy 3:** Tag `v1.2.0`.

---

### FASE 4 — Backend Mínimo + Painel Admin

**Objetivo:** Introduzir backend Node.js + MySQL, painel admin protegido por JWT e migração transparente dos formulários do site (de localStorage para MySQL).

**Entradas:** Fase 3 deployada e estável.

**Tarefas:**
1. Criar estrutura `server/` (Express + rotas + controllers + middleware + db).
2. Configurar MySQL na Hostinger e aplicar schema (SPEC §14.2).
3. Implementar middleware de autenticação JWT + bcrypt.
4. Implementar endpoints: `POST /api/contact`, `POST /api/visits`, `POST /api/admin/login`, `GET /api/admin/contacts`, `GET /api/admin/visits`, `GET /api/feature-flags`.
5. Configurar `express-rate-limit` (5 tentativas / 15min em login) e `helmet`.
6. Implementar `admin/login.html` e `admin/index.html` (dashboard com métricas básicas + listagem de contatos e agendamentos).
7. **Migrar formulários do site sem quebrar nada:**
   - `forms.js` tenta POST para API.
   - Em caso de falha de rede, mantém fallback localStorage (sistema da Fase 2 continua funcionando).
   - Indicador discreto: ícone verde "enviado ao servidor" vs. ícone amarelo "salvo localmente, será reenviado".
8. Configurar Nodemailer com Brevo SMTP para notificar Fran por e-mail a cada novo contato/agendamento.
9. Escrever testes:
   - Unit (Vitest) para validadores e utilitários.
   - API (Supertest): contratos de cada endpoint.
   - E2E full-stack: formulário → POST → registro aparece no admin.
10. Atualizar `robots.txt` para bloquear `/admin/`.
11. Smoke manual incluindo cenário com servidor caído (fallback localStorage deve ativar).

**Critérios de Aceite:**
- Formulário de contato grava no MySQL e e-mail é disparado.
- Agendamento idem.
- Login admin com credencial errada retorna 401 e ativa rate limit após 5 tentativas.
- Admin lista contatos e agendamentos ordenados por data.
- Site continua funcional com servidor indisponível (fallback localStorage).

**Testes obrigatórios:**
- Unit + API + E2E full-stack todos verdes.
- Lighthouse, axe-core e smoke manual nas páginas do admin.

**Definition of Done:**
- [ ] Backend rodando em produção (`alunomakerdigital.com.br/api/*`).
- [ ] Admin acessível em `alunomakerdigital.com.br/admin/`.
- [ ] Fran recebe e-mails de notificação.
- [ ] Fallback localStorage testado e funcional.
- [ ] Documentação de operação no README (como reiniciar o servidor, ver logs etc.).
- [ ] `CLAUDE.md` atualizado com paths, convenções e estado ao final desta fase.

**Estado funcional ao final:** Site + admin + backend mínimo operacional. Leads passam a ser capturados e gerenciáveis.

**Deploy 4:** Tag `v2.0.0` (mudança de major — backend introduzido).

---

### FASE 4.5 — Gerenciador de Conteúdo (CMS)

**Objetivo:** Dar autonomia ao Prof. Fran para editar todo o conteúdo dinâmico do site (eventos, projetos, escolas, cursos, fotos da página "Sobre" e configurações globais) sem depender de deploy.

**Entradas:** Fase 4 deployada e estável.

**Tarefas (executadas):**
1. Implementar `admin/galeria.html` — gerenciador com 6 abas: Eventos, Projetos, Escolas, Cursos, Sobre, Configurações.
2. Implementar CRUD completo por aba (`galeria.js`, `galeria.css`) com JWT.
3. Criar tabela `about_photos` (`schema-v3.sql`) + `aboutController.js`; `sobre.html` carrega fotos dinamicamente.
4. Criar tabela `site_config` (`schema-v4.sql` + `schema-v4-patch1.sql`) + `configController.js`; rota pública `GET /api/config` e admin `GET+PUT /api/admin/config`.
5. Implementar `assets/js/site-config.js` — atualiza `[data-config]` e `[data-config-href]` em todas as páginas públicas (cache sessionStorage 5 min).
6. Upload de imagem via Multer + Sharp → WebP (com `.rotate()` para corrigir EXIF).
7. Adicionar TikTok e X (Twitter) ao `site_config`, à aba Configurações e à `contato.html`.

**Critérios de Aceite:**
- Cada aba lista, cria, edita e remove seus registros, refletindo no site público.
- Upload converte para WebP e grava o path relativo no banco.
- Configurações globais (WhatsApp, redes, textos) atualizam o site sem deploy.

**Definition of Done:**
- [x] 6 abas funcionais e validadas em produção (2026-05-22).
- [x] `CLAUDE.md` atualizado com paths e convenções.

**Estado funcional ao final:** Site institucional + admin + CMS completo. Conteúdo gerenciável pelo PO sem deploy.

**Deploy 4.5:** Tag `v2.5.0`.

---

### FASE 5 — Gerador de Conteúdo com Claude API

**Objetivo:** Adicionar ao admin uma ferramenta que **gera texto** (rascunho) para redes sociais e blog usando a Claude API. A Fase 5 **não publica** em lugar nenhum — apenas gera, exibe e persiste; a publicação automática nas redes é a Fase 6.

**Entradas:** Fase 4.5 deployada e estável.

> **Especificação única (autoritativa):** esta seção, a SPEC (subseção do Gerador) e o NEXT_SESSION descrevem a MESMA feature. Em conflito, vencem PRD/SPEC/WORKFLOW.

**Decisões travadas:**
- **Entrada híbrida:** o usuário escolhe a cada uso — selecionar um item do banco (projeto/evento/curso) **ou** digitar um tema livre.
- **5 formatos selecionáveis:** Instagram (legenda + hashtags), TikTok (roteiro/legenda), X/Twitter (thread), WhatsApp (mensagem curta), Blog (post longo).
- **Seletor de fotos:** anexar fotos do banco existente ou enviar novas (Sharp → WebP). **Sem vídeo no site** (vídeos vão para as redes na Fase 6).
- **Persistência + custo:** cada geração é salva na tabela `generations` (`schema-v5.sql`) com `cost_usd`; badge de custo do mês + alerta > US$5/mês.
- **Rate limit:** 10 gerações/hora **e** 30/dia por IP (limiter separado do `loginLimiter`).
- **Modelo:** `claude-sonnet-4-6` via `@anthropic-ai/sdk`, com prompt caching (`cache_control: ephemeral`) no system prompt (contexto AMD fixo).
- **Segurança:** `ANTHROPIC_API_KEY` apenas no `start.sh` do servidor (nunca no repo).

**Tarefas:**
1. `cd server && npm install @anthropic-ai/sdk`.
2. Criar tabela `generations` (`server/db/schema-v5.sql`) e aplicar no MySQL.
3. Implementar `server/controllers/generatorController.js`:
   - System prompt fixo com contexto AMD (missão, público, tom de voz) + diretrizes do PRD §3, com prompt caching.
   - Entrada híbrida: buscar item do banco (quando `type`+`item_id`) ou usar `theme` livre.
   - Instruções por formato (5 formatos).
   - Persistir cada geração com `cost_usd`, `tokens_in`, `tokens_out`.
4. Atualizar `server/routes/admin.js`: `POST /api/admin/generate` + `GET /api/admin/generations` + novo rate limiter (10/h e 30/dia).
5. Implementar `admin/gerador.html` + `gerador.js` + `gerador.css`: seletor item/tema, checkboxes de formato, seletor de fotos, spinner durante chamada, exibição de tokens/cache, botão copiar por formato, histórico com filtro, badge de custo do mês.
6. Adicionar link "Gerador" na sidebar de `galeria.html`.
7. Testes: unit (função de geração com mock Anthropic), API (Supertest dos endpoints), E2E (gerar → copiar → histórico).
8. Fallback: falha da Claude API exibe mensagem clara, sem quebrar o painel.
9. Deploy do `server/` via SCP + reiniciar PM2; adicionar `ANTHROPIC_API_KEY` ao `start.sh` via echo linha a linha.

**Critérios de Aceite (do PRD §7.12):**
- Item OU tema retorna os formatos selecionados em até 30s.
- Cada formato em card separado com botão de copiar.
- Geração salva no histórico com custo; custo do mês visível e alerta > US$5/mês.
- Rate limit ativo (10/h e 30/dia); falha da API mostra mensagem sem quebrar a página.
- Acesso exige login válido.

**Testes obrigatórios:**
- Unit + API (mocks Anthropic) + E2E (geração → cópia → histórico).
- Smoke manual incluindo cenário de falha da API.

**Definition of Done:**
- [ ] Gerador funcional em produção (entrada híbrida, 5 formatos, seletor de fotos).
- [ ] Histórico armazenado e consultável; monitor de custo ativo (alerta > US$5/mês).
- [ ] Rate limit (10/h e 30/dia) e fallback testados.
- [ ] Testes verdes; smoke assinado.
- [ ] `CLAUDE.md` atualizado com paths, convenções e estado ao final desta fase.

**Estado funcional ao final:** Painel admin com IA generativa de texto. Site público inalterado.

**Deploy 5:** Tag `v2.6.0`.

---

### FASE 5.5 — Blog do Site

**Objetivo:** Criar a seção de blog pública — destino do formato "blog longo" gerado na Fase 5 — alimentada pelo CMS, melhorando SEO e tráfego.

**Entradas:** Fase 5 deployada e estável.

**Decisões travadas:**
- Página pública dinâmica (vanilla JS + `fetch`, mesmo padrão de projetos/eventos).
- **Vídeo no blog só via embed do YouTube (click-to-load)** — miniatura que só carrega o player ao clique; **nunca self-hosted** (protege o gate Lighthouse: total ≤ 1 MB, Perf ≥ 85).
- O Gerador (Fase 5) salva o "blog longo" como **rascunho** (`status='draft'`) direto na tabela.

**Tarefas:**
1. Criar tabela `blog_posts` (`server/db/schema-v6.sql`): `id, title, slug, excerpt, body, cover_image, video_embed_url (opcional), status('draft'|'published'), published_at, created_at`.
2. `server/controllers/blogController.js` — CRUD admin + rotas públicas `GET /api/posts` (publicados) e `GET /api/posts/:slug`.
3. `blog.html` (listagem) + página de post; renderização via `fetch`; `assets/js/blog.js`.
4. Admin: nova aba/página de CRUD de posts em `galeria.html` (rascunho ↔ publicado, capa, embed de vídeo).
5. Integração do Gerador: botão "Salvar como rascunho de blog" cria registro `draft`.
6. Atualizar navbar (link Blog) e `sitemap.xml`.
7. Testes: E2E (listagem + post + rascunho não aparece no público); Lighthouse + axe na página nova.

**Critérios de Aceite (do PRD §7.13):**
- Posts publicados aparecem na listagem; rascunhos não aparecem no site público.
- Página de post abre por slug; vídeo (se houver) carrega só ao clique.
- "Blog longo" do Gerador vira rascunho editável no admin.

**Testes obrigatórios:**
- E2E + Lighthouse (gate) + axe na `blog.html` e na página de post.

**Definition of Done:**
- [ ] Blog público no ar; CRUD funcional; rascunho do Gerador integrado.
- [ ] Lighthouse e axe verdes na página nova.
- [ ] `CLAUDE.md` atualizado com paths, convenções e estado ao final desta fase.

**Estado funcional ao final:** Site + CMS + Gerador + Blog. Conteúdo gerado tem onde ser publicado.

**Deploy 5.5:** Tag `v2.7.0`.

---

### FASE 6 — Publicador Redes Sociais + Loja com Pagamento

**Objetivo:** Fechar o ciclo: publicação automatizada nas redes principais + e-commerce com Mercado Pago.

**Entradas:** Fase 5 deployada e estável.

**Tarefas:**
1. Implementar `admin/publicador.html` integrando Instagram Graph API e TikTok Content Posting API.
2. Implementar `admin/produtos.html` com CRUD de produtos e toggle ativo/inativo.
3. Conectar `cursos.html` e `loja.html` ao endpoint `GET /api/products?active=true` (com cache leve no cliente).
4. Implementar checkout via Mercado Pago:
   - Front: botão "Comprar" em cada card de curso/produto.
   - Back: endpoint `POST /api/payments/checkout` que gera preference do Mercado Pago.
   - Webhook `POST /api/payments/webhook` para confirmar pagamento.
   - Tabela `orders` (criar no schema).
5. Implementar e-mail de confirmação de compra via Brevo.
6. Testes:
   - Mocks de Instagram, TikTok, Mercado Pago.
   - E2E de fluxo de compra (sandbox MP).
   - Validação manual com primeira compra real em sandbox.
7. Auditoria de segurança: tokens em `.env`, HTTPS obrigatório, nenhuma chave exposta no front.
8. Treinamento do responsável (Fran) no uso do painel completo.

**Critérios de Aceite:**
- Publicar no Instagram a partir do painel funciona.
- Agendar vídeo TikTok funciona.
- Produto inativado no admin desaparece do site público em ≤ 1min (TTL do cache).
- Compra em sandbox MP gera registro em `orders` e e-mail é disparado ao cliente.
- Compra falha graciosamente em caso de erro (sem cobrar e exibindo mensagem clara).

**Testes obrigatórios:**
- Toda a suíte de E2E.
- Mocks de APIs externas + 1 transação real em sandbox MP.
- Lighthouse e axe-core nas páginas afetadas.
- Smoke manual de fluxo de compra ponta a ponta.

**Definition of Done:**
- [ ] Publicação automatizada nas duas redes principais.
- [ ] Loja operacional com primeira venda real em sandbox.
- [ ] Auditoria de segurança aprovada.
- [ ] Fran treinado e operando o painel solo.
- [ ] `CLAUDE.md` atualizado com paths, convenções e estado ao final desta fase.

**Estado funcional ao final:** Plataforma completa — institucional + módulo GPIO + admin + IA + redes sociais + loja + pagamento.

**Deploy 6:** Tag `v3.0.0` (mudança de major — e-commerce introduzido).

---

## 5. Procedimentos de Deploy e Rollback

> **Automação real (ver SPEC §11.4):** o deploy é via **GitHub Actions**.
> O `deploy.yml` usa `FTP-Deploy-Action` para os estáticos e um passo `appleboy/ssh-action`
> que regrava `api/.htaccess` após cada deploy (o FTP não sobe dotfiles em subpastas).
> **O FTP NÃO copia `server/`** — alterações no backend Node.js vão por **SCP manual** (chave `~/.ssh/amd_deploy`) + restart do PM2 (sequência segura no CLAUDE.md). Secrets: `FTP_*`, `SSH_*`.

### 5.1 Deploy para Staging

1. Merge da PR em `develop`.
2. CI executa suíte completa.
3. Em caso de sucesso, GitHub Actions (FTP-Deploy-Action) sincroniza para `staging.alunomakerdigital.com.br`.
4. Health-check automatizado: 5 URLs-chave retornam 200 OK e conteúdo esperado.
5. Notificação no canal interno.

### 5.2 Deploy para Produção

1. **Pré-requisito:** smoke manual em staging assinado.
2. Criar snapshot de rollback:
   - Download via Hostinger File Manager dos arquivos atuais para `snapshots/AAAA-MM-DD-vN/`.
   - Dump do MySQL (Fase 4+): `mysqldump > snapshots/AAAA-MM-DD-vN/db.sql`.
3. Tag `vN.M.P` em `main` → push.
4. GitHub Actions executa o deploy (FTP estáticos + passo SSH que regrava `.htaccess`). Backend `server/` por SCP manual quando houver mudança.
5. Health-check pós-deploy.
6. Smoke manual rápido em produção (Chrome desktop + Chrome mobile).
7. Em caso de falha → executar rollback (§5.3).

### 5.3 Procedimento de Rollback

**Frontend:**
1. Restaurar arquivos do snapshot via Hostinger File Manager.
2. Verificar com health-check.
3. Anunciar incidente no canal interno + documentar.

**Backend (Fase 4+):**
1. Restaurar arquivos `server/`.
2. Restaurar dump MySQL: `mysql < snapshots/AAAA-MM-DD-vN/db.sql` (apenas se dados foram corrompidos; idealmente migrations são reversíveis).
3. Reiniciar processo Node.js na Hostinger.
4. Verificar com health-check.

### 5.4 Feature Flags

Cada feature em construção ou experimental deve estar protegida por flag:
- Front: `<section data-feature="quiz" data-enabled="false">…</section>` + CSS oculta.
- Back: tabela `feature_flags` permite alternar runtime via admin.
- Toggle só após DoD cumprido.

---

## 6. Ciclo PDCA Mensal

A partir do mês seguinte à Fase 2, o projeto adota PDCA mensal:

```
PLANEJAR (1º dia útil do mês)
├── Definir 5 metas mensuráveis (visitantes, leads, seguidores, vendas, conteúdo)
├── Definir 1 melhoria técnica (refactor, otimização, novo teste)
└── Definir 1 experimento (A/B, novo formato de post etc.)

FAZER (durante o mês)
├── Postagens semanais conforme calendário editorial (§7)
├── Acompanhamento de tickets/leads no admin
└── Implementação da melhoria técnica em branch separada

CHECAR (último dia útil do mês)
├── Coletar métricas: GA4, Instagram Insights, TikTok Analytics, vendas
├── Rodar Lighthouse em produção (snapshot mensal)
└── Revisão de regressões e bugs reportados

AGIR (1º dia útil do próximo mês)
├── Documentar aprendizados no README/wiki
├── Ajustar metas e calendário do próximo ciclo
└── Iniciar novo PDCA
```

---

## 7. Calendário Editorial (modelo)

| Dia | Formato | Plataforma |
|---|---|---|
| Segunda | Dica técnica (Python, ESP, Raspberry) | Instagram + X + Blog |
| Terça | Bastidor de aula | Instagram Reels + TikTok |
| Quarta | Projeto em destaque (robô funcionando) | Instagram + TikTok |
| Quinta | Depoimento de aluno ou professor | Instagram Stories + X |
| Sexta | "Você sabia?" — curiosidade de robótica | Instagram + TikTok |
| Sábado | Post motivacional + slogan | Instagram |
| Domingo | Repost ou conteúdo leve | Todas |

A partir da Fase 5, todo conteúdo é gerado/refinado pelo Gerador com Claude API e publicado pelo Publicador (Fase 6).

---

## 8. Matriz de Responsabilidades

| Papel | Responsável | Atividades |
|---|---|---|
| Product Owner | Professor Francenylson | Aprovação de fases, decisões estratégicas, conteúdo editorial |
| Tech Lead / Dev | Professor Francenylson (assistido por Claude Code) | Implementação, testes, deploy |
| Revisor de código | Claude Code (pair) + auto-revisão | Pull request reviews |
| QA Manual | Professor Francenylson | Smoke tests, validação de UX |
| Suporte editorial | Claude Code (Fase 5+) | Geração de conteúdo |

**Política:** Antes de avançar de fase, o PO assina o checklist DoD da fase atual.

---

## 9. Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|---|---|---|---|
| Hostinger Business atinge limite de apps Node.js (5) | Alto | Média | Backend único multiplexando endpoints; revisar uso na Fase 6 |
| API Instagram/TikTok bloqueia ou muda contratos | Alto | Média | Fallback de copy-paste manual sempre presente; monitor de erros |
| Custo Claude API ultrapassa orçamento | Médio | Baixa | Rate limiting + alerta de custo + cache de gerações similares |
| Mercado Pago bloqueia conta | Alto | Baixa | Manter Pix manual como alternativa para emergência |
| Falha em deploy noturno sem testemunho | Alto | Baixa | Deploys apenas em janela diurna; snapshot sempre prévio |
| Imagens grandes degradam Lighthouse | Médio | Alta | Performance budget enforced em CI; WebP obrigatório |
| Conteúdo gerado por IA com tom inadequado ao contexto social | Alto | Média | Revisão obrigatória do PO antes de cada publicação; prompt-base com diretrizes do PRD §3 |
| Vulnerabilidade no admin | Alto | Baixa | bcrypt 12 rounds, rate limit, helmet, JWT curto, auditoria semestral |
| Perda de dados MySQL | Alto | Baixa | Backup diário automatizado para storage externo (Hostinger + Drive) |

---

## 10. Indicadores de Execução (do workflow, não do produto)

| Indicador | Meta |
|---|---|
| Lead time de feature (branch → produção) | < 5 dias úteis |
| Taxa de PRs que passam de primeira no CI | > 80% |
| Tempo médio de execução da suíte E2E | < 5min |
| Incidentes em produção que exigem rollback | < 1 / fase |
| Cobertura de critérios de aceite por testes E2E | 100% das jornadas críticas |
| Aderência ao calendário editorial | ≥ 85% das semanas |

---

## 11. Glossário

- **DoD** — Definition of Done.
- **CA** — Critério de Aceite (Gherkin: Dado / Quando / Então).
- **PDCA** — Plan / Do / Check / Act.
- **PO** — Product Owner.
- **Feature Flag** — toggle simples para esconder funcionalidade em construção.
- **Smoke test** — verificação rápida de funcionalidade básica pós-deploy.
- **Rollback** — restauração de versão anterior estável.
- **Snapshot** — cópia dos arquivos/banco antes de mudança em produção.

---

## Apêndice — Mapa Rápido de Fases

```
FASE 0 (docs+infra)         → site placeholder
   ↓
FASE 1 (home + layout)      → home pública  ──┐
   ↓                                            │
FASE 2 (todas as páginas)   → site completo     ├─ usuários
   ↓                                            │   visitam
FASE 3 (módulo GPIO)        → ferramenta + site │   e veem
   ↓                                            │   evolução
FASE 4 (backend + admin)    → leads em MySQL    │   sem
   ↓                                            │   quebra
FASE 4.5 (CMS 6 abas)       → conteúdo editável │
   ↓                                            │
FASE 5 (Claude API)         → gerador de texto  │
   ↓                                            │
FASE 5.5 (blog)             → blog público      │
   ↓                                            │
FASE 6 (redes + loja)       → plataforma final ─┘
```

A cada seta, o sistema continua funcionando; nada quebra.

---

*Workflow v1.1 — Aluno Maker Digital*
*Desenvolvido com suporte de Claude AI (Anthropic) — Opus 4.7*
*© 2018–2026 — Todos os direitos reservados*
