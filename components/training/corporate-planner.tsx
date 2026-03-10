"use client"

import { useState, useMemo } from "react"
import { ContentCard } from "./content-card"
import { SessionCalendar, type CalendarEvent } from "./session-calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  trainingSessions,
  sessionInvites,
  courses,
  technicians,
  dealers,
  attendance,
  getNextSessionId,
  getNextInviteId,
  getNextCourseId,
} from "@/lib/training-store"
import { LOCATIONS } from "@/lib/training-types"
import type { TrainingSession } from "@/lib/training-types"
import { Plus, Search, UserPlus, MapPin, Users, Clock, BookOpen, Check, X } from "lucide-react"

function isSessionCompleted(session: TrainingSession): boolean {
  const sessionDate = new Date(session.session_date)
  sessionDate.setHours(23, 59, 59, 999)
  const today = new Date()
  if (sessionDate >= today) return false

  // Check if attendance has already been recorded for this session
  const hasAttendance = attendance.some((a) => a.session_id === session.id)
  return hasAttendance
}

export function CorporatePlanner() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null)
  const [, setRefresh] = useState(0)

  // Create session form
  const [newCourseId, setNewCourseId] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newLocation, setNewLocation] = useState("")

  // Add new course inline
  const [showNewCourseForm, setShowNewCourseForm] = useState(false)
  const [newCourseName, setNewCourseName] = useState("")

  // Invite technicians
  const [selectedTechs, setSelectedTechs] = useState<number[]>([])
  const [inviteSearch, setInviteSearch] = useState("")

  // Filter out completed sessions (past + attendance taken)
  const activeSessions = useMemo(
    () => trainingSessions.filter((s) => !isSessionCompleted(s)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trainingSessions.length, attendance.length]
  )

  // Map sessions to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return activeSessions.map((session) => {
      const course = courses.find((c) => c.id === session.course_id)
      const invites = sessionInvites.filter((i) => i.session_id === session.id)
      const confirmed = invites.filter((i) => i.dealer_confirmed).length

      return {
        id: session.id,
        title: course?.nombre || "Sin nombre",
        date: session.session_date,
        location: LOCATIONS[session.location_code] || "Sin lugar",
        inviteCount: invites.length,
        confirmedCount: confirmed,
        meta: { session },
      }
    })
  }, [activeSessions])

  function handleEventClick(event: CalendarEvent) {
    const session = activeSessions.find((s) => s.id === event.id)
    if (session) {
      setSelectedSession(session)
      setShowDetailDialog(true)
    }
  }

  function handleDateClick(date: string) {
    setNewDate(date)
    setShowCreateDialog(true)
  }

  function handleCreateSession() {
    if (!newCourseId || !newDate || !newLocation) return
    const id = getNextSessionId()
    trainingSessions.push({
      id,
      course_id: Number(newCourseId),
      session_date: newDate,
      location_code: Number(newLocation),
      created_by_user_id: 1,
      created_at: new Date().toISOString(),
    })
    setShowCreateDialog(false)
    setNewCourseId("")
    setNewDate("")
    setNewLocation("")
    setShowNewCourseForm(false)
    setNewCourseName("")
    setRefresh((r) => r + 1)
  }

  function handleAddCourse() {
    const trimmed = newCourseName.trim()
    if (!trimmed) return
    const id = getNextCourseId()
    courses.push({ id, nombre: trimmed, activo: true })
    setNewCourseId(id.toString())
    setNewCourseName("")
    setShowNewCourseForm(false)
    setRefresh((r) => r + 1)
  }

  function openInviteDialog() {
    if (!selectedSession) return
    const existingTechIds = sessionInvites
      .filter((i) => i.session_id === selectedSession.id)
      .map((i) => i.technician_id)
    setSelectedTechs([])
    setInviteSearch("")
    setShowInviteDialog(true)
  }

  function handleInviteTechs() {
    if (!selectedSession || selectedTechs.length === 0) return
    const existingTechIds = sessionInvites
      .filter((i) => i.session_id === selectedSession.id)
      .map((i) => i.technician_id)

    for (const techId of selectedTechs) {
      if (!existingTechIds.includes(techId)) {
        sessionInvites.push({
          id: getNextInviteId(),
          session_id: selectedSession.id,
          technician_id: techId,
          dealer_confirmed: false,
          confirmed_at: null,
          confirm_user_id: null,
        })
      }
    }
    setShowInviteDialog(false)
    setRefresh((r) => r + 1)
  }

  const availableTechs = selectedSession
    ? technicians.filter((t) => {
        const alreadyInvited = sessionInvites.some(
          (i) => i.session_id === selectedSession.id && i.technician_id === t.id
        )
        return t.activo && !alreadyInvited
      })
    : []

  const filteredAvailableTechs = availableTechs.filter(
    (t) =>
      !inviteSearch ||
      t.nombre.toLowerCase().includes(inviteSearch.toLowerCase()) ||
      dealers
        .find((d) => d.id === t.dealer_id)
        ?.nombre.toLowerCase()
        .includes(inviteSearch.toLowerCase())
  )

  // Detail panel data
  const detailInvites = selectedSession
    ? sessionInvites.filter((i) => i.session_id === selectedSession.id)
    : []
  const detailCourse = selectedSession
    ? courses.find((c) => c.id === selectedSession.course_id)
    : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Planeacion de Capacitaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Calendario de sesiones programadas. Las sesiones completadas se
            ocultan automaticamente.
          </p>
        </div>
        <Button
          onClick={() => {
            setNewDate("")
            setShowCreateDialog(true)
          }}
          className="gap-2"
        >
          <Plus className="size-4" />
          Nueva Sesion
        </Button>
      </div>

      {/* Calendar */}
      <ContentCard>
        <SessionCalendar
          events={calendarEvents}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
        />
      </ContentCard>

      {/* Session detail dialog */}
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

              {/* Invites table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2.5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Tecnicos Invitados ({detailInvites.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openInviteDialog}
                    className="gap-1 h-7 text-xs"
                  >
                    <UserPlus className="size-3" />
                    Invitar
                  </Button>
                </div>
                {detailInvites.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No hay tecnicos invitados. Haga clic en Invitar para agregar.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-2 px-4 font-medium text-foreground">
                          Tecnico
                        </th>
                        <th className="text-left py-2 px-4 font-medium text-foreground">
                          Dealer
                        </th>
                        <th className="text-left py-2 px-4 font-medium text-foreground">
                          RFC
                        </th>
                        <th className="text-left py-2 px-4 font-medium text-foreground">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailInvites.map((inv) => {
                        const tech = technicians.find(
                          (t) => t.id === inv.technician_id
                        )
                        const dealer = dealers.find(
                          (d) => d.id === tech?.dealer_id
                        )
                        return (
                          <tr
                            key={inv.id}
                            className="border-b border-border last:border-0 hover:bg-muted/20"
                          >
                            <td className="py-2 px-4 font-medium text-card-foreground">
                              {tech?.nombre}
                            </td>
                            <td className="py-2 px-4 text-muted-foreground">
                              {dealer?.nombre}
                            </td>
                            <td className="py-2 px-4 text-muted-foreground font-mono text-xs">
                              {tech?.rfc}
                            </td>
                            <td className="py-2 px-4">
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

      {/* Create session dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open)
        if (!open) {
          setShowNewCourseForm(false)
          setNewCourseName("")
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Sesion de Capacitacion</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div>
              <Label className="mb-1.5 block">Curso</Label>
              <div className="flex items-center gap-2">
                <Select value={newCourseId} onValueChange={setNewCourseId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccione un curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses
                      .filter((c) => c.activo)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setShowNewCourseForm((v) => !v)}
                  title="Agregar nuevo curso"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              {showNewCourseForm && (
                <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <BookOpen className="size-4 text-primary" />
                    Nuevo curso
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Nombre del curso..."
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddCourse()
                        }
                      }}
                      className="flex-1 bg-card"
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="icon"
                      className="shrink-0 size-9"
                      disabled={!newCourseName.trim()}
                      onClick={handleAddCourse}
                    >
                      <Check className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 size-9"
                      onClick={() => {
                        setShowNewCourseForm(false)
                        setNewCourseName("")
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label className="mb-1.5 block">Fecha</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Lugar</Label>
              <Select value={newLocation} onValueChange={setNewLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un lugar" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LOCATIONS).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateSession}
              disabled={!newCourseId || !newDate || !newLocation}
            >
              Crear Sesion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite technicians dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Invitar Tecnicos - {detailCourse?.nombre}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 flex-1 overflow-hidden flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o dealer..."
                value={inviteSearch}
                onChange={(e) => setInviteSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex-1 overflow-y-auto border border-border rounded-md">
              {filteredAvailableTechs.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 text-center">
                  No hay tecnicos disponibles para invitar.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border">
                      <th className="w-10 py-2 px-2" />
                      <th className="text-left py-2 px-2 font-medium text-foreground">
                        Tecnico
                      </th>
                      <th className="text-left py-2 px-2 font-medium text-foreground">
                        Dealer
                      </th>
                      <th className="text-left py-2 px-2 font-medium text-foreground">
                        RFC
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAvailableTechs.map((tech) => {
                      const dealer = dealers.find(
                        (d) => d.id === tech.dealer_id
                      )
                      const isSelected = selectedTechs.includes(tech.id)
                      return (
                        <tr
                          key={tech.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                          onClick={() =>
                            setSelectedTechs((prev) =>
                              isSelected
                                ? prev.filter((id) => id !== tech.id)
                                : [...prev, tech.id]
                            )
                          }
                        >
                          <td className="py-2 px-2 text-center">
                            <Checkbox checked={isSelected} />
                          </td>
                          <td className="py-2 px-2 text-card-foreground">
                            {tech.nombre}
                          </td>
                          <td className="py-2 px-2 text-muted-foreground">
                            {dealer?.nombre}
                          </td>
                          <td className="py-2 px-2 text-muted-foreground font-mono text-xs">
                            {tech.rfc}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
            {selectedTechs.length > 0 && (
              <p className="text-sm text-primary mt-2 font-medium">
                {selectedTechs.length} tecnico(s) seleccionado(s)
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleInviteTechs}
              disabled={selectedTechs.length === 0}
            >
              Invitar Seleccionados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
