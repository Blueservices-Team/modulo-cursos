-- ============================================================
-- TRAINING - Datos dummy para ver el front con datos cargados
-- Ejecutar después de database.sql
--
-- Opción A - BD vacía: ejecutar tal cual.
-- Opción B - BD con datos: descomenta los DELETE de abajo y ejecuta
--   (borra datos en orden por claves foráneas).
--
-- Uso: mysql -u user -p nombre_bd < training/seed-dummy.sql
-- ============================================================

SET NAMES utf8mb4;

-- Si tu BD ya tiene datos y quieres empezar limpio, descomenta y ejecuta en este orden:
-- DELETE FROM attendance;
-- DELETE FROM session_invites;
-- DELETE FROM training_history;
-- DELETE FROM certificates;
-- DELETE FROM training_sessions;
-- DELETE FROM technicians;
-- DELETE FROM courses;
-- DELETE FROM users;
-- DELETE FROM dealers;

-- -----------------------------------------------------------
-- Dealers
-- -----------------------------------------------------------
INSERT INTO dealers (id, nombre, codigo, activo) VALUES
(1, 'Dealer CDMX Norte', 'DLR-CDMX-01', 1),
(2, 'Dealer Monterrey', 'DLR-MTY-01', 1),
(3, 'Dealer Querétaro', 'DLR-QRO-01', 1),
(4, 'Dealer Guadalajara', 'DLR-GDL-01', 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), codigo = VALUES(codigo), activo = VALUES(activo);

-- -----------------------------------------------------------
-- Users (admin corporativo + admins por dealer)
-- -----------------------------------------------------------
INSERT INTO users (id, dealer_id, role, nombre, email, password_hash, activo) VALUES
(1, NULL, 'ADMIN_MASTER', 'Admin Corporativo', 'admin@corp.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
(2, 1, 'DEALER_ADMIN', 'Responsable CDMX', 'dealer.cdmx@local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
(3, 2, 'DEALER_ADMIN', 'Responsable MTY', 'dealer.mty@local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
(4, 3, 'DEALER_ADMIN', 'Responsable QRO', 'dealer.qro@local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
(5, 4, 'DEALER_ADMIN', 'Responsable GDL', 'dealer.gdl@local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), email = VALUES(email), role = VALUES(role), dealer_id = VALUES(dealer_id);

-- -----------------------------------------------------------
-- Technicians (varios por dealer)
-- -----------------------------------------------------------
INSERT INTO technicians (dealer_id, nombre, email, rfc, telefono, activo) VALUES
(1, 'Juan Pérez García', 'juan.perez@mail.com', 'PEGJ800101ABC', '55 1234 5601', 1),
(1, 'María López Sánchez', 'maria.lopez@mail.com', 'LOSM850202DEF', '55 1234 5602', 1),
(1, 'Carlos Hernández Ruiz', 'carlos.h@mail.com', 'HRC900303GHI', '55 1234 5603', 1),
(1, 'Ana Martínez Flores', 'ana.martinez@mail.com', 'MEFA880404JKL', '55 1234 5604', 1),
(1, 'Roberto Díaz Vega', NULL, 'DIVR920505MNO', '55 1234 5605', 1),
(2, 'Laura Gómez Torres', 'laura.gomez@mail.com', 'GOTL870606PQR', '81 9876 5401', 1),
(2, 'Miguel Ángel Castro', 'miguel.castro@mail.com', 'CAM891707RST', '81 9876 5402', 1),
(2, 'Sandra Reyes Mora', 'sandra.reyes@mail.com', NULL, '81 9876 5403', 1),
(2, 'Fernando Soto Luna', 'fernando.soto@mail.com', 'SOLF930909UVW', NULL, 1),
(3, 'Patricia Núñez Cruz', 'patricia.n@mail.com', 'NUCX910101XYZ', '442 111 2201', 1),
(3, 'Ricardo Mendoza Paz', 'ricardo.mendoza@mail.com', 'MEPR880202AA1', '442 111 2202', 1),
(3, 'Lucía Vargas Ríos', 'lucia.vargas@mail.com', 'VARL950303BB2', '442 111 2203', 1),
(4, 'Andrés Guerrero López', 'andres.g@mail.com', 'GULA900404CC3', '33 4455 6601', 1),
(4, 'Carmen Silva Ortiz', 'carmen.silva@mail.com', 'SIOC860505DD4', '33 4455 6602', 1);

-- -----------------------------------------------------------
-- Courses
-- -----------------------------------------------------------
INSERT INTO courses (id, nombre, activo) VALUES
(1, 'Diagnóstico básico de vehículos', 1),
(2, 'Sistemas eléctricos y diagnóstico', 1),
(3, 'Mantenimiento preventivo', 1),
(4, 'Actualización técnica nivel 1', 1),
(5, 'Seguridad en taller', 1),
(6, 'Atención al cliente y servicio', 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), activo = VALUES(activo);

-- -----------------------------------------------------------
-- Training sessions (pasadas y futuras; location_code 1-4)
-- Sin ID para que auto_increment no choque si ya hay datos.
-- -----------------------------------------------------------
INSERT INTO training_sessions (course_id, session_date, location_code, created_by_user_id) VALUES
(1, '2025-02-10', 1, 1),
(2, '2025-02-15', 2, 1),
(3, '2025-02-20', 1, 1),
(1, '2025-03-01', 3, 1),
(4, '2025-03-10', 4, 1),
(5, '2025-03-18', 1, 1),
(2, '2025-04-01', 2, 1),
(6, '2025-04-15', 1, 1),
(1, '2025-05-01', 4, 1),
(3, '2025-05-12', 2, 1);
-- Nota: session_invites y attendance más abajo usan session_id 1..10.
-- Si tu BD ya tenía sesiones, esos IDs pueden no coincidir; en ese caso
-- ejecuta antes los DELETE del inicio o usa una BD vacía.

-- -----------------------------------------------------------
-- Session invites (técnicos invitados a sesiones)
-- -----------------------------------------------------------
INSERT INTO session_invites (session_id, technician_id, dealer_confirmed, confirmed_at, confirm_user_id) VALUES
(1, 1, 1, NOW(), 2),
(1, 2, 1, NOW(), 2),
(1, 3, 0, NULL, NULL),
(1, 6, 1, NOW(), 3),
(2, 4, 1, NOW(), 2),
(2, 5, 0, NULL, NULL),
(2, 7, 1, NOW(), 3),
(3, 1, 1, NOW(), 2),
(3, 4, 1, NOW(), 2),
(3, 8, 0, NULL, NULL),
(4, 2, 0, NULL, NULL),
(4, 10, 1, NOW(), 4),
(5, 3, 1, NOW(), 2),
(5, 7, 1, NOW(), 3),
(5, 11, 0, NULL, NULL),
(6, 1, 0, NULL, NULL),
(6, 5, 0, NULL, NULL),
(7, 6, 0, NULL, NULL),
(7, 9, 0, NULL, NULL),
(8, 1, 0, NULL, NULL),
(8, 2, 0, NULL, NULL),
(9, 10, 0, NULL, NULL),
(9, 11, 0, NULL, NULL),
(10, 12, 0, NULL, NULL),
(10, 13, 0, NULL, NULL);

-- -----------------------------------------------------------
-- Attendance (asistencia en sesiones ya realizadas)
-- -----------------------------------------------------------
INSERT INTO attendance (session_id, technician_id, status, comments, marked_by_user_id) VALUES
(1, 1, 'PRESENTE', NULL, 1),
(1, 2, 'PRESENTE', NULL, 1),
(1, 3, 'AUSENTE', 'No se presentó', 1),
(1, 6, 'PRESENTE', 'Asistió completo', 1),
(2, 4, 'PRESENTE', NULL, 1),
(2, 7, 'PRESENTE', NULL, 1),
(3, 1, 'PRESENTE', NULL, 1),
(3, 4, 'AUSENTE', 'Justificado', 1);

-- -----------------------------------------------------------
-- Training history (Migración / Histórico - muchos registros)
-- -----------------------------------------------------------
INSERT INTO training_history (technician_id, course_name, training_date, result, certificate_file, imported_by) VALUES
(1, 'Inducción general', '2024-01-15', 'Aprobado', NULL, 1),
(1, 'Seguridad en taller', '2024-03-20', 'Aprobado', NULL, 1),
(1, 'Diagnóstico básico (versión anterior)', '2024-06-10', 'Aprobado', '/certs/1-dg-2024.pdf', 1),
(2, 'Inducción general', '2024-02-01', 'Aprobado', NULL, 1),
(2, 'Atención al cliente', '2024-04-12', 'Aprobado', NULL, 1),
(3, 'Seguridad en taller', '2024-01-22', 'Aprobado', NULL, 1),
(3, 'Mantenimiento preventivo (v1)', '2024-07-08', 'Aprobado', NULL, 1),
(4, 'Inducción general', '2024-03-05', 'Aprobado', NULL, 1),
(4, 'Sistemas eléctricos (ant)', '2024-08-14', 'Aprobado', NULL, 1),
(5, 'Curso externo homologado', '2023-11-20', 'Aprobado', NULL, 1),
(6, 'Inducción general', '2024-02-18', 'Aprobado', NULL, 1),
(6, 'Seguridad en taller', '2024-05-30', 'Aprobado', NULL, 1),
(6, 'Actualización técnica 2023', '2024-09-01', 'Aprobado', NULL, 1),
(7, 'Inducción general', '2024-04-02', 'Aprobado', NULL, 1),
(7, 'Diagnóstico básico', '2024-10-15', 'Aprobado', NULL, 1),
(8, 'Seguridad en taller', '2024-03-18', 'Aprobado', NULL, 1),
(9, 'Inducción general', '2024-05-06', 'Aprobado', NULL, 1),
(9, 'Atención al cliente', '2024-11-22', 'Aprobado', NULL, 1),
(10, 'Inducción general', '2024-01-30', 'Aprobado', NULL, 1),
(10, 'Mantenimiento preventivo', '2024-08-05', 'Aprobado', NULL, 1),
(11, 'Seguridad en taller', '2024-02-14', 'Aprobado', NULL, 1),
(11, 'Curso anterior importado', NULL, NULL, NULL, 1),
(12, 'Inducción general', '2024-06-17', 'Aprobado', NULL, 1),
(13, 'Inducción general', '2024-04-25', 'Aprobado', NULL, 1),
(14, 'Seguridad en taller', '2024-07-11', 'Aprobado', NULL, 1);

-- Fin seed-dummy.sql
