import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]

    const cached = await prisma.dailyTarot.findUnique({ where: { date: today } })
    if (cached) return NextResponse.json(cached)

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const dateLabel = new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    })

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `You are an expert tarot reader. Draw a single tarot card for ${dateLabel}.

Choose from the full 78-card deck (Major Arcana 0–XXI, and all four suits of the Minor Arcana: Wands, Cups, Swords, Pentacles, each with cards Ace through 10 plus Page, Knight, Queen, King). Vary the card based on the date so it feels like a genuine daily draw.

Respond in exactly this JSON format (no markdown):
{
  "cardName": "Full card name (e.g. The Moon, Five of Cups, Queen of Wands)",
  "arcana": "Major" | "Minor",
  "orientation": "Upright" | "Reversed",
  "keywords": "3 comma-separated keywords",
  "description": "2-3 sentences describing the card's imagery, symbolism, and what it means in today's energy.",
  "advice": "1 sentence of direct, personal advice for the day based on this card."
}`,
        },
      ],
    })

    const raw = message.content[0].type === "text" ? message.content[0].text : ""

    let data = {
      cardName: "The High Priestess",
      arcana: "Major",
      orientation: "Upright",
      keywords: "intuition, mystery, inner knowing",
      description: "The High Priestess sits between two pillars, a veil behind her concealing hidden realms. She invites you to trust what you feel beneath the surface today.",
      advice: "Pause before acting — your intuition holds the answer you're seeking.",
    }

    try {
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || "{}")
      if (parsed.cardName) data = { ...data, ...parsed }
    } catch {
      // keep defaults
    }

    const saved = await prisma.dailyTarot.create({ data: { date: today, ...data } })
    return NextResponse.json(saved)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[tarot]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
