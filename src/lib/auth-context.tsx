import { createContext, useContext, useState, type ReactNode } from "react"
import type { User, Role } from "./training-types"

interface AuthState {
  user: User | null
  login: (userId: number) => void
  logout: () => void
  switchRole: (role: Role) => void
}

const demoUsers: User[] = [
  { id: 1, dealer_id: null, role: "ADMIN_MASTER", nombre: "Carlos Admin Corporativo", email: "admin@changan.com", activo: true },
  { id: 2, dealer_id: 1, role: "DEALER_ADMIN", nombre: "María Dealer CDMX", email: "maria@dealer-cdmx.com", activo: true },
  { id: 3, dealer_id: 2, role: "DEALER_ADMIN", nombre: "Roberto Dealer MTY", email: "roberto@dealer-mty.com", activo: true },
]

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(demoUsers[0])

  const login = (userId: number) => {
    const found = demoUsers.find((u) => u.id === userId)
    if (found) setUser(found)
  }

  const logout = () => setUser(null)

  const switchRole = (role: Role) => {
    if (role === "ADMIN_MASTER") {
      setUser(demoUsers[0])
    } else {
      setUser(demoUsers[1])
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export { demoUsers }
