
# Próxima sessão: Fase 4.5 — Gerenciador de Conteúdo

## Prompt para iniciar a sessão

```
Iniciar a Fase 4.5 do projeto Aluno Maker Digital: Gerenciador de Conteúdo.
Leia o CLAUDE.md e este NEXT_SESSION.md inteiros antes de qualquer ação.
Branch de trabalho: criar feature/fase-4.5-cms a partir de develop.

Contexto essencial:
- As páginas projetos.html, eventos.html, escolas.html e cursos.html têm conteúdo
  hardcoded no HTML. Precisam se tornar dinâmicas, com conteúdo gerenciado pelo admin.
- O admin já existe em admin/login.html e admin/index.html (JWT funcional).
- A API já está no ar em alunomakerdigital.com.br/api/ (PHP proxy → Node.js → MySQL).
- Imagens ficam no repositório (assets/images/). O DB armazena apenas o path relativo.
- O visual das páginas públicas NÃO muda — o JS vai gerar o mesmo HTML que existe hoje.
```

---

## Estado atual (2026-05-20)

| Fase | Status | Tag | Notas |
|---|---|---|---|
| 0 a 3 | ✅ Concluídas | v0.1.1 – v0.4.0 | — |
| 4 — Backend + Admin | ✅ Concluída | v2.0.0 | API + painel admin funcionando |
| **4.5 — Gerenciador de Conteúdo** | **⏳ Próxima** | — | **Esta sessão** |
| 5 — Gerador Claude API | ⏳ | — | Só após 4.5 concluída |

---

## Por que esta fase existe

As páginas projetos.html, eventos.html, escolas.html e cursos.html têm conteúdo
**hardcoded no HTML**. O Professor Fran tem:
- Centenas de fotos de eventos ainda não publicadas
- Dezenas de projetos para adicionar
- Escolas a atualizar
- Imagens erradas/invertidas já no ar que precisam correção

Sem um gerenciador, cada atualização exige abrir uma sessão Claude Code para editar HTML.
Esta fase resolve isso de forma permanente.

---

## Arquitetura após esta fase

```
ANTES (hoje):
  projetos.html → HTML estático com 7 cards hardcoded
  eventos.html  → HTML estático com seções hardcoded
  escolas.html  → HTML estático com 12 cards hardcoded
  cursos.html   → HTML estático com hidden sections

DEPOIS:
  projetos.html → <div id="projects-grid"></div>
                → assets/js/projetos.js fetch('/api/projects') → renderiza idêntico
  eventos.html  → <div id="events-container"></div>
                → assets/js/eventos.js fetch('/api/events') → renderiza por grupo
  escolas.html  → <div id="schools-grid"></div>
                → assets/js/escolas.js fetch('/api/schools') → renderiza cards
  cursos.html   → <div id="courses-grid"></div>
                → assets/js/cursos.js fetch('/api/courses') → renderiza (se active=true)

  admin/galeria.html → 4 abas: Eventos | Projetos | Escolas | Cursos
                     → CRUD completo para cada área
```

---

## Banco de dados — 5 novas tabelas

```sql
-- EVENTOS (agrupadores de fotos)
CREATE TABLE events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  category    VARCHAR(100) NOT NULL,
  description TEXT,
  event_date  DATE,
  active      BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FOTOS DOS EVENTOS (filhos de events, N fotos por evento)
CREATE TABLE event_photos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  event_id    INT NOT NULL,
  image_url   VARCHAR(500) NOT NULL,
  caption     VARCHAR(300),
  sort_order  INT DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- PROJETOS (cards flip com frente e verso)
CREATE TABLE projects (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  category    VARCHAR(100) NOT NULL,
  short_desc  VARCHAR(300),
  full_desc   TEXT,
  image_url   VARCHAR(500),
  tags        VARCHAR(500),
  active      BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ESCOLAS
CREATE TABLE schools (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  location     VARCHAR(200),
  description  TEXT,
  image_url    VARCHAR(500),
  year_since   VARCHAR(20),
  levels       VARCHAR(300),
  icon_variant ENUM('default','purple') DEFAULT 'default',
  active       BOOLEAN DEFAULT TRUE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CURSOS
CREATE TABLE courses (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  category     ENUM('alunos','professores','escola') NOT NULL,
  level        ENUM('iniciante','intermediario','avancado') DEFAULT 'iniciante',
  duration     VARCHAR(50),
  description  TEXT,
  topics       TEXT,
  image_url    VARCHAR(500),
  price        DECIMAL(10,2) DEFAULT NULL,
  price_active BOOLEAN DEFAULT FALSE,
  active       BOOLEAN DEFAULT TRUE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Regra de exibição dos cursos
```
active = FALSE                          → não aparece na página
active = TRUE  + price_active = FALSE   → aparece com badge "Em breve" (sem preço)
active = TRUE  + price_active = TRUE    → aparece com preço (Fase 6)
```

---

## Novos endpoints da API

### Públicos (sem auth)
| Método | Rota | Retorna |
|---|---|---|
| GET | `/api/events` | Eventos ativos + fotos agrupadas |
| GET | `/api/projects` | Projetos ativos |
| GET | `/api/schools` | Escolas ativas |
| GET | `/api/courses` | Cursos ativos |

### Admin (Bearer JWT)
| Método | Rota | Ação |
|---|---|---|
| GET/POST | `/api/admin/events` | Listar / Criar evento |
| PUT/DELETE | `/api/admin/events/:id` | Editar / Excluir evento |
| POST | `/api/admin/events/:id/photos` | Adicionar foto ao evento |
| PUT/DELETE | `/api/admin/events/:id/photos/:photoId` | Editar / Excluir foto |
| GET/POST | `/api/admin/projects` | Listar / Criar projeto |
| PUT/DELETE | `/api/admin/projects/:id` | Editar / Excluir projeto |
| GET/POST | `/api/admin/schools` | Listar / Criar escola |
| PUT/DELETE | `/api/admin/schools/:id` | Editar / Excluir escola |
| GET/POST | `/api/admin/courses` | Listar / Criar curso |
| PUT/DELETE | `/api/admin/courses/:id` | Editar / Excluir curso |

---

## Novos arquivos a criar

### Backend
```
server/controllers/eventController.js
server/controllers/projectController.js
server/controllers/schoolController.js
server/controllers/courseController.js
server/routes/content.js          ← rotas públicas (/api/events, /api/projects, etc.)
server/routes/admin.js            ← adicionar rotas admin de conteúdo (já existe, expandir)
```

### Frontend (JS de renderização)
```
assets/js/projetos.js             ← fetch + render dos project-cards (flip)
assets/js/eventos.js              ← fetch + render por grupo de evento + GLightbox
assets/js/escolas.js              ← fetch + render dos school-cards
assets/js/cursos.js               ← fetch + render dos course-cards
```

### Admin
```
admin/galeria.html                ← 4 abas: Eventos | Projetos | Escolas | Cursos
admin/assets/js/galeria.js        ← lógica CRUD das 4 abas
admin/assets/css/galeria.css      ← estilos do gerenciador (já importa admin.css base)
```

### Banco
```
server/db/schema-v2.sql           ← as 5 novas tabelas + seed com dados atuais
```

---

## Dados atuais para seed (migrar do HTML para o banco)

### Projetos existentes (7 cards no HTML atual)
1. Robô Garçom — categoria: robotica — img: `assets/images/projetos/robo_garcon/versao_2_5.webp`
2. Humanoide 17 DOF — categoria: robotica — img: `assets/images/projetos/espaco_maker/espaco_maker_20.webp`
3. Braço Robótico com IA — categoria: ia — img: **ERRADA** (usa espaco_maker_5 que não é braço robótico → corrigir no seed)
4. Lixeira Inteligente — categoria: iot
5. Impressora 3D — categoria: impressao3d
6. Drone educacional — categoria: robotica
7. Sistema de Irrigação Inteligente — categoria: iot

> **ATENÇÃO:** Verificar e corrigir imagens erradas/invertidas durante o seed.
> O Professor Fran deve informar quais paths corretos para cada projeto antes do seed.

### Eventos existentes (seções no HTML atual)
1. Campus Party Brasília — 6 fotos — `assets/images/eventos/campus_party/`
2. Instituto Federal Campus Gama — fotos — `assets/images/eventos/IFB_gama_2024/`
3. (verificar demais seções em eventos.html)

### Escolas existentes (12 no HTML)
CEF 101, CEF 113, CEF 206, CEF 308, CEF 405, CEM 804, EC 203, EC 401,
Colégio Militar, Pinheirinho Roxo (Ed. Infantil), CeD 104, CEF 306 (surdos/mudos)

> Imagens da Pinheirinho Roxo: `assets/images/escolas/pinheirinho_roxo/` (JPGs brutos —
> otimizar com `npm run images:optimize` antes de referenciar no banco)

---

## Convenção de paths de imagem no banco
```
assets/images/projetos/[slug]/foto.webp
assets/images/eventos/[slug_evento]/foto01.webp
assets/images/escolas/[slug_escola]/foto.webp
assets/images/cursos/[slug_curso]/capa.webp
```

Fluxo: Professor envia fotos → Claude otimiza para WebP → commit → deploy automático.
No admin, campo "Caminho da imagem" aceita o path relativo.

---

## Ordem de implementação recomendada

1. Criar as 5 tabelas no MySQL do servidor (via SSH + schema-v2.sql)
2. Implementar controllers e rotas backend (público + admin)
3. Escrever testes Vitest para os novos endpoints
4. Fazer seed com dados atuais (migrar HTML → banco)
5. Converter projetos.html → rendering dinâmico (projetos.js)
6. Converter eventos.html → rendering dinâmico (eventos.js) — mais complexo (grupos + lightbox)
7. Converter escolas.html → rendering dinâmico (escolas.js)
8. Converter cursos.html → rendering dinâmico (cursos.js)
9. Construir admin/galeria.html com as 4 abas
10. Testes E2E para as páginas dinâmicas
11. Smoke manual + corrigir imagens erradas
12. Merge PR → tag v2.0.5

---

## O que NÃO muda para o visitante

- Visual idêntico nas 4 páginas (mesmos CSS classes, mesmos componentes)
- GLightbox continua funcionando (inicializado após render do JS)
- Filtros por categoria continuam funcionando (gallery.js já lida com isso)
- Acessibilidade mantida (aria-label, roles, etc. gerados pelo JS)

---

## Painel admin atual (referência)
- URL: `https://alunomakerdigital.com.br/admin/login.html`
- Email: `francenylson@gmail.com` | Senha: `Amd@2026!Admin`

---

## Infraestrutura do servidor (referência rápida)

```bash
# Reiniciar Node.js via Python+paramiko se necessário:
# /c/Users/User/AppData/Local/Programs/Python/Python311/python.exe
# SSH: 82.112.247.253:65002  user: u562242543
# PM2: env -i HOME=... PATH=.../bin pm2 start start.sh --name amd-api --interpreter bash

# Aplicar schema no MySQL:
# mysql -u u562242543_amd_user -p'Amd@2018#2020' u562242543_amd_db < schema-v2.sql
```

---

## Lembretes técnicos
- Vanilla JS — sem React, Vue, Angular
- Commits e copy em pt-BR
- `server/` usa ESM — `import`/`export` sempre, `require()` proibido
- PM2 via `start.sh` bash wrapper
- `API_BASE = '/api'` (relativo) em todos os JS
- `npm run test:unit` e `npm run test:api` antes de commitar server/
- `npm run test:ci` antes de commitar front
- `npm run build:css` após qualquer mudança de CSS
- Fase 5 (Gerador Claude API) só começa após esta fase estar 100% deployada
