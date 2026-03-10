"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react"

export interface CalendarEvent {
  id: number
  title: string
  date: string // YYYY-MM-DD
  location: string
  inviteCount: number
  confirmedCount: number
  color?: string
  meta?: Record<string, unknown>
}

type ViewMode = "month" | "week"

interface SessionCalendarProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: string) => void
  className?: string
}

const DAY_NAMES = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

function formatDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function startOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const result = new Date(d)
  result.setDate(diff)
  result.setHours(0, 0, 0, 0)
  return result
}

function addDaysToDate(d: Date, days: number): Date {
  const result = new Date(d)
  result.setDate(result.getDate() + days)
  return result
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export function SessionCalendar({
  events,
  onEventClick,
  onDateClick,
  className,
}: SessionCalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [currentDate, setCurrentDate] = useState(today)
  const [viewMode, setViewMode] = useState<ViewMode>("month")

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    }
    return map
  }, [events])

  // Navigation
  function navigatePrev() {
    const d = new Date(currentDate)
    if (viewMode === "month") {
      d.setMonth(d.getMonth() - 1)
    } else {
      d.setDate(d.getDate() - 7)
    }
    setCurrentDate(d)
  }

  function navigateNext() {
    const d = new Date(currentDate)
    if (viewMode === "month") {
      d.setMonth(d.getMonth() + 1)
    } else {
      d.setDate(d.getDate() + 7)
    }
    setCurrentDate(d)
  }

  function goToToday() {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    setCurrentDate(t)
  }

  // Build calendar grid
  const calendarDays = useMemo(() => {
    if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate)
      return Array.from({ length: 7 }, (_, i) => addDaysToDate(weekStart, i))
    }

    // Month view
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Start from Monday
    let startDate = startOfWeek(firstDay)
    const days: Date[] = []

    // Fill grid until we pass the last day and complete the week
    while (days.length < 42) {
      days.push(new Date(startDate))
      startDate = addDaysToDate(startDate, 1)
      if (days.length >= 35 && startDate.getMonth() !== month) break
    }

    return days
  }, [currentDate, viewMode])

  const headerLabel = viewMode === "month"
    ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : (() => {
        const weekStart = startOfWeek(currentDate)
        const weekEnd = addDaysToDate(weekStart, 6)
        const sameMonth = weekStart.getMonth() === weekEnd.getMonth()
        if (sameMonth) {
          return `${weekStart.getDate()} - ${weekEnd.getDate()} ${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear()}`
        }
        return `${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()].slice(0, 3)} - ${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()].slice(0, 3)} ${weekEnd.getFullYear()}`
      })()

  const currentMonth = currentDate.getMonth()

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday} className="gap-1.5">
            <CalendarIcon className="size-3.5" />
            Hoy
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="size-8" onClick={navigatePrev}>
              <ChevronLeft className="size-4" />
              <span className="sr-only">Anterior</span>
            </Button>
            <Button variant="ghost" size="icon" className="size-8" onClick={navigateNext}>
              <ChevronRight className="size-4" />
              <span className="sr-only">Siguiente</span>
            </Button>
          </div>
          <h2 className="text-lg font-semibold text-foreground select-none">
            {headerLabel}
          </h2>
        </div>

        <div className="flex items-center rounded-md border border-border bg-muted p-0.5">
          <button
            className={cn(
              "px-3 py-1 text-sm rounded transition-colors",
              viewMode === "month"
                ? "bg-card text-foreground shadow-sm font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setViewMode("month")}
          >
            Mes
          </button>
          <button
            className={cn(
              "px-3 py-1 text-sm rounded transition-colors",
              viewMode === "week"
                ? "bg-card text-foreground shadow-sm font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setViewMode("week")}
          >
            Semana
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className={cn(
          "grid grid-cols-7",
          viewMode === "week" ? "grid-rows-1" : ""
        )}>
          {calendarDays.map((day, idx) => {
            const dateKey = formatDateKey(day)
            const dayEvents = eventsByDate[dateKey] || []
            const isToday = isSameDay(day, today)
            const isCurrentMonth = viewMode === "month" ? day.getMonth() === currentMonth : true
            const isWeekend = day.getDay() === 0 || day.getDay() === 6

            return (
              <div
                key={idx}
                className={cn(
                  "border-b border-r border-border last:border-r-0 transition-colors",
                  viewMode === "week" ? "min-h-[280px]" : "min-h-[100px]",
                  !isCurrentMonth && "bg-muted/30",
                  isWeekend && isCurrentMonth && "bg-muted/15",
                  isToday && "bg-primary/5",
                  "group"
                )}
                onClick={() => onDateClick?.(dateKey)}
              >
                {/* Day number */}
                <div className="flex items-center justify-between px-2 pt-1.5 pb-0.5">
                  <span
                    className={cn(
                      "text-sm leading-none",
                      isToday
                        ? "bg-primary text-primary-foreground rounded-full size-6 flex items-center justify-center font-bold"
                        : !isCurrentMonth
                          ? "text-muted-foreground/40"
                          : "text-foreground font-medium"
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {dayEvents.length > 0 && viewMode === "month" && (
                    <span className="text-[10px] text-muted-foreground">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Events */}
                <div className="px-1 pb-1 flex flex-col gap-0.5">
                  {dayEvents.slice(0, viewMode === "week" ? 10 : 2).map((ev) => (
                    <button
                      key={ev.id}
                      className={cn(
                        "w-full text-left rounded px-1.5 py-1 text-xs transition-all",
                        "hover:ring-2 hover:ring-primary/30 cursor-pointer",
                        "bg-primary/10 text-primary border-l-2 border-primary"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(ev)
                      }}
                    >
                      <div className="font-medium truncate">{ev.title}</div>
                      {viewMode === "week" && (
                        <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {ev.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge
                          variant={ev.confirmedCount === ev.inviteCount && ev.inviteCount > 0 ? "default" : "secondary"}
                          className="text-[9px] px-1 py-0 h-3.5 leading-none"
                        >
                          {ev.confirmedCount}/{ev.inviteCount}
                        </Badge>
                      </div>
                    </button>
                  ))}
                  {viewMode === "month" && dayEvents.length > 2 && (
                    <button
                      className="text-[10px] text-primary font-medium px-1 hover:underline text-left"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Switch to week view on that date
                        setCurrentDate(new Date(day))
                        setViewMode("week")
                      }}
                    >
                      +{dayEvents.length - 2} mas
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-primary" />
          <span>Sesiones programadas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="default" className="text-[9px] px-1 py-0 h-3.5">3/3</Badge>
          <span>Todos confirmados</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">1/3</Badge>
          <span>Confirmaciones pendientes</span>
        </div>
      </div>
    </div>
  )
}
