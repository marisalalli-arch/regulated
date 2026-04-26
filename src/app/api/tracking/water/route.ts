import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { dateToYMD } from "@/lib/training-plan"

/** GET /api/tracking/water?date=YYYY-MM-DD -> { date, waterOz } */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const date = req.nextUrl.searchParams.get("date") || dateToYMD(new Date())
  const row = await prisma.dailyTracking.findUnique({
    where: { userId_date: { userId: session.user.id, date } },
  })
  return NextResponse.json({ date, waterOz: row?.waterOz ?? 0 })
}

/**
 * PATCH /api/tracking/water
 * Body: { date?, deltaOz?, setOz? }
 *   deltaOz adds (or subtracts if negative); setOz overwrites the day's total.
 */
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const date: string =
    typeof body?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
      ? body.date
      : dateToYMD(new Date())

  const existing = await prisma.dailyTracking.findUnique({
    where: { userId_date: { userId: session.user.id, date } },
  })

  let nextOz: number
  if (typeof body.setOz === "number") {
    nextOz = Math.max(0, Math.round(body.setOz))
  } else if (typeof body.deltaOz === "number") {
    nextOz = Math.max(0, (existing?.waterOz ?? 0) + Math.round(body.deltaOz))
  } else {
    return NextResponse.json({ error: "deltaOz or setOz required" }, { status: 400 })
  }

  const row = await prisma.dailyTracking.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    create: { userId: session.user.id, date, waterOz: nextOz },
    update: { waterOz: nextOz },
  })

  return NextResponse.json({ date: row.date, waterOz: row.waterOz })
}
