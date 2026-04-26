import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  PHASES,
  WORKOUTS,
  CARDIO_OPTIONS,
  WEEKLY_SCHEDULE,
  computeWeekNumber,
  phaseForWeek,
  todaysSuggestion,
  dateToYMD,
} from "@/lib/training-plan"

/**
 * GET /api/training/plan
 * Returns the static plan + the user's progress (current week / phase) if started.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const plan = await prisma.trainingPlan.findUnique({
    where: { userId: session.user.id },
  })

  const todayYMD = dateToYMD(new Date())
  const weekNumber = plan?.startDate ? computeWeekNumber(plan.startDate, todayYMD) : null
  const phase = weekNumber ? phaseForWeek(weekNumber) : null
  const suggestion = todaysSuggestion()

  return NextResponse.json({
    started: !!plan,
    startDate: plan?.startDate ?? null,
    weekNumber,
    phase,
    today: {
      date: todayYMD,
      suggestion,
    },
    phases: PHASES,
    workouts: WORKOUTS,
    cardioOptions: CARDIO_OPTIONS,
    weeklySchedule: WEEKLY_SCHEDULE,
  })
}

/**
 * POST /api/training/plan
 * Starts the plan (or updates the start date).
 * Body: { startDate?: "YYYY-MM-DD" }  // defaults to today
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const startDate: string =
    typeof body?.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.startDate)
      ? body.startDate
      : dateToYMD(new Date())

  const plan = await prisma.trainingPlan.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, startDate },
    update: { startDate, active: true },
  })

  return NextResponse.json(plan)
}
