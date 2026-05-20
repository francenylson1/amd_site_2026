import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../db/connection.js', () => {
  const query   = vi.fn();
  const release = vi.fn();
  const conn    = { query, release };
  const pool    = { query, getConnection: vi.fn().mockResolvedValue(conn) };
  return { ...pool, default: pool };
});

const { default: request } = await import('supertest');
const { default: app }     = await import('../../index.js');
const { default: db }      = await import('../../db/connection.js');

// ── Eventos públicos ──────────────────────────────────────────────────────────
describe('GET /api/events', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna lista de eventos com fotos agrupadas', async () => {
    const conn = await db.getConnection();
    conn.query
      .mockResolvedValueOnce([[{ id: 1, title: 'Campus Party', category: 'campus-party', active: 1, sort_order: 10 }]])
      .mockResolvedValueOnce([[{ id: 1, event_id: 1, image_url: 'assets/images/eventos/cp/foto1.webp', caption: 'Foto 1', sort_order: 10 }]]);

    const res = await request(app).get('/api/events');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].photos).toHaveLength(1);
    expect(res.body[0].title).toBe('Campus Party');
  });
});

// ── Projetos públicos ─────────────────────────────────────────────────────────
describe('GET /api/projects', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna lista de projetos ativos', async () => {
    db.query.mockResolvedValueOnce([[
      { id: 1, title: 'Robô Garçom', category: 'roborica', active: 1 },
    ]]);

    const res = await request(app).get('/api/projects');

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe('Robô Garçom');
  });
});

// ── Escolas públicas ──────────────────────────────────────────────────────────
describe('GET /api/schools', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna lista de escolas ativas', async () => {
    db.query.mockResolvedValueOnce([[
      { id: 1, name: 'CEF 101', location: 'Recanto das Emas', active: 1 },
    ]]);

    const res = await request(app).get('/api/schools');

    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('CEF 101');
  });
});

// ── Cursos públicos ───────────────────────────────────────────────────────────
describe('GET /api/courses', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna lista de cursos ativos', async () => {
    db.query.mockResolvedValueOnce([[
      { id: 1, title: 'Robótica com Python', category: 'alunos', active: 1, price_active: 0 },
    ]]);

    const res = await request(app).get('/api/courses');

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe('Robótica com Python');
  });
});

// ── Admin — cria projeto ──────────────────────────────────────────────────────
describe('POST /api/admin/projects (requer auth)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna 401 sem token', async () => {
    const res = await request(app)
      .post('/api/admin/projects')
      .send({ title: 'Novo Robô', category: 'roborica' });

    expect(res.status).toBe(401);
  });
});

// ── Admin — cria evento ───────────────────────────────────────────────────────
describe('POST /api/admin/events (requer auth)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna 401 sem token', async () => {
    const res = await request(app)
      .post('/api/admin/events')
      .send({ title: 'Novo Evento', category: 'robotica' });

    expect(res.status).toBe(401);
  });
});
