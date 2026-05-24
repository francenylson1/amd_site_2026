# Especificação Técnica — Aluno Maker Digital

**Versão:** 2.1
**Data:** 2026-05-23 (atualizado — §11.4 infraestrutura Hostinger)
**Repositório de trabalho:** `C:\Users\User\Desktop\amd_site_2026`
**Documento companheiro:** `PRD_AlunoMakerDigital.md` v2.0, `WORKFLOW_AlunoMakerDigital.md` v1.0
**Status:** Proposta para validação

---

## Sumário

1. Visão Geral Arquitetural
2. Stack Tecnológico
3. Estrutura de Pastas
4. Arquitetura CSS
5. Arquitetura JavaScript
6. Módulo de Animações GPIO — Spec Detalhada
7. Identidade Visual
8. SEO
9. PWA
10. **Estratégia de Testes e Validação**
11. **CI/CD e Estratégia de Deploy Incremental**
12. Performance Budget
13. Segurança
14. Backend e Modelo de Dados (Fase 4+)
15. Convenções de Código e Linters
16. Variáveis de Ambiente

---

## 1. Visão Geral Arquitetural

```
┌──────────────────────────────────────────────────────────────┐
│                       USUÁRIO (Browser)                       │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼─────────────────────────────────┐
│  CDN Hostinger (estáticos)                                    │
│  ├── HTML + CSS + JS vanilla                                  │
│  ├── Imagens otimizadas (WebP + fallback)                     │
│  └── Vídeos curtos comprimidos                                │
└────────────────────────────┬─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│  Node.js + Express (Fase 4+) — Hostinger Business             │
│  ├── /api/contact      → grava em MySQL                       │
│  ├── /api/visits       → grava em MySQL                       │
│  ├── /api/admin/login  → JWT                                  │
│  ├── /api/admin/*      → CRUD + integrações                   │
│  └── Claude API (gerador) — Fase 5+                           │
└────────────────────────────┬─────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         MySQL 8        Brevo SMTP    APIs Externas
       (Hostinger)    (e-mail mkt)    (IG, TikTok,
                                       Mercado Pago,
                                       Anthropic)
```

**Princípios arquiteturais:**
- **Static-first:** Fases 1–3 são puramente estáticas, sem backend.
- **Progressive enhancement:** site funciona mesmo com JavaScript desabilitado (conteúdo essencial).
- **Vanilla no front:** zero dependência runtime de framework JS.
- **Backend só quando necessário:** introduzido na Fase 4, formulários migram sem mudança no UX.
- **Cada fase deployável independentemente** em produção.

---

## 2. Stack Tecnológico

### 2.1 Frontend (todas as fases)

| Tecnologia | Versão / Fonte | Finalidade |
|---|---|---|
| HTML5 semântico | nativo | Estrutura das páginas |
| CSS3 + Custom Properties | nativo | Estilos e variáveis de design |
| JavaScript ES6+ | nativo (vanilla) | Interatividade — SEM framework |
| Intersection Observer API | nativo | Animações de entrada no scroll |
| Canvas 2D API | nativo | Módulo de Animações GPIO |
| Swiper.js | CDN / v11 | Sliders e carrosséis |
| GLightbox | CDN / v3 | Galeria com lightbox |
| JSZip | CDN / v3 | Exportação de sequência GPIO |
| Google Fonts | CDN | Orbitron + Inter + Rajdhani |
| Font Awesome 6 | CDN | Ícones |

### 2.2 Backend (Fase 4+)

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Node.js | v20 LTS | Runtime do servidor |
| Express.js | v4 | Framework HTTP |
| MySQL | v8 | Banco de dados relacional |
| mysql2 (driver puro) | v3 | Acesso ao banco (Sequelize opcional) |
| JWT (jsonwebtoken) | v9 | Autenticação |
| bcrypt | v5 | Hash de senhas |
| Multer | v1 | Upload de arquivos |
| Nodemailer | v6 | Envio de e-mails via Brevo SMTP |
| @anthropic-ai/sdk | latest | Geração de conteúdo (Fase 5) |
| dotenv | v16 | Variáveis de ambiente |
| express-rate-limit | v7 | Rate limiting |
| express-validator | v7 | Validação de inputs |
| helmet | v7 | Headers de segurança |

### 2.3 Ferramentas de Desenvolvimento e Testes (devDependencies)

| Ferramenta | Versão | Finalidade |
|---|---|---|
| @playwright/test | latest | Testes E2E |
| @lhci/cli | latest | Lighthouse CI |
| @axe-core/playwright | latest | Acessibilidade automatizada |
| vitest | latest | Testes unitários (Fase 4+) |
| supertest | latest | Testes de API (Fase 4+) |
| prettier | latest | Formatação |
| eslint | latest | Linting JavaScript |
| stylelint | latest | Linting CSS |

### 2.4 Integrações Externas

| Integração | Finalidade | Fase de entrada |
|---|---|---|
| Google Analytics 4 | Métricas do site | Fase 1 |
| Google Maps API | Mapa de localização | Fase 2 |
| WhatsApp Business | Botão flutuante | Fase 1 |
| Brevo (ex-Sendinblue) | E-mail marketing + SMTP | Fase 4 |
| Anthropic Claude API | Gerador de conteúdo | Fase 5 |
| Instagram Graph API | Publicação automática | Fase 6 |
| TikTok Content Posting API | Agendamento de vídeos | Fase 6 |
| Mercado Pago API | Pagamentos | Fase 6 |

---

## 3. Estrutura de Pastas

```
amd_site_2026/
│
├── PRD_AlunoMakerDigital.md
├── SPEC_TECNICA_AlunoMakerDigital.md
├── WORKFLOW_AlunoMakerDigital.md
├── BRIEFING_COMPLETO_V2_ALUNO_MAKER_DIGITAL.md
│
├── index.html
├── sobre.html
├── projetos.html
├── escolas.html
├── eventos.html
├── cursos.html
├── loja.html
├── contato.html
├── obrigado.html
├── animacoes.html              ← Módulo GPIO (Fase 3)
│
├── assets/
│   ├── css/
│   │   ├── variables.css
│   │   ├── main.css
│   │   ├── components.css
│   │   ├── animations.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── main.js
│   │   ├── navbar.js
│   │   ├── animations.js
│   │   ├── gallery.js
│   │   ├── counter.js
│   │   ├── quiz.js
│   │   ├── forms.js
│   │   └── animations-gpio.js  ← Módulo GPIO (Fase 3)
│   ├── images/
│   │   ├── logo/
│   │   ├── hero/
│   │   ├── sobre/
│   │   ├── projetos/
│   │   ├── escolas/
│   │   └── eventos/
│   └── videos/
│
├── admin/                       ← Fase 4+
│   ├── index.html
│   ├── login.html
│   ├── gerador.html
│   ├── publicador.html
│   ├── galeria.html
│   ├── produtos.html
│   └── assets/
│
├── server/                      ← Fase 4+
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── db/
│   └── package.json
│
├── tests/                       ← Estratégia de testes
│   ├── e2e/
│   │   ├── home.spec.js
│   │   ├── contato.spec.js
│   │   ├── quiz.spec.js
│   │   ├── gpio.spec.js
│   │   └── fixtures/
│   ├── lighthouse/
│   │   └── lighthouserc.json
│   ├── a11y/
│   │   └── axe.spec.js
│   ├── unit/                    ← Fase 4+
│   ├── api/                     ← Fase 4+
│   └── manual-checklists/
│       ├── home-smoke.md
│       ├── projetos-smoke.md
│       ├── animacoes-smoke.md
│       └── cross-browser.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml               ← Playwright + Lighthouse a cada PR
│       └── deploy.yml           ← Deploy para Hostinger
│
├── playwright.config.js
├── package.json                 ← apenas devDependencies (front)
├── .env.example
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── sitemap.xml
├── robots.txt
└── manifest.json
```

---

## 4. Arquitetura CSS

### 4.1 `variables.css` — Custom Properties

```css
:root {
  /* === FUNDOS === */
  --bg-primary:      #0a0e1a;
  --bg-secondary:    #0d1526;
  --bg-tertiary:     #111e35;
  --bg-glass:        rgba(13, 21, 38, 0.8);

  /* === CORES PRINCIPAIS === */
  --blue-primary:    #0066ff;
  --blue-electric:   #00e5ff;
  --orange-accent:   #ff6b35;
  --purple-accent:   #a855f7;
  --green-accent:    #00c870;
  --gold-accent:     #ffd700;

  /* === TEXTOS === */
  --text-primary:    #e0e8ff;
  --text-secondary:  #7090b0;
  --text-muted:      #4a6080;

  /* === BORDAS E EFEITOS === */
  --border-color:    #1e3a5f;
  --glow-blue:       0 0 20px rgba(0, 229, 255, 0.3);
  --glow-orange:     0 0 20px rgba(255, 107, 53, 0.3);
  --glow-purple:     0 0 20px rgba(168, 85, 247, 0.3);

  /* === TIPOGRAFIA === */
  --font-display:    'Orbitron', monospace;
  --font-nav:        'Rajdhani', sans-serif;
  --font-body:       'Inter', sans-serif;

  /* === ESPAÇAMENTOS === */
  --section-padding: 80px 0;
  --container-max:   1200px;
  --border-radius:   12px;
  --border-radius-lg: 20px;

  /* === TRANSIÇÕES === */
  --transition-fast: 0.2s ease;
  --transition-med:  0.4s ease;
  --transition-slow: 0.6s ease;
}
```

### 4.2 Demais arquivos
- `main.css` — reset, tipografia base, container, imagens.
- `components.css` — `.navbar`, `.card`, `.btn-*`, `.footer`, `.glass-card`, `.gpio-panel`.
- `animations.css` — keyframes (`fadeInUp`, `pulse`, `glow-pulse`, `float`, `typing`, `blink-caret`) e classes `.reveal` / `.reveal.visible`.
- `responsive.css` — breakpoints mobile-first: ≤480px, ≤768px, ≤1200px, >1200px.

### 4.3 Padrões obrigatórios
- BEM para classes: `.block__element--modifier`.
- Sem `!important` (usar especificidade correta).
- Mobile-first em media queries.
- Glassmorphism via `backdrop-filter: blur(10px)` + `--bg-glass`.

---

## 5. Arquitetura JavaScript

Cada arquivo é um módulo IIFE ou ES module com responsabilidade única. Todos iniciam com `'use strict'`.

### 5.1 `main.js`
- DOMContentLoaded: inicializa módulos.
- Injeta botão WhatsApp flutuante (constantes `WHATSAPP_NUMBER = '5561981333875'`, `WHATSAPP_MSG`).
- Lazy loading de imagens via IntersectionObserver.

### 5.2 `navbar.js`
- Estado: `isOpen`, `isSticky`.
- Eventos: scroll → `.sticky`; click hamburger → toggle `.nav-open`; click link → fecha mobile; click fora → fecha.
- Highlight do link ativo via pathname.

### 5.3 `animations.js`
- IntersectionObserver com `threshold: 0.15`.
- Observa `.reveal`; ao entrar adiciona `.visible`.
- Suporta `data-delay` para escalonamento.

### 5.4 `gallery.js`
- Filtros por `data-category` (sem reload).
- Integração GLightbox: `GLightbox({ selector: '.gallery-item' })`.

### 5.5 `counter.js`
- Observa seção `.counters`; ao entrar anima `data-target` de 0 ao valor (2000ms, linear).
- Roda 1x (disconnect após ativar).

### 5.6 `quiz.js`
- 3 perguntas; cada resposta acumula tags.
- Mapeamento tag → curso definido em constante interna.
- Renderiza resultado com botão âncora para `cursos.html#curso-{id}`.

### 5.7 `forms.js`
- Validação client-side: campos obrigatórios, regex de e-mail, data ≥ hoje.
- Fase 1–3: POST simulado, grava em `localStorage` para inspeção e redireciona.
- Fase 4+: POST real para `/api/contact` ou `/api/visits` com fallback localStorage em caso de falha.

### 5.8 `animations-gpio.js` — ver §6

---

## 6. Módulo de Animações GPIO — Spec Detalhada

### 6.1 Arquivo: `assets/js/animations-gpio.js`

**Padrão arquitetural:** Orientado a objetos (classes ES6).

### 6.2 Hierarquia de classes

```javascript
class GPIOTemplate {
  constructor(canvas, ctx)
  render()                       // diagrama base
  highlightPin(pinId)            // destaque visual
  getPin(pinId)                  // { x, y, function, label }
}

class RPi5Template extends GPIOTemplate {
  // 40 pinos (2×20)
  // Funções: 3V3, 5V, GND, GPIO, I2C (SDA/SCL), SPI (MISO/MOSI/SCLK/CE), UART (TXD/RXD)
}

class ESP8266Template extends GPIOTemplate {
  // NodeMCU 30 pinos
  // D0-D8, A0, 3V3, GND, VIN, TX, RX, RST, EN
}

class ESP32Template extends GPIOTemplate {
  // 38 pinos
  // ADC, DAC, Touch, I2C, SPI, UART, PWM
}

class AnimationController {
  constructor(canvas, template, animationType, config)
  state          // 'idle' | 'running' | 'paused' | 'stopped'
  frameId
  play()
  pause()
  stop()
  _tick(timestamp)
  _renderFrame()
  exportFrame()              // canvas.toDataURL('image/png')
  exportSequence(n, fps)     // retorna ZIP via JSZip
}

class LEDAnimation     { config: { pin, color, blinkRate, dutyCycle } }
class ServoAnimation   { config: { pin, startAngle, endAngle, speed } }
class SensorAnimation  { config: { pin, minValue, maxValue, unit } }
class BuzzerAnimation  { config: { pin, frequency, waveform: 'square'|'sine' } }
```

### 6.3 Tabela de pinos GPIO (referência para os templates)

**Raspberry Pi 5 (cabeçalho 40 pinos — destaque)**

| Pino físico | Nome GPIO | Função primária | Cor sugerida |
|---|---|---|---|
| 1, 17 | 3V3 | Alimentação 3.3V | Vermelho escuro |
| 2, 4 | 5V | Alimentação 5V | Vermelho |
| 6, 9, 14, 20, 25, 30, 34, 39 | GND | Terra | Preto |
| 3 | GPIO 2 | SDA1 (I2C) | Roxo |
| 5 | GPIO 3 | SCL1 (I2C) | Roxo |
| 8 | GPIO 14 | TXD0 (UART) | Verde |
| 10 | GPIO 15 | RXD0 (UART) | Verde |
| 19 | GPIO 10 | MOSI (SPI) | Amarelo |
| 21 | GPIO 9 | MISO (SPI) | Amarelo |
| 23 | GPIO 11 | SCLK (SPI) | Amarelo |
| 11, 12, 13, 15, 16, 18, 22, 24, 26, 29, 31, 32, 33, 35, 36, 37, 38, 40 | GPIO genérico | I/O digital | Azul elétrico |

**NodeMCU ESP8266 (pinos lógicos D0–D8 + analógico)**

| Label | GPIO | Função |
|---|---|---|
| D0 | GPIO 16 | I/O (sem PWM/interrupt) |
| D1 | GPIO 5 | SCL (I2C) |
| D2 | GPIO 4 | SDA (I2C) |
| D3 | GPIO 0 | Boot / Flash |
| D4 | GPIO 2 | LED onboard / TXD1 |
| D5 | GPIO 14 | SCLK (SPI) |
| D6 | GPIO 12 | MISO (SPI) |
| D7 | GPIO 13 | MOSI (SPI) |
| D8 | GPIO 15 | CS (SPI) |
| A0 | ADC0 | Entrada analógica (0–1V) |
| 3V3, GND, VIN, TX, RX, RST, EN | — | Alimentação e controle |

**ESP-32 (DevKit C — 38 pinos)**

| GPIO | Funções suportadas |
|---|---|
| 0, 2, 4, 5, 12–19, 21–23, 25–27, 32–33 | I/O + variações (PWM, ADC, Touch, DAC) |
| 34, 35, 36, 39 | Somente entrada (sem pull-up interno) |
| 1 (TX0), 3 (RX0) | UART0 (programação) |
| 16 (RX2), 17 (TX2) | UART2 |
| 21 (SDA), 22 (SCL) | I2C default |
| 18 (SCLK), 19 (MISO), 23 (MOSI), 5 (CS) | SPI default (VSPI) |
| 25, 26 | DAC |
| 2, 4, 12–15, 27, 32, 33 | Touch capacitivo |

### 6.4 Interface HTML (`animacoes.html`)

Layout: painel de controle à esquerda + canvas à direita. Em mobile (≤768px), painel acima do canvas.

```
[Navbar]
[Header da seção]
  Título: "Visualizador de Circuitos GPIO"

[Painel de controle]
  • Selecionar Plataforma: RPi5 / ESP8266 / ESP32
  • Tipo de Animação: LED / Servo / Sensor / Buzzer
  • Configurações dinâmicas (campos conforme animação)
  • Controles: Play / Pause / Stop / Velocidade
  • Exportação: PNG (frame) / ZIP (sequência)

[Canvas 800×500 desktop | 100% width mobile]

[Footer]
```

### 6.5 Exportação

```javascript
function exportFrame(canvas) {
  const link = document.createElement('a');
  link.download = `gpio-frame-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

async function exportSequence(controller, frameCount, fps) {
  const zip = new JSZip();
  const interval = 1000 / fps;
  for (let i = 0; i < frameCount; i++) {
    const dataUrl = controller.exportFrame();
    const base64 = dataUrl.split(',')[1];
    zip.file(`frame-${String(i).padStart(4, '0')}.png`, base64, { base64: true });
    await new Promise(r => setTimeout(r, interval));
  }
  zip.file('README.txt', 'Use ffmpeg ou ezgif.com para montar GIF a partir dos frames.');
  const blob = await zip.generateAsync({ type: 'blob' });
  // dispara download via URL.createObjectURL
}
```

---

## 7. Identidade Visual

### 7.1 Tipografia

```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600;700&family=Rajdhani:wght@400;500;600;700&display=swap');

h1, h2, h3         { font-family: var(--font-display); }
h4, h5, h6, nav    { font-family: var(--font-nav); }
body, p, li, span  { font-family: var(--font-body); }
```

| Elemento | Desktop | Mobile |
|---|---|---|
| h1 hero | 3.5rem | 2rem |
| h2 seção | 2.5rem | 1.75rem |
| h3 card | 1.5rem | 1.25rem |
| body | 1rem | 0.9rem |
| caption | 0.85rem | 0.8rem |

### 7.2 Glassmorphism

```css
.glass-card {
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius);
}
```

---

## 8. SEO

### 8.1 Meta Tags padrão

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="[150–160 chars por página]">
<meta name="keywords" content="robótica educacional, programação para alunos, maker, Brasília, escolas públicas">
<meta name="author" content="Professor Francenylson — Aluno Maker Digital">

<!-- Open Graph -->
<meta property="og:title" content="[título] — Aluno Maker Digital">
<meta property="og:description" content="[descrição]">
<meta property="og:image" content="https://alunomakerdigital.com.br/assets/images/og-image.jpg">
<meta property="og:url" content="https://alunomakerdigital.com.br/[página]">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@alunomakerdigital">
```

### 8.2 Schema.org

```json
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Aluno Maker Digital",
  "description": "Projeto de robótica educacional para escolas públicas",
  "url": "https://alunomakerdigital.com.br",
  "founder": { "@type": "Person", "name": "Francenylson" },
  "foundingDate": "2018",
  "areaServed": "Brasília, DF, Brasil",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Recanto das Emas",
    "addressRegion": "DF",
    "addressCountry": "BR"
  }
}
```

### 8.3 `sitemap.xml` e `robots.txt`
Conforme PRD §13. Atualizar sitemap a cada nova página entregue em fase.

---

## 9. PWA — `manifest.json`

```json
{
  "name": "Aluno Maker Digital",
  "short_name": "AMD",
  "description": "Robótica educacional — Tecnologia que transforma vidas.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0e1a",
  "theme_color": "#00e5ff",
  "icons": [
    { "src": "/assets/images/logo/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/assets/images/logo/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 10. Estratégia de Testes e Validação

Validação é parte do desenvolvimento, não etapa posterior. Esta seção é referência única para todas as fases.

### 10.1 Pirâmide adaptada (vanilla JS estático + backend mínimo)

```
                   ▲
                  / \         Manual smoke + cross-browser
                 /   \        (checklists em tests/manual-checklists/)
                ─────
               /     \        E2E (Playwright) — jornadas críticas
              ───────
             /         \      Acessibilidade (axe-core) + Lighthouse CI
            ───────────
           /             \    Unit + API (Vitest + Supertest) — Fase 4+
          ───────────────
```

### 10.2 Ferramentas e responsabilidades

**Playwright (E2E)**
- Configuração em `playwright.config.js`.
- Projetos: chromium, firefox, webkit, mobile-chrome, mobile-safari.
- Specs em `tests/e2e/*.spec.js`.
- Roda em `develop` a cada PR e antes de cada deploy.

**Lighthouse CI**
- `.github/workflows/ci.yml` chama `@lhci/cli`.
- Thresholds em `tests/lighthouse/lighthouserc.json`:
  - Performance ≥ 85
  - Acessibilidade ≥ 95
  - Best Practices ≥ 90
  - SEO ≥ 95
- Falha em qualquer threshold = bloqueio do merge / deploy.

**axe-core**
- Integração via `@axe-core/playwright` em `tests/a11y/axe.spec.js`.
- Tolerância: 0 violações `critical` e `serious`.

**Vitest + Supertest** (Fase 4+)
- Unit tests em `tests/unit/` para funções utilitárias.
- API tests em `tests/api/` cobrindo cada endpoint.

**Smoke manual cross-browser**
- Checklists em `tests/manual-checklists/{página}-smoke.md`.
- Matriz mínima por fase: Chrome desktop, Firefox desktop, Safari iOS, Chrome Android.
- Cada checklist exige assinatura (nome + data) antes do deploy.

### 10.3 Specs E2E obrigatórios por fase

**Fase 1:**
- `home.spec.js`: hero render, navbar mobile/desktop, contadores ao scroll, projetos hover, WhatsApp click.

**Fase 2:**
- `quiz.spec.js`: responder 3 perguntas → recomendação correta.
- `gallery.spec.js`: filtros por categoria.
- `contato.spec.js`: validação + envio → redirect obrigado.html.
- `navigation.spec.js`: jornada multi-página.

**Fase 3:**
- `gpio.spec.js`: seleção das 3 placas, play/pause/stop, exportação PNG, exportação ZIP.

**Fase 4:**
- `auth.spec.js`: login admin + acesso protegido.
- `api.spec.js` (Supertest): contratos de `/api/contact`, `/api/visits`, `/api/admin/*`.

**Fase 5–6:** mocks de APIs externas, fluxo de geração de conteúdo, fluxo de compra.

### 10.4 Exemplo de spec E2E — Quiz

```javascript
// tests/e2e/quiz.spec.js
import { test, expect } from '@playwright/test';

test('quiz recomenda curso após 3 respostas', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-quiz-start]').click();
  await page.locator('[data-answer="professor"]').click();
  await page.locator('[data-answer="iniciante"]').click();
  await page.locator('[data-answer="ensinar"]').click();
  await expect(page.locator('[data-quiz-result]')).toBeVisible();
  await expect(page.locator('[data-quiz-result]')).toContainText(/curso/i);
  const buyBtn = page.locator('[data-quiz-buy]');
  await expect(buyBtn).toHaveAttribute('href', /cursos\.html#curso-/);
});
```

### 10.5 Exemplo de configuração Lighthouse CI

```json
{
  "ci": {
    "collect": {
      "url": [
        "https://staging.alunomakerdigital.com.br/",
        "https://staging.alunomakerdigital.com.br/projetos.html",
        "https://staging.alunomakerdigital.com.br/animacoes.html"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.95 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

### 10.6 Checklist manual modelo (`tests/manual-checklists/home-smoke.md`)

```
# Smoke — Home (vDeploy-N)

Browser/dispositivo: ___________________________
Tester: _____________________  Data: __/__/____

- [ ] Página carrega em < 3s
- [ ] Hero exibe slogan e dois CTAs visíveis acima da dobra
- [ ] Scroll indicator pulsa
- [ ] Contadores animam ao entrar no viewport
- [ ] Cards de projetos têm flip ao hover (desktop) / tap (mobile)
- [ ] Quiz: 3 perguntas → recomendação correta com botão funcional
- [ ] Formulário de agendamento valida e-mail inválido
- [ ] WhatsApp flutuante abre conversa com mensagem pré-definida
- [ ] Nenhum erro no console
- [ ] Layout intacto em rotação portrait/landscape (mobile)

Resultado: [ ] APROVADO  [ ] REPROVADO
Notas: ______________________________________
```

### 10.7 Gate de qualidade

| Gate | Condição | Quem aprova |
|---|---|---|
| Merge para `develop` | Playwright verde, Lighthouse verde, axe-core sem violações sérias | CI automatizado |
| Deploy para staging | Merge em `develop` + smoke automatizado de fumaça pós-deploy | CI automatizado |
| Deploy para `main` (produção) | Smoke manual cross-browser preenchido e aprovado + snapshot de rollback | Professor Fran |

---

## 11. CI/CD e Estratégia de Deploy Incremental

### 11.1 Modelo de branches

- `main` — produção (`alunomakerdigital.com.br`).
- `develop` — staging (`staging.alunomakerdigital.com.br`).
- `feature/*` — desenvolvimento de feature isolada.
- `hotfix/*` — correções urgentes saindo direto para `main` com merge-back para `develop`.

### 11.2 Pipeline (GitHub Actions ou equivalente)

```
Push em feature/* ou PR:
  → instala deps → lint → testes E2E (chromium) → Lighthouse CI → axe-core
  → comenta resultado no PR

Merge em develop:
  → roda toda a suíte (chromium + firefox + webkit)
  → deploy automático em staging.alunomakerdigital.com.br
  → smoke automatizado pós-deploy (health-check)

Tag v* em main:
  → snapshot manual confirmado
  → deploy em alunomakerdigital.com.br via FTP/Git Deploy Hostinger
  → smoke automatizado pós-deploy
  → notificação WhatsApp para o responsável
```

### 11.3 Procedimento de deploy

**Para staging:**
1. Merge em `develop`.
2. Pipeline roda; se verde, sincroniza com Hostinger via FTP automatizado.
3. Smoke automatizado bate em 5 URLs-chave.

**Para produção:**
1. Snapshot manual: download dos arquivos atuais via Hostinger File Manager para `snapshots/AAAA-MM-DD-vN/`.
2. Tag `vN.M` em `main`.
3. Pipeline executa deploy.
4. Smoke automatizado + 1 smoke manual em Chrome desktop.
5. Em caso de falha: rollback restaura o snapshot anterior.

### 11.4 Infraestrutura Hostinger — Paths e Convenções (atualizado 2026-05-23)

#### Paths reais no servidor

| Recurso | Caminho |
|---|---|
| Site principal (public_html) | `~/domains/alunomakerdigital.com.br/public_html/` |
| Backend Node.js (server/) | `~/domains/api.alunomakerdigital.com.br/server/` |
| Staging | `~/domains/staging.alunomakerdigital.com.br/public_html/` |
| Proxy PHP subdomain api.* | `~/domains/api.alunomakerdigital.com.br/public_html/api/` |

> **Atenção:** NÃO existe `~/public_html/` no Hostinger Business com múltiplos domínios. Sempre usar o caminho completo via `~/domains/`.

#### FTP-Deploy-Action e dotfiles

O `SamKirkland/FTP-Deploy-Action` **não faz upload confiável de dotfiles** (arquivos iniciados com `.`) em subdiretórios. Isso afeta criticamente o `api/.htaccess`, sem o qual o Apache não roteia `/api/*` para o `index.php` do proxy PHP — resultando em 404 e CORS no login e nas rotas admin.

**Solução implementada:** passo `appleboy/ssh-action` no `deploy.yml` que regrava o `api/.htaccess` após cada deploy em produção:

```yaml
- name: Garantir .htaccess do proxy PHP via SSH
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.SSH_HOST }}
    username: ${{ secrets.SSH_USER }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    port: ${{ secrets.SSH_PORT }}
    script: |
      printf 'Options -Indexes\nRewriteEngine On\nRewriteCond %%{REQUEST_FILENAME} !-f\nRewriteRule ^ index.php [L,QSA]\n' \
        > ~/domains/alunomakerdigital.com.br/public_html/api/.htaccess
```

#### Secrets no GitHub Actions

| Secret | Valor | Finalidade |
|---|---|---|
| `FTP_HOST` | hostinger FTP host | Deploy FTP |
| `FTP_USER` | usuário FTP | Deploy FTP |
| `FTP_PASS` | senha FTP | Deploy FTP |
| `FTP_DIR_PROD` | path public_html produção | Deploy FTP |
| `FTP_DIR_STAGING` | path public_html staging | Deploy FTP |
| `FTP_DIR_API` | path api.* public_html | Deploy proxy PHP subdomínio |
| `SSH_HOST` | `82.112.247.253` | Passo SSH pós-deploy |
| `SSH_USER` | `u562242543` | Passo SSH pós-deploy |
| `SSH_PORT` | `65002` | Passo SSH pós-deploy |
| `SSH_PRIVATE_KEY` | conteúdo de `~/.ssh/amd_deploy` | Passo SSH pós-deploy |

#### Deploy de server/ (Node.js backend)

O pipeline FTP **não copia `server/`** — apenas arquivos estáticos vão para `public_html`. Após cada alteração em `server/`, copiar manualmente via SCP:

```bash
scp -P 65002 -i ~/.ssh/amd_deploy -r server/controllers/ \
  u562242543@82.112.247.253:~/domains/api.alunomakerdigital.com.br/server/controllers/
```

Em seguida reiniciar o PM2 com a sequência segura (ver CLAUDE.md — nunca usar `pkill`, pode matar a sessão SSH):

```bash
ps aux | grep -E "node|start.sh" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null
sleep 2 && pm2 delete all
pm2 start ~/domains/api.alunomakerdigital.com.br/server/start.sh --name amd-api --interpreter bash
```

#### Proxy PHP (domínio principal)

Dois arquivos no repo deployados via FTP para o domínio principal:
- `api/index.php` — proxy cURL para `http://127.0.0.1:3000` (sem CORS, mesma origem)
- `api/.htaccess` — roteamento Apache (regravado via SSH a cada deploy, por limitação do FTP)

#### Regras SSH no terminal do servidor

- **NUNCA usar heredoc** (`<< 'EOF'`) para escrever arquivos — o terminal SSH inclui o marcador literalmente no arquivo.
- Usar `echo "linha" >> arquivo` linha a linha, ou `printf` com `>` (sobrescrita).
- **NUNCA usar `pkill`** para matar processos Node — pode encerrar a sessão SSH. Usar `ps aux | grep | awk | xargs kill -9`.

### 11.5 Feature flags simples

Para evitar que código de fases futuras quebre fases já em produção:
- Atributo `data-feature="gpio"` no elemento; CSS oculta com `[data-feature][data-enabled="false"] { display: none }`.
- Constante `FEATURE_FLAGS = { gpio: true, admin: false }` em `main.js`.
- No backend (Fase 4+), tabela `feature_flags` permite toggle em runtime via admin.

---

## 12. Performance Budget

| Recurso | Limite por página | Aplica-se a |
|---|---|---|
| HTML | ≤ 50 KB | Todas |
| CSS total | ≤ 80 KB | Todas |
| JS total | ≤ 100 KB (sem dependências CDN) | Todas |
| Imagens above-the-fold | ≤ 300 KB | Todas |
| Total da página | ≤ 1 MB | Páginas públicas |
| Requests totais | ≤ 40 | Páginas públicas |
| Fontes web | 1 família principal + 2 secundárias | Todas |

**Práticas obrigatórias:**
- WebP com fallback JPG/PNG.
- `loading="lazy"` em imagens abaixo do fold.
- CSS crítico inline para above-the-fold.
- JS com `defer` no `<head>` ou ao fim do `<body>`.
- Fontes com `display=swap`.
- Compressão Gzip ativa no servidor.

---

## 13. Segurança

**Frontend (todas as fases):**
- HTTPS obrigatório.
- Sem `eval()` em hipótese alguma.
- `textContent` ao invés de `innerHTML` em todo conteúdo dinâmico.
- CSP definido via `<meta http-equiv="Content-Security-Policy">` ou header do servidor.

**Backend (Fase 4+):**
- bcrypt com 12 rounds para senhas.
- JWT com expiração de 8h, renovável.
- `express-rate-limit`: 5 tentativas / 15min em `/api/admin/login`.
- `helmet` com headers de segurança padrão.
- `express-validator` em todos os inputs.
- Upload restrito a MIME `image/*` e `video/mp4` via Multer.
- Segredos exclusivamente via `.env` (nunca no código).
- `.env` no `.gitignore` (regra inviolável).

---

## 14. Backend e Modelo de Dados (Fase 4+)

### 14.1 Endpoints planejados

| Método | Rota | Finalidade | Fase |
|---|---|---|---|
| POST | /api/contact | Recebe formulário de contato | 4 |
| POST | /api/visits | Recebe agendamento de visita | 4 |
| POST | /api/admin/login | Autenticação JWT | 4 |
| GET | /api/admin/contacts | Lista contatos (auth) | 4 |
| GET | /api/admin/visits | Lista agendamentos (auth) | 4 |
| POST | /api/admin/generate | Claude API | 5 |
| GET | /api/admin/generations | Histórico | 5 |
| POST | /api/admin/publish | Publica em IG/TikTok | 6 |
| GET/POST/PUT | /api/admin/products | CRUD de produtos | 6 |
| POST | /api/payments/checkout | Mercado Pago | 6 |
| GET | /api/feature-flags | Estado de flags públicas | 4 |

### 14.2 Esquema MySQL

```sql
CREATE TABLE visits (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  phone       VARCHAR(20),
  visit_date  DATE NOT NULL,
  message     TEXT,
  status      ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contacts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  subject     VARCHAR(200),
  message     TEXT NOT NULL,
  read_at     TIMESTAMP NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  category    ENUM('lesson_plan','course','mentoring','consulting','physical','subscription'),
  active      BOOLEAN DEFAULT TRUE,
  image_url   VARCHAR(500),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE generations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  theme       VARCHAR(255),
  type        VARCHAR(50),
  output_json JSON,
  cost_usd    DECIMAL(8,4),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feature_flags (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  key_    VARCHAR(50) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 15. Convenções de Código e Linters

**HTML:**
- `lang="pt-BR"` no `<html>`.
- Tags semânticas: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- Alt text descritivo em todas as imagens.
- ARIA labels em elementos interativos sem texto visível.

**CSS (Stylelint):**
- BEM: `.block__element--modifier`.
- Sem `!important`.
- Mobile-first.
- Propriedades agrupadas (layout → box → typography → visual).

**JavaScript (ESLint + Prettier):**
- `'use strict'`.
- `const` por padrão, `let` quando reatribuição necessária, nunca `var`.
- Funções nomeadas em handlers principais.
- Sem dependências npm em produção front (apenas devDependencies).
- Imports/Exports ES modules quando possível.

**Configurações sugeridas:**
- `.prettierrc`: `{ "singleQuote": true, "semi": true, "printWidth": 100 }`.
- `.eslintrc.json`: `{ "extends": ["eslint:recommended"], "env": { "browser": true, "es2022": true } }`.

---

## 16. Variáveis de Ambiente

Arquivo `.env.example` (template, sem segredos reais):

```
# Backend (Fase 4+)
PORT=3000
NODE_ENV=development

# Banco de dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=alunomakerdigital
DB_USER=
DB_PASS=

# JWT
JWT_SECRET=
JWT_EXPIRATION=8h

# E-mail (Brevo SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=alunomakerdigital@gmail.com

# Claude API (Fase 5)
ANTHROPIC_API_KEY=

# Redes sociais (Fase 6)
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_BUSINESS_ID=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=

# Mercado Pago (Fase 6)
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=
```

**Regras:**
- `.env` real NUNCA versionado.
- Cada ambiente (dev/staging/produção) tem seu `.env` próprio.
- Segredos rotacionados a cada 6 meses ou ao detectar exposição.

---

*Spec Técnica v2.0 — Aluno Maker Digital*
*Desenvolvido com suporte de Claude AI (Anthropic) — Opus 4.7*
*© 2018–2026 — Todos os direitos reservados*
