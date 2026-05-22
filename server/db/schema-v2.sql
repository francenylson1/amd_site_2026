-- Schema Aluno Maker Digital — Fase 4.5 (Gerenciador de Conteúdo)
-- Aplica novas tabelas sem modificar as existentes
-- Executar: mysql -u u562242543_amd_user -p'Amd@2018#2020' u562242543_amd_db < schema-v2.sql

USE u562242543_amd_db;

-- EVENTOS
CREATE TABLE IF NOT EXISTS events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  category    VARCHAR(100) NOT NULL,
  description TEXT,
  event_date  DATE,
  active      BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FOTOS DOS EVENTOS
CREATE TABLE IF NOT EXISTS event_photos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  event_id    INT NOT NULL,
  image_url   VARCHAR(500) NOT NULL,
  caption     VARCHAR(300),
  sort_order  INT DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- PROJETOS
CREATE TABLE IF NOT EXISTS projects (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  category    VARCHAR(100) NOT NULL,
  short_desc  VARCHAR(300),
  full_desc   TEXT,
  image_url   VARCHAR(500),
  tags        VARCHAR(500),
  active      BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ESCOLAS
CREATE TABLE IF NOT EXISTS schools (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  location     VARCHAR(200),
  description  TEXT,
  image_url    VARCHAR(500),
  year_since   VARCHAR(20),
  levels       VARCHAR(300),
  icon_variant ENUM('default','purple','gold') DEFAULT 'default',
  active       BOOLEAN DEFAULT TRUE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CURSOS
CREATE TABLE IF NOT EXISTS courses (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  category     ENUM('alunos','professores','escola') NOT NULL,
  level        ENUM('iniciante','intermediario','avancado') DEFAULT 'iniciante',
  duration     VARCHAR(50),
  description  TEXT,
  topics       TEXT,
  image_url    VARCHAR(500),
  price        DECIMAL(10,2) DEFAULT NULL,
  price_active BOOLEAN DEFAULT FALSE,
  active       BOOLEAN DEFAULT TRUE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED — migração dos dados hardcoded do HTML
-- ============================================================

-- Eventos
INSERT IGNORE INTO events (id, title, category, description, event_date, sort_order) VALUES
(1, 'Campus Party Brasília',           'campus-party',  'Um dos maiores eventos de tecnologia do mundo realizado em Brasília, DF.',    NULL, 10),
(2, 'Instituto Federal — Campus Gama', 'institucional', 'Apresentação no IFB Campus Gama, Brasília.',                                  '2024-01-01', 20),
(3, 'Câmara Legislativa do DF',        'institucional', 'Apresentação de projetos na Câmara Legislativa do Distrito Federal.',         '2019-01-01', 30),
(4, 'Colégio Militar de Brasília',     'escola',        'Evento especial no Colégio Militar de Brasília.',                             NULL, 40),
(5, 'Festival de Robótica do DF',      'robotica',      'Participação no Festival de Robótica do Distrito Federal.',                   NULL, 50),
(6, 'Shopping Recanto — 2025',         'institucional', 'Exposição no Shopping do Recanto das Emas em 2025.',                          '2025-01-01', 60);

-- Fotos — Campus Party (6 fotos)
INSERT IGNORE INTO event_photos (event_id, image_url, caption, sort_order) VALUES
(1, 'assets/images/eventos/campus_party/campus_party_BSB_i1.webp', 'Campus Party Brasília — Aluno Maker Digital', 10),
(1, 'assets/images/eventos/campus_party/campus_party_BSB_i2.webp', 'Campus Party Brasília — robôs em ação',       20),
(1, 'assets/images/eventos/campus_party/campus_party_BSB_i3.webp', 'Campus Party Brasília',                       30),
(1, 'assets/images/eventos/campus_party/campus_party_BSB_i4.webp', 'Campus Party Brasília',                       40),
(1, 'assets/images/eventos/campus_party/campus_party_BSB_i5.webp', 'Campus Party Brasília',                       50),
(1, 'assets/images/eventos/campus_party/campus_party_BSB_i6.webp', 'Campus Party Brasília',                       60);

-- Fotos — IFB Gama (4 fotos)
INSERT IGNORE INTO event_photos (event_id, image_url, caption, sort_order) VALUES
(2, 'assets/images/eventos/IFB_gama_2024/instituto_federal_BsB_1.webp', 'Instituto Federal — Campus Gama 2024', 10),
(2, 'assets/images/eventos/IFB_gama_2024/instituto_federal_BsB_2.webp', 'Instituto Federal — Campus Gama 2024', 20),
(2, 'assets/images/eventos/IFB_gama_2024/instituto_federal_BsB_3.webp', 'Instituto Federal — Campus Gama 2024', 30),
(2, 'assets/images/eventos/IFB_gama_2024/instituto_federal_BsB_4.webp', 'Instituto Federal — Campus Gama 2024', 40);

-- Fotos — CLDF (3 fotos)
INSERT IGNORE INTO event_photos (event_id, image_url, caption, sort_order) VALUES
(3, 'assets/images/eventos/camara_legislativa_df/cldf_2019.webp',           'Câmara Legislativa do DF — 2019', 10),
(3, 'assets/images/eventos/camara_legislativa_df/cldf_humanoide_2019.webp',  'Humanoide na CLDF — 2019',       20),
(3, 'assets/images/eventos/camara_legislativa_df/cldf_humanoide2_2019.webp', 'Humanoide na CLDF — 2019',       30);

-- Fotos — Colégio Militar (4 fotos)
INSERT IGNORE INTO event_photos (event_id, image_url, caption, sort_order) VALUES
(4, 'assets/images/eventos/colegio_militar_Brasilia/colegio_militar_1.webp', 'Colégio Militar de Brasília', 10),
(4, 'assets/images/eventos/colegio_militar_Brasilia/colegio_militar_2.webp', 'Colégio Militar de Brasília', 20),
(4, 'assets/images/eventos/colegio_militar_Brasilia/colegio_militar_3.webp', 'Colégio Militar de Brasília', 30),
(4, 'assets/images/eventos/colegio_militar_Brasilia/colegio_militar_4.webp', 'Colégio Militar de Brasília', 40);

-- Fotos — Festival Robótica (1 foto)
INSERT IGNORE INTO event_photos (event_id, image_url, caption, sort_order) VALUES
(5, 'assets/images/eventos/festival_robotica_DF/festival_robotica_DF_1.webp', 'Festival de Robótica do DF', 10);

-- Fotos — Shopping Recanto (1 foto)
INSERT IGNORE INTO event_photos (event_id, image_url, caption, sort_order) VALUES
(6, 'assets/images/eventos/shopping_recanto_2025/shopping_recanto_1.webp', 'Shopping Recanto das Emas — 2025', 10);

-- Projetos (9 do HTML — nota: imagem do Braço Robótico com IA precisa ser corrigida pelo Prof. Fran)
INSERT IGNORE INTO projects (id, title, category, short_desc, full_desc, image_url, tags, sort_order) VALUES
(1, 'Robô Garçom',            'roborica',   'Robô semi-autônomo de serviço com duas bandejas',
  'Robô semi-autônomo capaz de navegar pelo ambiente e servir bebidas e comidas em eventos com duas bandejas independentes. Desenvolvido por alunos do ensino médio. A versão autônoma está em desenvolvimento.',
  'assets/images/projetos/robo_garcon/versao_2_5.webp',
  'Arduino,Sensores Ultrassônicos,Motores DC,C++', 10),

(2, 'Humanoide 17 DOF',       'roborica',   'Estrutura humanoide completa com movimentos de todo o corpo',
  'Robô humanoide de 45 cm com 17 graus de liberdade (DOF), capaz de andar, dançar e realizar movimentos de todo o corpo. Integra mecânica, eletrônica e programação avançada. Apresentado na Campus Party Brasília e na CLDF.',
  'assets/images/projetos/espaco_maker/espaco_maker_20.webp',
  'Servo Motores,Raspberry Pi,Python,Impressão 3D', 20),

(3, 'Braço Robótico com IA',  'ia',         'Separador de frutas com inteligência artificial',
  'Braço articulado que usa visão computacional para identificar e separar frutas por tipo e qualidade. Projeto que une robótica, programação e inteligência artificial aplicadas a um problema real do cotidiano.',
  'assets/images/projetos/espaco_maker/espaco_maker_5.webp',
  'Python,OpenCV,Servo Motores,Raspberry Pi', 30),

(4, 'Braço Distribuidor',     'roborica',   'Serve amendoins automaticamente para visitantes',
  'Braço robótico com funcionalidade prática: distribui amendoins automaticamente para os visitantes do espaço maker. Um projeto simples e encantador que demonstra como a robótica pode ter função real no cotidiano.',
  'assets/images/projetos/espaco_maker/espaco_maker_10.webp',
  'Arduino,Servo Motores,Sensor de Presença,C++', 40),

(5, 'Lixeira Inteligente',    'iot',        'Abre automaticamente com sensor de aproximação',
  'Lixeira com sensor de proximidade que abre automaticamente quando detecta a presença de uma pessoa. Projeto que demonstra na prática como a eletrônica pode melhorar objetos do dia a dia.',
  'assets/images/projetos/espaco_maker/espaco_maker_15.webp',
  'Arduino,Sensor Ultrassônico,Servo Motor,C++', 50),

(6, 'Projetos IoT',           'iot',        'Dispositivos conectados com ESP-8266 e sensores',
  'Série de projetos que conectam sensores e atuadores à internet usando NodeMCU ESP-8266. Inclui estação meteorológica, automação residencial simples e monitoramento remoto — tudo feito por alunos do ensino fundamental e médio.',
  'assets/images/projetos/espaco_maker/espaco_maker_30.webp',
  'ESP-8266,MicroPython,MQTT,Wi-Fi', 60),

(7, 'Iniciação à Eletrônica', 'eletronica', 'LEDs, buzzers e sensores — o primeiro passo de todo criador',
  'Módulo inicial onde os alunos aprendem a programar LEDs, buzzers e sensores diversos. É o ponto de partida para todos que chegam ao AMD — a base que dá confiança para criar projetos cada vez mais complexos.',
  'assets/images/projetos/espaco_maker/espaco_maker_3.webp',
  'Arduino,LEDs,Buzzers,Sensores', 70),

(8, 'Humanoide com Fala',     'roborica',   'Fala e movimenta os membros superiores de forma coordenada',
  'Robô com síntese de voz e movimentos coordenados dos membros superiores. Capaz de cumprimentar visitantes e executar gestos predefinidos. Um marco na trajetória do AMD que encanta alunos e professores em eventos.',
  'assets/images/projetos/espaco_maker/espaco_maker_25.webp',
  'Text-to-Speech,Servo Motores,Python,Raspberry Pi', 80),

(9, 'Altas Habilidades — 2019', 'eletronica', 'Apresentação para programa de altas habilidades e superdotação',
  'Apresentação especial para alunos do programa de altas habilidades e superdotação do Distrito Federal. Demonstrou que a robótica é um caminho de excelência também para jovens com potencial acima da média.',
  'assets/images/projetos/altas_habilidades/altas_habilidades_2019.webp',
  'Arduino,Eletrônica,Programação,2019', 90);

-- Escolas (12 do HTML)
INSERT IGNORE INTO schools (id, name, location, description, image_url, year_since, levels, icon_variant, sort_order) VALUES
(1,  'CEF 101',          'Recanto das Emas', 'A escola onde tudo começou. Desde 2018, o CEF 101 é a casa do Aluno Maker Digital, palco dos primeiros robôs e das primeiras conquistas dos alunos do projeto.',
     NULL, '2018', 'Anos Finais e Ensino Médio', 'default', 10),

(2,  'CEF 113',          'Recanto das Emas', 'Escola parceira que abre suas portas para o AMD levar robótica educacional aos seus alunos, com oficinas que misturam eletrônica, programação e criatividade.',
     'assets/images/escolas/cef_113/cef_113.webp', NULL, 'Anos Finais', 'default', 20),

(3,  'CEF 206',          'Recanto das Emas', 'Parceira do AMD com turmas que participam de oficinas de eletrônica e introdução à programação com Arduino — abrindo caminhos para que cada aluno descubra seu potencial criativo.',
     NULL, NULL, 'Anos Finais', 'default', 30),

(4,  'CEF 308',          'Recanto das Emas', 'No CEF 308, os alunos aprendem desde a montagem de circuitos básicos até a programação de microcontroladores, com projetos que fazem sentido para o cotidiano deles.',
     'assets/images/escolas/cef_308/ced_308_1.webp', NULL, 'Anos Finais', 'default', 40),

(5,  'CEF 405',          'Recanto das Emas', 'Uma das escolas com maior engajamento dos alunos. No CEF 405, oficinas de robótica e programação criaram verdadeiros apaixonados por tecnologia.',
     'assets/images/escolas/cef_405/cef_405_1.webp', NULL, 'Anos Finais e Ensino Médio', 'default', 50),

(6,  'CEM 804',          'Recanto das Emas', 'Centro de Ensino Médio 804 — parceiro do AMD no atendimento a jovens do Ensino Médio que buscam um diferencial tecnológico para o futuro acadêmico e profissional.',
     NULL, NULL, 'Ensino Médio', 'default', 60),

(7,  'EC 203',           'Recanto das Emas', 'Escola Classe 203 — onde os menores do projeto encontram seu primeiro contato com robótica. Crianças de 7 a 12 anos descobrem que também podem ser criadores de tecnologia.',
     'assets/images/escolas/ec_203/escola_classe_203_1.webp', NULL, 'Anos Iniciais (7–12 anos)', 'default', 70),

(8,  'EC 401',           'Recanto das Emas', 'Escola Classe 401 — parceira no atendimento às crianças dos anos iniciais, onde a robótica é usada como ferramenta lúdica e educativa para despertar a curiosidade científica desde cedo.',
     'assets/images/escolas/ec_401/escola_classe_401_1.webp', NULL, 'Anos Iniciais (7–12 anos)', 'default', 80),

(9,  'Pinheirinho Roxo', 'Recanto das Emas', 'Centro de Educação Infantil Pinheirinho Roxo — parceiro do AMD no atendimento às crianças da primeira infância, onde a robótica lúdica desperta a curiosidade científica desde os primeiros anos de vida.',
     NULL, NULL, 'Educação Infantil', 'default', 90),

(10, 'CeD 104',          'Recanto das Emas', 'Centro Educacional 104 — escola parceira do AMD com turmas do Ensino Médio que participam das oficinas de robótica e programação.',
     NULL, NULL, 'Ensino Médio', 'default', 100),

(11, 'CEF 106',          'Recanto das Emas', 'Centro de Ensino Fundamental 106 — o AMD atende a turma de inclusão de alunos surdos e mudos com metodologia adaptada, comunicação visual e projetos que ampliam a autonomia de cada aluno.',
     NULL, NULL, 'Anos Finais', 'purple', 110),

(12, 'Colégio Militar',  'Brasília, DF',     'O AMD levou seus projetos ao Colégio Militar de Brasília em evento especial, demonstrando o alcance e a qualidade técnica dos projetos construídos por alunos de escolas públicas do Recanto das Emas.',
     NULL, NULL, 'Participação especial', 'gold', 120);
