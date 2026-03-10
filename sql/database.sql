-- ============================================================
-- TRAINING MODULE - DATABASE SCHEMA
-- MySQL 8+
-- ============================================================

CREATE DATABASE IF NOT EXISTS training_module
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE training_module;

-- 1. Dealers
CREATE TABLE dealers (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(150)  NOT NULL,
  codigo      VARCHAR(30)   NOT NULL UNIQUE,
  activo      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Users
CREATE TABLE users (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  dealer_id       INT UNSIGNED  NULL,
  role            ENUM('ADMIN_MASTER','DEALER_ADMIN') NOT NULL,
  nombre          VARCHAR(150)  NOT NULL,
  email           VARCHAR(200)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  activo          TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_dealer FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_users_role ON users(role);

-- 3. Technicians
CREATE TABLE technicians (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  dealer_id   INT UNSIGNED  NOT NULL,
  nombre      VARCHAR(150)  NOT NULL,
  email       VARCHAR(200)  NOT NULL,
  rfc         VARCHAR(20)   NOT NULL,
  telefono    VARCHAR(20)   NULL,
  activo      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_technicians_dealer FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_technicians_dealer ON technicians(dealer_id);

-- 4. Courses
CREATE TABLE courses (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(200)  NOT NULL,
  activo      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Training Sessions
CREATE TABLE training_sessions (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id           INT UNSIGNED  NOT NULL,
  session_date        DATE          NOT NULL,
  location_code       TINYINT UNSIGNED NOT NULL COMMENT '1-4',
  created_by_user_id  INT UNSIGNED  NOT NULL,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_sessions_user   FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  CONSTRAINT chk_location CHECK (location_code BETWEEN 1 AND 4)
) ENGINE=InnoDB;

CREATE INDEX idx_sessions_date ON training_sessions(session_date);
CREATE INDEX idx_sessions_location ON training_sessions(location_code);

-- 6. Session Invites
CREATE TABLE session_invites (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id      INT UNSIGNED  NOT NULL,
  technician_id   INT UNSIGNED  NOT NULL,
  dealer_confirmed TINYINT(1)   NOT NULL DEFAULT 0,
  confirmed_at    DATETIME      NULL,
  confirm_user_id INT UNSIGNED  NULL,
  CONSTRAINT fk_invites_session    FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_invites_technician FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE,
  CONSTRAINT fk_invites_user       FOREIGN KEY (confirm_user_id) REFERENCES users(id),
  UNIQUE KEY uq_invite (session_id, technician_id)
) ENGINE=InnoDB;

-- 7. Attendance
CREATE TABLE attendance (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id        INT UNSIGNED  NOT NULL,
  technician_id     INT UNSIGNED  NOT NULL,
  status            ENUM('PRESENTE','AUSENTE') NOT NULL,
  comments          TEXT          NULL,
  marked_by_user_id INT UNSIGNED  NOT NULL,
  marked_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendance_session    FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_technician FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_user       FOREIGN KEY (marked_by_user_id) REFERENCES users(id),
  UNIQUE KEY uq_attendance (session_id, technician_id)
) ENGINE=InnoDB;

-- ============================================================
-- PHASE 2 STUBS (feature-flagged)
-- ============================================================

-- 8. Certificates
CREATE TABLE certificates (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  technician_id   INT UNSIGNED  NOT NULL,
  course_id       INT UNSIGNED  NOT NULL,
  session_id      INT UNSIGNED  NULL,
  file_path       VARCHAR(500)  NULL,
  issued_at       DATE          NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_certificates_tech    FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE,
  CONSTRAINT fk_certificates_course  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_certificates_session FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. Exams
CREATE TABLE exams (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id   INT UNSIGNED  NOT NULL,
  title       VARCHAR(200)  NOT NULL,
  active      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_exams_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Exam Results
CREATE TABLE exam_results (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  exam_id         INT UNSIGNED  NOT NULL,
  technician_id   INT UNSIGNED  NOT NULL,
  score           DECIMAL(5,2)  NOT NULL,
  passed          TINYINT(1)    NOT NULL DEFAULT 0,
  taken_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_results_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  CONSTRAINT fk_results_tech FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- HISTORY (for migration/import of past trainings)
-- ============================================================

CREATE TABLE training_history (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  technician_id   INT UNSIGNED  NOT NULL,
  course_name     VARCHAR(200)  NOT NULL,
  training_date   DATE          NULL,
  result          VARCHAR(100)  NULL,
  certificate_file VARCHAR(500) NULL,
  imported_by     INT UNSIGNED  NOT NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_tech FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_user FOREIGN KEY (imported_by) REFERENCES users(id)
) ENGINE=InnoDB;
