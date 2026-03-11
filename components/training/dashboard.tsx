"use client"

import { useAuth } from "@/lib/auth-context"
import { ContentCard } from "./content-card"
import { useTrainingData } from "@/hooks/use-training-data"
import { LOCATIONS } from "@/lib/training-types"
import { CalendarDays, Users, ClipboardCheck, GraduationCap, Loader2 } from "lucide-react"

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
  const { sessions, technicians, courses, dealers, loading, error } = useTrainingData(
    user?.role ?? "DEALER_ADMIN",
    user?.dealer_id ?? null
  )

  if (!user) return null

  const isCorp = user.role === "ADMIN_MASTER"
  const today = new Date().toISOString().split("T")[0]

  const futureSessions = sessions.filter((s) => s.session_date >= today)
  const totalInvites = sessions.reduce((acc, s) => acc + (s.invite_count ?? 0), 0)
  const confirmedInvites = sessions.reduce((acc, s) => acc + (s.confirmed_count ?? 0), 0)

  const dealerTechs = isCorp ? technicians : technicians.filter((t) => t.dealer_id === user.dealer_id && t.activo)
  const coursesActive = courses.filter((c) => c.activo)

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isCorp ? "Panel Corporativo" : "Panel Dealer"}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Cargando...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isCorp ? "Panel Corporativo" : "Panel Dealer"}</h1>
          <p className="text-muted-foreground mt-1 text-destructive">{error}</p>
        </div>
      </div>
    )
  }

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarDays} label="Sesiones Futuras" value={futureSessions.length} />
        <StatCard icon={Users} label={isCorp ? "Total Técnicos" : "Mis Técnicos"} value={dealerTechs.length} />
        <StatCard icon={ClipboardCheck} label="Invitaciones Confirmadas" value={confirmedInvites} />
        <StatCard icon={GraduationCap} label="Cursos Activos" value={coursesActive.length} />
      </div>

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
                  const courseName = session.course_name ?? courses.find((c) => c.id === session.course_id)?.nombre
                  const invCount = session.invite_count ?? 0
                  const confCount = session.confirmed_count ?? 0
                  return (
                    <tr key={session.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-2 text-card-foreground">{courseName}</td>
                      <td className="py-3 px-2 text-card-foreground">{session.session_date}</td>
                      <td className="py-3 px-2 text-muted-foreground">{LOCATIONS[session.location_code]}</td>
                      <td className="py-3 px-2 text-card-foreground">{invCount}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          confCount === invCount && invCount > 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {confCount} / {invCount}
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
