import mysql from 'mysql2/promise';

const socketPath = process.env.DB_SOCKET || null;

const pool = mysql.createPool({
  ...(socketPath ? { socketPath } : {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
  }),
  database:        process.env.DB_NAME     || 'alunomakerdigital',
  user:            process.env.DB_USER     || '',
  password:        process.env.DB_PASS     || '',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:          0,
  timezone:           'Z',
});

export default pool;
