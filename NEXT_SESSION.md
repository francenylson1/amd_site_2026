
# Próxima sessão: Fase 3 — Módulo de Animações GPIO

## Prompt para iniciar a sessão

```
Iniciar a Fase 3 do projeto Aluno Maker Digital: Módulo de Animações GPIO.
Leia o CLAUDE.md e este arquivo antes de qualquer ação.
Fase 2 concluída e mergeada em main com tag v0.3.0.
Branch de trabalho: feature/fase-3-gpio-animacoes (criar a partir de develop).
```

---

## Estado atual (2026-05-19)

| Fase | Status | Tag | Notas |
|---|---|---|---|
| 0 — Fundação | ✅ Concluída | v0.1.1 | — |
| 1 — Home + layout global | ✅ Concluída | v0.2.0 | — |
| 2 — Demais páginas públicas | ✅ Concluída | v0.3.0 | 12 escolas, logo tricolor, mapa corrigido |
| 3 — Módulo GPIO (animações) | ⏳ Próxima | — | — |

---

## O que foi feito na sessão anterior (2026-05-19)

### Ajustes Fase 2 (pré-publicação)
- Logo navbar: substituída imagem por texto tricolor (Aluno verde / Maker vermelho / Digital azul) com fundo branco — todas as 9 páginas
- `escolas.html`: mapa removido (movido para contato), título sem número fixo, 3 novas escolas (Pinheirinho Roxo, CeD 104, CEF 306 turma surdos/mudos)
- `contato.html`: mapa corrigido para Quadra 203 Lote 32, Recanto das Emas, CEP 72610-300
- `sobre.html`: card de inclusão surdos/mudos adicionado
- `cursos.html`: seções com preços ocultadas via `hidden`, mantidos quiz CTA + banner "em construção"
- PR #2 mergeado em develop → PR #3 develop→main mergeado → tag `v0.3.0` publicada

### Observação sobre branch protection
A `main` exige 1 review de terceiro (dono não pode aprovar o próprio PR). Para futuros merges diretos:
```bash
gh api --method DELETE repos/francenylson1/amd_site_2026/branches/main/protection/enforce_admins
gh pr merge N --merge --admin
gh api --method POST repos/francenylson1/amd_site_2026/branches/main/protection/enforce_admins
```

---

## Fase 3 — Escopo completo

### Objetivo
Entregar `animacoes.html` — visualizador interativo de circuitos GPIO para RPi5, ESP8266 e ESP32, com animações de LED, Servo, Sensor e Buzzer, e exportação PNG/ZIP.

### Tarefas (do WORKFLOW)
1. Criar branch `feature/fase-3-gpio-animacoes` a partir de `develop`
2. Implementar `animacoes.html` — layout painel esquerdo + canvas direito (SPEC §6.4)
3. Implementar `assets/js/animations-gpio.js` com hierarquia de classes (SPEC §6.1–6.2):
   - `GPIOTemplate` (base)
   - `RPi5Template` (40 pinos), `ESP8266Template` (NodeMCU), `ESP32Template` (38 pinos)
   - `AnimationController` (play/pause/stop/exportFrame/exportSequence)
   - `LEDAnimation`, `ServoAnimation`, `SensorAnimation`, `BuzzerAnimation`
4. Exportação PNG (frame atual) e ZIP via JSZip CDN (sequência)
5. Adicionar link "Animações" na navbar de todas as páginas
6. Atualizar `sitemap.xml`
7. Escrever specs E2E: `tests/e2e/gpio-animations.spec.js`
8. Rodar Lighthouse em `animacoes.html`
9. Smoke manual da nova página
10. Merge PR → tag `v0.4.0` → main

### Spec técnica chave (SPEC §6)
- **Canvas:** 800×500 desktop, 100% width mobile (≤768px painel acima do canvas)
- **Plataformas:** RPi5 (40 pinos 2×20), NodeMCU ESP8266 (D0-D8 + A0), ESP32 DevKit C (38 pinos)
- **Animações:** LED (blink/duty cycle), Servo (ângulo start→end), Sensor (valor min→max), Buzzer (frequência/waveform)
- **Exportação:** `canvas.toDataURL('image/png')` para frame; JSZip CDN para sequência ZIP com README.txt
- **JSZip:** CDN `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`
- **Estado AnimationController:** `'idle' | 'running' | 'paused' | 'stopped'`

### Tabelas de pinos (consultar SPEC §6.3 para detalhes completos)
- RPi5: 3V3 (vermelho escuro), 5V (vermelho), GND (preto), GPIO genérico (azul elétrico), I2C (roxo), SPI (amarelo), UART (verde)
- ESP8266: D0=GPIO16, D1=GPIO5(SCL), D2=GPIO4(SDA), D3=GPIO0, D4=GPIO2, D5=GPIO14(SCLK), D6=GPIO12(MISO), D7=GPIO13(MOSI), D8=GPIO15(CS), A0=ADC0
- ESP32: I2C(21/22), SPI VSPI(18/19/23/5), UART(1/3 e 16/17), DAC(25/26), Touch(2/4/12-15/27/32/33)

---

## Lembretes

- Vanilla JS — sem React, Vue ou Angular
- Todo copy e commits em pt-BR
- Rodar `npm run build:css` após qualquer mudança de CSS
- `npm run test:ci` antes de qualquer commit novo
- gh CLI em `C:\Program Files\GitHub CLI\gh.exe`
- Imagens Pinheirinho Roxo em `assets/images/escolas/pinheirinho_roxo/` (JPGs brutos — otimizar com `npm run images:optimize` antes de referenciar no HTML)
