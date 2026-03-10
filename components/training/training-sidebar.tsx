"use client"

import { useAuth } from "@/lib/auth-context"
import {
  CalendarDays,
  ClipboardCheck,
  Users,
  GraduationCap,
  Award,
  History,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  collapsed: boolean
  onToggle: () => void
}

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles: ("ADMIN_MASTER" | "DEALER_ADMIN")[]
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN_MASTER", "DEALER_ADMIN"] },
  { id: "corporate_planner", label: "Planeación", icon: CalendarDays, roles: ["ADMIN_MASTER"] },
  { id: "corporate_attendance", label: "Pase de Lista", icon: ClipboardCheck, roles: ["ADMIN_MASTER"] },
  { id: "corporate_history", label: "Migración / Histórico", icon: History, roles: ["ADMIN_MASTER"] },
  { id: "dealer_technicians", label: "Técnicos", icon: Users, roles: ["DEALER_ADMIN"] },
  { id: "dealer_planner", label: "Planeación", icon: CalendarDays, roles: ["DEALER_ADMIN"] },
  { id: "dealer_certificates", label: "Certificados", icon: Award, roles: ["DEALER_ADMIN"] },
]

export function TrainingSidebar({ currentPage, onNavigate, collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth()
  if (!user) return null

  const filteredItems = navItems.filter((item) => item.roles.includes(user.role))

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 h-full",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo area */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <GraduationCap className="size-6 text-sidebar-primary" />
            <span className="text-sm font-bold tracking-wide">TRAINING</span>
          </div>
        )}
        {collapsed && <GraduationCap className="size-6 text-sidebar-primary mx-auto" />}
        <button
          onClick={onToggle}
          className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="flex flex-col gap-1 px-2">
          {filteredItems.map((item) => {
            const isActive = currentPage === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="size-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Role indicator */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/50 uppercase tracking-wider mb-1">
            {user.role === "ADMIN_MASTER" ? "Corporativo" : "Dealer"}
          </div>
          <div className="text-sm font-medium truncate">{user.nombre}</div>
        </div>
      )}
    </aside>
  )
}
