import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const entries = await prisma.journalEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { content, mood, prompt } = await req.json()

  if (!content) {
    return NextResponse.json({ error: "Content required" }, { status: 400 })
  }

  const entry = await prisma.journalEntry.create({
    data: {
      userId: session.user.id,
      content,
      mood,
      prompt,
    },
  })

  return NextResponse.json(entry, { status: 201 })
}
