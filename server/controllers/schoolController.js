import pool from '../db/connection.js';

export async function listSchools(_req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM schools WHERE active = TRUE ORDER BY sort_order ASC, id ASC'
  );
  res.json(rows);
}

export async function adminListSchools(_req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM schools ORDER BY sort_order ASC, id ASC'
  );
  res.json(rows);
}

export async function createSchool(req, res) {
  const { name, location, description, image_url, year_since, levels, icon_variant = 'default', active = true, sort_order = 0 } = req.body;
  if (!name) return res.status(400).json({ erro: 'name é obrigatório.' });
  const [result] = await pool.query(
    'INSERT INTO schools (name, location, description, image_url, year_since, levels, icon_variant, active, sort_order) VALUES (?,?,?,?,?,?,?,?,?)',
    [name, location ?? null, description ?? null, image_url ?? null, year_since ?? null, levels ?? null, icon_variant, active, sort_order]
  );
  res.status(201).json({ id: result.insertId });
}

export async function updateSchool(req, res) {
  const { id } = req.params;
  const { name, location, description, image_url, year_since, levels, icon_variant, active, sort_order } = req.body;
  const [result] = await pool.query(
    `UPDATE schools SET
       name         = COALESCE(?, name),
       location     = COALESCE(?, location),
       description  = COALESCE(?, description),
       image_url    = COALESCE(?, image_url),
       year_since   = COALESCE(?, year_since),
       levels       = COALESCE(?, levels),
       icon_variant = COALESCE(?, icon_variant),
       active       = COALESCE(?, active),
       sort_order   = COALESCE(?, sort_order)
     WHERE id = ?`,
    [name ?? null, location ?? null, description ?? null, image_url ?? null,
     year_since ?? null, levels ?? null, icon_variant ?? null, active ?? null, sort_order ?? null, id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Escola não encontrada.' });
  res.json({ ok: true });
}

export async function deleteSchool(req, res) {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM schools WHERE id = ?', [id]);
  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Escola não encontrada.' });
  res.json({ ok: true });
}
