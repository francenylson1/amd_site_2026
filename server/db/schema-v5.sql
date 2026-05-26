-- Schema Aluno Maker Digital — Fase 5 (Gerador de Conteúdo com Claude API)
-- Executar UMA VEZ no servidor de produção:
-- mysql -u u562242543_amd_user -p'Amd@2018#2020' u562242543_amd_db < schema-v5.sql

USE u562242543_amd_db;

CREATE TABLE IF NOT EXISTS generations (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source      ENUM('item','theme') NOT NULL,
  item_type   ENUM('projeto','evento','curso') NULL,
  item_id     INT UNSIGNED NULL,
  theme       VARCHAR(500) NULL,
  format      ENUM('instagram','tiktok','twitter','whatsapp','blog') NOT NULL,
  output      MEDIUMTEXT NOT NULL,
  tokens_in   INT UNSIGNED NOT NULL DEFAULT 0,
  tokens_out  INT UNSIGNED NOT NULL DEFAULT 0,
  cached      TINYINT(1) NOT NULL DEFAULT 0,
  cost_usd    DECIMAL(10,6) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_format    (format),
  INDEX idx_source    (source),
  INDEX idx_created   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
