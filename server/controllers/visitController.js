import db from '../db/connection.js';
import { notifyNewVisit } from '../services/emailService.js';

export async function createVisit(req, res) {
  const { name, email, phone, visit_date, message } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO visits (name, email, phone, visit_date, message) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim(), (phone || '').trim(), visit_date, (message || '').trim()]
    );
    notifyNewVisit({ name, email, phone, visit_date, message }).catch(() => {});
    return res.status(201).json({ id: result.insertId, mensagem: 'Agendamento registrado com sucesso.' });
  } catch (err) {
    console.error('Erro ao gravar agendamento:', err.message);
    return res.status(500).json({ erro: 'Erro interno ao salvar agendamento.' });
  }
}

export async function listVisits(req, res) {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, phone, visit_date, message, status, created_at FROM visits ORDER BY created_at DESC'
    );
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao listar agendamentos:', err.message);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}
