const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\(?\d{2}\)?[\s\-]?[\s]?\d{4,5}[\s\-]?\d{4}$/;
const DATE_RE  = /^\d{4}-\d{2}-\d{2}$/;

export function isValidEmail(v) { return EMAIL_RE.test(String(v || '')); }
export function isValidPhone(v) { return !v || PHONE_RE.test(String(v)); }
export function isValidDate(v)  { return DATE_RE.test(String(v || '')); }
export function isFutureOrToday(v) {
  const d = new Date(v + 'T00:00:00Z');
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return d >= today;
}
export function notEmpty(v) { return typeof v === 'string' && v.trim().length > 0; }
export function maxLen(v, n) { return typeof v === 'string' && v.trim().length <= n; }

export function validateContact(req, res, next) {
  const { name, email, subject, message } = req.body;
  const erros = [];

  if (!notEmpty(name) || !maxLen(name, 100))        erros.push('name: obrigatório, máximo 100 caracteres.');
  if (!isValidEmail(email))                          erros.push('email: endereço inválido.');
  if (subject && !maxLen(subject, 200))              erros.push('subject: máximo 200 caracteres.');
  if (!notEmpty(message) || !maxLen(message, 5000)) erros.push('message: obrigatório, máximo 5000 caracteres.');

  if (erros.length) return res.status(422).json({ erros });
  next();
}

export function validateVisit(req, res, next) {
  const { name, email, phone, visit_date, message } = req.body;
  const erros = [];

  if (!notEmpty(name) || !maxLen(name, 100)) erros.push('name: obrigatório, máximo 100 caracteres.');
  if (!isValidEmail(email))                   erros.push('email: endereço inválido.');
  if (!isValidPhone(phone))                   erros.push('phone: formato inválido.');
  if (!isValidDate(visit_date))               erros.push('visit_date: formato inválido (AAAA-MM-DD).');
  else if (!isFutureOrToday(visit_date))      erros.push('visit_date: deve ser hoje ou uma data futura.');
  if (message && !maxLen(message, 2000))      erros.push('message: máximo 2000 caracteres.');

  if (erros.length) return res.status(422).json({ erros });
  next();
}
