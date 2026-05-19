import db from '../db/connection.js';
import { notifyNewContact } from '../services/emailService.js';

export async function createContact(req, res) {
  const { name, email, subject, message } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim(), (subject || '').trim(), message.trim()]
    );
    notifyNewContact({ name, email, subject, message }).catch(() => {});
    return res.status(201).json({ id: result.insertId, mensagem: 'Contato registrado com sucesso.' });
  } catch (err) {
    console.error('Erro ao gravar contato:', err.message);
    return res.status(500).json({ erro: 'Erro interno ao salvar contato.' });
  }
}

export async function listContacts(req, res) {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, subject, message, read_at, created_at FROM contacts ORDER BY created_at DESC'
    );
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao listar contatos:', err.message);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}
