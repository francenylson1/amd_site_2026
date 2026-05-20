import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../db/connection.js', () => {
  const execute = vi.fn();
  const pool = { execute };
  return { ...pool, default: pool };
});

vi.mock('../../services/emailService.js', () => ({
  notifyNewContact: vi.fn().mockResolvedValue(undefined),
  notifyNewVisit:   vi.fn().mockResolvedValue(undefined),
}));

const { default: request } = await import('supertest');
const { default: app }     = await import('../../index.js');
const { default: db }      = await import('../../db/connection.js');

const FUTURE_DATE = '2099-12-31';

describe('POST /api/visits', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const payload = {
    name:       'João Costa',
    email:      'joao@exemplo.com',
    phone:      '(61) 98133-3875',
    visit_date: FUTURE_DATE,
    message:    'Quero visitar a escola.',
  };

  it('retorna 201 com dados válidos', async () => {
    db.execute.mockResolvedValueOnce([{ insertId: 7 }]);

    const res = await request(app).post('/api/visits').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(7);
  });

  it('retorna 422 se visit_date no passado', async () => {
    const res = await request(app)
      .post('/api/visits')
      .send({ ...payload, visit_date: '2020-01-01' });

    expect(res.status).toBe(422);
    expect(res.body.erros.some((e) => e.includes('visit_date'))).toBe(true);
  });

  it('retorna 422 se formato de data inválido', async () => {
    const res = await request(app)
      .post('/api/visits')
      .send({ ...payload, visit_date: '31/12/2099' });

    expect(res.status).toBe(422);
  });

  it('retorna 422 se e-mail inválido', async () => {
    const res = await request(app)
      .post('/api/visits')
      .send({ ...payload, email: 'nao-e-email' });

    expect(res.status).toBe(422);
  });

  it('aceita telefone vazio (campo opcional)', async () => {
    db.execute.mockResolvedValueOnce([{ insertId: 8 }]);

    const res = await request(app)
      .post('/api/visits')
      .send({ ...payload, phone: '' });

    expect(res.status).toBe(201);
  });
});
