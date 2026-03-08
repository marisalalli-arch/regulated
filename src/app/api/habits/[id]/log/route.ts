import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { date, completed } = await req.json()
  const logDate = date || new Date().toISOString().split("T")[0]

  // Verify habit belongs to user
  const habit = await prisma.habit.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (completed === false) {
    await prisma.habitLog.deleteMany({ where: { habitId: id, date: logDate } })
  } else {
    await prisma.habitLog.upsert({
      where: { habitId_date: { habitId: id, date: logDate } },
      create: { habitId: id, date: logDate, completed: true },
      update: { completed: true },
    })
  }

  // Recalculate streak
  const logs = await prisma.habitLog.findMany({
    where: { habitId: id, completed: true },
    orderBy: { date: "desc" },
  })

  let streak = 0
  const today = new Date()
  for (let i = 0; i < logs.length; i++) {
    const expected = new Date(today)
    expected.setDate(today.getDate() - i)
    const expectedDate = expected.toISOString().split("T")[0]
    if (logs[i].date === expectedDate) {
      streak++
    } else {
      break
    }
  }

  await prisma.habit.update({ where: { id }, data: { streak } })

  return NextResponse.json({ success: true, streak })
}
