-- Schema Aluno Maker Digital — Fase 4
-- Aplicar via: mysql -u USER -p alunomakerdigital < schema.sql

CREATE DATABASE IF NOT EXISTS alunomakerdigital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alunomakerdigital;

CREATE TABLE IF NOT EXISTS visits (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  phone       VARCHAR(20),
  visit_date  DATE NOT NULL,
  message     TEXT,
  status      ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  subject     VARCHAR(200),
  message     TEXT NOT NULL,
  read_at     TIMESTAMP NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  key_       VARCHAR(50) UNIQUE NOT NULL,
  enabled    BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Flags iniciais
INSERT IGNORE INTO feature_flags (key_, enabled) VALUES
  ('gpio', TRUE),
  ('admin', TRUE),
  ('generator', FALSE),
  ('store', FALSE);
