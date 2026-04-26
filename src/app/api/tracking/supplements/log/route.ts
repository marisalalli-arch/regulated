import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { dateToYMD } from "@/lib/training-plan"

/**
 * POST /api/tracking/supplements/log
 * Body: { supplementId, date?, taken: boolean }
 * Toggles the taken state for a given supplement on a given date.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.supplementId || typeof body.taken !== "boolean") {
    return NextResponse.json({ error: "supplementId + taken required" }, { status: 400 })
  }
  const date: string =
    typeof body?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
      ? body.date
      : dateToYMD(new Date())

  // Verify the supplement belongs to this user
  const supp = await prisma.supplement.findUnique({ where: { id: body.supplementId } })
  if (!supp || supp.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (body.taken) {
    await prisma.supplementLog.upsert({
      where: { supplementId_date: { supplementId: body.supplementId, date } },
      create: { userId: session.user.id, supplementId: body.supplementId, date },
      update: {}, // already taken
    })
  } else {
    await prisma.supplementLog.deleteMany({
      where: { supplementId: body.supplementId, date },
    })
  }

  return NextResponse.json({ supplementId: body.supplementId, date, taken: body.taken })
}
