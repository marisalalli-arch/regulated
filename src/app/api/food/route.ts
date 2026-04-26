import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { dateToYMD, MEAL_TYPES } from "@/lib/training-plan"

/**
 * GET /api/food?date=YYYY-MM-DD
 * Returns entries + computed totals for the date (defaults to today).
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const date = req.nextUrl.searchParams.get("date") || dateToYMD(new Date())

  const entries = await prisma.foodLog.findMany({
    where: { userId: session.user.id, date },
    orderBy: { createdAt: "asc" },
  })

  type Totals = { calories: number; proteinG: number; carbsG: number; fatG: number }
  type EntryShape = { calories: number | null; proteinG: number | null; carbsG: number | null; fatG: number | null }
  const totals = (entries as EntryShape[]).reduce<Totals>(
    (acc, e) => ({
      calories: acc.calories + (e.calories ?? 0),
      proteinG: acc.proteinG + (e.proteinG ?? 0),
      carbsG: acc.carbsG + (e.carbsG ?? 0),
      fatG: acc.fatG + (e.fatG ?? 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  )

  return NextResponse.json({ date, entries, totals })
}

/**
 * POST /api/food
 * Body: { date?, mealType, name, calories?, proteinG?, carbsG?, fatG? }
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.name || !body?.mealType) {
    return NextResponse.json({ error: "name and mealType required" }, { status: 400 })
  }
  if (!MEAL_TYPES.includes(body.mealType)) {
    return NextResponse.json({ error: "Invalid mealType" }, { status: 400 })
  }

  const date: string =
    typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
      ? body.date
      : dateToYMD(new Date())

  const entry = await prisma.foodLog.create({
    data: {
      userId: session.user.id,
      date,
      mealType: body.mealType,
      name: body.name,
      calories: typeof body.calories === "number" ? body.calories : null,
      proteinG: typeof body.proteinG === "number" ? body.proteinG : null,
      carbsG: typeof body.carbsG === "number" ? body.carbsG : null,
      fatG: typeof body.fatG === "number" ? body.fatG : null,
    },
  })

  return NextResponse.json(entry, { status: 201 })
}
