-- Schema Aluno Maker Digital — Fase 4.5 complemento (Configurações do site)
-- Executar UMA VEZ: mysql -u u562242543_amd_user -p'Amd@2018#2020' u562242543_amd_db < schema-v4.sql

USE u562242543_amd_db;

CREATE TABLE IF NOT EXISTS site_config (
  config_key   VARCHAR(100) PRIMARY KEY,
  config_value TEXT,
  label        VARCHAR(200) NOT NULL,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO site_config (config_key, config_value, label) VALUES
('whatsapp_num',        '5561981333875',                                  'WhatsApp — número (somente dígitos com DDI)'),
('whatsapp_display',    '(61) 9 8133-3875',                               'WhatsApp — texto exibido no site'),
('email_contato',       'contato@alunomakerdigital.com.br',               'E-mail de contato'),
('instagram_handle',    'alunomakerdigital',                              'Instagram — handle (sem @)'),
('instagram_display',   '@alunomakerdigital',                             'Instagram — texto exibido'),
('youtube_handle',      '@alunomakerdigital',                             'YouTube — handle/canal'),
('endereco_rua',        'Quadra 203, Lote 32 — Avenida Recanto das Emas', 'Endereço — Rua/Quadra'),
('endereco_display',    'Recanto das Emas, Brasília — DF',                'Endereço — Cidade/Estado (formato curto)'),
('atendimento_horario', 'de segunda a sábado, das 8h às 18h',             'Horário de atendimento')
ON DUPLICATE KEY UPDATE label = VALUES(label);
