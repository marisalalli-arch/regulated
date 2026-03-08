import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const client = new Anthropic()

const SYSTEM_PROMPT = `You are an expert life coach named Rox. You are empathetic, motivating, and practical.
Your role is to help users:
- Set and achieve meaningful goals
- Build positive habits and break negative ones
- Reflect on their experiences through journaling
- Overcome obstacles and limiting beliefs
- Develop self-awareness and emotional intelligence
- Create actionable plans and hold them accountable

Keep responses concise but impactful. Ask clarifying questions when needed.
Always be encouraging while being honest. Focus on the user's strengths and potential.`

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { message, history } = await req.json()

  // Save user message
  await prisma.chatMessage.create({
    data: { userId: session.user.id, role: "user", content: message },
  })

  const messages = [
    ...(history || []).map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ]

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  })

  const encoder = new TextEncoder()
  let fullText = ""

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          fullText += chunk.delta.text
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      // Save assistant message after streaming
      await prisma.chatMessage.create({
        data: {
          userId: session.user!.id!,
          role: "assistant",
          content: fullText,
        },
      })
      controller.close()
    },
  })

  return new NextResponse(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const messages = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  })

  return NextResponse.json(messages)
}
