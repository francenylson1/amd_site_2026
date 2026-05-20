import bcrypt from 'bcrypt';
import jwt    from 'jsonwebtoken';
import db     from '../db/connection.js';

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id, email, password_hash FROM admin_users WHERE email = ?',
      [email.trim()]
    );

    if (!rows.length) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '8h' }
    );

    return res.json({ token });
  } catch (err) {
    console.error('Erro no login admin:', err.message);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}
