// Feature flags (Phase 2 stubs)
export const ENABLE_EXAMS = false
export const ENABLE_CERTIFICATES = false

export const LOCATIONS: Record<number, string> = {
  1: "Lugar 1 - Centro de Capacitación CDMX",
  2: "Lugar 2 - Centro Técnico Monterrey",
  3: "Lugar 3 - Planta Querétaro",
  4: "Lugar 4 - Centro Regional Guadalajara",
}

export type Role = "ADMIN_MASTER" | "DEALER_ADMIN"

export interface Dealer {
  id: number
  nombre: string
  codigo: string
  activo: boolean
}

export interface User {
  id: number
  dealer_id: number | null
  role: Role
  nombre: string
  email: string
  activo: boolean
}

export interface Technician {
  id: number
  dealer_id: number
  nombre: string
  email: string
  rfc: string
  telefono: string
  activo: boolean
  created_at: string
}

export interface Course {
  id: number
  nombre: string
  activo: boolean
}

export interface TrainingSession {
  id: number
  course_id: number
  session_date: string
  location_code: number
  created_by_user_id: number
  created_at: string
  // joined
  course_name?: string
  location_name?: string
  invite_count?: number
  confirmed_count?: number
}

export interface SessionInvite {
  id: number
  session_id: number
  technician_id: number
  dealer_confirmed: boolean
  confirmed_at: string | null
  confirm_user_id: number | null
  // joined
  technician_name?: string
  dealer_name?: string
  dealer_id?: number
  attendance_status?: "PRESENTE" | "AUSENTE" | null
}

export interface Attendance {
  id: number
  session_id: number
  technician_id: number
  status: "PRESENTE" | "AUSENTE"
  comments: string
  marked_by_user_id: number
  marked_at: string
}

export interface TrainingHistory {
  id: number
  technician_id: number
  course_name: string
  training_date: string | null
  result: string | null
  certificate_file: string | null
  imported_by: number
  created_at: string
  // joined
  technician_name?: string
  dealer_name?: string
}

export interface Certificate {
  id: number
  technician_id: number
  course_id: number
  session_id: number | null
  file_path: string | null
  issued_at: string | null
}
