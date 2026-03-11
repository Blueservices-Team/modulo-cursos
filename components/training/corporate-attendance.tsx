"use client"

import { useState, useEffect, useCallback } from "react"
import { ContentCard } from "./content-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import * as api from "@/lib/training-api"
import { LOCATIONS } from "@/lib/training-types"
import type { TrainingSession, SessionInvite, Attendance, Technician, Dealer, Course } from "@/lib/training-types"
import { ClipboardCheck, Check, X, AlertCircle, Loader2 } from "lucide-react"

interface AttendanceEntry {
  technician_id: number
  status: "PRESENTE" | "AUSENTE" | null
  comments: string
}

export function CorporateAttendance() {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [invites, setInvites] = useState<SessionInvite[]>([])
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([])
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([])
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      setLoading(true)
      try {
        const [sess, cour, tech, deal] = await Promise.all([
          api.getSessions(),
          api.getCourses(),
          api.getTechnicians(),
          api.getDealers(),
        ])
        if (!cancelled) {
          setSessions(Array.isArray(sess) ? sess : [])
          setCourses(Array.isArray(cour) ? cour : [])
          setTechnicians(Array.isArray(tech) ? tech : [])
          setDealers(Array.isArray(deal) ? deal : [])
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error al cargar")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSelectSession = useCallback(async (sessionId: string) => {
    setSelectedSessionId(sessionId)
    setSaved(false)
    if (!sessionId) return
    const sid = Number(sessionId)
    try {
      const [inv, att] = await Promise.all([api.getInvites(sid), api.getAttendance(sid)])
      const invList = Array.isArray(inv) ? inv : []
      const attList = Array.isArray(att) ? att : []
      setInvites(invList)
      setAttendanceList(attList)
      const entries: AttendanceEntry[] = invList
        .filter((i) => i.dealer_confirmed)
        .map((inv) => {
          const existing = attList.find(
            (a) => a.session_id === sid && a.technician_id === inv.technician_id
          )
          return {
            technician_id: inv.technician_id,
            status: (existing?.status as "PRESENTE" | "AUSENTE") ?? null,
            comments: existing?.comments ?? "",
          }
        })
      setAttendanceEntries(entries)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar sesión")
    }
  }, [])

  function setEntryStatus(techId: number, status: "PRESENTE" | "AUSENTE") {
    setAttendanceEntries((prev) =>
      prev.map((e) => (e.technician_id === techId ? { ...e, status } : e))
    )
    setSaved(false)
  }

  function setEntryComments(techId: number, comments: string) {
    setAttendanceEntries((prev) =>
      prev.map((e) => (e.technician_id === techId ? { ...e, comments } : e))
    )
    setSaved(false)
  }

  async function handleSaveAttendance() {
    if (!selectedSessionId) return
    const session = sessions.find((s) => s.id === Number(selectedSessionId))
    if (!session) return

    const records = attendanceEntries
      .filter((e) => e.status)
      .map((e) => ({
        technician_id: e.technician_id,
        status: e.status!,
        comments: e.comments || undefined,
      }))
    if (records.length === 0) return

    setError(null)
    try {
      await api.markAttendance({ session_id: session.id, records })
      setSaved(true)
      const att = await api.getAttendance(session.id)
      setAttendanceList(Array.isArray(att) ? att : [])
      const entries: AttendanceEntry[] = invites
        .filter((i) => i.dealer_confirmed)
        .map((inv) => {
          const existing = (Array.isArray(att) ? att : []).find(
            (a) => a.technician_id === inv.technician_id
          )
          return {
            technician_id: inv.technician_id,
            status: (existing?.status as "PRESENTE" | "AUSENTE") ?? null,
            comments: existing?.comments ?? "",
          }
        })
      setAttendanceEntries(entries)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar asistencia")
    }
  }

  const session = selectedSessionId ? sessions.find((s) => s.id === Number(selectedSessionId)) : null
  const course = session ? courses.find((c) => c.id === session.course_id) : null
  const unconfirmedInvites = invites.filter((i) => !i.dealer_confirmed)

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pase de Lista</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Cargando...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pase de Lista</h1>
        <p className="text-muted-foreground mt-1">Marque la asistencia de los técnicos confirmados por sus dealers</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <ContentCard title="Seleccionar Sesión">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-64">
            <Select value={selectedSessionId} onValueChange={handleSelectSession}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una sesión..." />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((s) => {
                  const c = courses.find((co) => co.id === s.course_id)
                  return (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {c?.nombre} - {s.session_date} ({LOCATIONS[s.location_code]})
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ContentCard>

      {session && (
        <>
          <ContentCard>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Curso</p>
                <p className="font-medium text-card-foreground">{course?.nombre}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha</p>
                <p className="font-medium text-card-foreground">{session.session_date}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Lugar</p>
                <p className="font-medium text-card-foreground">{LOCATIONS[session.location_code]}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Invitados</p>
                <p className="font-medium text-card-foreground">{invites.length}</p>
              </div>
            </div>
          </ContentCard>

          {unconfirmedInvites.length > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="size-5 text-amber-600 shrink-0" />
              <span className="text-amber-800">
                {unconfirmedInvites.length} técnico(s) no confirmado(s) por su dealer. Solo puede marcar asistencia a técnicos confirmados.
              </span>
            </div>
          )}

          <ContentCard
            title="Asistencia"
            actions={
              <Button onClick={handleSaveAttendance} className="gap-2" disabled={attendanceEntries.every((e) => !e.status)}>
                <ClipboardCheck className="size-4" />
                Guardar Asistencia
              </Button>
            }
          >
            {saved && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-4 text-sm text-green-700">
                <Check className="size-4" />
                Asistencia guardada correctamente.
              </div>
            )}

            {attendanceEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No hay técnicos confirmados para esta sesión.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-foreground">Técnico</th>
                      <th className="text-left py-3 px-2 font-medium text-foreground">Dealer</th>
                      <th className="text-left py-3 px-2 font-medium text-foreground">Estado</th>
                      <th className="text-left py-3 px-2 font-medium text-foreground">Asistencia</th>
                      <th className="text-left py-3 px-2 font-medium text-foreground">Comentarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceEntries.map((entry) => {
                      const tech = technicians.find((t) => t.id === entry.technician_id)
                      const dealer = dealers.find((d) => d.id === tech?.dealer_id)
                      return (
                        <tr key={entry.technician_id} className="border-b border-border last:border-0">
                          <td className="py-3 px-2 font-medium text-card-foreground">{tech?.nombre}</td>
                          <td className="py-3 px-2 text-muted-foreground">{dealer?.nombre}</td>
                          <td className="py-3 px-2">
                            <Badge variant="default">Confirmado</Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant={entry.status === "PRESENTE" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setEntryStatus(entry.technician_id, "PRESENTE")}
                                className="gap-1"
                              >
                                <Check className="size-3" />
                                Presente
                              </Button>
                              <Button
                                variant={entry.status === "AUSENTE" ? "destructive" : "outline"}
                                size="sm"
                                onClick={() => setEntryStatus(entry.technician_id, "AUSENTE")}
                                className="gap-1"
                              >
                                <X className="size-3" />
                                Ausente
                              </Button>
                            </div>
                          </td>
                          <td className="py-3 px-2 min-w-40">
                            <Textarea
                              value={entry.comments}
                              onChange={(e) => setEntryComments(entry.technician_id, e.target.value)}
                              placeholder="Comentarios..."
                              rows={1}
                              className="text-sm resize-none"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </ContentCard>
        </>
      )}
    </div>
  )
}
