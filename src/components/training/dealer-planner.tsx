"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { ContentCard } from "./content-card"
import { SessionCalendar, type CalendarEvent } from "./session-calendar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import * as api from "@/lib/training-api"
import { LOCATIONS } from "@/lib/training-types"
import type { TrainingSession, SessionInvite, Technician, Course } from "@/lib/training-types"
import { AlertTriangle, Check, MapPin, Users, Clock, Loader2 } from "lucide-react"

function isSessionCompleted(session: TrainingSession, attendanceBySession: Record<number, boolean>): boolean {
  const sessionDate = new Date(session.session_date)
  sessionDate.setHours(23, 59, 59, 999)
  const today = new Date()
  if (sessionDate >= today) return false
  return attendanceBySession[session.id] === true
}

export function DealerPlanner() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [invitesBySession, setInvitesBySession] = useState<Record<number, SessionInvite[]>>({})
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [attendanceBySession, setAttendanceBySession] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null)

  const load = useCallback(async () => {
    if (!user?.dealer_id) return
    setError(null)
    setLoading(true)
    try {
      const [sess, tech, cour] = await Promise.all([
        api.getSessions({ dealer_id: user.dealer_id }),
        api.getTechnicians(user.dealer_id),
        api.getCourses(),
      ])
      setSessions(Array.isArray(sess) ? sess : [])
      setTechnicians(Array.isArray(tech) ? tech : [])
      setCourses(Array.isArray(cour) ? cour : [])
      const sidList = (Array.isArray(sess) ? sess : []).map((s) => s.id)
      const attMap: Record<number, boolean> = {}
      await Promise.all(
        sidList.map(async (sid) => {
          const att = await api.getAttendance(sid)
          attMap[sid] = Array.isArray(att) && att.length > 0
        })
      )
      setAttendanceBySession(attMap)
      const invMap: Record<number, SessionInvite[]> = {}
      await Promise.all(
        sidList.map(async (sid) => {
          const inv = await api.getInvites(sid)
          invMap[sid] = Array.isArray(inv) ? inv : []
        })
      )
      setInvitesBySession(invMap)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar")
    } finally {
      setLoading(false)
    }
  }, [user?.dealer_id])

  useEffect(() => {
    load()
  }, [load])

  if (!user || !user.dealer_id) return null

  const dealerTechs = technicians.filter((t) => t.dealer_id === user.dealer_id && t.activo)
  const hasActiveTechs = dealerTechs.length > 0

  if (!hasActiveTechs) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planeación de Capacitaciones</h1>
          <p className="text-muted-foreground mt-1">Visualice y confirme la asistencia de sus técnicos</p>
        </div>
        <ContentCard>
          <div className="flex flex-col items-center py-10 text-center">
            <AlertTriangle className="size-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No tiene técnicos activos</h3>
            <p className="text-muted-foreground max-w-md">
              Debe registrar al menos un técnico activo antes de poder acceder a la planeación de capacitaciones.
            </p>
          </div>
        </ContentCard>
      </div>
    )
  }

  const dealerTechIds = dealerTechs.map((t) => t.id)
  const relevantSessionIds = [
    ...new Set(
      Object.entries(invitesBySession).flatMap(([sid, invs]) =>
        invs.some((i) => dealerTechIds.includes(i.technician_id)) ? [Number(sid)] : []
      )
    ),
  ]

  const activeSessions = sessions.filter(
    (s) => relevantSessionIds.includes(s.id) && !isSessionCompleted(s, attendanceBySession)
  )

  const calendarEvents: CalendarEvent[] = activeSessions.map((session) => {
    const course = courses.find((c) => c.id === session.course_id)
    const invites = (invitesBySession[session.id] ?? []).filter((i) => dealerTechIds.includes(i.technician_id))
    const confirmed = invites.filter((i) => i.dealer_confirmed).length
    return {
      id: session.id,
      title: course?.nombre || "Sin nombre",
      date: session.session_date,
      location: LOCATIONS[session.location_code] || "Sin lugar",
      inviteCount: invites.length,
      confirmedCount: confirmed,
    }
  })

  function handleEventClick(event: CalendarEvent) {
    const session = activeSessions.find((s) => s.id === event.id)
    if (session) {
      setSelectedSession(session)
      setShowDetailDialog(true)
    }
  }

  async function handleConfirm(inviteId: number) {
    setError(null)
    try {
      await api.confirmInvite(inviteId)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al confirmar")
    }
  }

  const detailInvites = selectedSession
    ? (invitesBySession[selectedSession.id] ?? []).filter((i) => dealerTechIds.includes(i.technician_id))
    : []
  const detailCourse = selectedSession ? courses.find((c) => c.id === selectedSession.course_id) : null

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planeación de Capacitaciones</h1>
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
        <h1 className="text-2xl font-bold text-foreground">Planeación de Capacitaciones</h1>
        <p className="text-muted-foreground mt-1">
          Visualice y confirme la asistencia de sus técnicos. Las sesiones completadas se ocultan automáticamente.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <ContentCard>
        <SessionCalendar events={calendarEvents} onEventClick={handleEventClick} />
      </ContentCard>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">{detailCourse?.nombre}</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="flex flex-col gap-4 overflow-y-auto flex-1 py-2">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  <span>{selectedSession.session_date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  <span>{LOCATIONS[selectedSession.location_code]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  <span>
                    {detailInvites.filter((i) => i.dealer_confirmed).length}/{detailInvites.length} confirmados
                  </span>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2.5">
                  <h3 className="text-sm font-semibold text-foreground">Sus Técnicos Invitados ({detailInvites.length})</h3>
                </div>
                {detailInvites.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No tiene técnicos invitados a esta sesión.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-2 px-4 font-medium text-foreground">Técnico</th>
                        <th className="text-left py-2 px-4 font-medium text-foreground">RFC</th>
                        <th className="text-left py-2 px-4 font-medium text-foreground">Estado</th>
                        <th className="text-left py-2 px-4 font-medium text-foreground">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailInvites.map((inv) => {
                        const tech = technicians.find((t) => t.id === inv.technician_id)
                        return (
                          <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                            <td className="py-2.5 px-4 font-medium text-card-foreground">{tech?.nombre}</td>
                            <td className="py-2.5 px-4 text-muted-foreground font-mono text-xs">{tech?.rfc ?? "—"}</td>
                            <td className="py-2.5 px-4">
                              <Badge variant={inv.dealer_confirmed ? "default" : "outline"}>
                                {inv.dealer_confirmed ? "Confirmado" : "Pendiente"}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-4">
                              {!inv.dealer_confirmed && (
                                <Button variant="default" size="sm" onClick={() => handleConfirm(inv.id)} className="gap-1 h-7 text-xs">
                                  <Check className="size-3" />
                                  Confirmar
                                </Button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
