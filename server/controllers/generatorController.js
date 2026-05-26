import Anthropic from '@anthropic-ai/sdk';
import pool from '../db/connection.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Preços claude-sonnet-4-6 por token (USD)
const PRICE_IN  = 3.00  / 1_000_000; // $3.00/1M tokens de entrada
const PRICE_OUT = 15.00 / 1_000_000; // $15.00/1M tokens de saída
const PRICE_IN_CACHED = 0.30 / 1_000_000; // $0.30/1M tokens de cache hit

// System prompt fixo — cacheado pela API
const SYSTEM_PROMPT = `Você é o assistente de marketing do Aluno Maker Digital (AMD), \
um projeto de educação tecnológica localizado no Recanto das Emas, Brasília — DF, \
que leva computadores, robótica, programação e impressão 3D a escolas públicas e \
comunidades em situação de vulnerabilidade socioeconômica.

Valores invioláveis ao criar qualquer conteúdo:
• Tom: esperança, protagonismo, transformação e pertencimento. NUNCA reforce \
estigmas de pobreza ou vulnerabilidade — os alunos são protagonistas de suas histórias.
• Linguagem: acessível, empolgante e próxima do público jovem e das famílias.
• Slogan oficial: "Tecnologia que transforma vidas."
• Canais: Instagram, TikTok, X (Twitter/X), WhatsApp e Blog.
• Organização: Aluno Maker Digital | @alunomakerdigital | (61) 9 8133-3875
• Retorne APENAS o conteúdo solicitado, sem explicações adicionais.`;

const FORMAT_INSTRUCTIONS = {
  instagram: `Crie uma legenda para Instagram com até 2200 caracteres.
Estrutura: gancho impactante na 1ª linha, 2-3 parágrafos de corpo, chamada para ação e \
~30 hashtags relevantes ao final (separadas por espaço). Emojis com moderação.`,

  tiktok: `Crie um roteiro/legenda para TikTok de 30 a 60 segundos.
Inclua: gancho nos primeiros 3 segundos (o que aparece em tela), narração/legenda do vídeo \
e hashtags ao final (máx 10). Tom jovem, dinâmico e autêntico.`,

  twitter: `Crie uma thread para X (Twitter) com 3 a 5 tweets.
Formato: numere cada tweet (1/, 2/, ...). Cada tweet deve ter até 280 caracteres. \
O primeiro deve ser o gancho principal. Termine com uma chamada para ação.`,

  whatsapp: `Crie uma mensagem para WhatsApp/grupo de pais e responsáveis.
Máx 500 caracteres. Tom: acolhedor, direto e informativo. Sem formatação markdown.`,

  blog: `Crie um post de blog completo em português.
Estrutura obrigatória:
# Título (máx 80 caracteres, cativante e com keyword)
## Introdução (1-2 parágrafos — contexto e por que importa)
## Desenvolvimento (3-5 seções com subtítulos ## relevantes)
## Conclusão (1 parágrafo — chamada para ação e esperança)
---
*Tags sugeridas: tag1, tag2, tag3* (ao final)
Use markdown. Tom: inspirador, informativo e acessível.`,
};

async function fetchItemContext(item_type, item_id) {
  const tableMap = {
    projeto: { table: 'projects', cols: 'title, description' },
    evento:  { table: 'events',   cols: 'title, description' },
    curso:   { table: 'courses',  cols: 'name AS title, description' },
  };
  const { table, cols } = tableMap[item_type] || {};
  if (!table) return null;

  const [rows] = await pool.query(
    `SELECT ${cols} FROM ${table} WHERE id = ? LIMIT 1`, [item_id]
  );
  return rows[0] || null;
}

function buildUserPrompt({ source, item_type, item_id, theme, itemData, format, photo_ids, extra_notes }) {
  let context = '';

  if (source === 'item' && itemData) {
    context = `Tipo de conteúdo: ${item_type} (ID ${item_id})\n`;
    context += `Título: ${itemData.title}\n`;
    if (itemData.description) context += `Descrição: ${itemData.description}\n`;
  } else if (source === 'theme') {
    context = `Tema livre: ${theme}\n`;
  }

  if (photo_ids && photo_ids.length > 0) {
    context += `Fotos anexadas: ${photo_ids.length} foto(s) selecionada(s).\n`;
  }
  if (extra_notes) {
    context += `Instruções adicionais: ${extra_notes}\n`;
  }

  return `${context}\n${FORMAT_INSTRUCTIONS[format]}`;
}

export async function generate(req, res) {
  const { source, item_type, item_id, theme, formats, photo_ids, extra_notes } = req.body;

  if (!formats || !formats.length) {
    return res.status(400).json({ erro: 'Selecione ao menos um formato.' });
  }
  if (source === 'item' && (!item_type || !item_id)) {
    return res.status(400).json({ erro: 'Informe tipo e ID do item.' });
  }
  if (source === 'theme' && !theme?.trim()) {
    return res.status(400).json({ erro: 'Informe o tema.' });
  }

  const validFormats = ['instagram', 'tiktok', 'twitter', 'whatsapp', 'blog'];
  const invalid = formats.filter(f => !validFormats.includes(f));
  if (invalid.length) {
    return res.status(400).json({ erro: `Formato inválido: ${invalid.join(', ')}` });
  }

  let itemData = null;
  if (source === 'item') {
    try {
      itemData = await fetchItemContext(item_type, item_id);
    } catch {
      return res.status(500).json({ erro: 'Erro ao buscar item no banco.' });
    }
    if (!itemData) {
      return res.status(404).json({ erro: 'Item não encontrado.' });
    }
  }

  const results = [];

  for (const format of formats) {
    const userPrompt = buildUserPrompt({ source, item_type, item_id, theme, itemData, format, photo_ids, extra_notes });

    let response;
    try {
      response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' }, // prompt caching no system prompt fixo
          }
        ],
        messages: [{ role: 'user', content: userPrompt }],
      });
    } catch (err) {
      console.error(`[generator] Erro na chamada Claude (${format}):`, err.message);
      return res.status(502).json({ erro: `Erro ao chamar a API Claude: ${err.message}` });
    }

    const usage     = response.usage;
    const tokensIn  = usage.input_tokens || 0;
    const tokensOut = usage.output_tokens || 0;
    const cached    = usage.cache_read_input_tokens > 0 ? 1 : 0;

    const cacheHit     = usage.cache_read_input_tokens  || 0;
    const cacheCreate  = usage.cache_creation_input_tokens || 0;
    const normalIn     = tokensIn - cacheCreate - cacheHit;
    const costUsd      = (normalIn  * PRICE_IN)
                       + (cacheCreate * PRICE_IN * 1.25) // escrita de cache custa 1.25×
                       + (cacheHit  * PRICE_IN_CACHED)
                       + (tokensOut * PRICE_OUT);

    const output = response.content.find(b => b.type === 'text')?.text || '';

    // Persiste no banco
    try {
      await pool.query(
        `INSERT INTO generations
           (source, item_type, item_id, theme, format, output, tokens_in, tokens_out, cached, cost_usd)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          source,
          item_type || null,
          item_id   || null,
          source === 'theme' ? theme : null,
          format,
          output,
          tokensIn,
          tokensOut,
          cached,
          costUsd.toFixed(6),
        ]
      );
    } catch (err) {
      console.error('[generator] Erro ao persistir geração:', err.message);
      // não interrompe — retorna o resultado mesmo sem persistir
    }

    results.push({
      format,
      content:    output,
      tokens_in:  tokensIn,
      tokens_out: tokensOut,
      cached:     Boolean(cached),
      cost_usd:   Number(costUsd.toFixed(6)),
    });
  }

  res.json({ results });
}

export async function listGenerations(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, source, item_type, item_id, theme, format,
              LEFT(output, 200) AS output_preview,
              tokens_in, tokens_out, cached, cost_usd, created_at
       FROM generations
       ORDER BY created_at DESC
       LIMIT 100`
    );

    const [[costRow]] = await pool.query(
      `SELECT COALESCE(SUM(cost_usd), 0) AS month_cost
       FROM generations
       WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`
    );

    res.json({
      generations: rows,
      month_cost: Number(costRow.month_cost).toFixed(4),
    });
  } catch (err) {
    console.error('[generator] Erro ao listar gerações:', err.message);
    res.status(500).json({ erro: 'Erro ao buscar histórico.' });
  }
}
