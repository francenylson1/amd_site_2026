import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             5,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});

// Rate limit por hora para o gerador Claude (10 req/hora por IP)
export const generateHourLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { erro: 'Limite de 10 gerações por hora atingido. Tente mais tarde.' },
});

// Rate limit por dia para o gerador Claude (30 req/dia por IP)
export const generateDayLimiter = rateLimit({
  windowMs:        24 * 60 * 60 * 1000,
  max:             30,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { erro: 'Limite de 30 gerações por dia atingido. Tente amanhã.' },
});
