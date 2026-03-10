import { NextResponse } from "next/server"
import {
  trainingHistory,
  technicians,
  dealers,
  getNextHistoryId,
} from "@/lib/training-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const techId = searchParams.get("technician_id")
  const dealerId = searchParams.get("dealer_id")
  const q = searchParams.get("q")

  let results = [...trainingHistory]

  if (techId) results = results.filter((h) => h.technician_id === Number(techId))
  if (dealerId) {
    const dealerTechIds = technicians
      .filter((t) => t.dealer_id === Number(dealerId))
      .map((t) => t.id)
    results = results.filter((h) => dealerTechIds.includes(h.technician_id))
  }
  if (q) {
    const lower = q.toLowerCase()
    results = results.filter((h) => {
      const tech = technicians.find((t) => t.id === h.technician_id)
      return (
        h.course_name.toLowerCase().includes(lower) ||
        tech?.nombre.toLowerCase().includes(lower)
      )
    })
  }

  const enriched = results.map((h) => {
    const tech = technicians.find((t) => t.id === h.technician_id)
    const dealer = tech ? dealers.find((d) => d.id === tech.dealer_id) : null
    return {
      ...h,
      technician_name: tech?.nombre,
      dealer_name: dealer?.nombre,
    }
  })

  return NextResponse.json({ ok: true, data: enriched })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { technician_id, course_name, training_date, result, certificate_file } = body

    if (!technician_id || !course_name) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: technician_id, course_name" },
        { status: 400 }
      )
    }

    const record = {
      id: getNextHistoryId(),
      technician_id: Number(technician_id),
      course_name,
      training_date: training_date ?? null,
      result: result ?? null,
      certificate_file: certificate_file ?? null,
      imported_by: 1,
      created_at: new Date().toISOString(),
    }

    trainingHistory.push(record)
    return NextResponse.json({ ok: true, data: record })
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 })
  }
}
