import type {
  Dealer,
  User,
  Technician,
  Course,
  TrainingSession,
  SessionInvite,
  Attendance,
  TrainingHistory,
} from "./training-types"

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

const now = new Date().toISOString()

// In-memory data store (simulates MySQL database)
export const dealers: Dealer[] = [
  { id: 1, nombre: "Dealer Ciudad de México", codigo: "DLR-CDMX", activo: true },
  { id: 2, nombre: "Dealer Monterrey", codigo: "DLR-MTY", activo: true },
]

export const users: User[] = [
  { id: 1, dealer_id: null, role: "ADMIN_MASTER", nombre: "Carlos Admin Corporativo", email: "admin@changan.com", activo: true },
  { id: 2, dealer_id: 1, role: "DEALER_ADMIN", nombre: "María Dealer CDMX", email: "maria@dealer-cdmx.com", activo: true },
  { id: 3, dealer_id: 2, role: "DEALER_ADMIN", nombre: "Roberto Dealer MTY", email: "roberto@dealer-mty.com", activo: true },
]

export const technicians: Technician[] = [
  { id: 1, dealer_id: 1, nombre: "Juan Pérez López", email: "juan.perez@dealer-cdmx.com", rfc: "PELJ900101ABC", telefono: "5551234001", activo: true, created_at: now },
  { id: 2, dealer_id: 1, nombre: "Ana García Martínez", email: "ana.garcia@dealer-cdmx.com", rfc: "GAMA880215DEF", telefono: "5551234002", activo: true, created_at: now },
  { id: 3, dealer_id: 1, nombre: "Pedro Ramírez Soto", email: "pedro.ramirez@dealer-cdmx.com", rfc: "RASP910310GHI", telefono: "5551234003", activo: true, created_at: now },
  { id: 4, dealer_id: 1, nombre: "Laura Torres Díaz", email: "laura.torres@dealer-cdmx.com", rfc: "TODL850722JKL", telefono: "5551234004", activo: true, created_at: now },
  { id: 5, dealer_id: 1, nombre: "Miguel Hernández Cruz", email: "miguel.hdz@dealer-cdmx.com", rfc: "HECM920430MNO", telefono: "5551234005", activo: true, created_at: now },
  { id: 6, dealer_id: 1, nombre: "Sofía López Ruiz", email: "sofia.lopez@dealer-cdmx.com", rfc: "LORS940815PQR", telefono: "5551234006", activo: true, created_at: now },
  { id: 7, dealer_id: 2, nombre: "Carlos Mendoza Ríos", email: "carlos.mendoza@dealer-mty.com", rfc: "MERC870505STU", telefono: "8181234001", activo: true, created_at: now },
  { id: 8, dealer_id: 2, nombre: "Diana Flores Vargas", email: "diana.flores@dealer-mty.com", rfc: "FOVD890620VWX", telefono: "8181234002", activo: true, created_at: now },
  { id: 9, dealer_id: 2, nombre: "José Castillo Moreno", email: "jose.castillo@dealer-mty.com", rfc: "CAMJ910718YZA", telefono: "8181234003", activo: true, created_at: now },
  { id: 10, dealer_id: 2, nombre: "Patricia Navarro Gómez", email: "patricia.navarro@dealer-mty.com", rfc: "NAGP860903BCD", telefono: "8181234004", activo: true, created_at: now },
  { id: 11, dealer_id: 2, nombre: "Ricardo Salinas Vega", email: "ricardo.salinas@dealer-mty.com", rfc: "SAVR930112EFG", telefono: "8181234005", activo: true, created_at: now },
  { id: 12, dealer_id: 2, nombre: "Valeria Ortiz Luna", email: "valeria.ortiz@dealer-mty.com", rfc: "OILV950228HIJ", telefono: "8181234006", activo: true, created_at: now },
]

export const courses: Course[] = [
  { id: 1, nombre: "Diagnóstico Electrónico Avanzado", activo: true },
  { id: 2, nombre: "Motor y Transmisión CHANGAN CS55+", activo: true },
  { id: 3, nombre: "Sistemas ADAS y Conducción Asistida", activo: true },
]

export const trainingSessions: TrainingSession[] = [
  { id: 1, course_id: 1, session_date: addDays(10), location_code: 1, created_by_user_id: 1, created_at: now },
  { id: 2, course_id: 2, session_date: addDays(20), location_code: 2, created_by_user_id: 1, created_at: now },
  { id: 3, course_id: 3, session_date: addDays(45), location_code: 3, created_by_user_id: 1, created_at: now },
  { id: 4, course_id: 1, session_date: addDays(60), location_code: 4, created_by_user_id: 1, created_at: now },
]

export const sessionInvites: SessionInvite[] = [
  // Session 1
  { id: 1, session_id: 1, technician_id: 1, dealer_confirmed: true, confirmed_at: now, confirm_user_id: 2 },
  { id: 2, session_id: 1, technician_id: 2, dealer_confirmed: false, confirmed_at: null, confirm_user_id: null },
  { id: 3, session_id: 1, technician_id: 3, dealer_confirmed: true, confirmed_at: now, confirm_user_id: 2 },
  { id: 4, session_id: 1, technician_id: 7, dealer_confirmed: true, confirmed_at: now, confirm_user_id: 3 },
  { id: 5, session_id: 1, technician_id: 8, dealer_confirmed: false, confirmed_at: null, confirm_user_id: null },
  // Session 2
  { id: 6, session_id: 2, technician_id: 1, dealer_confirmed: false, confirmed_at: null, confirm_user_id: null },
  { id: 7, session_id: 2, technician_id: 4, dealer_confirmed: true, confirmed_at: now, confirm_user_id: 2 },
  { id: 8, session_id: 2, technician_id: 5, dealer_confirmed: false, confirmed_at: null, confirm_user_id: null },
  { id: 9, session_id: 2, technician_id: 6, dealer_confirmed: true, confirmed_at: now, confirm_user_id: 2 },
  // Session 3
  { id: 10, session_id: 3, technician_id: 9, dealer_confirmed: false, confirmed_at: null, confirm_user_id: null },
  { id: 11, session_id: 3, technician_id: 10, dealer_confirmed: true, confirmed_at: now, confirm_user_id: 3 },
  { id: 12, session_id: 3, technician_id: 11, dealer_confirmed: false, confirmed_at: null, confirm_user_id: null },
  { id: 13, session_id: 3, technician_id: 12, dealer_confirmed: true, confirmed_at: now, confirm_user_id: 3 },
  // Session 4
  { id: 14, session_id: 4, technician_id: 2, dealer_confirmed: false, confirmed_at: null, confirm_user_id: null },
  { id: 15, session_id: 4, technician_id: 3, dealer_confirmed: false, confirmed_at: null, confirm_user_id: null },
  { id: 16, session_id: 4, technician_id: 7, dealer_confirmed: false, confirmed_at: null, confirm_user_id: null },
  { id: 17, session_id: 4, technician_id: 11, dealer_confirmed: false, confirmed_at: null, confirm_user_id: null },
]

export const attendance: Attendance[] = []

export const trainingHistory: TrainingHistory[] = [
  { id: 1, technician_id: 1, course_name: "Inducción Mecánica General", training_date: "2024-03-15", result: "Aprobado", certificate_file: null, imported_by: 1, created_at: now },
  { id: 2, technician_id: 1, course_name: "Electricidad Automotriz Básica", training_date: "2024-06-20", result: "Aprobado", certificate_file: null, imported_by: 1, created_at: now },
  { id: 3, technician_id: 7, course_name: "Inducción Mecánica General", training_date: "2024-04-10", result: "Aprobado", certificate_file: null, imported_by: 1, created_at: now },
  { id: 4, technician_id: 7, course_name: "Motor CHANGAN CS35 Plus", training_date: "2024-08-05", result: "Aprobado", certificate_file: null, imported_by: 1, created_at: now },
]

// Auto-increment counters
let nextTechId = 13
let nextSessionId = 5
let nextInviteId = 18
let nextAttendanceId = 1
let nextHistoryId = 5
let nextCourseId = 4

export function getNextTechId() { return nextTechId++ }
export function getNextSessionId() { return nextSessionId++ }
export function getNextInviteId() { return nextInviteId++ }
export function getNextAttendanceId() { return nextAttendanceId++ }
export function getNextHistoryId() { return nextHistoryId++ }
export function getNextCourseId() { return nextCourseId++ }
