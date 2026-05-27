import sanitizeHtml from 'sanitize-html';
import pool from '../db/connection.js';

const ALLOWED_TAGS = [
  'h1','h2','h3','h4','h5','h6','p','br','strong','em','u','s',
  'ul','ol','li','blockquote','pre','code','a','img',
  'table','thead','tbody','tr','th','td',
];

const ALLOWED_ATTRS = {
  a:   ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height', 'loading'],
  '*': ['class'],
};

function sanitize(html) {
  return sanitizeHtml(html, { allowedTags: ALLOWED_TAGS, allowedAttributes: ALLOWED_ATTRS });
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ── Público ──────────────────────────────────────────────────────────────────

export async function listPosts(req, res) {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  const conn = await pool.getConnection();
  try {
    const [[{ total }]] = await conn.query(
      "SELECT COUNT(*) AS total FROM blog_posts WHERE status = 'published'"
    );
    const [posts] = await conn.query(
      `SELECT id, slug, title, excerpt, cover_image, youtube_id, published_at, created_at
       FROM blog_posts
       WHERE status = 'published'
       ORDER BY published_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } finally {
    conn.release();
  }
}

export async function getPost(req, res) {
  const { slug } = req.params;
  const conn = await pool.getConnection();
  try {
    const [[post]] = await conn.query(
      "SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'",
      [slug]
    );
    if (!post) return res.status(404).json({ erro: 'Post não encontrado.' });
    res.json(post);
  } finally {
    conn.release();
  }
}

// ── Admin ────────────────────────────────────────────────────────────────────

export async function adminListPosts(_req, res) {
  const [posts] = await pool.query(
    'SELECT id, slug, title, status, published_at, created_at FROM blog_posts ORDER BY id DESC'
  );
  res.json(posts);
}

export async function createPost(req, res) {
  const { title, excerpt, content, cover_image, youtube_id, status = 'draft' } = req.body;
  let { slug } = req.body;

  if (!title || !content) {
    return res.status(400).json({ erro: 'title e content são obrigatórios.' });
  }
  if (!['draft', 'published'].includes(status)) {
    return res.status(400).json({ erro: 'status deve ser draft ou published.' });
  }

  slug = slug ? slugify(slug) : slugify(title);
  if (!slug) return res.status(400).json({ erro: 'Slug inválido.' });

  const cleanContent = sanitize(content);
  const published_at = status === 'published' ? new Date() : null;

  try {
    const [result] = await pool.query(
      `INSERT INTO blog_posts (slug, title, excerpt, content, cover_image, youtube_id, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [slug, title, excerpt ?? null, cleanContent, cover_image ?? null, youtube_id ?? null, status, published_at]
    );
    res.status(201).json({ id: result.insertId, slug });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: `Slug "${slug}" já existe.` });
    }
    throw err;
  }
}

export async function updatePost(req, res) {
  const { id } = req.params;
  const { title, excerpt, content, cover_image, youtube_id, status } = req.body;
  let { slug } = req.body;

  if (status && !['draft', 'published'].includes(status)) {
    return res.status(400).json({ erro: 'status deve ser draft ou published.' });
  }

  if (slug) slug = slugify(slug);

  const cleanContent = content ? sanitize(content) : undefined;

  // Determinar published_at: setar só na primeira publicação
  let published_at_clause = '';
  const values = [];

  if (status === 'published') {
    published_at_clause = ', published_at = COALESCE(published_at, NOW())';
  } else if (status === 'draft') {
    published_at_clause = ', published_at = NULL';
  }

  const [result] = await pool.query(
    `UPDATE blog_posts SET
       title       = COALESCE(?, title),
       slug        = COALESCE(?, slug),
       excerpt     = COALESCE(?, excerpt),
       content     = COALESCE(?, content),
       cover_image = COALESCE(?, cover_image),
       youtube_id  = COALESCE(?, youtube_id),
       status      = COALESCE(?, status)
       ${published_at_clause}
     WHERE id = ?`,
    [
      title ?? null,
      slug ?? null,
      excerpt ?? null,
      cleanContent ?? null,
      cover_image ?? null,
      youtube_id ?? null,
      status ?? null,
      ...values,
      id,
    ]
  );

  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Post não encontrado.' });
  res.json({ ok: true });
}

export async function deletePost(req, res) {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM blog_posts WHERE id = ?', [id]);
  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Post não encontrado.' });
  res.json({ ok: true });
}
