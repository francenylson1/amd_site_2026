# PRD — Product Requirements Document
# Aluno Maker Digital

**Versão:** 2.1
**Data:** 2026-05-26 (atualizado — Fase 4.5 no roadmap, §7.12 Gerador, §7.13 Blog)
**Responsável:** Professor Francenylson
**E-mail:** francenylson@gmail.com
**Status:** Em vigor

---

## Sumário

1. Sumário Executivo
2. Identidade do Projeto
3. Contexto Social (CRÍTICO)
4. Personas
5. Objetivos Estratégicos
6. Princípio de Lançamento Incremental
7. Requisitos Funcionais por Página (com Critérios de Aceite)
8. Módulo de Animações GPIO
9. Requisitos Não-Funcionais
10. Plano de Validação e Testes
11. KPIs e Métricas de Sucesso
12. Roadmap por Fases
13. Restrições e Não-Escopo
14. Glossário e Referências

---

## 1. Sumário Executivo

O **Aluno Maker Digital** é um projeto educacional de robótica e programação ativo desde 2018 no Recanto das Emas, Brasília/DF. Atende alunos de escolas públicas em situação de vulnerabilidade social, transformando-os de consumidores passivos de tecnologia em criadores ativos.

Este PRD define os requisitos do site institucional e da plataforma digital do projeto, cujo objetivo central é **converter visitantes em leads qualificados** — agendamentos de visita, compras de cursos, mentorias e parcerias — enquanto comunica a identidade, o impacto e a autoridade do projeto para professores, escolas, pais e empresas.

**Diferenciais do produto:**
- Site institucional dark/tech, performante (vanilla JS), com critérios de qualidade mensuráveis.
- **Módulo de Animações GPIO** inédito: ferramenta interna que gera demonstrações padronizadas de circuitos com Raspberry Pi 5, NodeMCU ESP8266 e ESP-32 para uso em aulas e redes sociais.
- Estratégia de lançamento incremental: cada fase entrega um sistema funcional em produção, sem quebrar a anterior.
- Validação automatizada e manual em todas as fases (Playwright, Lighthouse, axe-core, smoke manual).

**Slogan (placeholder a confirmar):** "Tecnologia que transforma vidas." — o briefing original criticou "Criar é o melhor caminho"; sugestões alternativas listadas no §2.

---

## 2. Identidade do Projeto

| Campo | Valor |
|---|---|
| Nome | Aluno Maker Digital |
| Slogan (placeholder) | "Tecnologia que transforma vidas." |
| Sugestões alternativas | "Criadores do futuro." / "Aqui se constrói o amanhã." / "Do consumo à criação." |
| Domínio | alunomakerdigital.com.br |
| Subdomínio de staging | staging.alunomakerdigital.com.br |
| E-mail | alunomakerdigital@gmail.com |
| WhatsApp | (61) 98133-3875 |
| Instagram | @alunomakerdigital |
| X (Twitter) | @alunomakerdigital |
| Localização | Recanto das Emas — Brasília/DF — Brasil |
| Ativo desde | 2018 |
| Hospedagem | Hostinger Business (Node.js + MySQL + CDN) |

### Missão
Transformar alunos da Educação Básica em criadores ativos de tecnologia, tirando-os da posição de consumidores passivos e colocando-os como protagonistas do próprio futuro através da robótica, programação e IA.

### Visão
Ser a maior referência nacional em robótica educacional para escolas públicas, reconhecida pela transformação real e permanente na vida dos alunos.

### Valores
| Valor | Descrição |
|---|---|
| Protagonismo | O aluno é o criador, não o espectador |
| Permanência | Conhecimento que dura para sempre |
| Inclusão | Tecnologia para quem mais precisa |
| Inovação | Sempre na fronteira do que é possível |
| Impacto social | Transformar comunidades vulneráveis |

---

## 3. Contexto Social (CRÍTICO)

O projeto atende alunos em situação de **alta vulnerabilidade social** no Recanto das Emas. Tráfico e violência fazem parte do cotidiano de parte desses jovens.

**Diretrizes obrigatórias de comunicação:**
- Toda linguagem deve transmitir esperança, protagonismo e transformação.
- NUNCA usar linguagem com conotação negativa para esse público.
- Destacar conquistas e potencial, jamais deficiências ou limitações.
- Inclusão ativa: o projeto atende alunos com TEA (autistas) em turmas inclusivas.
- Próxima expansão: atendimento a alunos cadeirantes (fase futura).

Essas diretrizes devem orientar copy, alt-text de imagens, mensagens de erro, microcopy e qualquer texto exibido na plataforma.

---

## 4. Personas

### 4.1 Público Primário — Quem Usa

**Persona: Aluno Criador**
- Faixa etária: 10 a 18 anos (5º EF ao 3º EM).
- Perfil: jovem em vulnerabilidade social, curioso, energia alta.
- Dor principal: falta de perspectiva e de conexão com o futuro.
- Motivação: criar algo real com as próprias mãos, pertencer a um grupo.
- Variações inclusivas: alunos com TEA e (futuramente) cadeirantes.

### 4.2 Público Secundário — Quem Compra / Contrata

**Persona: Professor Replicador** — quer replicar o modelo em sua escola com suporte.

**Persona: Diretor / Coordenador** — busca solução completa, com resultados comprovados.

**Persona: Pai / Mãe** — quer filho engajado em atividade produtiva e com futuro.

**Persona: Secretaria de Educação** — busca projeto de impacto com resultados mensuráveis.

**Persona: Empresa Patrocinadora** — quer associar marca a projeto de impacto social comprovado.

### 4.3 Público Terciário — Parceiros

Fabricantes de componentes, universidades, ONGs, imprensa educacional.

---

## 5. Objetivos Estratégicos

### 5.1 Objetivo Principal do Site

Converter visitantes em leads qualificados que agendem visitas, comprem cursos ou contratem mentorias.

### 5.2 Jornada do Visitante Ideal

```
1. Descobre o projeto (redes sociais / Google)
         ↓
2. Acessa o site e SE IMPRESSIONA com os projetos
         ↓
3. Assiste a vídeos dos robôs funcionando
         ↓
4. Lê sobre a transformação dos alunos
         ↓
5. Agenda uma visita gratuita (isca principal)
         ↓
6. Visita presencial → vê os robôs ao vivo
         ↓
7. Confia → Compra curso / mentoria / consultoria
         ↓
8. Vira embaixador do projeto
```

### 5.3 Metas Mensuráveis (até 2026-11-15 — 6 meses após publicação)

| Métrica | Meta |
|---|---|
| Visitantes únicos/mês | 1.000 |
| Visitas agendadas/mês | 10 |
| Seguidores Instagram | +500 |
| Seguidores TikTok | +1.000 |
| Planos de aula vendidos | 20/mês |
| Cursos vendidos | 5/mês |
| Mentorias realizadas | 4/mês |
| Receita mensal | R$ 2.000+ |

---

## 6. Princípio de Lançamento Incremental

Este projeto é desenvolvido e implantado em **fases independentes**, regidas por três regras invioláveis:

1. **Cada fase termina com um sistema funcional em produção** — não há fase intermediária quebrada.
2. **Uma fase nunca pode quebrar a anterior** — features em construção ficam ocultas por feature flags simples até estarem completas; o site permanece estável durante toda a evolução.
3. **Avanço de fase só acontece com Definition of Done (DoD) cumprido + testes verdes + aprovação do responsável.**

Detalhamento completo das fases está em `WORKFLOW_AlunoMakerDigital.md`.

---

## 7. Requisitos Funcionais por Página

Cada feature abaixo é acompanhada de **Critérios de Aceite** no formato Gherkin (Dado / Quando / Então), que servem como contrato testável para QA.

### 7.1 `index.html` — Home (PRIORIDADE MÁXIMA — Fase 1)

**Hero Section**
- Background com partículas animadas (canvas JS).
- Texto com efeito de digitação (typewriter) — slogan e subtítulo.
- CTA primário: "Agende uma visita gratuita" (laranja).
- CTA secundário: "Conheça os projetos" (transparente com borda).
- Scroll indicator animado.

**Critério de Aceite — Hero:**
> Dado que acesso a home em qualquer dispositivo, quando a página termina de carregar, então vejo o hero com slogan, dois CTAs visíveis acima da dobra e o scroll indicator pulsando.

**Seção de Impacto — Contadores Animados**
- Ativam ao rolar até a seção (Intersection Observer).
- Valores: 6+ anos / 7+ escolas / 100+ alunos / 10+ robôs.

**Critério de Aceite — Contadores:**
> Dado que rolo a home até a seção de impacto, quando 50% da seção entra no viewport, então os 4 contadores animam de 0 ao valor final em até 2 segundos e param no valor correto.

**Projetos em Destaque**
- Grid de cards com flip effect (frente: foto / verso: descrição + tecnologias).
- Botão "Ver todos os projetos" → `projetos.html`.

**Quiz Interativo "Qual curso é pra mim?"**
- 3 perguntas (perfil, nível, objetivo).
- Resultado: recomendação de curso com botão de compra direto.

**Critério de Aceite — Quiz:**
> Dado que respondi as 3 perguntas, quando clico em "Ver minha recomendação", então vejo um curso recomendado e um botão de compra direto que leva ao card correspondente em `cursos.html`.

**Seção "Venha nos Visitar"**
- Vídeo autoplay (mudo) dos robôs como background.
- Formulário de agendamento (nome, e-mail, data desejada).
- Contador de vagas disponíveis (urgência).
- Depoimentos em slider automático.

**Critério de Aceite — Agendamento:**
> Dado que preencho nome, e-mail válido e data futura, quando clico em "Agendar", então recebo confirmação visível e sou redirecionado para `obrigado.html`.

**Parceiros / Escolas**
- Logos ou nomes das 7 escolas atendidas + link para `escolas.html`.

**WhatsApp Flutuante**
- Fixo no canto inferior direito, com pulse animation.
- Mensagem pré-definida ao clicar.

**Critério de Aceite — WhatsApp:**
> Dado que estou em qualquer página, quando clico no botão flutuante, então abro o WhatsApp Web/App com a mensagem pré-definida endereçada ao número (61) 98133-3875.

### 7.2 `sobre.html`
- Missão, visão e valores (visual com ícones).
- Perfil do Professor Francenylson (foto, história, formação).
- Timeline interativa: 2018 → presente.
- Seção de inclusão: TEA + cadeirantes (futura expansão).

### 7.3 `projetos.html`
- Filtro por categoria sem recarregar a página (Robótica / IA / IoT / Eletrônica / Programação).
- Cards com flip effect ao hover.
- Lightbox ao clicar na foto (GLightbox).
- Projetos documentados: braço robótico, humanoide, robô garçom, lixeira inteligente, ESP8266/IoT.

**Critério de Aceite — Filtros:**
> Dado que estou na galeria, quando clico em uma categoria, então apenas cards dessa categoria permanecem visíveis em até 300ms, sem recarregar a página.

### 7.4 `escolas.html`
- Cards de escolas **renderizados dinamicamente** via `fetch('/api/schools')` — a lista é gerenciada no CMS (aba Escolas), não fixa no HTML. Hoje há 12 escolas cadastradas (CEF 101, 113, 206, 308, 405, CEM 804, EC 203, EC 401, Colégio Militar, Pinheirinho Roxo, CeD 104, CEF 106).
- O mapa Google Maps fica em `contato.html` (não em escolas.html).

### 7.5 `eventos.html`
- Galeria de eventos com lightbox.
- Categorias: Campus Party, Feiras de Ciências, Oficinas, Competições.

### 7.6 `cursos.html`
- Cards visuais com título, carga horária, nível, preço, badge "Em breve" para inativos.
- Status controlado pelo painel admin (Fase 5+).

**Catálogo de referência (valores estratégicos):**
| Produto | Preço |
|---|---|
| Plano de aula avulso | R$ 37 |
| Pack 5 planos de aula | R$ 147 |
| Curso: Robótica com Python | R$ 197 |
| Curso: ESP-8266 na Prática | R$ 147 |
| Curso: Raspberry Pi Maker | R$ 177 |
| Mentoria 1h (professor) | R$ 150 |
| Consultoria escola (pacote) | R$ 800+ |
| Assinatura mensal (membros) | R$ 47/mês |

### 7.7 `loja.html`
- Kit didático físico (R$ 120+), camiseta do projeto (R$ 59).
- Ativação/desativação via painel admin (Fase 6).
- CTA WhatsApp enquanto loja não está integrada.

### 7.8 `contato.html`
- Formulário: nome, e-mail, assunto (dropdown), mensagem.
- Validação client-side antes do envio.
- Envio via fetch para `/api/contact` (Fase 4); fallback localStorage até lá.
- Mapa Google Maps com localização.

**Critério de Aceite — Contato:**
> Dado que preencho nome, e-mail válido, assunto e mensagem com mais de 10 caracteres, quando submeto o formulário, então sou redirecionado para `obrigado.html` e o envio é registrado (backend ou localStorage).

### 7.9 `obrigado.html`
- Confirmação + próximos passos + CTA para redes sociais + pixel GA4.

### 7.10 `animacoes.html` — Módulo GPIO (ver §8)

### 7.11 `/admin/` — Painel Administrativo (Fase 4+)
- Login JWT (`login.html` → `galeria.html`).
- **CMS (Fase 4.5, ✅):** `galeria.html` com 6 abas — Eventos, Projetos, Escolas, Cursos, Sobre, Configurações (CRUD + upload WebP).
- **Gerador (Fase 5):** `gerador.html` (ver §7.12).
- **Blog (Fase 5.5):** CRUD de posts em aba do `galeria.html` (ver §7.13).
- **Fase 6 (planejado):** publicador (Instagram/TikTok), produtos.

### 7.12 `admin/gerador.html` — Gerador de Conteúdo (Fase 5)

Ferramenta que **gera texto** (rascunho) com a Claude API para redes sociais e blog. **Não publica** — publicação automática é a Fase 6.

- **Entrada híbrida:** selecionar um item do banco (projeto/evento/curso) **ou** digitar um tema livre.
- **5 formatos selecionáveis:** Instagram (legenda + hashtags), TikTok (roteiro/legenda), X/Twitter (thread), WhatsApp (mensagem), Blog (post longo).
- **Seletor de fotos:** anexar fotos do banco ou enviar novas. Sem vídeo no site.
- **Histórico + custo:** cada geração é salva; badge de custo do mês + alerta > US$5/mês.
- Diretriz crítica: todo texto respeita o §3 (esperança, protagonismo, nunca conotação negativa ao público).

**CA-GER-01 — Geração:**
> Dado que selecionei um item (ou digitei um tema) e marquei um ou mais formatos, quando clico em "Gerar", então recebo o texto de cada formato em card separado em até 30s, com botão de copiar.

**CA-GER-02 — Histórico e custo:**
> Dado que gerei conteúdo, quando abro o histórico, então vejo as gerações anteriores com data e custo, e o custo acumulado do mês fica visível (com alerta acima de US$5).

**CA-GER-03 — Limite e falha:**
> Dado que excedi 10 gerações na hora (ou 30 no dia), quando tento gerar, então sou bloqueado com mensagem clara; e se a API falhar, vejo mensagem de erro sem que o painel quebre.

**CA-GER-04 — Acesso:**
> Dado que não estou autenticado, quando tento acessar o gerador ou o endpoint, então sou impedido (401/redirect ao login).

### 7.13 `blog.html` — Blog do Site (Fase 5.5)

Seção de blog pública, destino do formato "blog longo" do Gerador, alimentada pelo CMS.

- Listagem de posts publicados + página de post individual (por slug).
- Status `rascunho`/`publicado` controlado no admin; rascunho não aparece no site público.
- **Vídeo:** apenas embed do YouTube com click-to-load (nunca self-hosted — protege o Lighthouse).

**CA-BLOG-01 — Listagem:**
> Dado que existem posts publicados, quando acesso `blog.html`, então vejo a lista dos publicados (rascunhos não aparecem) com título, resumo e capa.

**CA-BLOG-02 — Post:**
> Dado que clico em um post, quando a página abre, então vejo o conteúdo completo pelo slug; se houver vídeo, ele carrega apenas ao clicar na miniatura.

**CA-BLOG-03 — Rascunho do Gerador:**
> Dado que gerei um "blog longo", quando salvo como rascunho, então ele aparece editável no admin com status `rascunho`, pronto para revisão e publicação.

---

## 8. Módulo de Animações GPIO

### 8.1 Propósito

Ferramenta interna do projeto que permite ao Professor Fran (e futuramente alunos) criar **animações padronizadas de circuitos** sobre três plataformas — Raspberry Pi 5, NodeMCU ESP8266, ESP-32 — para uso em postagens do site, blog e redes sociais. Resolve a dor de produzir conteúdo visual técnico consistente em escala.

### 8.2 User Stories

- **US-GPIO-01:** Como professor, quero selecionar uma placa de referência (RPi5 / ESP8266 / ESP32) para que minha animação parta da pinagem real e correta.
- **US-GPIO-02:** Como professor, quero escolher um tipo de animação (LED, servo, sensor, buzzer) e configurar parâmetros simples (pino, frequência, cor) para gerar a demonstração.
- **US-GPIO-03:** Como professor, quero controlar a reprodução (play / pause / stop) para revisar e ajustar antes de exportar.
- **US-GPIO-04:** Como professor, quero exportar um frame estático (PNG) ou uma sequência de frames (ZIP) para usar como imagem ou montar GIF externamente.

### 8.3 Funcionalidades

1. **Seletor de Plataforma** com 3 opções: Raspberry Pi 5 (40 pinos), NodeMCU ESP8266 (30 pinos), ESP-32 (38 pinos).
2. **Visualização GPIO** — diagrama interativo com pinos coloridos por função (alimentação, GND, GPIO, I2C, SPI, UART, ADC).
3. **Tipos de Animação:** LED Blink, Servo Motor, Sensor de Distância, Buzzer.
4. **Controles:** Play / Pause / Stop / velocidade (lenta / normal / rápida).
5. **Exportação:** PNG do frame atual; ZIP de N frames sequenciais para montagem externa de GIF.

### 8.4 Critérios de Aceite

**CA-GPIO-01 — Seleção de placa:**
> Dado que abri a página de animações, quando clico em uma das 3 placas, então vejo o diagrama da placa renderizado no canvas em até 500ms com todos os pinos identificados por cor e legenda.

**CA-GPIO-02 — Animação LED:**
> Dado que selecionei RPi5 e tipo "LED Blink" no pino GPIO 17 a 2Hz, quando clico em Play, então vejo um LED simulado piscando 2x por segundo conectado ao pino 17 do diagrama.

**CA-GPIO-03 — Controle de reprodução:**
> Dado que uma animação está rodando, quando clico em Pause, então a animação congela imediatamente; quando clico em Play novamente, retoma do mesmo ponto.

**CA-GPIO-04 — Exportação PNG:**
> Dado que tenho uma animação em qualquer estado, quando clico em "Exportar frame", então um arquivo PNG é baixado com nome `gpio-frame-{timestamp}.png` contendo a imagem atual do canvas.

**CA-GPIO-05 — Exportação ZIP:**
> Dado que selecionei "Exportar sequência" com 30 frames a 10fps, quando confirmo, então um arquivo ZIP é baixado contendo 30 PNGs numerados + um README.txt com instruções para montar GIF.

### 8.5 Requisitos não-funcionais do módulo
- Funciona 100% no browser, sem instalação.
- Compatível com Chrome, Firefox, Safari (desktop e mobile recentes).
- Performance: 30+ FPS em desktop médio, 20+ FPS em mobile médio.
- Interface intuitiva para alunos de 12+ anos.
- Visual coerente com identidade dark/tech do site.

---

## 9. Requisitos Não-Funcionais

### 9.1 Performance

| Métrica | Meta | Ferramenta de Validação |
|---|---|---|
| First Contentful Paint | < 2s | Lighthouse |
| Largest Contentful Paint | < 3s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Total Blocking Time | < 300ms | Lighthouse |
| Tamanho total da página | < 1MB | Manual / DevTools |
| Lighthouse Performance Score | ≥ 85 | Lighthouse CI |

### 9.2 Acessibilidade (WCAG 2.1 AA)

| Requisito | Meta | Validação |
|---|---|---|
| Lighthouse Acessibilidade | ≥ 95 | Lighthouse CI |
| Violações axe-core | 0 críticas, 0 sérias | axe-core CLI |
| Navegação por teclado | 100% do site | Manual |
| Contraste mínimo | 4.5:1 texto normal, 3:1 texto grande | axe-core |
| Leitor de tela | NVDA + VoiceOver iOS testados | Manual |

### 9.3 SEO

| Requisito | Meta | Validação |
|---|---|---|
| Lighthouse SEO | ≥ 95 | Lighthouse CI |
| Meta tags + Open Graph | Em todas as páginas | Manual + Lighthouse |
| Schema.org EducationalOrganization | Presente | Validador Google |
| sitemap.xml + robots.txt | Publicados | Manual |

### 9.4 Segurança

- HTTPS obrigatório (SSL gratuito Hostinger).
- CSP (Content Security Policy) configurado.
- Sanitização de inputs no front e back.
- Senhas hasheadas com bcrypt (rounds: 12) — Fase 4+.
- JWT com expiração de 8h — Fase 4+.
- Rate limiting: 5 tentativas de login / 15min — Fase 4+.
- `.env` no `.gitignore`; nunca subir segredos.

### 9.5 Compatibilidade

- Chrome ≥ 100, Firefox ≥ 100, Safari ≥ 15, Edge ≥ 100.
- Mobile: iOS ≥ 15, Android Chrome ≥ 100.
- Progressive enhancement: conteúdo essencial acessível mesmo sem JavaScript.

---

## 10. Plano de Validação e Testes

Validação e testes são **gates obrigatórios** em todas as fases — não etapa final. Detalhamento técnico no SPEC §10.

### 10.1 Camadas de validação

| Camada | O que valida | Ferramenta | Quando roda |
|---|---|---|---|
| Critérios de aceite (Gherkin) | Comportamento esperado por feature | Manual (revisão humana) | Antes de marcar feature como pronta |
| E2E (jornadas críticas) | Fluxo completo do usuário | Playwright | A cada PR + pré-deploy |
| Performance / SEO / Best Practices | Métricas Web Vitals e SEO | Lighthouse CI | A cada PR + pré-deploy (gate) |
| Acessibilidade automatizada | Violações WCAG | axe-core | A cada PR + pré-deploy (gate) |
| Acessibilidade manual | Navegação por teclado, leitor de tela | NVDA / VoiceOver | Antes de cada deploy de fase |
| Smoke manual cross-browser | Comportamento real em browsers | Checklists `/tests/manual-checklists/` | Antes de cada deploy de fase |
| Regressão visual (opcional) | Mudanças visuais inesperadas | Playwright snapshots | A cada PR |
| API (Fase 4+) | Endpoints e contratos | Vitest + Supertest | A cada PR backend |

### 10.2 Jornadas críticas que devem ter E2E desde a Fase 1

1. **Home → Agendamento de visita → Obrigado** (conversão principal).
2. **Home → Quiz → Recomendação → Cursos** (caminho de venda).
3. **Home → Projetos → Lightbox** (engajamento e prova social).
4. **Qualquer página → WhatsApp flutuante** (CTA universal).
5. **Contato → Obrigado** (lead inbound).
6. **Módulo GPIO: selecionar placa → configurar → play → exportar PNG** (Fase 3).

### 10.3 Definition of Done (DoD) — global por feature

Uma feature só é considerada PRONTA quando:
- [ ] Todos os critérios de aceite Gherkin verificados manualmente.
- [ ] Teste E2E correspondente passando localmente e no CI.
- [ ] Lighthouse rodado na página afetada com thresholds atingidos.
- [ ] axe-core sem violações críticas/sérias na página afetada.
- [ ] Smoke manual em ao menos 2 browsers (1 desktop + 1 mobile).
- [ ] Code review (revisão humana ou por Claude Code) concluída.
- [ ] Deploy em staging realizado e validado.

### 10.4 Gate de deploy para produção

Nenhum push para `main` (produção) ocorre sem:
- Todos os checks verdes em `develop` (staging).
- Smoke manual em staging realizado e registrado no checklist da fase.
- Snapshot de rollback documentado (procedimento descrito no WORKFLOW).

---

## 11. KPIs e Métricas de Sucesso

### Site
| KPI | Ferramenta | Meta mês 1 | Meta mês 6 |
|---|---|---|---|
| Visitantes únicos | Google Analytics | 300 | 2.000 |
| Taxa de rejeição | Google Analytics | < 60% | < 45% |
| Tempo médio no site | Google Analytics | > 2min | > 3min |
| Formulários enviados | Google Analytics | 5 | 30 |
| Cliques no WhatsApp | Google Analytics | 10 | 50 |

### Redes Sociais
| KPI | Meta mês 1 | Meta mês 3 | Meta mês 6 |
|---|---|---|---|
| Seguidores Instagram | +100 | +300 | +800 |
| Seguidores TikTok | +200 | +1.000 | +5.000 |
| Seguidores X | +50 | +150 | +400 |
| Engajamento médio | 3% | 5% | 7% |

### Financeiro
| KPI | Meta mês 1 | Meta mês 3 | Meta mês 6 |
|---|---|---|---|
| Planos de aula | R$ 150 | R$ 500 | R$ 1.000 |
| Cursos | R$ 0 | R$ 400 | R$ 1.500 |
| Mentorias | R$ 150 | R$ 450 | R$ 900 |
| **Total mensal** | **R$ 300** | **R$ 1.350** | **R$ 3.400** |

### Qualidade técnica (gates contínuos)
| KPI | Meta |
|---|---|
| Lighthouse Performance (média) | ≥ 85 |
| Lighthouse Acessibilidade | ≥ 95 |
| Lighthouse SEO | ≥ 95 |
| Cobertura E2E das jornadas críticas | 100% |
| Tempo médio de execução E2E | < 3min |

---

## 12. Roadmap por Fases

Resumo executivo — detalhamento por fase no `WORKFLOW_AlunoMakerDigital.md`.

| Fase | Entrega | Estado funcional ao final |
|---|---|---|
| **Fase 0** | Documentação + ambiente | Repositório versionado, docs aprovados |
| **Fase 1** | Home + CSS base + navbar + footer | Home institucional no ar |
| **Fase 2** | 8 páginas públicas restantes | Site institucional completo (sem backend) |
| **Fase 3** | Módulo GPIO (Animações) | Ferramenta de animação no ar |
| **Fase 4** | Backend + Admin mínimo + Auth | Formulários gravam em MySQL, admin funcional |
| **Fase 4.5** | Gerenciador de Conteúdo (CMS 6 abas) | Conteúdo dinâmico editável sem deploy (✅ em produção) |
| **Fase 5** | Gerador de Conteúdo com Claude API | Painel gera texto (rascunho) para redes e blog |
| **Fase 5.5** | Blog do site | Seção de blog pública, alimentada pelo CMS/Gerador |
| **Fase 6** | Publicador redes sociais + Loja | Plataforma completa com pagamentos |

**Garantia incremental:** ao final de cada fase, o sistema das fases anteriores continua 100% funcional em produção.

---

## 13. Restrições e Não-Escopo

**Restrições:**
- Vanilla JS no front (sem React/Vue/Angular) — requisito de performance e leveza.
- Sem CMS — conteúdo gerenciado via painel admin proprietário (Fase 4+).
- Hospedagem Hostinger Business — até 5 apps Node.js simultâneas.
- Orçamento de ferramentas pagas mínimo na Fase 1 (apenas Hostinger).

**Não-escopo da Fase 1 (entram em fases futuras):**
- Sistema de pagamentos (Mercado Pago — Fase 6).
- Área de membros com login de aluno.
- Chat ao vivo.
- Tour 360° do laboratório.
- Simulador de circuito interativo além das animações GPIO.
- App mobile nativo.

---

## 14. Glossário e Referências

**Glossário:**
- **DoD** — Definition of Done, conjunto de critérios que define uma feature como pronta.
- **CA** — Critério de Aceite, regra testável em formato Gherkin.
- **E2E** — End-to-End, teste que simula um usuário real.
- **WCAG 2.1 AA** — Web Content Accessibility Guidelines, nível AA.
- **Feature flag** — mecanismo simples para ocultar funcionalidades em construção.
- **Gate** — checkpoint obrigatório de qualidade entre fases.

**Documentos relacionados:**
- `SPEC_TECNICA_AlunoMakerDigital.md` v2.0 — especificação técnica.
- `WORKFLOW_AlunoMakerDigital.md` v1.0 — workflow de execução fase a fase.
- `BRIEFING_COMPLETO_V2_ALUNO_MAKER_DIGITAL.md` — briefing estratégico original.

---

*PRD v2.1 — Aluno Maker Digital*
*Desenvolvido com suporte de Claude AI (Anthropic) — Opus 4.7*
*© 2018–2026 — Todos os direitos reservados*
