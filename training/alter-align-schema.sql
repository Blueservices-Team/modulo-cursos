-- ============================================================
-- Alineación BD al schema training/database.sql (MySQL 8+)
-- Uso: mysql -u user -p database < training/alter-align-schema.sql
-- Hacer backup antes de ejecutar.
-- ============================================================

SET NAMES utf8mb4;

-- 1. dealers
ALTER TABLE dealers
  MODIFY COLUMN nombre VARCHAR(200) NOT NULL;

-- 2. users
ALTER TABLE users
  MODIFY COLUMN nombre VARCHAR(200) NOT NULL,
  MODIFY COLUMN email VARCHAR(200) NOT NULL;

-- 3. technicians (email NULL = técnicos sin email permitidos)
ALTER TABLE technicians
  MODIFY COLUMN nombre VARCHAR(200) NOT NULL,
  MODIFY COLUMN email VARCHAR(200) NULL,
  MODIFY COLUMN rfc VARCHAR(20) NULL,
  MODIFY COLUMN telefono VARCHAR(30) NULL;

-- 4. courses
ALTER TABLE courses
  MODIFY COLUMN nombre VARCHAR(300) NOT NULL;

-- 5. session_invites: quitar created_at si existe (proyecto no la usa)
-- ALTER TABLE session_invites DROP COLUMN created_at;

-- 6. certificates
ALTER TABLE certificates
  MODIFY COLUMN file_path VARCHAR(500) NULL;

-- 7. exams
ALTER TABLE exams
  MODIFY COLUMN title VARCHAR(300) NOT NULL;

-- 8. exam_results
ALTER TABLE exam_results
  MODIFY COLUMN score DECIMAL(5,2) NOT NULL DEFAULT 0;

-- 9. training_history
ALTER TABLE training_history
  MODIFY COLUMN course_name VARCHAR(300) NOT NULL;
