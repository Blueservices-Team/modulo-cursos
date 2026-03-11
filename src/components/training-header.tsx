"use client"

import { useAuth, demoUsers } from "@/lib/auth-context"
import { Globe, User } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface HeaderProps {
  breadcrumb: string[]
}

const pageLabels: Record<string, string> = {
  dashboard: "Dashboard",
  corporate_planner: "Planeación (Corporativo)",
  corporate_attendance: "Pase de Lista (Corporativo)",
  corporate_history: "Migración / Histórico",
  dealer_technicians: "Técnicos",
  dealer_planner: "Planeación (Dealer)",
  dealer_certificates: "Certificados",
}

export function TrainingHeader({ breadcrumb }: HeaderProps) {
  const { user, login } = useAuth()

  return (
    <header className="flex items-center justify-between bg-card border-b border-border px-6 py-3">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm">
          <li className="text-primary font-semibold">Training</li>
          {breadcrumb.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span className="text-muted-foreground">/</span>
              <span className={i === breadcrumb.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}>
                {item}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Language selector (decorative) */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Globe className="size-4" />
          <span>ES</span>
        </div>

        {/* User switcher (for demo) */}
        <Select
          value={user?.id.toString() ?? "1"}
          onValueChange={(v) => login(Number(v))}
        >
          <SelectTrigger className="w-56 h-8 text-sm">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {demoUsers.map((u) => (
              <SelectItem key={u.id} value={u.id.toString()}>
                <span className="text-sm">
                  {u.nombre}
                  <span className="text-muted-foreground ml-1">
                    ({u.role === "ADMIN_MASTER" ? "Corp" : "Dealer"})
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  )
}

export { pageLabels }
