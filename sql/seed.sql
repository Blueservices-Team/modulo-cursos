-- ============================================================
-- TRAINING MODULE - SEED DATA
-- ============================================================

USE training_module;

-- Dealers
INSERT INTO dealers (id, nombre, codigo, activo) VALUES
(1, 'Dealer Ciudad de México',  'DLR-CDMX', 1),
(2, 'Dealer Monterrey',         'DLR-MTY',  1);

-- Users (passwords: "admin123" hashed with bcrypt)
INSERT INTO users (id, dealer_id, role, nombre, email, password_hash, activo) VALUES
(1, NULL, 'ADMIN_MASTER', 'Carlos Admin Corporativo', 'admin@changan.com',       '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
(2, 1,    'DEALER_ADMIN', 'María Dealer CDMX',       'maria@dealer-cdmx.com',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1),
(3, 2,    'DEALER_ADMIN', 'Roberto Dealer MTY',       'roberto@dealer-mty.com',   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

-- Technicians - Dealer CDMX (6)
INSERT INTO technicians (id, dealer_id, nombre, email, rfc, telefono, activo) VALUES
(1,  1, 'Juan Pérez López',       'juan.perez@dealer-cdmx.com',     'PELJ900101ABC', '5551234001', 1),
(2,  1, 'Ana García Martínez',    'ana.garcia@dealer-cdmx.com',     'GAMA880215DEF', '5551234002', 1),
(3,  1, 'Pedro Ramírez Soto',     'pedro.ramirez@dealer-cdmx.com',  'RASP910310GHI', '5551234003', 1),
(4,  1, 'Laura Torres Díaz',      'laura.torres@dealer-cdmx.com',   'TODL850722JKL', '5551234004', 1),
(5,  1, 'Miguel Hernández Cruz',  'miguel.hdz@dealer-cdmx.com',     'HECM920430MNO', '5551234005', 1),
(6,  1, 'Sofía López Ruiz',       'sofia.lopez@dealer-cdmx.com',    'LORS940815PQR', '5551234006', 1);

-- Technicians - Dealer MTY (6)
INSERT INTO technicians (id, dealer_id, nombre, email, rfc, telefono, activo) VALUES
(7,  2, 'Carlos Mendoza Ríos',    'carlos.mendoza@dealer-mty.com',  'MERC870505STU', '8181234001', 1),
(8,  2, 'Diana Flores Vargas',    'diana.flores@dealer-mty.com',    'FOVD890620VWX', '8181234002', 1),
(9,  2, 'José Castillo Moreno',   'jose.castillo@dealer-mty.com',   'CAMJ910718YZA', '8181234003', 1),
(10, 2, 'Patricia Navarro Gómez', 'patricia.navarro@dealer-mty.com','NAGP860903BCD', '8181234004', 1),
(11, 2, 'Ricardo Salinas Vega',   'ricardo.salinas@dealer-mty.com', 'SAVR930112EFG', '8181234005', 1),
(12, 2, 'Valeria Ortiz Luna',     'valeria.ortiz@dealer-mty.com',   'OILV950228HIJ', '8181234006', 1);

-- Courses
INSERT INTO courses (id, nombre, activo) VALUES
(1, 'Diagnóstico Electrónico Avanzado',   1),
(2, 'Motor y Transmisión CHANGAN CS55+',  1),
(3, 'Sistemas ADAS y Conducción Asistida', 1);

-- Training Sessions (future dates)
INSERT INTO training_sessions (id, course_id, session_date, location_code, created_by_user_id) VALUES
(1, 1, DATE_ADD(CURDATE(), INTERVAL 10 DAY), 1, 1),
(2, 2, DATE_ADD(CURDATE(), INTERVAL 20 DAY), 2, 1),
(3, 3, DATE_ADD(CURDATE(), INTERVAL 45 DAY), 3, 1),
(4, 1, DATE_ADD(CURDATE(), INTERVAL 60 DAY), 4, 1);

-- Session Invites (mixed technicians from both dealers)
INSERT INTO session_invites (session_id, technician_id, dealer_confirmed) VALUES
-- Session 1: tech from CDMX and MTY
(1, 1, 1), (1, 2, 0), (1, 3, 1),
(1, 7, 1), (1, 8, 0),
-- Session 2: tech from CDMX
(2, 1, 0), (2, 4, 1), (2, 5, 0), (2, 6, 1),
-- Session 3: tech from MTY
(3, 9, 0), (3, 10, 1), (3, 11, 0), (3, 12, 1),
-- Session 4: mixed
(4, 2, 0), (4, 3, 0), (4, 7, 0), (4, 11, 0);

-- Sample historical training data
INSERT INTO training_history (technician_id, course_name, training_date, result, imported_by) VALUES
(1, 'Inducción Mecánica General',    '2024-03-15', 'Aprobado', 1),
(1, 'Electricidad Automotriz Básica','2024-06-20', 'Aprobado', 1),
(7, 'Inducción Mecánica General',    '2024-04-10', 'Aprobado', 1),
(7, 'Motor CHANGAN CS35 Plus',       '2024-08-05', 'Aprobado', 1);
