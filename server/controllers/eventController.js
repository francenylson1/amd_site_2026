import pool from '../db/connection.js';

export async function listEvents(_req, res) {
  const conn = await pool.getConnection();
  try {
    const [events] = await conn.query(
      'SELECT * FROM events WHERE active = TRUE ORDER BY sort_order ASC, id ASC'
    );
    const [photos] = await conn.query(
      'SELECT * FROM event_photos ORDER BY event_id ASC, sort_order ASC'
    );
    const photoMap = {};
    for (const p of photos) {
      (photoMap[p.event_id] ??= []).push(p);
    }
    const result = events.map(ev => ({ ...ev, photos: photoMap[ev.id] ?? [] }));
    res.json(result);
  } finally {
    conn.release();
  }
}

export async function adminListEvents(_req, res) {
  const conn = await pool.getConnection();
  try {
    const [events] = await conn.query(
      'SELECT * FROM events ORDER BY sort_order ASC, id ASC'
    );
    const [photos] = await conn.query(
      'SELECT * FROM event_photos ORDER BY event_id ASC, sort_order ASC'
    );
    const photoMap = {};
    for (const p of photos) {
      (photoMap[p.event_id] ??= []).push(p);
    }
    const result = events.map(ev => ({ ...ev, photos: photoMap[ev.id] ?? [] }));
    res.json(result);
  } finally {
    conn.release();
  }
}

export async function createEvent(req, res) {
  const { title, category, description, event_date, active = true, sort_order = 0 } = req.body;
  if (!title || !category) {
    return res.status(400).json({ erro: 'title e category são obrigatórios.' });
  }
  const [result] = await pool.query(
    'INSERT INTO events (title, category, description, event_date, active, sort_order) VALUES (?,?,?,?,?,?)',
    [title, category, description ?? null, event_date ?? null, active, sort_order]
  );
  res.status(201).json({ id: result.insertId });
}

export async function updateEvent(req, res) {
  const { id } = req.params;
  const { title, category, description, event_date, active, sort_order } = req.body;
  const [result] = await pool.query(
    `UPDATE events SET
       title       = COALESCE(?, title),
       category    = COALESCE(?, category),
       description = COALESCE(?, description),
       event_date  = COALESCE(?, event_date),
       active      = COALESCE(?, active),
       sort_order  = COALESCE(?, sort_order)
     WHERE id = ?`,
    [title ?? null, category ?? null, description ?? null, event_date ?? null,
     active ?? null, sort_order ?? null, id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Evento não encontrado.' });
  res.json({ ok: true });
}

export async function deleteEvent(req, res) {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);
  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Evento não encontrado.' });
  res.json({ ok: true });
}

export async function addPhoto(req, res) {
  const { id } = req.params;
  const { image_url, caption, sort_order = 0 } = req.body;
  if (!image_url) return res.status(400).json({ erro: 'image_url é obrigatório.' });
  const [result] = await pool.query(
    'INSERT INTO event_photos (event_id, image_url, caption, sort_order) VALUES (?,?,?,?)',
    [id, image_url, caption ?? null, sort_order]
  );
  res.status(201).json({ id: result.insertId });
}

export async function updatePhoto(req, res) {
  const { photoId } = req.params;
  const { image_url, caption, sort_order } = req.body;
  const [result] = await pool.query(
    `UPDATE event_photos SET
       image_url  = COALESCE(?, image_url),
       caption    = COALESCE(?, caption),
       sort_order = COALESCE(?, sort_order)
     WHERE id = ?`,
    [image_url ?? null, caption ?? null, sort_order ?? null, photoId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Foto não encontrada.' });
  res.json({ ok: true });
}

export async function deletePhoto(req, res) {
  const { photoId } = req.params;
  const [result] = await pool.query('DELETE FROM event_photos WHERE id = ?', [photoId]);
  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Foto não encontrada.' });
  res.json({ ok: true });
}
