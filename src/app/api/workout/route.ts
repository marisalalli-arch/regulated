import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]

    const cached = await prisma.dailyWorkout.findUnique({ where: { date: today } })
    if (cached) return NextResponse.json(cached)

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const dateLabel = new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    })

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `You are a Peloton fitness coach assistant. Recommend a single Peloton workout for ${dateLabel}.

The user's favorite instructors are: Matty Maggiacomo, Kirsten Ferguson, Ash Pryor, Jess King.
Allowed workout types: Tread (running/walking), Strength, Row.
Do NOT recommend Bike or Cycling workouts.

Vary the instructor and workout type day to day based on the date. Make it feel fresh and specific.

Respond in exactly this JSON format (no markdown):
{
  "instructor": "First Last",
  "type": "Tread" | "Strength" | "Row",
  "duration": 20 | 30 | 45 | 60,
  "title": "Short punchy workout title (4-6 words)",
  "description": "2 sentences. Describe what to expect in this class — the energy, the focus, what makes this instructor/type combo great today.",
  "intensity": "Low" | "Moderate" | "High" | "All Out"
}`,
        },
      ],
    })

    const raw = message.content[0].type === "text" ? message.content[0].text : ""

    let data = {
      instructor: "Matty Maggiacomo",
      type: "Tread",
      duration: 30,
      title: "Power Run",
      description: "Push your pace with Matty's signature energy and killer playlist. Expect interval work that challenges your speed and endurance.",
      intensity: "High" as string,
    }

    try {
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || "{}")
      if (parsed.instructor) data = { ...data, ...parsed }
    } catch {
      // keep defaults
    }

    const saved = await prisma.dailyWorkout.create({ data: { date: today, ...data } })
    return NextResponse.json(saved)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[workout]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
