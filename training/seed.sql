-- ============================================================
-- TRAINING MODULE - Seed data (datos de prueba, no fijos)
-- Ejecutar después de database.sql
-- Uso: mysql -u user -p database < training/seed.sql
-- ============================================================

SET NAMES utf8mb4;

-- Limpiar en orden por FKs (opcional; comentar si ya tienes datos)
-- DELETE FROM attendance;
-- DELETE FROM session_invites;
-- DELETE FROM training_history;
-- DELETE FROM training_sessions;
-- DELETE FROM technicians;
-- DELETE FROM courses;
-- DELETE FROM users;
-- DELETE FROM dealers;

-- -----------------------------------------------------------
-- Dealers (códigos y nombres genéricos)
-- -----------------------------------------------------------
INSERT INTO dealers (nombre, codigo, activo) VALUES
('Sucursal Norte', 'SUC-N-01', 1),
('Sucursal Centro', 'SUC-C-02', 1),
('Sucursal Bajío', 'SUC-B-03', 1);

-- Ajustar IDs si ya existían (en BD nueva los IDs serán 1,2,3)
-- -----------------------------------------------------------
-- Users (password por defecto: "password123" - cambiar en producción)
-- -----------------------------------------------------------
INSERT INTO users (dealer_id, role, nombre, email, password_hash, activo) VALUES
(NULL, 'ADMIN_MASTER', 'Administrador del sistema', 'admin@sistema.local',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
(1, 'DEALER_ADMIN', 'Responsable Sucursal Norte', 'responsable.norte@sistema.local',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
(2, 'DEALER_ADMIN', 'Responsable Sucursal Centro', 'responsable.centro@sistema.local',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
(3, 'DEALER_ADMIN', 'Responsable Sucursal Bajío', 'responsable.bajio@sistema.local',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

-- -----------------------------------------------------------
-- Technicians (algunos sin email/tel para variedad)
-- -----------------------------------------------------------
INSERT INTO technicians (dealer_id, nombre, email, rfc, telefono, activo) VALUES
(1, 'Técnico Uno', 'tecnico.uno@sucursal.local', 'TECU800101A12', '5512340001', 1),
(1, 'Técnico Dos', NULL, 'TECD850202B34', NULL, 1),
(1, 'Técnico Tres', 'tecnico.tres@sucursal.local', NULL, '5512340003', 1),
(1, 'Técnico Cuatro', 'tecnico.cuatro@sucursal.local', 'TECF900303C56', '5512340004', 1),
(1, 'Técnico Cinco', NULL, 'TECC880404D78', '5512340005', 1),
(2, 'Técnico Seis', 'tecnico.seis@sucursal.local', 'TECS920505E90', '5512340006', 1),
(2, 'Técnico Siete', 'tecnico.siete@sucursal.local', 'TECV870606F01', NULL, 1),
(2, 'Técnico Ocho', NULL, NULL, '5512340008', 1),
(2, 'Técnico Nueve', 'tecnico.nueve@sucursal.local', 'TECN910707G23', '5512340009', 1),
(3, 'Técnico Diez', 'tecnico.diez@sucursal.local', 'TECD890808H45', '5512340010', 1),
(3, 'Técnico Once', NULL, 'TECO930909I67', '5512340011', 1),
(3, 'Técnico Doce', 'tecnico.doce@sucursal.local', NULL, NULL, 1);

-- -----------------------------------------------------------
-- Courses (nombres genéricos de capacitación)
-- -----------------------------------------------------------
INSERT INTO courses (nombre, activo) VALUES
('Curso de diagnóstico básico', 1),
('Sistemas eléctricos y diagnóstico', 1),
('Mantenimiento preventivo', 1),
('Actualización técnica nivel 1', 1);

-- -----------------------------------------------------------
-- Training sessions (fechas relativas al día actual)
-- -----------------------------------------------------------
INSERT INTO training_sessions (course_id, session_date, location_code, created_by_user_id) VALUES
(1, DATE_ADD(CURDATE(), INTERVAL 7 DAY),  1, 1),
(2, DATE_ADD(CURDATE(), INTERVAL 14 DAY), 2, 1),
(3, DATE_ADD(CURDATE(), INTERVAL 21 DAY), 1, 1),
(1, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 3, 1),
(4, DATE_ADD(CURDATE(), INTERVAL 45 DAY), 4, 1);

-- -----------------------------------------------------------
-- Session invites (mezcla de confirmados y pendientes)
-- -----------------------------------------------------------
INSERT INTO session_invites (session_id, technician_id, dealer_confirmed, confirmed_at, confirm_user_id) VALUES
(1, 1, 1, NOW(), 2),
(1, 2, 0, NULL, NULL),
(1, 3, 1, NOW(), 2),
(1, 6, 0, NULL, NULL),
(2, 4, 1, NOW(), 2),
(2, 5, 0, NULL, NULL),
(2, 7, 1, NOW(), 3),
(2, 10, 0, NULL, NULL),
(3, 1, 0, NULL, NULL),
(3, 8, 1, NOW(), 3),
(3, 9, 0, NULL, NULL),
(4, 2, 0, NULL, NULL),
(4, 11, 1, NOW(), 4),
(5, 3, 0, NULL, NULL),
(5, 12, 0, NULL, NULL);

-- -----------------------------------------------------------
-- Attendance (solo para invites ya confirmados)
-- -----------------------------------------------------------
INSERT INTO attendance (session_id, technician_id, status, comments, marked_by_user_id) VALUES
(1, 1, 'PRESENTE', NULL, 1),
(1, 3, 'PRESENTE', NULL, 1),
(2, 4, 'PRESENTE', 'Asistió completo', 1),
(2, 7, 'AUSENTE', 'No se presentó', 1);

-- -----------------------------------------------------------
-- Training history (historial importado de ejemplo)
-- -----------------------------------------------------------
INSERT INTO training_history (technician_id, course_name, training_date, result, certificate_file, imported_by) VALUES
(1, 'Inducción general', '2024-01-15', 'Aprobado', NULL, 1),
(1, 'Seguridad en taller', '2024-03-20', 'Aprobado', NULL, 1),
(6, 'Inducción general', '2024-02-10', 'Aprobado', NULL, 1),
(10, 'Curso anterior importado', NULL, NULL, NULL, 1);
