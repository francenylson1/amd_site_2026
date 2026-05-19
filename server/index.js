import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import helmet  from 'helmet';
import cors    from 'cors';

import apiRoutes   from './routes/api.js';
import adminRoutes from './routes/admin.js';

const app  = express();
const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
  'https://alunomakerdigital.com.br',
  'https://www.alunomakerdigital.com.br',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

app.use(helmet());
app.use(cors({
  origin(origin, cb) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origem não permitida.'));
  },
  methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const isMain = process.argv[1] === __filename;
if (isMain) {
  app.listen(PORT, () => {
    console.log(`Servidor AMD rodando na porta ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

export default app;
