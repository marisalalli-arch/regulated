import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(goals)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, description, category, targetDate } = await req.json()

  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 })
  }

  const goal = await prisma.goal.create({
    data: {
      userId: session.user.id,
      title,
      description,
      category: category || "personal",
      targetDate: targetDate ? new Date(targetDate) : undefined,
    },
  })

  return NextResponse.json(goal, { status: 201 })
}
