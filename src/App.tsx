import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { TrainingSidebar } from "@/components/training/training-sidebar"
import { TrainingHeader, pageLabels } from "@/components/training/training-header"
import { Dashboard } from "@/components/training/dashboard"
import { CorporatePlanner } from "@/components/training/corporate-planner"
import { CorporateAttendance } from "@/components/training/corporate-attendance"
import { CorporateHistory } from "@/components/training/corporate-history"
import { DealerTechnicians } from "@/components/training/dealer-technicians"
import { DealerPlanner } from "@/components/training/dealer-planner"
import { DealerCertificates } from "@/components/training/dealer-certificates"

function LoginGate() {
  const { login } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="h-1.5 bg-primary rounded-full mb-8" />
        <h1 className="text-2xl font-bold text-card-foreground mb-2">Training Module</h1>
        <p className="text-muted-foreground mb-8">
          Seleccione un perfil para ingresar al sistema de capacitaciones.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => login(1)}
            className="flex items-center gap-4 w-full rounded-lg border border-border p-4 text-left hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-center size-10 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              CA
            </div>
            <div>
              <p className="font-medium text-card-foreground">Carlos Admin Corporativo</p>
              <p className="text-sm text-muted-foreground">ADMIN_MASTER - Corporativo</p>
            </div>
          </button>
          <button
            onClick={() => login(2)}
            className="flex items-center gap-4 w-full rounded-lg border border-border p-4 text-left hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-center size-10 rounded-full bg-primary/70 text-primary-foreground text-sm font-bold">
              MD
            </div>
            <div>
              <p className="font-medium text-card-foreground">{"María Dealer CDMX"}</p>
              <p className="text-sm text-muted-foreground">DEALER_ADMIN - Dealer CDMX</p>
            </div>
          </button>
          <button
            onClick={() => login(3)}
            className="flex items-center gap-4 w-full rounded-lg border border-border p-4 text-left hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-center size-10 rounded-full bg-primary/50 text-primary-foreground text-sm font-bold">
              RD
            </div>
            <div>
              <p className="font-medium text-card-foreground">Roberto Dealer MTY</p>
              <p className="text-sm text-muted-foreground">DEALER_ADMIN - Dealer Monterrey</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function TrainingApp() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (!user) return <LoginGate />

  const isCorp = user.role === "ADMIN_MASTER"
  const corpPages = ["dashboard", "corporate_planner", "corporate_attendance", "corporate_history"]
  const dealerPages = ["dashboard", "dealer_technicians", "dealer_planner", "dealer_certificates"]
  const allowedPages = isCorp ? corpPages : dealerPages

  const activePage = allowedPages.includes(currentPage) ? currentPage : "dashboard"
  const breadcrumb = [pageLabels[activePage] ?? activePage]

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />
      case "corporate_planner":
        return <CorporatePlanner />
      case "corporate_attendance":
        return <CorporateAttendance />
      case "corporate_history":
        return <CorporateHistory />
      case "dealer_technicians":
        return <DealerTechnicians />
      case "dealer_planner":
        return <DealerPlanner />
      case "dealer_certificates":
        return <DealerCertificates />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <TrainingSidebar
        currentPage={activePage}
        onNavigate={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TrainingHeader breadcrumb={breadcrumb} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return <TrainingApp />
}
