
# Próxima sessão: Fase 4 — Backend + Painel Admin

## Prompt para iniciar a sessão

```
Iniciar a Fase 4 do projeto Aluno Maker Digital: Backend Node.js + Painel Admin.
Leia o CLAUDE.md e este arquivo antes de qualquer ação.
Fase 3 concluída e mergeada em main com tag v0.4.0.
Branch de trabalho: feature/fase-4-backend-admin (criar a partir de develop).
```

---

## Estado atual (2026-05-19)

| Fase | Status | Tag | Notas |
|---|---|---|---|
| 0 — Fundação | ✅ Concluída | v0.1.1 | — |
| 1 — Home + layout global | ✅ Concluída | v0.2.0 | — |
| 2 — Demais páginas públicas | ✅ Concluída | v0.3.0 | 12 escolas, logo tricolor, mapa corrigido |
| 3 — Módulo GPIO (animações) | ✅ Concluída | v0.4.0 | animacoes.html + animations-gpio.js. 104/104 E2E + axe 11 páginas |
| 4 — Backend + Admin mínimo | ⏳ Próxima | — | — |

---

## O que foi feito na sessão anterior (2026-05-19)

### Fase 3 — Módulo GPIO
- `animacoes.html`: visualizador GPIO com painel de controle + canvas 800×500
- `assets/js/animations-gpio.js`: GPIOTemplate, RPi5Template (40 pinos), ESP8266Template, ESP32Template, AnimationController (play/pause/stop), LEDAnimation, ServoAnimation, SensorAnimation, BuzzerAnimation
- `assets/css/gpio.css` integrado ao bundle via `build:css`
- Exportação PNG (frame) e ZIP (24 frames via JSZip CDN)
- Link "Animações" adicionado à navbar + footer de todas as páginas
- `sitemap.xml` atualizado
- 104/104 E2E Chromium + 11/11 axe verdes
- Fix colateral: contraste WCAG AA logo tricolor (verde `#00843f`, vermelho `#d32f2f`)
- Fix colateral: `contato.spec.js` selector iframe mapa corrigido
- PRs #4 e #5 mergeados → tag `v0.4.0` publicada

### Observação sobre branch protection
A `main` exige 1 review de terceiro (dono não pode aprovar o próprio PR). Para futuros merges:
```bash
gh api --method DELETE repos/francenylson1/amd_site_2026/branches/main/protection/enforce_admins
gh pr merge N --merge --admin
gh api --method POST repos/francenylson1/amd_site_2026/branches/main/protection/enforce_admins
```

---

## Fase 4 — Escopo completo (WORKFLOW §4 + SPEC §14)

### Objetivo
Introduzir backend Node.js + MySQL, painel admin protegido por JWT e migrar os formulários do site (de localStorage para MySQL), mantendo fallback para localStorage em caso de falha de rede.

### Tarefas (do WORKFLOW)
1. Criar branch `feature/fase-4-backend-admin` a partir de `develop`
2. Criar estrutura `server/` (Express + rotas + controllers + middleware + db)
3. Configurar MySQL na Hostinger e aplicar schema (SPEC §14.2)
4. Implementar middleware JWT + bcrypt
5. Implementar endpoints:
   - `POST /api/contact`
   - `POST /api/visits`
   - `POST /api/admin/login`
   - `GET /api/admin/contacts`
   - `GET /api/admin/visits`
   - `GET /api/feature-flags`
6. Configurar `express-rate-limit` (5 tentativas/15min em login) + `helmet`
7. Implementar `admin/login.html` e `admin/index.html` (dashboard: métricas + listagem)
8. Migrar `forms.js`: tenta POST para API; fallback localStorage se falhar
9. Indicador visual: ícone verde "enviado ao servidor" vs. amarelo "salvo localmente"
10. Configurar Nodemailer com Brevo SMTP para notificação a cada novo contato/agendamento
11. Escrever testes:
    - Unit (Vitest) para validadores e utilitários
    - API (Supertest): contratos de cada endpoint
    - E2E full-stack: formulário → POST → registro no admin
12. Atualizar `robots.txt` para bloquear `/admin/`
13. Smoke manual incluindo cenário com servidor caído (fallback ativa)
14. Merge PR → tag `v2.0.0` (major — backend introduzido)

### Spec técnica chave (SPEC §14)
- **Stack backend:** Node.js 20 LTS + Express 4 + MySQL 8 (Hostinger Business)
- **Auth:** JWT (expira em 8h) + bcrypt 12 rounds
- **Rate limit:** 5 tentativas/15min no endpoint `/api/admin/login`
- **Schema:** tabelas `contacts`, `visits`, `feature_flags`, `admin_users`
- **E-mail:** Nodemailer + Brevo SMTP (variável `BREVO_API_KEY` em `.env`)
- **Segurança:** helmet, CORS restrito ao domínio, nenhum segredo no frontend

---

## Lembretes

- Vanilla JS no front — sem React, Vue ou Angular
- Todo copy e commits em pt-BR
- Rodar `npm run build:css` após qualquer mudança de CSS
- `npm run test:ci` antes de qualquer commit novo
- gh CLI em `C:\Program Files\GitHub CLI\gh.exe`
- Imagens Pinheirinho Roxo em `assets/images/escolas/pinheirinho_roxo/` (JPGs brutos — otimizar com `npm run images:optimize` antes de referenciar no HTML)
- `icon-192.png` faltando no manifest (404 não crítico, registrado para Fase 4)
