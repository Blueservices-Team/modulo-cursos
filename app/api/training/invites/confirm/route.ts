import { NextResponse } from "next/server"
import { sessionInvites } from "@/lib/training-store"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { invite_id, user_id } = body

    if (!invite_id) {
      return NextResponse.json({ ok: false, error: "invite_id is required" }, { status: 400 })
    }

    const invite = sessionInvites.find((i) => i.id === Number(invite_id))
    if (!invite) {
      return NextResponse.json({ ok: false, error: "Invite not found" }, { status: 404 })
    }

    invite.dealer_confirmed = true
    invite.confirmed_at = new Date().toISOString()
    invite.confirm_user_id = user_id ?? null

    return NextResponse.json({ ok: true, data: invite })
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 })
  }
}
