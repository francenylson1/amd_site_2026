-- Schema Aluno Maker Digital — Fase 5 (Gerenciador Sobre)
-- Executar UMA VEZ: mysql -u u562242543_amd_user -p'Amd@2018#2020' u562242543_amd_db < schema-v3.sql

USE u562242543_amd_db;

CREATE TABLE IF NOT EXISTS about_photos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  section    ENUM('professor', 'espaco') NOT NULL DEFAULT 'espaco',
  image_url  VARCHAR(500) NOT NULL,
  alt_text   VARCHAR(300),
  sort_order INT DEFAULT 0,
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed: migração das fotos estáticas de sobre.html
INSERT INTO about_photos (section, image_url, alt_text, sort_order, active) VALUES
('professor', 'assets/images/sobre/espaco_maker_47.webp', 'Professor Francenylson no espaço maker com alunos', 0,  TRUE),
('espaco',    'assets/images/sobre/espaco_maker_3.webp',  'Alunos trabalhando no espaço maker',                10, TRUE),
('espaco',    'assets/images/sobre/espaco_maker_11.webp', 'Bancada do espaço maker com componentes eletrônicos', 20, TRUE),
('espaco',    'assets/images/sobre/espaco_maker_18.webp', 'Aluno programando microcontrolador',                30, TRUE),
('espaco',    'assets/images/sobre/espaco_maker_20.webp', 'Robô humanoide em construção',                      40, TRUE),
('espaco',    'assets/images/sobre/espaco_maker_33.webp', 'Projeto de robótica em andamento',                  50, TRUE),
('espaco',    'assets/images/sobre/espaco_maker_36.webp', 'Alunos montando circuito eletrônico',               60, TRUE);
