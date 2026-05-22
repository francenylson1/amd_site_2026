import pool from '../db/connection.js';

export async function getConfigPublic(_req, res) {
  const [rows] = await pool.query(
    'SELECT config_key, config_value FROM site_config'
  );
  const config = Object.fromEntries(rows.map(r => [r.config_key, r.config_value ?? '']));
  res.json(config);
}

export async function listConfig(_req, res) {
  const [rows] = await pool.query(
    'SELECT config_key, config_value, label FROM site_config ORDER BY config_key ASC'
  );
  res.json(rows);
}

export async function updateConfig(req, res) {
  const updates = req.body;
  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
    return res.status(400).json({ erro: 'Body deve ser um objeto { chave: valor }.' });
  }
  const entries = Object.entries(updates);
  if (!entries.length) return res.status(400).json({ erro: 'Nenhum campo para atualizar.' });

  for (const [key, value] of entries) {
    await pool.query(
      'UPDATE site_config SET config_value = ? WHERE config_key = ?',
      [String(value ?? ''), key]
    );
  }
  res.json({ ok: true });
}
