import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/** GET /api/training/sessions/:id */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const ws = await prisma.workoutSession.findUnique({
    where: { id },
    include: { exerciseLogs: { orderBy: { orderIndex: "asc" } } },
  })
  if (!ws || ws.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(ws)
}

/** PUT /api/training/sessions/:id  -- replace logs + notes/duration. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.workoutSession.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Body required" }, { status: 400 })

  // Replace exerciseLogs wholesale (simpler than diffing).
  await prisma.exerciseLog.deleteMany({ where: { sessionId: id } })

  const updated = await prisma.workoutSession.update({
    where: { id },
    data: {
      durationMin: body.durationMin ?? existing.durationMin,
      striveScore: body.striveScore ?? existing.striveScore,
      notes: body.notes ?? existing.notes,
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

  return NextResponse.json(updated)
}

/** DELETE /api/training/sessions/:id */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const existing = await prisma.workoutSession.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  await prisma.workoutSession.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
