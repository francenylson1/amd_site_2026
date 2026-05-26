import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do banco de dados
vi.mock('../../db/connection.js', () => {
  const query = vi.fn();
  const pool  = { query };
  return { ...pool, default: pool };
});

// Mock do SDK Anthropic
vi.mock('@anthropic-ai/sdk', () => {
  const createFn = vi.fn();
  const Anthropic = vi.fn(() => ({
    messages: { create: createFn },
  }));
  Anthropic._createFn = createFn;
  return { default: Anthropic };
});

const { default: db }        = await import('../../db/connection.js');
const { default: Anthropic } = await import('@anthropic-ai/sdk');
const { generate, listGenerations } = await import('../../controllers/generatorController.js');

function makeRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json:   vi.fn().mockReturnThis(),
  };
  return res;
}

function makeReq(body = {}) {
  return { body };
}

describe('generatorController.generate — validações', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna 400 quando formats está vazio', async () => {
    const req = makeReq({ source: 'theme', theme: 'Robótica', formats: [] });
    const res = makeRes();
    await generate(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('retorna 400 quando source=item sem item_type', async () => {
    const req = makeReq({ source: 'item', formats: ['instagram'] });
    const res = makeRes();
    await generate(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('retorna 400 quando source=theme sem theme', async () => {
    const req = makeReq({ source: 'theme', theme: '   ', formats: ['instagram'] });
    const res = makeRes();
    await generate(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('retorna 400 para formato inválido', async () => {
    const req = makeReq({ source: 'theme', theme: 'Robótica', formats: ['linkedin'] });
    const res = makeRes();
    await generate(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('generatorController.generate — chamada Claude e persistência', () => {
  beforeEach(() => vi.clearAllMocks());

  it('chama Claude e persiste no banco para source=theme', async () => {
    const mockResponse = {
      content: [{ type: 'text', text: 'Legenda gerada para Instagram!' }],
      usage: {
        input_tokens: 500,
        output_tokens: 120,
        cache_read_input_tokens: 400,
        cache_creation_input_tokens: 0,
      },
    };
    Anthropic._createFn.mockResolvedValue(mockResponse);
    db.query.mockResolvedValue([{ insertId: 1 }]);

    const req = makeReq({
      source: 'theme',
      theme: 'Inauguração do laboratório',
      formats: ['instagram'],
    });
    const res = makeRes();
    await generate(req, res);

    expect(Anthropic._createFn).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalled(); // INSERT na tabela generations
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        results: expect.arrayContaining([
          expect.objectContaining({
            format: 'instagram',
            content: 'Legenda gerada para Instagram!',
            cached: true,
          }),
        ]),
      })
    );
  });

  it('gera múltiplos formatos em sequência', async () => {
    const mockResponse = {
      content: [{ type: 'text', text: 'Conteúdo gerado.' }],
      usage: {
        input_tokens: 300,
        output_tokens: 80,
        cache_read_input_tokens: 0,
        cache_creation_input_tokens: 200,
      },
    };
    Anthropic._createFn.mockResolvedValue(mockResponse);
    db.query.mockResolvedValue([{ insertId: 1 }]);

    const req = makeReq({
      source: 'theme',
      theme: 'Campus Party Brasília',
      formats: ['instagram', 'whatsapp'],
    });
    const res = makeRes();
    await generate(req, res);

    expect(Anthropic._createFn).toHaveBeenCalledTimes(2);
    const { results } = res.json.mock.calls[0][0];
    expect(results).toHaveLength(2);
    expect(results.map(r => r.format)).toEqual(['instagram', 'whatsapp']);
  });
});

describe('generatorController.listGenerations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna generations e custo do mês', async () => {
    const rows = [
      { id: 1, source: 'theme', theme: 'Robótica', format: 'instagram',
        output_preview: 'Conteúdo...', tokens_in: 300, tokens_out: 100,
        cached: 0, cost_usd: 0.002, created_at: new Date().toISOString() },
    ];
    const costRow = [{ month_cost: '0.0020' }];
    db.query
      .mockResolvedValueOnce([rows])
      .mockResolvedValueOnce([[costRow[0]]]);

    const req = makeReq();
    const res = makeRes();
    await listGenerations(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        generations: expect.arrayContaining([expect.objectContaining({ id: 1 })]),
        month_cost: expect.any(String),
      })
    );
  });
});
