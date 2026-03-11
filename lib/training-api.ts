/**
 * Cliente de la API de capacitación (Training).
 * La URL base se lee de ENV: NEXT_PUBLIC_TRAINING_API_URL (.env.local o .env).
 * Si está vacía, se usan las rutas Next.js locales (/api/training/*).
 */

import { getTrainingApiUrl } from "@/lib/env"

import type {
  Course,
  Dealer,
  SessionInvite,
  Technician,
  TrainingSession,
  TrainingHistory,
  Attendance,
} from "./training-types"

export function getTrainingApiBase(): string {
  return getTrainingApiUrl()
}

function apiPath(segment: string, params?: Record<string, string | number | undefined>): string {
  const base = getTrainingApiUrl()
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (!base && !(window as unknown as { __trainingApiWarned?: boolean }).__trainingApiWarned) {
      ;(window as unknown as { __trainingApiWarned?: boolean }).__trainingApiWarned = true
      console.warn(
        "[Training API] NEXT_PUBLIC_TRAINING_API_URL no está definida. Peticiones a /api/training/* (origen actual). " +
          "Para usar otra API: copia .env.example a .env.local, asigna la URL y reinicia el servidor (npm run dev)."
      )
    }
  }
  const path = `/api/training${segment}`
  const qs =
    params && Object.keys(params).length
      ? "?" +
        new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")
          ) as Record<string, string>
        )
      : ""
  return base ? `${base.replace(/\/$/, "")}${path}${qs}` : `${path}${qs}`
}

async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = apiPath(path, params)
  const res = await fetch(url, { credentials: "include" })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.ok === false) throw new Error(json?.error ?? `Error ${res.status}`)
  return json.data as T
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const url = apiPath(path)
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.ok === false) throw new Error(json?.error ?? `Error ${res.status}`)
  return json.data as T
}

async function put<T>(path: string, body: unknown, query?: Record<string, string | number>): Promise<T> {
  const base = getTrainingApiUrl()
  const segment = `/api/training${path}`
  const qs = query && Object.keys(query).length ? "?" + new URLSearchParams(query as Record<string, string>) : ""
  const url = base ? `${base.replace(/\/$/, "")}${segment}${qs}` : `${segment}${qs}`
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.ok === false) throw new Error(json?.error ?? `Error ${res.status}`)
  return json.data as T
}

async function del<T>(path: string, query?: Record<string, string | number>): Promise<T> {
  const base = getTrainingApiUrl()
  const segment = `/api/training${path}`
  const qs = query && Object.keys(query).length ? "?" + new URLSearchParams(query as Record<string, string>) : ""
  const url = base ? `${base.replace(/\/$/, "")}${segment}${qs}` : `${segment}${qs}`
  const res = await fetch(url, { method: "DELETE", credentials: "include" })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.ok === false) throw new Error(json?.error ?? `Error ${res.status}`)
  return json.data as T
}

// ——— Sessions ———
export async function getSessions(params?: {
  from?: string
  to?: string
  dealer_id?: number
  location?: number
  q?: string
}): Promise<TrainingSession[]> {
  return get<TrainingSession[]>("/sessions", params as Record<string, string | number | undefined>)
}

export async function createSession(body: {
  course_id: number
  session_date: string
  location_code: number
}): Promise<{ id: number; message?: string }> {
  return post("/sessions", body)
}

// ——— Invites ———
export async function getInvites(sessionId: number): Promise<SessionInvite[]> {
  return get<SessionInvite[]>("/invites", { session_id: sessionId })
}

export async function addInvites(body: { session_id: number; technician_ids: number[] }): Promise<{ added: number; message?: string }> {
  return post("/invites", body)
}

export async function confirmInvite(inviteId: number): Promise<{ message?: string }> {
  return post("/invites/confirm", { invite_id: inviteId })
}

// ——— Attendance ———
export async function getAttendance(sessionId: number): Promise<Attendance[]> {
  return get<Attendance[]>("/attendance", { session_id: sessionId })
}

export async function markAttendance(body: {
  session_id: number
  records: Array<{ technician_id: number; status: "PRESENTE" | "AUSENTE"; comments?: string }>
}): Promise<{ marked: number; skipped: number; message?: string }> {
  return post("/attendance", body)
}

// ——— Technicians ———
export async function getTechnicians(dealerId?: number): Promise<Technician[]> {
  return get<Technician[]>("/technicians", dealerId != null ? { dealer_id: dealerId } : undefined)
}

export async function createTechnician(body: {
  dealer_id?: number
  nombre: string
  email?: string | null
  rfc?: string | null
  telefono?: string | null
}): Promise<{ id: number; message?: string }> {
  return post("/technicians", body)
}

export async function updateTechnician(
  id: number,
  body: Partial<{ nombre: string; email: string | null; rfc: string | null; telefono: string | null; activo: number }>
): Promise<{ message?: string }> {
  return put("/technicians", body, { id })
}

export async function deleteTechnician(id: number): Promise<{ message?: string }> {
  return del("/technicians", { id })
}

// ——— Courses & Dealers ———
export async function getCourses(): Promise<Course[]> {
  return get<Course[]>("/courses")
}

export async function getDealers(): Promise<Dealer[]> {
  return get<Dealer[]>("/dealers")
}

// ——— History ———
export async function getHistory(technicianId?: number): Promise<TrainingHistory[]> {
  return get<TrainingHistory[]>("/history", technicianId != null ? { technician_id: technicianId } : undefined)
}

export async function importHistory(body: {
  technician_id: number
  course_name: string
  training_date?: string | null
  result?: string | null
  certificate_file?: string | null
}): Promise<{ id: number; message?: string }> {
  return post("/history", body)
}
