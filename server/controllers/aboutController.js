import pool from '../db/connection.js';

export async function listAboutPhotos(_req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM about_photos WHERE active = TRUE ORDER BY section ASC, sort_order ASC, id ASC'
  );
  res.json(rows);
}

export async function adminListAboutPhotos(_req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM about_photos ORDER BY section ASC, sort_order ASC, id ASC'
  );
  res.json(rows);
}

export async function createAboutPhoto(req, res) {
  const { section, image_url, alt_text, sort_order = 0, active = true } = req.body;
  if (!section || !image_url) {
    return res.status(400).json({ erro: 'section e image_url são obrigatórios.' });
  }
  const [result] = await pool.query(
    'INSERT INTO about_photos (section, image_url, alt_text, sort_order, active) VALUES (?,?,?,?,?)',
    [section, image_url, alt_text ?? null, sort_order, active]
  );
  res.status(201).json({ id: result.insertId });
}

export async function updateAboutPhoto(req, res) {
  const { id } = req.params;
  const { section, image_url, alt_text, sort_order, active } = req.body;
  const [result] = await pool.query(
    `UPDATE about_photos SET
       section    = COALESCE(?, section),
       image_url  = COALESCE(?, image_url),
       alt_text   = COALESCE(?, alt_text),
       sort_order = COALESCE(?, sort_order),
       active     = COALESCE(?, active)
     WHERE id = ?`,
    [section ?? null, image_url ?? null, alt_text ?? null, sort_order ?? null, active ?? null, id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Foto não encontrada.' });
  res.json({ ok: true });
}

export async function deleteAboutPhoto(req, res) {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM about_photos WHERE id = ?', [id]);
  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Foto não encontrada.' });
  res.json({ ok: true });
}
