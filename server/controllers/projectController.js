import pool from '../db/connection.js';

export async function listProjects(_req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM projects WHERE active = TRUE ORDER BY sort_order ASC, id ASC'
  );
  res.json(rows);
}

export async function adminListProjects(_req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM projects ORDER BY sort_order ASC, id ASC'
  );
  res.json(rows);
}

export async function createProject(req, res) {
  const { title, category, short_desc, full_desc, image_url, tags, active = true, sort_order = 0 } = req.body;
  if (!title || !category) {
    return res.status(400).json({ erro: 'title e category são obrigatórios.' });
  }
  const [result] = await pool.query(
    'INSERT INTO projects (title, category, short_desc, full_desc, image_url, tags, active, sort_order) VALUES (?,?,?,?,?,?,?,?)',
    [title, category, short_desc ?? null, full_desc ?? null, image_url ?? null, tags ?? null, active, sort_order]
  );
  res.status(201).json({ id: result.insertId });
}

export async function updateProject(req, res) {
  const { id } = req.params;
  const { title, category, short_desc, full_desc, image_url, tags, active, sort_order } = req.body;
  const [result] = await pool.query(
    `UPDATE projects SET
       title      = COALESCE(?, title),
       category   = COALESCE(?, category),
       short_desc = COALESCE(?, short_desc),
       full_desc  = COALESCE(?, full_desc),
       image_url  = COALESCE(?, image_url),
       tags       = COALESCE(?, tags),
       active     = COALESCE(?, active),
       sort_order = COALESCE(?, sort_order)
     WHERE id = ?`,
    [title ?? null, category ?? null, short_desc ?? null, full_desc ?? null,
     image_url ?? null, tags ?? null, active ?? null, sort_order ?? null, id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Projeto não encontrado.' });
  res.json({ ok: true });
}

export async function deleteProject(req, res) {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Projeto não encontrado.' });
  res.json({ ok: true });
}
