import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

vi.mock('../../db/connection.js', () => {
  const execute = vi.fn();
  const pool = { execute };
  return { ...pool, default: pool };
});

vi.mock('../../services/emailService.js', () => ({
  notifyNewContact: vi.fn().mockResolvedValue(undefined),
  notifyNewVisit:   vi.fn().mockResolvedValue(undefined),
}));

// bcrypt.compare é lento; mock para não travar os testes
vi.mock('bcrypt', () => {
  const compare = vi.fn();
  const hash    = vi.fn();
  const mock    = { compare, hash };
  return { ...mock, default: mock };
});

process.env.JWT_SECRET = 'segredo-de-teste-fase4';

const { default: request } = await import('supertest');
const { default: app }     = await import('../../index.js');
const { default: db }      = await import('../../db/connection.js');
const { default: bcrypt }  = await import('bcrypt');

function makeToken(payload = {}) {
  return jwt.sign({ id: 1, email: 'admin@amd.com', ...payload }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('POST /api/admin/login', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('retorna 400 sem e-mail ou senha', async () => {
    const res = await request(app).post('/api/admin/login').send({});
    expect(res.status).toBe(400);
  });

  it('retorna 401 se usuário não existe', async () => {
    db.execute.mockResolvedValueOnce([[]]); // sem linhas

    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'x@y.com', password: '123' });

    expect(res.status).toBe(401);
  });

  it('retorna 401 se senha incorreta', async () => {
    db.execute.mockResolvedValueOnce([[{ id: 1, email: 'admin@amd.com', password_hash: '$2b$...' }]]);
    bcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'admin@amd.com', password: 'errada' });

    expect(res.status).toBe(401);
  });

  it('retorna 200 e token com credenciais corretas', async () => {
    db.execute.mockResolvedValueOnce([[{ id: 1, email: 'admin@amd.com', password_hash: '$2b$...' }]]);
    bcrypt.compare.mockResolvedValueOnce(true);

    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'admin@amd.com', password: 'correta' });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
  });
});

describe('GET /api/admin/contacts', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/admin/contacts');
    expect(res.status).toBe(401);
  });

  it('retorna 401 com token inválido', async () => {
    const res = await request(app)
      .get('/api/admin/contacts')
      .set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(401);
  });

  it('retorna lista de contatos com token válido', async () => {
    const mockContacts = [
      { id: 1, name: 'Ana', email: 'ana@ex.com', subject: 'Oi', message: 'Olá!', read_at: null, created_at: new Date() },
    ];
    db.execute.mockResolvedValueOnce([mockContacts]);

    const res = await request(app)
      .get('/api/admin/contacts')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('Ana');
  });
});

describe('GET /api/admin/visits', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/admin/visits');
    expect(res.status).toBe(401);
  });

  it('retorna lista de agendamentos com token válido', async () => {
    const mockVisits = [
      { id: 1, name: 'Pedro', email: 'p@ex.com', phone: '', visit_date: '2099-01-01', message: '', status: 'pending', created_at: new Date() },
    ];
    db.execute.mockResolvedValueOnce([mockVisits]);

    const res = await request(app)
      .get('/api/admin/visits')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body[0].status).toBe('pending');
  });
});

describe('GET /api/feature-flags', () => {
  it('retorna objeto de flags sem autenticação', async () => {
    db.execute.mockResolvedValueOnce([[
      { key_: 'gpio', enabled: 1 },
      { key_: 'admin', enabled: 1 },
    ]]);

    const res = await request(app).get('/api/feature-flags');

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body.gpio).toBe(true);
  });
});

describe('GET /api/health', () => {
  it('retorna status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
