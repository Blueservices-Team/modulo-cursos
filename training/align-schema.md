# Alineación API y Front con el schema del proyecto

## Prompt para alineación

Copia y usa este texto cuando quieras que la API o el front queden alineados con el schema del módulo de capacitación:

---

**Objetivo:** Alinear la base de datos y la API con el schema y comportamiento del **front** del proyecto modulo-cursos (training).

**Schema de referencia:** El front y la API del proyecto esperan el schema definido en `training/database.sql`. Todas las tablas, tipos de columnas y restricciones deben coincidir con ese archivo.

**Reglas de alineación:**

1. **Tipos de datos:** Usar exactamente los del proyecto: `VARCHAR(200)` en dealers.nombre, users.nombre/email, technicians.nombre/email; `VARCHAR(300)` en courses.nombre, exams.title, training_history.course_name; `VARCHAR(30)` en technicians.telefono; `VARCHAR(20)` en technicians.rfc.
2. **Nullabilidad:** `technicians.email` debe ser **NULL** (el front/API permiten técnicos sin email). `certificates.file_path` debe ser **NULL** (certificado sin archivo). `exam_results.score` debe ser **NOT NULL DEFAULT 0**.
3. **session_invites:** En el proyecto **no** existe la columna `created_at`; si tu BD la tiene, puedes eliminarla para coincidir o dejarla (la API no la usa).
4. **Respuestas API:** Formato `{ "ok": true|false, "data": ... | null, "error": "..." | null }`. Mismos códigos HTTP y mismos contratos de endpoints que el front (ver PROMPT-API-TRAINING.md).
5. **Roles:** ADMIN_MASTER (corporativo) y DEALER_ADMIN (dealer); misma lógica de permisos por recurso.

Cuando implementes o modifiques la API o migraciones, cumple siempre con `training/database.sql` y con los endpoints descritos en PROMPT-API-TRAINING.md para que front y API estén alineados.

---

## ALTER TABLE – Ajustar BD existente al schema del proyecto

Ejecuta estos `ALTER TABLE` sobre la base de datos que quieras alinear con el front (schema en `training/database.sql`). **Haz backup antes.** Si alguna columna no existe o ya tiene el tipo indicado, omite o comenta esa línea.

```sql
-- ============================================================
-- Alineación al schema training/database.sql (MySQL 8+)
-- Ejecutar sobre la BD que usa la API. Hacer backup antes.
-- ============================================================

SET NAMES utf8mb4;

-- -----------------------------------------------------------
-- 1. dealers
-- -----------------------------------------------------------
ALTER TABLE dealers
  MODIFY COLUMN nombre VARCHAR(200) NOT NULL;

-- -----------------------------------------------------------
-- 2. users
-- -----------------------------------------------------------
ALTER TABLE users
  MODIFY COLUMN nombre VARCHAR(200) NOT NULL,
  MODIFY COLUMN email VARCHAR(200) NOT NULL;

-- -----------------------------------------------------------
-- 3. technicians (crítico: email NULL para técnicos sin email)
-- -----------------------------------------------------------
ALTER TABLE technicians
  MODIFY COLUMN nombre VARCHAR(200) NOT NULL,
  MODIFY COLUMN email VARCHAR(200) NULL,
  MODIFY COLUMN rfc VARCHAR(20) NULL,
  MODIFY COLUMN telefono VARCHAR(30) NULL;

-- -----------------------------------------------------------
-- 4. courses
-- -----------------------------------------------------------
ALTER TABLE courses
  MODIFY COLUMN nombre VARCHAR(300) NOT NULL;

-- -----------------------------------------------------------
-- 5. session_invites
-- Opcional: el proyecto no tiene created_at. Si quieres coincidir
-- exactamente, descomenta la línea siguiente (pierdes la columna).
-- -----------------------------------------------------------
-- ALTER TABLE session_invites DROP COLUMN created_at;

-- -----------------------------------------------------------
-- 6. attendance (sin cambios típicos; incluir si faltan índices)
-- -----------------------------------------------------------
-- Si tu tabla no tiene índice por session_id, descomenta:
-- ALTER TABLE attendance ADD KEY idx_att_session (session_id);
-- ALTER TABLE attendance ADD KEY idx_att_tech (technician_id);

-- -----------------------------------------------------------
-- 7. certificates (file_path nullable)
-- -----------------------------------------------------------
ALTER TABLE certificates
  MODIFY COLUMN file_path VARCHAR(500) NULL;

-- -----------------------------------------------------------
-- 8. exams
-- -----------------------------------------------------------
ALTER TABLE exams
  MODIFY COLUMN title VARCHAR(300) NOT NULL;

-- -----------------------------------------------------------
-- 9. exam_results (score obligatorio con default)
-- Si ya tienes índices en exam_id o technician_id, omite las
-- líneas ADD KEY o elimina antes los índices duplicados.
-- -----------------------------------------------------------
ALTER TABLE exam_results
  MODIFY COLUMN score DECIMAL(5,2) NOT NULL DEFAULT 0;

-- Añadir índices del proyecto si no existen (omitir si da error por duplicado):
-- ALTER TABLE exam_results ADD KEY idx_er_exam (exam_id);
-- ALTER TABLE exam_results ADD KEY idx_er_tech (technician_id);

-- -----------------------------------------------------------
-- 10. training_history
-- -----------------------------------------------------------
ALTER TABLE training_history
  MODIFY COLUMN course_name VARCHAR(300) NOT NULL;
```

---

## Orden recomendado

1. Backup de la BD.
2. Ejecutar los `ALTER TABLE` en el orden indicado (dealers → users → technicians → …).
3. Si `technicians.email` tenía NOT NULL y ya tenías filas con email vacío, antes de modificar rellena o actualiza:  
   `UPDATE technicians SET email = NULL WHERE email = '';`  
   Luego aplica el `MODIFY email VARCHAR(200) NULL`.
4. Probar el front contra esta BD (o contra la API que use esta BD) para confirmar que todo responde igual que con el schema del proyecto.
