"use client"

import { useState } from "react"
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
import {
  trainingSessions,
  sessionInvites,
  courses,
  technicians,
  dealers,
  attendance,
  getNextAttendanceId,
} from "@/lib/training-store"
import { LOCATIONS } from "@/lib/training-types"
import { ClipboardCheck, Check, X, AlertCircle } from "lucide-react"

interface AttendanceEntry {
  technician_id: number
  status: "PRESENTE" | "AUSENTE" | null
  comments: string
}

export function CorporateAttendance() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([])
  const [saved, setSaved] = useState(false)
  const [, setRefresh] = useState(0)

  const session = selectedSessionId
    ? trainingSessions.find((s) => s.id === Number(selectedSessionId))
    : null

  const invites = session
    ? sessionInvites.filter((i) => i.session_id === session.id)
    : []

  function handleSelectSession(sessionId: string) {
    setSelectedSessionId(sessionId)
    setSaved(false)
    const sess = trainingSessions.find((s) => s.id === Number(sessionId))
    if (!sess) return

    const sessionInvs = sessionInvites.filter((i) => i.session_id === sess.id)
    const entries: AttendanceEntry[] = sessionInvs
      .filter((i) => i.dealer_confirmed)
      .map((inv) => {
        const existing = attendance.find(
          (a) => a.session_id === sess.id && a.technician_id === inv.technician_id
        )
        return {
          technician_id: inv.technician_id,
          status: existing?.status ?? null,
          comments: existing?.comments ?? "",
        }
      })
    setAttendanceEntries(entries)
  }

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

  function handleSaveAttendance() {
    if (!session) return

    for (const entry of attendanceEntries) {
      if (!entry.status) continue

      const existingIdx = attendance.findIndex(
        (a) => a.session_id === session.id && a.technician_id === entry.technician_id
      )

      if (existingIdx >= 0) {
        attendance[existingIdx].status = entry.status
        attendance[existingIdx].comments = entry.comments
        attendance[existingIdx].marked_at = new Date().toISOString()
      } else {
        attendance.push({
          id: getNextAttendanceId(),
          session_id: session.id,
          technician_id: entry.technician_id,
          status: entry.status,
          comments: entry.comments,
          marked_by_user_id: 1,
          marked_at: new Date().toISOString(),
        })
      }
    }
    setSaved(true)
    setRefresh((r) => r + 1)
  }

  const course = session ? courses.find((c) => c.id === session.course_id) : null
  const unconfirmedInvites = invites.filter((i) => !i.dealer_confirmed)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pase de Lista</h1>
        <p className="text-muted-foreground mt-1">Marque la asistencia de los técnicos confirmados por sus dealers</p>
      </div>

      {/* Session selector */}
      <ContentCard title="Seleccionar Sesión">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-64">
            <Select value={selectedSessionId} onValueChange={handleSelectSession}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una sesión..." />
              </SelectTrigger>
              <SelectContent>
                {trainingSessions.map((s) => {
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
          {/* Session info */}
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

          {/* Unconfirmed notice */}
          {unconfirmedInvites.length > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="size-5 text-amber-600 shrink-0" />
              <span className="text-amber-800">
                {unconfirmedInvites.length} técnico(s) no confirmado(s) por su dealer. Solo puede marcar asistencia a técnicos confirmados.
              </span>
            </div>
          )}

          {/* Attendance table */}
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
