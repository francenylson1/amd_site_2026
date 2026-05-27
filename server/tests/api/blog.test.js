import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

vi.mock('../../db/connection.js', () => {
  const query      = vi.fn();
  const release    = vi.fn();
  const conn       = { query, release };
  const pool       = { query, getConnection: vi.fn().mockResolvedValue(conn) };
  return { ...pool, default: pool };
});

vi.mock('sanitize-html', () => ({
  default: vi.fn(html => html),
}));

const { default: request } = await import('supertest');
const { default: app }     = await import('../../index.js');
const { default: db }      = await import('../../db/connection.js');

function makeToken() {
  const secret = process.env.JWT_SECRET || 'amd-secret-dev';
  return jwt.sign({ id: 1, email: 'admin@test.com' }, secret, { expiresIn: '1h' });
}

describe('GET /api/posts (público)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna lista paginada de posts publicados', async () => {
    const conn = { query: vi.fn(), release: vi.fn() };
    db.getConnection.mockResolvedValue(conn);
    conn.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1, slug: 'meu-post', title: 'Meu Post', status: 'published' }]]);

    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('posts');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('pages');
  });

  it('retorna 404 para slug inexistente', async () => {
    const conn = { query: vi.fn(), release: vi.fn() };
    db.getConnection.mockResolvedValue(conn);
    conn.query.mockResolvedValueOnce([[]]); // nenhum resultado
    const res = await request(app).get('/api/posts/slug-nao-existe');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/admin/posts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna 401 sem token', async () => {
    const res = await request(app).post('/api/admin/posts').send({ title: 'T', content: 'C' });
    expect(res.status).toBe(401);
  });

  it('retorna 400 quando title está ausente', async () => {
    const res = await request(app)
      .post('/api/admin/posts')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ content: 'Corpo do post' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erro');
  });

  it('retorna 201 ao criar post com dados válidos', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 5 }]);
    const res = await request(app)
      .post('/api/admin/posts')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ title: 'Post Novo', content: '<p>Texto</p>' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 5);
    expect(res.body).toHaveProperty('slug', 'post-novo');
  });

  it('retorna 409 para slug duplicado', async () => {
    const dupErr = new Error('Duplicate entry');
    dupErr.code = 'ER_DUP_ENTRY';
    db.query.mockRejectedValueOnce(dupErr);
    const res = await request(app)
      .post('/api/admin/posts')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ title: 'Post Novo', content: '<p>Texto</p>' });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/admin/posts/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna 401 sem token', async () => {
    const res = await request(app).delete('/api/admin/posts/1');
    expect(res.status).toBe(401);
  });

  it('retorna 404 para id inexistente', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app)
      .delete('/api/admin/posts/999')
      .set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(404);
  });

  it('retorna 200 ao excluir post existente', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app)
      .delete('/api/admin/posts/1')
      .set('Authorization', `Bearer ${makeToken()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});
