import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../db/connection.js', () => {
  const query = vi.fn();
  const getConnection = vi.fn(() => ({ query, release: vi.fn() }));
  const pool = { query, getConnection };
  return { ...pool, default: pool };
});

vi.mock('sanitize-html', () => ({
  default: vi.fn(html => html),
}));

const { default: db } = await import('../../db/connection.js');
const {
  listPosts, getPost,
  adminListPosts, createPost, updatePost, deletePost,
} = await import('../../controllers/blogController.js');

function makeRes() {
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  return res;
}

describe('blogController — validações', () => {
  beforeEach(() => vi.clearAllMocks());

  it('createPost retorna 400 quando title está ausente', async () => {
    const res = makeRes();
    await createPost({ body: { content: 'corpo' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ erro: expect.any(String) }));
  });

  it('createPost retorna 400 quando content está ausente', async () => {
    const res = makeRes();
    await createPost({ body: { title: 'Título' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('createPost retorna 400 para status inválido', async () => {
    const res = makeRes();
    await createPost({ body: { title: 'T', content: 'C', status: 'invalid' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updatePost retorna 400 para status inválido', async () => {
    const res = makeRes();
    await updatePost({ params: { id: '1' }, body: { status: 'nope' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updatePost retorna 404 quando post não existe', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = makeRes();
    await updatePost({ params: { id: '99' }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deletePost retorna 404 quando post não existe', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = makeRes();
    await deletePost({ params: { id: '99' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('createPost insere no banco e retorna 201 com id e slug', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 42 }]);
    const res = makeRes();
    await createPost({ body: { title: 'Meu Post', content: '<p>Texto</p>' } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 42, slug: 'meu-post' }));
  });
});
