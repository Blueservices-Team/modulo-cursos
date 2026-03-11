"use client"

import { useState, useEffect, useCallback } from "react"
import { ContentCard } from "./content-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import * as api from "@/lib/training-api"
import type { Technician, Dealer, TrainingHistory } from "@/lib/training-types"
import { Plus, Search, History, Upload, Check, Loader2 } from "lucide-react"

export function CorporateHistory() {
  const [history, setHistory] = useState<TrainingHistory[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDealer, setFilterDealer] = useState<string>("all")
  const [showDialog, setShowDialog] = useState(false)
  const [saved, setSaved] = useState(false)

  const [formTechId, setFormTechId] = useState("")
  const [formCourseName, setFormCourseName] = useState("")
  const [formDate, setFormDate] = useState("")
  const [formResult, setFormResult] = useState("")
  const [formCertFile, setFormCertFile] = useState("")

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const [hist, tech, deal] = await Promise.all([
        api.getHistory(),
        api.getTechnicians(),
        api.getDealers(),
      ])
      setHistory(Array.isArray(hist) ? hist : [])
      setTechnicians(Array.isArray(tech) ? tech : [])
      setDealers(Array.isArray(deal) ? deal : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filteredHistory = history
    .filter((h) => {
      if (!searchQuery) return true
      const tech = technicians.find((t) => t.id === h.technician_id)
      return (
        h.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech?.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
    .filter((h) => {
      if (filterDealer === "all") return true
      const tech = technicians.find((t) => t.id === h.technician_id)
      return tech?.dealer_id === Number(filterDealer)
    })
    .sort((a, b) => (b.training_date ?? "").localeCompare(a.training_date ?? ""))

  async function handleSave() {
    if (!formTechId || !formCourseName) return

    setError(null)
    try {
      await api.importHistory({
        technician_id: Number(formTechId),
        course_name: formCourseName,
        training_date: formDate || null,
        result: formResult || null,
        certificate_file: formCertFile || null,
      })
      setSaved(true)
      setFormTechId("")
      setFormCourseName("")
      setFormDate("")
      setFormResult("")
      setFormCertFile("")
      await load()
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar")
    }
  }

  const techsByDealer = dealers.map((d) => ({
    dealer: d,
    techs: technicians.filter((t) => t.dealer_id === d.id),
  }))

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Migración / Histórico</h1>
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
          <h1 className="text-2xl font-bold text-foreground">Migración / Histórico</h1>
          <p className="text-muted-foreground mt-1">
            Cargue el historial de capacitaciones previas y certificados por técnico
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="size-4" />
          Agregar Registro
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <ContentCard>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-48">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Curso o técnico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-48">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Dealer</Label>
            <Select value={filterDealer} onValueChange={setFilterDealer}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los dealers</SelectItem>
                {dealers.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ContentCard>

      <ContentCard title="Registros Históricos" description={`${filteredHistory.length} registro(s)`}>
        {filteredHistory.length === 0 ? (
          <div className="text-center py-10">
            <History className="size-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay registros históricos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-foreground">Técnico</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Dealer</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Curso</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Fecha</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Resultado</th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">Certificado</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((h) => {
                  const tech = technicians.find((t) => t.id === h.technician_id)
                  const dealer = dealers.find((d) => d.id === tech?.dealer_id)
                  return (
                    <tr key={h.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2 font-medium text-card-foreground">{tech?.nombre ?? h.technician_name ?? "N/A"}</td>
                      <td className="py-3 px-2 text-muted-foreground">{dealer?.nombre ?? h.dealer_name ?? "N/A"}</td>
                      <td className="py-3 px-2 text-card-foreground">{h.course_name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{h.training_date ?? "N/A"}</td>
                      <td className="py-3 px-2">
                        <Badge variant={h.result === "Aprobado" ? "default" : "secondary"}>
                          {h.result ?? "N/A"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {h.certificate_file ? (
                          <Badge variant="outline">Archivo</Badge>
                        ) : (
                          "Sin archivo"
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </ContentCard>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar Registro Histórico</DialogTitle>
          </DialogHeader>

          {saved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
              <Check className="size-4" />
              Registro guardado. Puede agregar otro o cerrar.
            </div>
          )}

          <div className="flex flex-col gap-4 py-2">
            <div>
              <Label className="mb-1.5 block">Técnico *</Label>
              <Select value={formTechId} onValueChange={setFormTechId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un técnico" />
                </SelectTrigger>
                <SelectContent>
                  {techsByDealer.map((group) => (
                    <div key={group.dealer.id}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {group.dealer.nombre}
                      </div>
                      {group.techs.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.nombre} ({t.rfc ?? "sin RFC"})
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Nombre del curso *</Label>
              <Input
                value={formCourseName}
                onChange={(e) => setFormCourseName(e.target.value)}
                placeholder="Ej: Inducción Mecánica General"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Fecha</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Resultado</Label>
                <Select value={formResult} onValueChange={setFormResult}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aprobado">Aprobado</SelectItem>
                    <SelectItem value="Reprobado">Reprobado</SelectItem>
                    <SelectItem value="En curso">En curso</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Archivo de certificado (ruta o referencia)</Label>
              <Input
                value={formCertFile}
                onChange={(e) => setFormCertFile(e.target.value)}
                placeholder="Opcional: ruta al archivo PDF"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cerrar</Button>
            <Button onClick={handleSave} disabled={!formTechId || !formCourseName} className="gap-2">
              <Upload className="size-4" />
              Guardar Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
