import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

  const entries = await prisma.foodEntry.findMany({
    where: { userId: session.user.id, date },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, calories, mealType, notes, date } = await req.json()

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 })
  }

  const entry = await prisma.foodEntry.create({
    data: {
      userId: session.user.id,
      date: date || new Date().toISOString().split("T")[0],
      name,
      calories: calories ? Number(calories) : null,
      mealType: mealType || "meal",
      notes,
    },
  })

  return NextResponse.json(entry, { status: 201 })
}
