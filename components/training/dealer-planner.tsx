"use client"

import { useState, useMemo } from "react"
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
import {
  trainingSessions,
  sessionInvites,
  courses,
  technicians,
  attendance,
} from "@/lib/training-store"
import { LOCATIONS } from "@/lib/training-types"
import type { TrainingSession } from "@/lib/training-types"
import { AlertTriangle, Check, MapPin, Users, Clock } from "lucide-react"

function isSessionCompleted(session: TrainingSession): boolean {
  const sessionDate = new Date(session.session_date)
  sessionDate.setHours(23, 59, 59, 999)
  const today = new Date()
  if (sessionDate >= today) return false
  const hasAttendance = attendance.some((a) => a.session_id === session.id)
  return hasAttendance
}

export function DealerPlanner() {
  const { user } = useAuth()
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null)
  const [, setRefresh] = useState(0)

  if (!user || !user.dealer_id) return null

  const dealerTechs = technicians.filter(
    (t) => t.dealer_id === user.dealer_id && t.activo
  )
  const hasActiveTechs = dealerTechs.length > 0

  if (!hasActiveTechs) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Planeacion de Capacitaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualice y confirme la asistencia de sus tecnicos
          </p>
        </div>
        <ContentCard>
          <div className="flex flex-col items-center py-10 text-center">
            <AlertTriangle className="size-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No tiene tecnicos activos
            </h3>
            <p className="text-muted-foreground max-w-md">
              Debe registrar al menos un tecnico activo antes de poder acceder a
              la planeacion de capacitaciones. Vaya a la seccion de Tecnicos para
              agregar personal.
            </p>
          </div>
        </ContentCard>
      </div>
    )
  }

  const dealerTechIds = dealerTechs.map((t) => t.id)
  const relevantSessionIds = [
    ...new Set(
      sessionInvites
        .filter((i) => dealerTechIds.includes(i.technician_id))
        .map((i) => i.session_id)
    ),
  ]

  // Only show sessions that are NOT completed
  const activeSessions = trainingSessions.filter(
    (s) => relevantSessionIds.includes(s.id) && !isSessionCompleted(s)
  )

  const calendarEvents: CalendarEvent[] = activeSessions.map((session) => {
    const course = courses.find((c) => c.id === session.course_id)
    const invites = sessionInvites.filter(
      (i) =>
        i.session_id === session.id &&
        dealerTechIds.includes(i.technician_id)
    )
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

  function handleConfirm(inviteId: number) {
    const inv = sessionInvites.find((i) => i.id === inviteId)
    if (!inv) return
    inv.dealer_confirmed = true
    inv.confirmed_at = new Date().toISOString()
    inv.confirm_user_id = user!.id
    setRefresh((r) => r + 1)
  }

  function handleUnconfirm(inviteId: number) {
    const inv = sessionInvites.find((i) => i.id === inviteId)
    if (!inv) return
    inv.dealer_confirmed = false
    inv.confirmed_at = null
    inv.confirm_user_id = null
    setRefresh((r) => r + 1)
  }

  const detailInvites = selectedSession
    ? sessionInvites.filter(
        (i) =>
          i.session_id === selectedSession.id &&
          dealerTechIds.includes(i.technician_id)
      )
    : []
  const detailCourse = selectedSession
    ? courses.find((c) => c.id === selectedSession.course_id)
    : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Planeacion de Capacitaciones
        </h1>
        <p className="text-muted-foreground mt-1">
          Visualice y confirme la asistencia de sus tecnicos. Las sesiones
          completadas se ocultan automaticamente.
        </p>
      </div>

      {/* Calendar */}
      <ContentCard>
        <SessionCalendar
          events={calendarEvents}
          onEventClick={handleEventClick}
        />
      </ContentCard>

      {/* Session detail + confirm dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {detailCourse?.nombre}
            </DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="flex flex-col gap-4 overflow-y-auto flex-1 py-2">
              {/* Session info */}
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
                    {detailInvites.filter((i) => i.dealer_confirmed).length}/
                    {detailInvites.length} confirmados
                  </span>
                </div>
              </div>

              {/* Invites table with confirm actions */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Sus Tecnicos Invitados ({detailInvites.length})
                  </h3>
                </div>
                {detailInvites.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No tiene tecnicos invitados a esta sesion.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-2 px-4 font-medium text-foreground">
                          Tecnico
                        </th>
                        <th className="text-left py-2 px-4 font-medium text-foreground">
                          RFC
                        </th>
                        <th className="text-left py-2 px-4 font-medium text-foreground">
                          Estado
                        </th>
                        <th className="text-left py-2 px-4 font-medium text-foreground">
                          Accion
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailInvites.map((inv) => {
                        const tech = technicians.find(
                          (t) => t.id === inv.technician_id
                        )
                        return (
                          <tr
                            key={inv.id}
                            className="border-b border-border last:border-0 hover:bg-muted/20"
                          >
                            <td className="py-2.5 px-4 font-medium text-card-foreground">
                              {tech?.nombre}
                            </td>
                            <td className="py-2.5 px-4 text-muted-foreground font-mono text-xs">
                              {tech?.rfc}
                            </td>
                            <td className="py-2.5 px-4">
                              <Badge
                                variant={
                                  inv.dealer_confirmed ? "default" : "outline"
                                }
                              >
                                {inv.dealer_confirmed
                                  ? "Confirmado"
                                  : "Pendiente"}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-4">
                              {inv.dealer_confirmed ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnconfirm(inv.id)}
                                  className="text-destructive h-7 text-xs"
                                >
                                  Cancelar
                                </Button>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleConfirm(inv.id)}
                                  className="gap-1 h-7 text-xs"
                                >
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
            <Button
              variant="outline"
              onClick={() => setShowDetailDialog(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
