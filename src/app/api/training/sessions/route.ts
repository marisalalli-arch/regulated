import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  computeWeekNumber,
  phaseForWeek,
  workoutByKey,
} from "@/lib/training-plan"

/**
 * GET /api/training/sessions?date=YYYY-MM-DD
 * GET /api/training/sessions  -> all sessions for the user (most recent first)
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const date = req.nextUrl.searchParams.get("date")
  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId: session.user.id,
      ...(date ? { date } : {}),
    },
    include: { exerciseLogs: { orderBy: { orderIndex: "asc" } } },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(sessions)
}

/**
 * POST /api/training/sessions
 * Create a new logged session. Body:
 * {
 *   date: "YYYY-MM-DD",
 *   workoutKey: "A" | "B" | "C" | "walk" | "row" | "intervals" | "peloton",
 *   workoutName?: string,
 *   durationMin?: number,
 *   notes?: string,
 *   exercises?: [{ exerciseKey, exerciseName, orderIndex, setWeights, setReps, notes? }]
 * }
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.date || !body?.workoutKey) {
    return NextResponse.json({ error: "date and workoutKey required" }, { status: 400 })
  }

  // Look up the user's plan to derive weekNumber + phase. If they haven't
  // started one yet, fall back to "no week" as week 0.
  const plan = await prisma.trainingPlan.findUnique({
    where: { userId: session.user.id },
  })
  const weekNumber = plan?.startDate
    ? computeWeekNumber(plan.startDate, body.date)
    : 0
  const phase = weekNumber > 0 ? phaseForWeek(weekNumber).name : "Foundation"

  // Auto-fill workoutName if it matches a known lift
  const known = workoutByKey(body.workoutKey)
  const workoutName: string =
    body.workoutName ||
    (known ? `Workout ${known.key} — ${known.name}` : body.workoutKey)

  const created = await prisma.workoutSession.create({
    data: {
      userId: session.user.id,
      date: body.date,
      weekNumber,
      phase,
      workoutKey: body.workoutKey,
      workoutName,
      durationMin: body.durationMin ?? null,
      striveScore: body.striveScore ?? null,
      notes: body.notes ?? null,
      exerciseLogs: {
        create: (body.exercises ?? []).map((e: {
          exerciseKey: string
          exerciseName: string
          orderIndex: number
          setWeights?: number[]
          setReps?: number[]
          notes?: string
        }) => ({
          exerciseKey: e.exerciseKey,
          exerciseName: e.exerciseName,
          orderIndex: e.orderIndex,
          setWeights: e.setWeights ?? [],
          setReps: e.setReps ?? [],
          notes: e.notes ?? null,
        })),
      },
    },
    include: { exerciseLogs: { orderBy: { orderIndex: "asc" } } },
  })

  return NextResponse.json(created, { status: 201 })
}
