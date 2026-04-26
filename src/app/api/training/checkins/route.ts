import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { computeWeekNumber, dateToYMD } from "@/lib/training-plan"

/** GET /api/training/checkins  -> all check-ins for the user, oldest first */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const checkins = await prisma.weeklyCheckIn.findMany({
    where: { userId: session.user.id },
    orderBy: { weekNumber: "asc" },
  })
  return NextResponse.json(checkins)
}

/**
 * POST /api/training/checkins
 * Body: { date?, weightLbs?, waistIn?, hipsIn?, energy?, sleepHrs?, notes? }
 * Upserts on (userId, weekNumber) -- one check-in per week, overwrites if re-submitted.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const date: string =
    typeof body?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
      ? body.date
      : dateToYMD(new Date())

  const plan = await prisma.trainingPlan.findUnique({
    where: { userId: session.user.id },
  })
  const weekNumber = plan?.startDate ? computeWeekNumber(plan.startDate, date) : 0
  if (!weekNumber) {
    return NextResponse.json(
      { error: "Start your training plan first." },
      { status: 400 }
    )
  }

  const data = {
    userId: session.user.id,
    date,
    weekNumber,
    weightLbs: body.weightLbs ?? null,
    waistIn: body.waistIn ?? null,
    hipsIn: body.hipsIn ?? null,
    energy: body.energy ?? null,
    sleepHrs: body.sleepHrs ?? null,
    notes: body.notes ?? null,
  }

  const checkin = await prisma.weeklyCheckIn.upsert({
    where: { userId_weekNumber: { userId: session.user.id, weekNumber } },
    create: data,
    update: { ...data },
  })

  return NextResponse.json(checkin, { status: 201 })
}
