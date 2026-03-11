# Contrato API – Frontend Training Module

URL base: **`VITE_TRAINING_API_URL`** (ej. `http://localhost:8000`). Todas las rutas van bajo **`/api/training`**.

---

## Formato de respuesta que entiende el frontend

- **GET (listas):** Acepta cualquiera de:
  - `{ "data": [ ... ] }`
  - `[ ... ]` (array directo)
  - `{ "history": [ ... ] }` o `{ "records": [ ... ] }`
- **GET (si no hay datos):** Si no viene lista, el front usa `[]`.
- **POST / PUT / DELETE:** Espera `{ "data": <resultado> }`. Si la API devuelve otro envoltorio, el front usa `json.data` (puede quedar `undefined`).
- **Errores:** `res.ok === false` o cuerpo con `"ok": false` → el front lanza `Error(json?.error ?? "Error " + status)`.

---

## Endpoints usados por el frontend

### 1. Sesiones

| Uso en front | Método | URL completa | Query / Body | Respuesta esperada |
|--------------|--------|--------------|--------------|--------------------|
| Listar sesiones | **GET** | `{base}/api/training/sessions` | Opcionales: `from`, `to`, `dealer_id`, `location`, `q` | Array de `TrainingSession` |
| Crear sesión | **POST** | `{base}/api/training/sessions` | Body: `{ course_id, session_date, location_code }` | `{ data: { id: number, message?: string } }` |

**TrainingSession** (cada elemento del array):
```json
{
  "id": 1,
  "course_id": 1,
  "session_date": "2025-03-15",
  "location_code": 1,
  "created_by_user_id": 1,
  "created_at": "2025-01-01T00:00:00Z",
  "course_name": "opcional",
  "location_name": "opcional",
  "invite_count": "opcional number",
  "confirmed_count": "opcional number"
}
```

---

### 2. Invitaciones

| Uso en front | Método | URL completa | Query / Body | Respuesta esperada |
|--------------|--------|--------------|--------------|--------------------|
| Invitaciones de una sesión | **GET** | `{base}/api/training/invite` | **Query:** `session_id` (number) | Array de `SessionInvite` |
| Añadir invitaciones | **POST** | `{base}/api/training/invites` | Body: `{ session_id, technician_ids: number[] }` | `{ data: { added: number, message?: string } }` |
| Confirmar invitación | **POST** | `{base}/api/training/invites/confirm` | Body: `{ invite_id: number }` | `{ data: { message?: string } }` |

**SessionInvite** (cada elemento):
```json
{
  "id": 1,
  "session_id": 1,
  "technician_id": 1,
  "dealer_confirmed": true,
  "confirmed_at": "2025-01-01T12:00:00Z",
  "confirm_user_id": 2,
  "technician_name": "opcional",
  "dealer_name": "opcional",
  "dealer_id": "opcional",
  "attendance_status": "PRESENTE | AUSENTE | null"
}
```

---

### 3. Asistencia

| Uso en front | Método | URL completa | Query / Body | Respuesta esperada |
|--------------|--------|--------------|--------------|--------------------|
| Asistencia de una sesión | **GET** | `{base}/api/training/attendance` | **Query:** `session_id` (number) | Array de `Attendance` |
| Registrar asistencia | **POST** | `{base}/api/training/attendance` | Body: `{ session_id, records: [{ technician_id, status: "PRESENTE"|"AUSENTE", comments? }] }` | `{ data: { marked: number, skipped: number, message?: string } }` |

**Attendance** (cada elemento):
```json
{
  "id": 1,
  "session_id": 1,
  "technician_id": 1,
  "status": "PRESENTE",
  "comments": "",
  "marked_by_user_id": 1,
  "marked_at": "2025-01-01T12:00:00Z"
}
```

---

### 4. Técnicos

| Uso en front | Método | URL completa | Query / Body | Respuesta esperada |
|--------------|--------|--------------|--------------|--------------------|
| Listar técnicos | **GET** | `{base}/api/training/technicians` | Opcional: `dealer_id` | Array de `Technician` |
| Crear técnico | **POST** | `{base}/api/training/technicians` | Body: `{ dealer_id?, nombre, email?, rfc?, telefono? }` | `{ data: { id: number, message?: string } }` |
| Actualizar técnico | **PUT** | `{base}/api/training/technicians?id={id}` | Body: parcial de `{ nombre, email, rfc, telefono, activo }` | `{ data: { message?: string } }` |
| Eliminar técnico | **DELETE** | `{base}/api/training/technicians?id={id}` | — | `{ data: { message?: string } }` |

**Technician** (cada elemento):
```json
{
  "id": 1,
  "dealer_id": 1,
  "nombre": "Juan Pérez",
  "email": "juan@mail.com",
  "rfc": "PEGJ800101ABC",
  "telefono": "55 1234 5601",
  "activo": true,
  "created_at": "opcional"
}
```

---

### 5. Cursos

| Uso en front | Método | URL completa | Query / Body | Respuesta esperada |
|--------------|--------|--------------|--------------|--------------------|
| Listar cursos | **GET** | `{base}/api/training/courses` | — | Array de `Course` |

**Course** (cada elemento):
```json
{
  "id": 1,
  "nombre": "Diagnóstico básico",
  "activo": true
}
```

---

### 6. Dealers

| Uso en front | Método | URL completa | Query / Body | Respuesta esperada |
|--------------|--------|--------------|--------------|--------------------|
| Listar dealers | **GET** | `{base}/api/training/dealers` | — | Array de `Dealer` |

**Dealer** (cada elemento):
```json
{
  "id": 1,
  "nombre": "Dealer CDMX",
  "codigo": "DLR-01",
  "activo": true
}
```

---

### 7. Historial (Migración / Histórico)

| Uso en front | Método | URL completa | Query / Body | Respuesta esperada |
|--------------|--------|--------------|--------------|--------------------|
| Listar historial | **GET** | `{base}/api/training/history` | Opcional: `technician_id` | Array de `TrainingHistory` |
| Importar registro | **POST** | `{base}/api/training/history` | Body: `{ technician_id, course_name, training_date?, result?, certificate_file? }` | `{ data: { id: number, message?: string } }` |

**TrainingHistory** (cada elemento):
```json
{
  "id": 1,
  "technician_id": 1,
  "course_name": "Inducción general",
  "training_date": "2024-01-15",
  "result": "Aprobado",
  "certificate_file": null,
  "imported_by": 1,
  "created_at": "2025-01-01T00:00:00Z",
  "technician_name": "opcional",
  "dealer_name": "opcional"
}
```

---

## Resumen de rutas para tu API

| Método | Ruta bajo `/api/training` | Query / Body |
|--------|---------------------------|--------------|
| GET | `/sessions` | opc: `from`, `to`, `dealer_id`, `location`, `q` |
| POST | `/sessions` | body: `course_id`, `session_date`, `location_code` |
| GET | `/invite` | **obligatorio:** `session_id` |
| POST | `/invites` | body: `session_id`, `technician_ids` |
| POST | `/invites/confirm` | body: `invite_id` |
| GET | `/attendance` | **obligatorio:** `session_id` |
| POST | `/attendance` | body: `session_id`, `records` |
| GET | `/technicians` | opc: `dealer_id` |
| POST | `/technicians` | body: `dealer_id?`, `nombre`, `email?`, `rfc?`, `telefono?` |
| PUT | `/technicians?id={id}` | body: campos a actualizar |
| DELETE | `/technicians?id={id}` | — |
| GET | `/courses` | — |
| GET | `/dealers` | — |
| GET | `/history` | opc: `technician_id` |
| POST | `/history` | body: `technician_id`, `course_name`, etc. |

---

## Checklist de sincronía

- [ ] Base URL = `http://localhost:8000` (o la que uses en `.env`).
- [ ] Prefijo de ruta = `/api/training` (ej. listar cursos = `GET /api/training/courses`).
- [ ] Invitaciones de sesión = **GET `/api/training/invite?session_id=1`** (singular `invite`).
- [ ] Listas: respuesta con `data` o array directo; el front acepta ambos.
- [ ] Errores: status 4xx/5xx o `"ok": false` y mensaje en `json.error`.
- [ ] Autenticación: si la API exige sesión, usar modo desarrollo (`DEV_AUTO_SESSION=1`, etc.) para probar sin login.
