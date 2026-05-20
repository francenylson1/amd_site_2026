import db from '../db/connection.js';

export async function listFlags(req, res) {
  try {
    const [rows] = await db.execute('SELECT key_, enabled FROM feature_flags');
    const flags = {};
    rows.forEach((r) => { flags[r.key_] = Boolean(r.enabled); });
    return res.json(flags);
  } catch (err) {
    console.error('Erro ao buscar feature flags:', err.message);
    return res.json({ gpio: true, admin: true, generator: false, store: false });
  }
}
