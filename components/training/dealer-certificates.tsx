"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ContentCard } from "./content-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { technicians, trainingHistory, attendance, courses, trainingSessions } from "@/lib/training-store"
import { ENABLE_CERTIFICATES } from "@/lib/training-types"
import { Award, Search, Clock, User } from "lucide-react"

export function DealerCertificates() {
  const { user } = useAuth()
  const [selectedTechId, setSelectedTechId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  if (!user || !user.dealer_id) return null

  const dealerTechs = technicians
    .filter((t) => t.dealer_id === user.dealer_id)
    .filter(
      (t) =>
        !searchQuery ||
        t.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const selectedTech = selectedTechId ? technicians.find((t) => t.id === selectedTechId) : null

  // Get history for selected technician
  const techHistory = selectedTechId
    ? trainingHistory.filter((h) => h.technician_id === selectedTechId)
    : []

  // Get attended sessions for selected technician
  const techAttendance = selectedTechId
    ? attendance.filter((a) => a.technician_id === selectedTechId && a.status === "PRESENTE")
    : []

  const attendedSessions = techAttendance.map((a) => {
    const session = trainingSessions.find((s) => s.id === a.session_id)
    const course = session ? courses.find((c) => c.id === session.course_id) : null
    return {
      course_name: course?.nombre ?? "Curso desconocido",
      date: session?.session_date ?? "",
      status: "Presente",
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Certificados por Técnico</h1>
        <p className="text-muted-foreground mt-1">Consulte el historial de capacitaciones y certificados de sus técnicos</p>
      </div>

      {!ENABLE_CERTIFICATES && (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 text-sm">
          <Clock className="size-5 text-primary shrink-0" />
          <span className="text-foreground">
            <strong>Certificados: próximamente.</strong> La emisión de certificados estará disponible en una próxima actualización. Puede consultar el historial de capacitaciones.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Technicians list */}
        <div className="lg:col-span-1">
          <ContentCard title="Técnicos">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar técnico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
              {dealerTechs.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => setSelectedTechId(tech.id)}
                  className={`flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                    selectedTechId === tech.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-card-foreground hover:bg-muted"
                  }`}
                >
                  <User className="size-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate">{tech.nombre}</p>
                    <p className="text-xs text-muted-foreground truncate">{tech.rfc}</p>
                  </div>
                </button>
              ))}
            </div>
          </ContentCard>
        </div>

        {/* Training history & certificates */}
        <div className="lg:col-span-2">
          {!selectedTech ? (
            <ContentCard>
              <div className="text-center py-10">
                <Award className="size-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Seleccione un técnico para ver su historial.</p>
              </div>
            </ContentCard>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Tech info */}
              <ContentCard>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nombre</p>
                    <p className="font-medium text-card-foreground">{selectedTech.nombre}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RFC</p>
                    <p className="font-medium text-card-foreground">{selectedTech.rfc}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium text-card-foreground">{selectedTech.email}</p>
                  </div>
                </div>
              </ContentCard>

              {/* Historical trainings */}
              <ContentCard title="Historial de Capacitaciones Importado">
                {techHistory.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No hay historial importado para este técnico.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2 font-medium text-foreground">Curso</th>
                          <th className="text-left py-2 px-2 font-medium text-foreground">Fecha</th>
                          <th className="text-left py-2 px-2 font-medium text-foreground">Resultado</th>
                          <th className="text-left py-2 px-2 font-medium text-foreground">Certificado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {techHistory.map((h) => (
                          <tr key={h.id} className="border-b border-border last:border-0">
                            <td className="py-2 px-2 text-card-foreground">{h.course_name}</td>
                            <td className="py-2 px-2 text-muted-foreground">{h.training_date ?? "N/A"}</td>
                            <td className="py-2 px-2">
                              <Badge variant={h.result === "Aprobado" ? "default" : "secondary"}>
                                {h.result ?? "N/A"}
                              </Badge>
                            </td>
                            <td className="py-2 px-2 text-muted-foreground">
                              {h.certificate_file ? "Disponible" : "Sin archivo"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </ContentCard>

              {/* Recent attended sessions */}
              <ContentCard title="Sesiones Asistidas (sistema actual)">
                {attendedSessions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Este técnico no tiene asistencias registradas aún.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2 font-medium text-foreground">Curso</th>
                          <th className="text-left py-2 px-2 font-medium text-foreground">Fecha</th>
                          <th className="text-left py-2 px-2 font-medium text-foreground">Asistencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendedSessions.map((s, idx) => (
                          <tr key={idx} className="border-b border-border last:border-0">
                            <td className="py-2 px-2 text-card-foreground">{s.course_name}</td>
                            <td className="py-2 px-2 text-muted-foreground">{s.date}</td>
                            <td className="py-2 px-2">
                              <Badge variant="default">Presente</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </ContentCard>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
