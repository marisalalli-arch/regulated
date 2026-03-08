import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, birthdate: true, risingSign: true },
  })

  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { birthdate, risingSign, name } = await req.json()

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(birthdate !== undefined && { birthdate }),
      ...(risingSign !== undefined && { risingSign }),
    },
    select: { name: true, email: true, birthdate: true, risingSign: true },
  })

  // Clear today's cached horoscope so it regenerates with new sign info
  const today = new Date().toISOString().split("T")[0]
  await prisma.dailyHoroscope.deleteMany({
    where: { userId: session.user.id, date: today },
  })

  return NextResponse.json(user)
}
