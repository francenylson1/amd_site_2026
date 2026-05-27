-- schema-v6.sql — Fase 5.5: Blog do Site
-- Aplicar em produção: mysql -u u562242543_amd_user -p u562242543_amd_db < /tmp/schema-v6.sql

CREATE TABLE IF NOT EXISTS blog_posts (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug         VARCHAR(200) NOT NULL UNIQUE,
  title        VARCHAR(300) NOT NULL,
  excerpt      VARCHAR(500) NULL,
  content      MEDIUMTEXT NOT NULL,
  cover_image  VARCHAR(500) NULL,
  youtube_id   VARCHAR(20)  NULL,
  status       ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_pub (status, published_at),
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
