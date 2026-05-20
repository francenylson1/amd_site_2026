import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPhone,
  isValidDate,
  isFutureOrToday,
  notEmpty,
  maxLen,
} from '../../middleware/validate.js';

describe('isValidEmail', () => {
  it('aceita e-mail válido', () => {
    expect(isValidEmail('francenylson@gmail.com')).toBe(true);
    expect(isValidEmail('a+b@example.co.uk')).toBe(true);
  });

  it('rejeita e-mail inválido', () => {
    expect(isValidEmail('semArroba')).toBe(false);
    expect(isValidEmail('@dominio.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('aceita telefone válido', () => {
    expect(isValidPhone('(61) 98133-3875')).toBe(true);
    expect(isValidPhone('61981333875')).toBe(true);
    expect(isValidPhone('')).toBe(true);
    expect(isValidPhone(null)).toBe(true);
  });

  it('rejeita telefone inválido', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('abcd-efgh')).toBe(false);
  });
});

describe('isValidDate', () => {
  it('aceita formato AAAA-MM-DD', () => {
    expect(isValidDate('2026-06-15')).toBe(true);
  });

  it('rejeita formatos incorretos', () => {
    expect(isValidDate('15/06/2026')).toBe(false);
    expect(isValidDate('')).toBe(false);
    expect(isValidDate(null)).toBe(false);
  });
});

describe('isFutureOrToday', () => {
  it('aceita data de hoje', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(isFutureOrToday(today)).toBe(true);
  });

  it('aceita data futura', () => {
    expect(isFutureOrToday('2099-01-01')).toBe(true);
  });

  it('rejeita data passada', () => {
    expect(isFutureOrToday('2020-01-01')).toBe(false);
  });
});

describe('notEmpty', () => {
  it('retorna true para string não vazia', () => {
    expect(notEmpty('João')).toBe(true);
    expect(notEmpty('  a  ')).toBe(true);
  });

  it('retorna false para string vazia ou non-string', () => {
    expect(notEmpty('')).toBe(false);
    expect(notEmpty('   ')).toBe(false);
    expect(notEmpty(null)).toBe(false);
    expect(notEmpty(42)).toBe(false);
  });
});

describe('maxLen', () => {
  it('retorna true quando dentro do limite', () => {
    expect(maxLen('abc', 10)).toBe(true);
    expect(maxLen('abc', 3)).toBe(true);
  });

  it('retorna false quando excede o limite', () => {
    expect(maxLen('abcd', 3)).toBe(false);
    expect(maxLen(null, 10)).toBe(false);
  });
});
