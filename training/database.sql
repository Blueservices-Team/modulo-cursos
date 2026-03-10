-- ============================================================
-- TRAINING MODULE - Database Schema
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------
-- 1. dealers
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dealers` (
  `id`        INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `nombre`    VARCHAR(200)    NOT NULL,
  `codigo`    VARCHAR(50)     NOT NULL,
  `activo`    TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at` DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dealers_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 2. users
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `dealer_id`     INT UNSIGNED    NULL,
  `role`          ENUM('ADMIN_MASTER','DEALER_ADMIN') NOT NULL,
  `nombre`        VARCHAR(200)    NOT NULL,
  `email`         VARCHAR(200)    NOT NULL,
  `password_hash` VARCHAR(255)    NOT NULL,
  `activo`        TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_dealer` (`dealer_id`),
  CONSTRAINT `fk_users_dealer` FOREIGN KEY (`dealer_id`) REFERENCES `dealers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 3. technicians
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `technicians` (
  `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `dealer_id`  INT UNSIGNED    NOT NULL,
  `nombre`     VARCHAR(200)    NOT NULL,
  `email`      VARCHAR(200)    NULL,
  `rfc`        VARCHAR(20)     NULL,
  `telefono`   VARCHAR(30)     NULL,
  `activo`     TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tech_dealer` (`dealer_id`),
  CONSTRAINT `fk_tech_dealer` FOREIGN KEY (`dealer_id`) REFERENCES `dealers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 4. courses
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `courses` (
  `id`      INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `nombre`  VARCHAR(300)    NOT NULL,
  `activo`  TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 5. training_sessions
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `training_sessions` (
  `id`                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `course_id`         INT UNSIGNED  NOT NULL,
  `session_date`      DATE          NOT NULL,
  `location_code`     TINYINT UNSIGNED NOT NULL COMMENT '1-4',
  `created_by_user_id` INT UNSIGNED NOT NULL,
  `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ts_course` (`course_id`),
  KEY `idx_ts_date` (`session_date`),
  KEY `idx_ts_location` (`location_code`),
  CONSTRAINT `fk_ts_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ts_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 6. session_invites
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `session_invites` (
  `id`                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `session_id`        INT UNSIGNED  NOT NULL,
  `technician_id`     INT UNSIGNED  NOT NULL,
  `dealer_confirmed`  TINYINT(1)    NOT NULL DEFAULT 0,
  `confirmed_at`      DATETIME      NULL,
  `confirm_user_id`   INT UNSIGNED  NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_invite` (`session_id`, `technician_id`),
  KEY `idx_inv_tech` (`technician_id`),
  CONSTRAINT `fk_inv_session` FOREIGN KEY (`session_id`) REFERENCES `training_sessions`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inv_tech` FOREIGN KEY (`technician_id`) REFERENCES `technicians`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inv_confirm_user` FOREIGN KEY (`confirm_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 7. attendance
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `attendance` (
  `id`                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `session_id`        INT UNSIGNED  NOT NULL,
  `technician_id`     INT UNSIGNED  NOT NULL,
  `status`            ENUM('PRESENTE','AUSENTE') NOT NULL,
  `comments`          TEXT          NULL,
  `marked_by_user_id` INT UNSIGNED  NOT NULL,
  `marked_at`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_attendance` (`session_id`, `technician_id`),
  CONSTRAINT `fk_att_session` FOREIGN KEY (`session_id`) REFERENCES `training_sessions`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_tech` FOREIGN KEY (`technician_id`) REFERENCES `technicians`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_user` FOREIGN KEY (`marked_by_user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PHASE 2 STUBS (tables created but not used yet)
-- ============================================================

-- -----------------------------------------------------------
-- 8. certificates
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `certificates` (
  `id`             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `technician_id`  INT UNSIGNED  NOT NULL,
  `course_id`      INT UNSIGNED  NOT NULL,
  `session_id`     INT UNSIGNED  NULL,
  `file_path`      VARCHAR(500)  NULL,
  `issued_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cert_tech` (`technician_id`),
  KEY `idx_cert_course` (`course_id`),
  CONSTRAINT `fk_cert_tech` FOREIGN KEY (`technician_id`) REFERENCES `technicians`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cert_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cert_session` FOREIGN KEY (`session_id`) REFERENCES `training_sessions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 9. exams
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `exams` (
  `id`        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `course_id` INT UNSIGNED  NOT NULL,
  `title`     VARCHAR(300)  NOT NULL,
  `active`    TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_exam_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 10. exam_results
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `exam_results` (
  `id`             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `exam_id`        INT UNSIGNED  NOT NULL,
  `technician_id`  INT UNSIGNED  NOT NULL,
  `score`          DECIMAL(5,2)  NOT NULL DEFAULT 0,
  `passed`         TINYINT(1)    NOT NULL DEFAULT 0,
  `taken_at`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_er_exam` (`exam_id`),
  KEY `idx_er_tech` (`technician_id`),
  CONSTRAINT `fk_er_exam` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_er_tech` FOREIGN KEY (`technician_id`) REFERENCES `technicians`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 11. training_history (for manual history import)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `training_history` (
  `id`             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `technician_id`  INT UNSIGNED  NOT NULL,
  `course_name`    VARCHAR(300)  NOT NULL,
  `training_date`  DATE          NULL,
  `result`         VARCHAR(100)  NULL,
  `certificate_file` VARCHAR(500) NULL,
  `imported_by`    INT UNSIGNED  NOT NULL,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_th_tech` (`technician_id`),
  CONSTRAINT `fk_th_tech` FOREIGN KEY (`technician_id`) REFERENCES `technicians`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_th_importer` FOREIGN KEY (`imported_by`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
