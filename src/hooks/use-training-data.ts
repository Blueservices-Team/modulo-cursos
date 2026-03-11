"use client"

import { useState, useEffect, useCallback } from "react"
import * as api from "@/lib/training-api"
import type {
  Course,
  Dealer,
  SessionInvite,
  Technician,
  TrainingSession,
  TrainingHistory,
  Attendance,
} from "@/lib/training-types"

export function useTrainingData(role: "ADMIN_MASTER" | "DEALER_ADMIN", dealerId: number | null) {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [invitesBySession, setInvitesBySession] = useState<Record<number, SessionInvite[]>>({})
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [attendance, _setAttendance] = useState<Attendance[]>([])
  const [history, setHistory] = useState<TrainingHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    const params = role === "DEALER_ADMIN" && dealerId ? { dealer_id: dealerId } : undefined
    const data = await api.getSessions(params)
    setSessions(Array.isArray(data) ? data : [])
  }, [role, dealerId])

  const fetchInvitesForSession = useCallback(async (sessionId: number) => {
    const data = await api.getInvites(sessionId)
    setInvitesBySession((prev) => ({ ...prev, [sessionId]: Array.isArray(data) ? data : [] }))
  }, [])

  const fetchTechnicians = useCallback(async () => {
    const data = await api.getTechnicians(role === "DEALER_ADMIN" && dealerId ? dealerId : undefined)
    setTechnicians(Array.isArray(data) ? data : [])
  }, [role, dealerId])

  const fetchCourses = useCallback(async () => {
    const data = await api.getCourses()
    setCourses(Array.isArray(data) ? data : [])
  }, [])

  const fetchDealers = useCallback(async () => {
    if (role !== "ADMIN_MASTER") return
    const data = await api.getDealers()
    setDealers(Array.isArray(data) ? data : [])
  }, [role])

  const fetchHistory = useCallback(async (technicianId?: number) => {
    const data = await api.getHistory(technicianId)
    setHistory(Array.isArray(data) ? data : [])
  }, [])

  const refetch = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      if (import.meta.env.DEV) console.log("[Training API] Cargando sesiones, técnicos, cursos, dealers...")
      await Promise.all([
        fetchSessions(),
        fetchTechnicians(),
        fetchCourses(),
        fetchDealers(),
      ])
      if (import.meta.env.DEV) console.log("[Training API] Datos cargados")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar datos")
      if (import.meta.env.DEV) console.error("[Training API] Error:", e)
    } finally {
      setLoading(false)
    }
  }, [fetchSessions, fetchTechnicians, fetchCourses, fetchDealers])

  useEffect(() => {
    refetch()
  }, [refetch])

  // Si tras 12 s sigue cargando, avisar (API no responde o CORS)
  useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => {
      setError("La API no respondió. Comprueba que esté en marcha (ej. php -S localhost:8000 -t public public/router.php) y CORS.")
      setLoading(false)
    }, 12000)
    return () => clearTimeout(t)
  }, [loading])

  // Invites: load on demand per session, or preload for visible sessions
  const getInvites = useCallback(
    async (sessionId: number): Promise<SessionInvite[]> => {
      if (invitesBySession[sessionId]) return invitesBySession[sessionId]
      const data = await api.getInvites(sessionId)
      const list = Array.isArray(data) ? data : []
      setInvitesBySession((prev) => ({ ...prev, [sessionId]: list }))
      return list
    },
    [invitesBySession]
  )

  const getAttendance = useCallback(async (sessionId: number) => {
    const data = await api.getAttendance(sessionId)
    return Array.isArray(data) ? data : []
  }, [])

  return {
    sessions,
    invitesBySession,
    technicians,
    courses,
    dealers,
    attendance,
    history,
    loading,
    error,
    refetch,
    fetchSessions,
    fetchInvitesForSession,
    fetchTechnicians,
    fetchCourses,
    fetchDealers,
    fetchHistory,
    getInvites,
    getAttendance,
  }
}
