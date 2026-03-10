import { NextResponse } from "next/server"
import { sessionInvites, technicians, dealers, getNextInviteId } from "@/lib/training-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "session_id is required" }, { status: 400 })
  }

  const invites = sessionInvites
    .filter((i) => i.session_id === Number(sessionId))
    .map((i) => {
      const tech = technicians.find((t) => t.id === i.technician_id)
      const dealer = tech ? dealers.find((d) => d.id === tech.dealer_id) : null
      return {
        ...i,
        technician_name: tech?.nombre,
        dealer_name: dealer?.nombre,
        dealer_id: tech?.dealer_id,
      }
    })

  return NextResponse.json({ ok: true, data: invites })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { session_id, technician_ids } = body

    if (!session_id || !Array.isArray(technician_ids)) {
      return NextResponse.json(
        { ok: false, error: "session_id and technician_ids array required" },
        { status: 400 }
      )
    }

    const added = []
    for (const techId of technician_ids) {
      const exists = sessionInvites.some(
        (i) => i.session_id === Number(session_id) && i.technician_id === Number(techId)
      )
      if (!exists) {
        const invite = {
          id: getNextInviteId(),
          session_id: Number(session_id),
          technician_id: Number(techId),
          dealer_confirmed: false,
          confirmed_at: null,
          confirm_user_id: null,
        }
        sessionInvites.push(invite)
        added.push(invite)
      }
    }

    return NextResponse.json({ ok: true, data: added })
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 })
  }
}
