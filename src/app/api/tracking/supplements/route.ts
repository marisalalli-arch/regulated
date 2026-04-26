import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { dateToYMD } from "@/lib/training-plan"

/**
 * GET /api/tracking/supplements?date=YYYY-MM-DD
 * Returns active supplements + which were taken on the given date.
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const date = req.nextUrl.searchParams.get("date") || dateToYMD(new Date())

  const supplements = await prisma.supplement.findMany({
    where: { userId: session.user.id, active: true },
    orderBy: { createdAt: "asc" },
  })

  const logs = await prisma.supplementLog.findMany({
    where: { userId: session.user.id, date },
  })

  type SupplementShape = { id: string; name: string; active: boolean }
  type LogShape = { supplementId: string }
  const takenIds = new Set((logs as LogShape[]).map((l) => l.supplementId))

  return NextResponse.json({
    date,
    supplements: (supplements as SupplementShape[]).map((s) => ({
      id: s.id,
      name: s.name,
      taken: takenIds.has(s.id),
    })),
  })
}

/** POST /api/tracking/supplements  Body: { name }  -- adds a new supplement to the user's list */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json().catch(() => null)
  if (!body?.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "name required" }, { status: 400 })
  }
  const created = await prisma.supplement.create({
    data: { userId: session.user.id, name: body.name.trim() },
  })
  return NextResponse.json(created, { status: 201 })
}
