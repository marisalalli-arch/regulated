import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date().toISOString().split("T")[0]

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    include: {
      logs: {
        where: { date: today },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(habits)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, description, color } = await req.json()

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 })
  }

  const habit = await prisma.habit.create({
    data: {
      userId: session.user.id,
      name,
      description,
      color: color || "#6366f1",
    },
  })

  return NextResponse.json(habit, { status: 201 })
}
