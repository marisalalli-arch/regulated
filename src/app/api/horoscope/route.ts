import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getSunSign } from "@/lib/astrology"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { birthdate: true, risingSign: true },
    })

    if (!user?.birthdate) {
      return NextResponse.json({ missingBirthdate: true })
    }

    const sunSign = getSunSign(user.birthdate)
    const rising = user.risingSign || null
    const today = new Date().toISOString().split("T")[0]

    const cached = await prisma.dailyHoroscope.findUnique({
      where: { date_userId: { date: today, userId: session.user.id } },
    })
    if (cached) {
      return NextResponse.json({ reading: cached.reading, focusWord: cached.focusWord, sunSign: cached.sunSign, rising: cached.rising })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const dateLabel = new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    })

    const signLine = rising ? `${sunSign} sun and ${rising} rising` : `${sunSign} sun`

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `You are a thoughtful, insightful astrologer. Write a daily horoscope for someone with a ${signLine} for ${dateLabel}.

Make it:
- 3 sentences, personal and specific to this placement
- Grounded and practical, relevant to personal growth and day-to-day life
- Warm, encouraging, and slightly mystical in tone

Then provide a single focus word for the day (one word, capitalize it).

Respond in exactly this JSON format:
{"reading": "...", "focusWord": "..."}`,
      }],
    })

    const raw = message.content[0].type === "text" ? message.content[0].text : ""
    let reading = "The stars are aligning for you today."
    let focusWord = "Presence"

    try {
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || "{}")
      if (parsed.reading) reading = parsed.reading
      if (parsed.focusWord) focusWord = parsed.focusWord
    } catch { /* keep defaults */ }

    await prisma.dailyHoroscope.create({
      data: { date: today, userId: session.user.id, sunSign, rising, reading, focusWord },
    })

    return NextResponse.json({ reading, focusWord, sunSign, rising })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[horoscope]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
