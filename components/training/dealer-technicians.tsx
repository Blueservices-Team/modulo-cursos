"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { ContentCard } from "./content-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import * as api from "@/lib/training-api"
import type { Technician } from "@/lib/training-types"
import { Plus, Pencil, Search, Users, Loader2 } from "lucide-react"

interface TechForm {
  nombre: string
  email: string
  rfc: string
  telefono: string
  activo: boolean
}

const emptyForm: TechForm = { nombre: "", email: "", rfc: "", telefono: "", activo: true }

export function DealerTechnicians() {
  const { user } = useAuth()
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<TechForm>(emptyForm)

  const load = useCallback(async () => {
    if (!user?.dealer_id) return
    setError(null)
    setLoading(true)
    try {
      const data = await api.getTechnicians(user.dealer_id)
      setTechnicians(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar técnicos")
    } finally {
      setLoading(false)
    }
  }, [user?.dealer_id])

  useEffect(() => {
    load()
  }, [load])

  if (!user || !user.dealer_id) return null

  const dealerTechs = technicians.filter(
    (t) =>
      !searchQuery ||
      t.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.rfc && t.rfc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.email && t.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  function openCreateDialog() {
    setEditId(null)
    setForm(emptyForm)
    setShowDialog(true)
  }

  function openEditDialog(tech: Technician) {
    setEditId(tech.id)
    setForm({
      nombre: tech.nombre,
      email: tech.email ?? "",
      rfc: tech.rfc ?? "",
      telefono: tech.telefono ?? "",
      activo: tech.activo,
    })
    setShowDialog(true)
  }

  async function handleSave() {
    if (!form.nombre) return

    try {
      if (editId) {
        await api.updateTechnician(editId, {
          nombre: form.nombre,
          email: form.email || null,
          rfc: form.rfc || null,
          telefono: form.telefono || null,
          activo: form.activo ? 1 : 0,
        })
      } else {
        await api.createTechnician({
          dealer_id: user.dealer_id ?? undefined,
          nombre: form.nombre,
          email: form.email || null,
          rfc: form.rfc || null,
          telefono: form.telefono || null,
        })
      }
      setShowDialog(false)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar")
    }
  }

  async function toggleActive(tech: Technician) {
    try {
      await api.updateTechnician(tech.id, { activo: tech.activo ? 0 : 1 })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administración de Técnicos</h1>
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
          <h1 className="text-2xl font-bold text-foreground">Administración de Técnicos</h1>
          <p className="text-muted-foreground mt-1">Gestione los técnicos de su dealer</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="size-4" />
          Nuevo Técnico
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <ContentCard>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, RFC o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </ContentCard>

      <ContentCard title="Técnicos" description={`${dealerTechs.length} técnico(s)`}>
        {dealerTechs.length === 0 ? (
          <div className="text-center py-10">
            <Users className="size-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No se encontraron técnicos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-foreground">Nombre</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Email</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">RFC</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Teléfono</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Estatus</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dealerTechs.map((tech) => (
                  <tr key={tech.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 font-medium text-card-foreground">{tech.nombre}</td>
                    <td className="py-3 px-2 text-muted-foreground">{tech.email ?? "—"}</td>
                    <td className="py-3 px-2 text-muted-foreground">{tech.rfc ?? "—"}</td>
                    <td className="py-3 px-2 text-muted-foreground">{tech.telefono ?? "—"}</td>
                    <td className="py-3 px-2">
                      <Badge
                        variant={tech.activo ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleActive(tech)}
                      >
                        {tech.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(tech)} className="gap-1">
                        <Pencil className="size-3" />
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ContentCard>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar Técnico" : "Nuevo Técnico"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div>
              <Label className="mb-1.5 block">Nombre completo *</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Nombre del técnico"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">RFC</Label>
                <Input
                  value={form.rfc}
                  onChange={(e) => setForm((f) => ({ ...f, rfc: e.target.value }))}
                  placeholder="XXXX000000XXX"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Teléfono</Label>
                <Input
                  value={form.telefono}
                  onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                  placeholder="5500000000"
                />
              </div>
            </div>
            {editId && (
              <div>
                <Label className="mb-1.5 block">Estatus</Label>
                <Select
                  value={form.activo ? "1" : "0"}
                  onValueChange={(v) => setForm((f) => ({ ...f, activo: v === "1" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Activo</SelectItem>
                    <SelectItem value="0">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.nombre}>
              {editId ? "Guardar Cambios" : "Crear Técnico"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
