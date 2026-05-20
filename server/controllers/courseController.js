import pool from '../db/connection.js';

export async function listCourses(_req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM courses WHERE active = TRUE ORDER BY sort_order ASC, id ASC'
  );
  res.json(rows);
}

export async function adminListCourses(_req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM courses ORDER BY sort_order ASC, id ASC'
  );
  res.json(rows);
}

export async function createCourse(req, res) {
  const { title, category, level = 'iniciante', duration, description, topics, image_url, price, price_active = false, active = true, sort_order = 0 } = req.body;
  if (!title || !category) {
    return res.status(400).json({ erro: 'title e category são obrigatórios.' });
  }
  const [result] = await pool.query(
    'INSERT INTO courses (title, category, level, duration, description, topics, image_url, price, price_active, active, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [title, category, level, duration ?? null, description ?? null, topics ?? null, image_url ?? null, price ?? null, price_active, active, sort_order]
  );
  res.status(201).json({ id: result.insertId });
}

export async function updateCourse(req, res) {
  const { id } = req.params;
  const { title, category, level, duration, description, topics, image_url, price, price_active, active, sort_order } = req.body;
  const [result] = await pool.query(
    `UPDATE courses SET
       title        = COALESCE(?, title),
       category     = COALESCE(?, category),
       level        = COALESCE(?, level),
       duration     = COALESCE(?, duration),
       description  = COALESCE(?, description),
       topics       = COALESCE(?, topics),
       image_url    = COALESCE(?, image_url),
       price        = COALESCE(?, price),
       price_active = COALESCE(?, price_active),
       active       = COALESCE(?, active),
       sort_order   = COALESCE(?, sort_order)
     WHERE id = ?`,
    [title ?? null, category ?? null, level ?? null, duration ?? null, description ?? null,
     topics ?? null, image_url ?? null, price ?? null, price_active ?? null, active ?? null, sort_order ?? null, id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Curso não encontrado.' });
  res.json({ ok: true });
}

export async function deleteCourse(req, res) {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Curso não encontrado.' });
  res.json({ ok: true });
}
