import { NextResponse } from "next/server"
import {
  trainingSessions,
  sessionInvites,
  courses,
  technicians,
  getNextSessionId,
  getNextInviteId,
} from "@/lib/training-store"
import { LOCATIONS } from "@/lib/training-types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const dealerId = searchParams.get("dealer_id")
  const location = searchParams.get("location")
  const q = searchParams.get("q")

  let results = [...trainingSessions]

  if (from) results = results.filter((s) => s.session_date >= from)
  if (to) results = results.filter((s) => s.session_date <= to)
  if (location) results = results.filter((s) => s.location_code === Number(location))
  if (dealerId) {
    const dealerTechIds = technicians
      .filter((t) => t.dealer_id === Number(dealerId))
      .map((t) => t.id)
    const relevantSessionIds = sessionInvites
      .filter((i) => dealerTechIds.includes(i.technician_id))
      .map((i) => i.session_id)
    results = results.filter((s) => relevantSessionIds.includes(s.id))
  }
  if (q) {
    const lower = q.toLowerCase()
    results = results.filter((s) => {
      const course = courses.find((c) => c.id === s.course_id)
      return course?.nombre.toLowerCase().includes(lower)
    })
  }

  const enriched = results.map((s) => ({
    ...s,
    course_name: courses.find((c) => c.id === s.course_id)?.nombre,
    location_name: LOCATIONS[s.location_code],
    invite_count: sessionInvites.filter((i) => i.session_id === s.id).length,
    confirmed_count: sessionInvites.filter(
      (i) => i.session_id === s.id && i.dealer_confirmed
    ).length,
  }))

  return NextResponse.json({ ok: true, data: enriched })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { course_id, session_date, location_code } = body

    if (!course_id || !session_date || !location_code) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: course_id, session_date, location_code" },
        { status: 400 }
      )
    }

    const session = {
      id: getNextSessionId(),
      course_id: Number(course_id),
      session_date,
      location_code: Number(location_code),
      created_by_user_id: 1,
      created_at: new Date().toISOString(),
    }

    trainingSessions.push(session)
    return NextResponse.json({ ok: true, data: session })
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 })
  }
}
