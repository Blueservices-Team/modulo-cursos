"use client"

import { useState, useEffect, useCallback } from "react"
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
import * as api from "@/lib/training-api"
import { LOCATIONS } from "@/lib/training-types"
import type { TrainingSession, SessionInvite, Course, Technician, Dealer } from "@/lib/training-types"
import { Plus, Search, UserPlus, MapPin, Users, Clock, Check, Loader2 } from "lucide-react"

function isSessionCompleted(session: TrainingSession, attendanceBySession: Record<number, boolean>): boolean {
  const sessionDate = new Date(session.session_date)
  sessionDate.setHours(23, 59, 59, 999)
  const today = new Date()
  if (sessionDate >= today) return false
  return attendanceBySession[session.id] === true
}

export function CorporatePlanner() {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [invitesBySession, setInvitesBySession] = useState<Record<number, SessionInvite[]>>({})
  const [courses, setCourses] = useState<Course[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [attendanceBySession, setAttendanceBySession] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null)

  const [newCourseId, setNewCourseId] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newLocation, setNewLocation] = useState("")

  const [selectedTechs, setSelectedTechs] = useState<number[]>([])
  const [inviteSearch, setInviteSearch] = useState("")

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const [sess, cour, tech, deal] = await Promise.all([
        api.getSessions(),
        api.getCourses(),
        api.getTechnicians(),
        api.getDealers(),
      ])
      setSessions(Array.isArray(sess) ? sess : [])
      setCourses(Array.isArray(cour) ? cour : [])
      setTechnicians(Array.isArray(tech) ? tech : [])
      setDealers(Array.isArray(deal) ? deal : [])
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
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const activeSessions = sessions.filter((s) => !isSessionCompleted(s, attendanceBySession))

  const calendarEvents: CalendarEvent[] = activeSessions.map((session) => {
    const course = courses.find((c) => c.id === session.course_id)
    const invites = invitesBySession[session.id] ?? []
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

  async function handleCreateSession() {
    if (!newCourseId || !newDate || !newLocation) return
    setError(null)
    try {
      await api.createSession({
        course_id: Number(newCourseId),
        session_date: newDate,
        location_code: Number(newLocation),
      })
      setShowCreateDialog(false)
      setNewCourseId("")
      setNewDate("")
      setNewLocation("")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear sesión")
    }
  }

  function openInviteDialog() {
    if (!selectedSession) return
    const existing = invitesBySession[selectedSession.id] ?? []
    setSelectedTechs([])
    setInviteSearch("")
    setShowInviteDialog(true)
  }

  async function handleInviteTechs() {
    if (!selectedSession || selectedTechs.length === 0) return
    const existing = (invitesBySession[selectedSession.id] ?? []).map((i) => i.technician_id)
    const toAdd = selectedTechs.filter((id) => !existing.includes(id))
    if (toAdd.length === 0) {
      setShowInviteDialog(false)
      return
    }
    setError(null)
    try {
      await api.addInvites({ session_id: selectedSession.id, technician_ids: toAdd })
      setShowInviteDialog(false)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al invitar")
    }
  }

  const detailInvites = selectedSession ? invitesBySession[selectedSession.id] ?? [] : []
  const detailCourse = selectedSession ? courses.find((c) => c.id === selectedSession.course_id) : null

  const availableTechs = technicians.filter((t) => {
    if (!t.activo) return false
    if (!selectedSession) return false
    const alreadyInvited = (invitesBySession[selectedSession.id] ?? []).some((i) => i.technician_id === t.id)
    return !alreadyInvited
  })

  const filteredAvailableTechs = availableTechs.filter(
    (t) =>
      !inviteSearch ||
      t.nombre.toLowerCase().includes(inviteSearch.toLowerCase()) ||
      dealers.find((d) => d.id === t.dealer_id)?.nombre.toLowerCase().includes(inviteSearch.toLowerCase())
  )

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planeación de Capacitaciones</h1>
          <p className="text-muted-foreground mt-1">
            Calendario de sesiones programadas. Las sesiones completadas se ocultan automáticamente.
          </p>
        </div>
        <Button onClick={() => { setNewDate(""); setShowCreateDialog(true); }} className="gap-2">
          <Plus className="size-4" />
          Nueva Sesión
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <ContentCard>
        <SessionCalendar
          events={calendarEvents}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
        />
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
                <div className="bg-muted/50 px-4 py-2.5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Técnicos Invitados ({detailInvites.length})</h3>
                  <Button variant="outline" size="sm" onClick={openInviteDialog} className="gap-1 h-7 text-xs">
                    <UserPlus className="size-3" />
                    Invitar
                  </Button>
                </div>
                {detailInvites.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No hay técnicos invitados. Haga clic en Invitar para agregar.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-2 px-4 font-medium text-foreground">Técnico</th>
                        <th className="text-left py-2 px-4 font-medium text-foreground">Dealer</th>
                        <th className="text-left py-2 px-4 font-medium text-foreground">RFC</th>
                        <th className="text-left py-2 px-4 font-medium text-foreground">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailInvites.map((inv) => {
                        const tech = technicians.find((t) => t.id === inv.technician_id)
                        const dealer = dealers.find((d) => d.id === tech?.dealer_id)
                        return (
                          <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                            <td className="py-2 px-4 font-medium text-card-foreground">{tech?.nombre}</td>
                            <td className="py-2 px-4 text-muted-foreground">{dealer?.nombre}</td>
                            <td className="py-2 px-4 text-muted-foreground font-mono text-xs">{tech?.rfc ?? "—"}</td>
                            <td className="py-2 px-4">
                              <Badge variant={inv.dealer_confirmed ? "default" : "outline"}>
                                {inv.dealer_confirmed ? "Confirmado" : "Pendiente"}
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
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Sesión de Capacitación</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div>
              <Label className="mb-1.5 block">Curso</Label>
              <Select value={newCourseId} onValueChange={setNewCourseId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.filter((c) => c.activo).map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Fecha</Label>
              <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Lugar</Label>
              <Select value={newLocation} onValueChange={setNewLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un lugar" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LOCATIONS).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreateSession} disabled={!newCourseId || !newDate || !newLocation}>
              Crear Sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Invitar Técnicos - {detailCourse?.nombre}</DialogTitle>
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
                  No hay técnicos disponibles para invitar.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border">
                      <th className="w-10 py-2 px-2" />
                      <th className="text-left py-2 px-2 font-medium text-foreground">Técnico</th>
                      <th className="text-left py-2 px-2 font-medium text-foreground">Dealer</th>
                      <th className="text-left py-2 px-2 font-medium text-foreground">RFC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAvailableTechs.map((tech) => {
                      const dealer = dealers.find((d) => d.id === tech.dealer_id)
                      const isSelected = selectedTechs.includes(tech.id)
                      return (
                        <tr
                          key={tech.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                          onClick={() =>
                            setSelectedTechs((prev) =>
                              isSelected ? prev.filter((id) => id !== tech.id) : [...prev, tech.id]
                            )
                          }
                        >
                          <td className="py-2 px-2 text-center">
                            <Checkbox checked={isSelected} />
                          </td>
                          <td className="py-2 px-2 text-card-foreground">{tech.nombre}</td>
                          <td className="py-2 px-2 text-muted-foreground">{dealer?.nombre}</td>
                          <td className="py-2 px-2 text-muted-foreground font-mono text-xs">{tech.rfc ?? "—"}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
            {selectedTechs.length > 0 && (
              <p className="text-sm text-primary mt-2 font-medium">
                {selectedTechs.length} técnico(s) seleccionado(s)
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancelar</Button>
            <Button onClick={handleInviteTechs} disabled={selectedTechs.length === 0}>
              Invitar Seleccionados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
