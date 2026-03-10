import { NextResponse } from "next/server"
import { technicians, getNextTechId } from "@/lib/training-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dealerId = searchParams.get("dealer_id")
  const q = searchParams.get("q")

  let results = [...technicians]

  if (dealerId) results = results.filter((t) => t.dealer_id === Number(dealerId))
  if (q) {
    const lower = q.toLowerCase()
    results = results.filter(
      (t) =>
        t.nombre.toLowerCase().includes(lower) ||
        t.rfc.toLowerCase().includes(lower) ||
        t.email.toLowerCase().includes(lower)
    )
  }

  return NextResponse.json({ ok: true, data: results })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { dealer_id, nombre, email, rfc, telefono } = body

    if (!dealer_id || !nombre || !email || !rfc) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: dealer_id, nombre, email, rfc" },
        { status: 400 }
      )
    }

    const tech = {
      id: getNextTechId(),
      dealer_id: Number(dealer_id),
      nombre,
      email,
      rfc,
      telefono: telefono ?? "",
      activo: true,
      created_at: new Date().toISOString(),
    }

    technicians.push(tech)
    return NextResponse.json({ ok: true, data: tech })
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 })
  }
}
