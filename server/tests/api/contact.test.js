import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks antes de qualquer import dinâmico
// Para interop CJS/ESM: spread as propriedades no topo E define default,
// assim tanto `require()` (CJS) quanto `import default` (ESM) recebem a mesma instância.
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

describe('POST /api/contact', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const payload = {
    name:    'Maria Silva',
    email:   'maria@exemplo.com',
    subject: 'Dúvida sobre cursos',
    message: 'Gostaria de saber mais sobre os cursos disponíveis.',
  };

  it('retorna 201 com dados válidos', async () => {
    db.execute.mockResolvedValueOnce([{ insertId: 42 }]);

    const res = await request(app).post('/api/contact').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 42 });
    expect(db.execute).toHaveBeenCalledOnce();
  });

  it('retorna 422 se nome está vazio', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...payload, name: '' });

    expect(res.status).toBe(422);
    expect(res.body.erros).toBeDefined();
  });

  it('retorna 422 se e-mail inválido', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...payload, email: 'invalido' });

    expect(res.status).toBe(422);
  });

  it('retorna 422 se mensagem está vazia', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...payload, message: '' });

    expect(res.status).toBe(422);
  });

  it('retorna 500 se banco falhar', async () => {
    db.execute.mockRejectedValueOnce(new Error('conexão recusada'));

    const res = await request(app).post('/api/contact').send(payload);

    expect(res.status).toBe(500);
  });
});
