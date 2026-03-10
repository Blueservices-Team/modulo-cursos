import { NextResponse } from "next/server"
import { attendance, sessionInvites, getNextAttendanceId } from "@/lib/training-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "session_id is required" }, { status: 400 })
  }

  const records = attendance.filter((a) => a.session_id === Number(sessionId))
  return NextResponse.json({ ok: true, data: records })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { session_id, entries } = body

    if (!session_id || !Array.isArray(entries)) {
      return NextResponse.json(
        { ok: false, error: "session_id and entries array required" },
        { status: 400 }
      )
    }

    const saved = []
    for (const entry of entries) {
      const { technician_id, status, comments } = entry

      // Only allow attendance for confirmed invites
      const invite = sessionInvites.find(
        (i) => i.session_id === Number(session_id) && i.technician_id === Number(technician_id)
      )
      if (!invite?.dealer_confirmed) continue

      const existingIdx = attendance.findIndex(
        (a) => a.session_id === Number(session_id) && a.technician_id === Number(technician_id)
      )

      if (existingIdx >= 0) {
        attendance[existingIdx].status = status
        attendance[existingIdx].comments = comments ?? ""
        attendance[existingIdx].marked_at = new Date().toISOString()
        saved.push(attendance[existingIdx])
      } else {
        const record = {
          id: getNextAttendanceId(),
          session_id: Number(session_id),
          technician_id: Number(technician_id),
          status,
          comments: comments ?? "",
          marked_by_user_id: 1,
          marked_at: new Date().toISOString(),
        }
        attendance.push(record)
        saved.push(record)
      }
    }

    return NextResponse.json({ ok: true, data: saved })
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 })
  }
}
