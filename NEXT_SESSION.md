
  Próxima sessão: Fase 1 — Home + Layout Global

  Quando quiser começar, abra uma nova sessão e cole:

  Iniciar a Fase 1 do projeto Aluno Maker Digital.
  Leia o CLAUDE.md primeiro. A Fase 0 está concluída (tag v0.1.1).

Antes de qualquer ação, me apresente:
1. Um plano enxuto da Fase 1 (tarefas em ordem).
2. As dependências/decisões que precisa de mim 
3. Quais comandos você vai rodar localmente (npm install, git init, etc.).

Só comece a executar depois que eu aprovar o plano.
```


## Lembretes

- Mantém `Opus 4.7` reservado para Fases 3, 4 e 5 (decisões arquiteturais e módulo GPIO). Para o resto, `Sonnet 4.6` basta.
- Memória já carrega: idioma pt-BR, rotina de atualização do `CLAUDE.md`, contexto não-derivável (Recanto das Emas, vulnerabilidade social).

---

## Pendências desta sessão (2026-05-16) — FAZER PRIMEIRO AMANHÃ

### 1. Watcher de vídeos (`assets/videos/`)
- Watcher atual só processa imagens. Vídeos foram adicionados mas não tratados.
- Vídeos precisam de **ffmpeg** (ferramenta de sistema) para compressão real.
- **Perguntar ao Fran antes de implementar:**
  - Opção A: ffmpeg instalado → comprimir mp4 + gerar poster WebP automático
  - Opção B: só gerar poster/thumbnail do primeiro frame
  - Opção C: só monitorar/logar (sem compressão, sem dependência externa)

### 2. Corrigir `foto_3.jpeg`
- Arquivo JPEG corrompido — descartar ou substituir por outra foto.

### 3. Commit do watcher de imagens
```bash
git add scripts/ package.json package-lock.json
git commit -m "feat(imagens): watcher automático WebP com sharp + chokidar"
```

---

## Sequência após resolver watcher de vídeos

4. `git checkout -b feature/fase-1-home`
5. CSS: `variables.css`, `main.css`, `components.css`, `animations.css`, `responsive.css`
6. JS: `main.js`, `navbar.js`, `animations.js`, `counter.js`, `forms.js`, `quiz.js`
7. `index.html` completo + `obrigado.html`
8. `tests/e2e/home.spec.js` (substitui `placeholder.spec.js`)
9. Checar thresholds Lighthouse na home

---

## Estado das imagens (2026-05-16)
- 167 imagens encontradas → 166 WebPs gerados com sucesso
- 1 erro: `foto_3.jpeg` (JPEG inválido/corrompido)
- `npm run dev` = servidor porta 5500 + watcher de imagens juntos
- `npm run images:optimize` = processamento em lote (já rodado hoje)
