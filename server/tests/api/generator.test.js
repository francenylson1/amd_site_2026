import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

// Mock do banco de dados
vi.mock('../../db/connection.js', () => {
  const query   = vi.fn();
  const release = vi.fn();
  const conn    = { query, release };
  const pool    = { query, getConnection: vi.fn().mockResolvedValue(conn) };
  return { ...pool, default: pool };
});

// Mock do SDK Anthropic (evita chamadas reais na API)
vi.mock('@anthropic-ai/sdk', () => {
  const createFn = vi.fn();
  const Anthropic = vi.fn(() => ({
    messages: { create: createFn },
  }));
  Anthropic._createFn = createFn;
  return { default: Anthropic };
});

const { default: request }   = await import('supertest');
const { default: app }        = await import('../../index.js');
const { default: db }         = await import('../../db/connection.js');
const { default: Anthropic }  = await import('@anthropic-ai/sdk');

function makeToken() {
  const secret = process.env.JWT_SECRET || 'amd-secret-dev';
  return jwt.sign({ id: 1, email: 'admin@test.com' }, secret, { expiresIn: '1h' });
}

describe('POST /api/admin/generate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna 401 sem token', async () => {
    const res = await request(app)
      .post('/api/admin/generate')
      .send({ source: 'theme', theme: 'Robótica', formats: ['instagram'] });
    expect(res.status).toBe(401);
  });

  it('retorna 400 sem formats', async () => {
    const res = await request(app)
      .post('/api/admin/generate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ source: 'theme', theme: 'Robótica', formats: [] });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erro');
  });

  it('retorna 200 com resultado válido para tema livre', async () => {
    const mockResponse = {
      content: [{ type: 'text', text: 'Legenda gerada!' }],
      usage: {
        input_tokens: 200,
        output_tokens: 50,
        cache_read_input_tokens: 150,
        cache_creation_input_tokens: 0,
      },
    };
    Anthropic._createFn.mockResolvedValue(mockResponse);
    db.query.mockResolvedValue([{ insertId: 1 }]);

    const res = await request(app)
      .post('/api/admin/generate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ source: 'theme', theme: 'Tecnologia nas escolas', formats: ['instagram'] });

    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(1);
    expect(res.body.results[0].format).toBe('instagram');
    expect(res.body.results[0].content).toBe('Legenda gerada!');
    expect(res.body.results[0].cached).toBe(true);
  });

  it('retorna 400 para formato desconhecido', async () => {
    const res = await request(app)
      .post('/api/admin/generate')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ source: 'theme', theme: 'Robótica', formats: ['snapchat'] });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/admin/generations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/admin/generations');
    expect(res.status).toBe(401);
  });

  it('retorna lista de gerações com custo', async () => {
    const rows = [
      { id: 1, source: 'theme', theme: 'Robótica', format: 'instagram',
        output_preview: 'Conteúdo...', tokens_in: 300, tokens_out: 100,
        cached: 0, cost_usd: 0.002, created_at: new Date().toISOString() },
    ];
    db.query
      .mockResolvedValueOnce([rows])
      .mockResolvedValueOnce([[{ month_cost: '0.0020' }]]);

    const res = await request(app)
      .get('/api/admin/generations')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('generations');
    expect(res.body).toHaveProperty('month_cost');
    expect(Array.isArray(res.body.generations)).toBe(true);
  });
});
