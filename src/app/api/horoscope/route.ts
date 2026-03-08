import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]

    const cached = await prisma.dailyHoroscope.findUnique({ where: { date: today } })
    if (cached) {
      return NextResponse.json({ reading: cached.reading, focusWord: cached.focusWord, date: today })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const dateLabel = new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    })

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are a thoughtful, insightful astrologer. Write a daily horoscope for someone with a Libra sun and Virgo rising for ${dateLabel}.

Make it:
- 3 sentences, personal and specific to this sun/rising combination
- Grounded and practical (Virgo rising loves detail and routine)
- Balanced and relationally aware (Libra sun craves harmony and beauty)
- Relevant to personal growth, energy, and day-to-day life
- Warm, encouraging, and slightly mystical in tone

Then provide a single focus word for the day (one word, capitalize it).

Respond in exactly this JSON format:
{"reading": "...", "focusWord": "..."}`,
        },
      ],
    })

    const raw = message.content[0].type === "text" ? message.content[0].text : ""

    let reading = "The stars are aligning for you today."
    let focusWord = "Presence"

    try {
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || "{}")
      if (parsed.reading) reading = parsed.reading
      if (parsed.focusWord) focusWord = parsed.focusWord
    } catch {
      // keep defaults
    }

    await prisma.dailyHoroscope.create({ data: { date: today, reading, focusWord } })

    return NextResponse.json({ reading, focusWord, date: today })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[horoscope]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
