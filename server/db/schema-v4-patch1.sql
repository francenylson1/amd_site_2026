-- Patch schema-v4 — adiciona TikTok e X (Twitter) à tabela site_config
-- Executar UMA VEZ: mysql -u u562242543_amd_user -p'Amd@2018#2020' u562242543_amd_db < schema-v4-patch1.sql

USE u562242543_amd_db;

INSERT INTO site_config (config_key, config_value, label) VALUES
('tiktok_handle', 'alunomakerdigital', 'TikTok — handle (sem @)'),
('x_handle',      'alunomakerdigital', 'X (Twitter) — handle (sem @)')
ON DUPLICATE KEY UPDATE label = VALUES(label);
