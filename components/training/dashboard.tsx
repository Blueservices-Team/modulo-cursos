"use client"

import { useAuth } from "@/lib/auth-context"
import { ContentCard } from "./content-card"
import { trainingSessions, sessionInvites, technicians, courses, dealers } from "@/lib/training-store"
import { LOCATIONS } from "@/lib/training-types"
import { CalendarDays, Users, ClipboardCheck, GraduationCap } from "lucide-react"

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; accent?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5">
      <div className={`flex items-center justify-center size-12 rounded-lg ${accent ?? "bg-primary/10"}`}>
        <Icon className="size-6 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  if (!user) return null

  const isCorp = user.role === "ADMIN_MASTER"
  const today = new Date().toISOString().split("T")[0]

  const futureSessions = trainingSessions.filter((s) => s.session_date >= today)
  const totalInvites = sessionInvites.length
  const confirmedInvites = sessionInvites.filter((i) => i.dealer_confirmed).length

  // Dealer-specific
  const dealerTechs = isCorp ? technicians : technicians.filter((t) => t.dealer_id === user.dealer_id && t.activo)
  const dealerInvites = isCorp
    ? sessionInvites
    : sessionInvites.filter((inv) => {
        const tech = technicians.find((t) => t.id === inv.technician_id)
        return tech && tech.dealer_id === user.dealer_id
      })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isCorp ? "Panel Corporativo" : "Panel Dealer"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isCorp
            ? "Resumen general del módulo de capacitación"
            : `Bienvenido, ${user.nombre}`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarDays} label="Sesiones Futuras" value={futureSessions.length} />
        <StatCard icon={Users} label={isCorp ? "Total Técnicos" : "Mis Técnicos"} value={dealerTechs.length} />
        <StatCard icon={ClipboardCheck} label="Invitaciones Confirmadas" value={isCorp ? confirmedInvites : dealerInvites.filter((i) => i.dealer_confirmed).length} />
        <StatCard icon={GraduationCap} label="Cursos Activos" value={courses.filter((c) => c.activo).length} />
      </div>

      {/* Upcoming sessions */}
      <ContentCard title="Próximas Sesiones">
        {futureSessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay sesiones programadas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-foreground">Curso</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Fecha</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Lugar</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Invitados</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Confirmados</th>
                </tr>
              </thead>
              <tbody>
                {futureSessions.slice(0, 5).map((session) => {
                  const course = courses.find((c) => c.id === session.course_id)
                  const invites = sessionInvites.filter((i) => i.session_id === session.id)
                  const confirmed = invites.filter((i) => i.dealer_confirmed)
                  return (
                    <tr key={session.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-2 text-card-foreground">{course?.nombre}</td>
                      <td className="py-3 px-2 text-card-foreground">{session.session_date}</td>
                      <td className="py-3 px-2 text-muted-foreground">{LOCATIONS[session.location_code]}</td>
                      <td className="py-3 px-2 text-card-foreground">{invites.length}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          confirmed.length === invites.length && invites.length > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {confirmed.length} / {invites.length}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </ContentCard>

      {/* Dealers list (corporate only) */}
      {isCorp && (
        <ContentCard title="Dealers Registrados">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dealers.map((dealer) => {
              const dealerTechCount = technicians.filter((t) => t.dealer_id === dealer.id && t.activo).length
              return (
                <div key={dealer.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-card-foreground">{dealer.nombre}</p>
                    <p className="text-sm text-muted-foreground">{dealer.codigo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{dealerTechCount}</p>
                    <p className="text-xs text-muted-foreground">técnicos</p>
                  </div>
                </div>
              )
            })}
          </div>
        </ContentCard>
      )}
    </div>
  )
}
