-- ============================================================
-- TRAINING MODULE - Seed Data
-- Run AFTER database.sql
-- ============================================================

SET NAMES utf8mb4;

-- -----------------------------------------------------------
-- Dealers
-- -----------------------------------------------------------
INSERT INTO `dealers` (`id`, `nombre`, `codigo`) VALUES
(1, 'Dealer Centro CDMX',  'DLR-001'),
(2, 'Dealer Norte Monterrey', 'DLR-002');

-- -----------------------------------------------------------
-- Users  (passwords: "password123" hashed with bcrypt)
-- -----------------------------------------------------------
INSERT INTO `users` (`id`, `dealer_id`, `role`, `nombre`, `email`, `password_hash`) VALUES
(1, NULL, 'ADMIN_MASTER', 'Admin Corporativo', 'admin@changan.com',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(2, 1, 'DEALER_ADMIN', 'Gerente Dealer Centro', 'gerente@dealer-centro.com',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(3, 2, 'DEALER_ADMIN', 'Gerente Dealer Norte', 'gerente@dealer-norte.com',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- -----------------------------------------------------------
-- Technicians - Dealer 1 (6)
-- -----------------------------------------------------------
INSERT INTO `technicians` (`id`, `dealer_id`, `nombre`, `email`, `rfc`, `telefono`) VALUES
(1,  1, 'Carlos Mendoza',   'carlos.m@dealer-centro.com',  'MEDC900101ABC', '5551001001'),
(2,  1, 'Ana Torres',       'ana.t@dealer-centro.com',     'TORA880215DEF', '5551001002'),
(3,  1, 'Luis Hernández',   'luis.h@dealer-centro.com',    'HELU950330GHI', '5551001003'),
(4,  1, 'María García',     'maria.g@dealer-centro.com',   'GARM870512JKL', '5551001004'),
(5,  1, 'Roberto Díaz',     'roberto.d@dealer-centro.com', 'DIAR920718MNO', '5551001005'),
(6,  1, 'Patricia López',   'patricia.l@dealer-centro.com','LOPP910823PQR', '5551001006');

-- -----------------------------------------------------------
-- Technicians - Dealer 2 (6)
-- -----------------------------------------------------------
INSERT INTO `technicians` (`id`, `dealer_id`, `nombre`, `email`, `rfc`, `telefono`) VALUES
(7,  2, 'Fernando Ruiz',    'fernando.r@dealer-norte.com', 'RUIF880101STU', '8181001001'),
(8,  2, 'Gabriela Salinas', 'gabriela.s@dealer-norte.com', 'SALG900215VWX', '8181001002'),
(9,  2, 'Javier Moreno',    'javier.m@dealer-norte.com',   'MORJ850330YZA', '8181001003'),
(10, 2, 'Laura Castillo',   'laura.c@dealer-norte.com',    'CASL920512BCD', '8181001004'),
(11, 2, 'Diego Ramírez',    'diego.r@dealer-norte.com',    'RAMD940718EFG', '8181001005'),
(12, 2, 'Sandra Flores',    'sandra.f@dealer-norte.com',   'FLOS960823HIJ', '8181001006');

-- -----------------------------------------------------------
-- Courses
-- -----------------------------------------------------------
INSERT INTO `courses` (`id`, `nombre`) VALUES
(1, 'Diagnóstico de Motor Changan CS55 Plus'),
(2, 'Sistema Eléctrico y CAN Bus'),
(3, 'Mantenimiento Preventivo Línea SUV');

-- -----------------------------------------------------------
-- Training Sessions (4 future sessions)
-- -----------------------------------------------------------
INSERT INTO `training_sessions` (`id`, `course_id`, `session_date`, `location_code`, `created_by_user_id`) VALUES
(1, 1, DATE_ADD(CURDATE(), INTERVAL 10 DAY), 1, 1),
(2, 2, DATE_ADD(CURDATE(), INTERVAL 20 DAY), 2, 1),
(3, 3, DATE_ADD(CURDATE(), INTERVAL 45 DAY), 3, 1),
(4, 1, DATE_ADD(CURDATE(), INTERVAL 60 DAY), 4, 1);

-- -----------------------------------------------------------
-- Session Invites (mixed technicians across sessions)
-- -----------------------------------------------------------
INSERT INTO `session_invites` (`session_id`, `technician_id`, `dealer_confirmed`) VALUES
-- Session 1: 3 from dealer 1, 2 from dealer 2
(1, 1, 0), (1, 2, 0), (1, 3, 0),
(1, 7, 0), (1, 8, 0),
-- Session 2: 2 from dealer 1, 3 from dealer 2
(2, 4, 0), (2, 5, 0),
(2, 9, 0), (2, 10, 0), (2, 11, 0),
-- Session 3: 4 from dealer 1, 2 from dealer 2
(3, 1, 0), (3, 2, 0), (3, 5, 0), (3, 6, 0),
(3, 7, 0), (3, 12, 0),
-- Session 4: 2 from dealer 1, 3 from dealer 2
(4, 3, 0), (4, 6, 0),
(4, 8, 0), (4, 10, 0), (4, 12, 0);

-- -----------------------------------------------------------
-- Sample training history (for migration demo)
-- -----------------------------------------------------------
INSERT INTO `training_history` (`technician_id`, `course_name`, `training_date`, `result`, `imported_by`) VALUES
(1, 'Introducción a Sistemas Changan', '2024-06-15', 'Aprobado', 1),
(2, 'Introducción a Sistemas Changan', '2024-06-15', 'Aprobado', 1),
(7, 'Seguridad en Taller', '2024-08-20', 'Aprobado', 1);
