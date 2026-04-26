import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

/**
 * POST /api/food/lookup
 *
 * Searches USDA FoodData Central and returns top matches with macros per 100g.
 * Server-side only -- the API key never leaves the server.
 *
 * Body: { query: string }   e.g. "greek yogurt"
 *
 * Required env var (in .env.local):
 *   USDA_API_KEY  -- get one free at https://api.data.gov/signup/
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.USDA_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "USDA_API_KEY not configured. Add it to .env.local and restart the dev server." },
      { status: 500 }
    )
  }

  const body = await req.json().catch(() => null)
  if (!body?.query || typeof body.query !== "string") {
    return NextResponse.json({ error: "query (string) required" }, { status: 400 })
  }

  type Nutrient = {
    nutrientId?: number
    nutrientName?: string
    nutrientNumber?: string
    unitName?: string
    value?: number
  }
  type UsdaFood = {
    fdcId: number
    description: string
    dataType?: string
    brandOwner?: string
    brandName?: string
    servingSize?: number
    servingSizeUnit?: string
    foodNutrients?: Nutrient[]
  }

  // USDA's keyword matcher gets confused by quantity language ("1 cup", "2 oz",
  // "1/2 large"). Strip those out so we send a clean food-name-only query.
  const cleanedQuery = cleanQueryForUsda(body.query)

  async function search(dataTypes: string): Promise<UsdaFood[]> {
    const params = new URLSearchParams({
      query: cleanedQuery,
      api_key: apiKey!,
      pageSize: "10",
      dataType: dataTypes,
    })
    const r = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?${params.toString()}`)
    if (!r.ok) return []
    const json = await r.json()
    return json?.foods ?? []
  }

  // First pass: only whole-food datasets. These are the real USDA reference
  // entries -- "Strawberries, raw", "Yogurt, Greek, plain", etc. -- with reliable
  // per-100g nutrient data and no brand noise.
  let foods = await search("Foundation,SR Legacy,Survey (FNDDS)")

  // Fallback to Branded only if no whole-food matches were found.
  if (foods.length === 0) {
    foods = await search("Branded")
  }

  if (foods.length === 0) {
    return NextResponse.json({ results: [] })
  }

  const results = foods.slice(0, 5).map((f) => {
    const macros = pickMacros(f.foodNutrients ?? [])
    const isBranded = f.dataType === "Branded"
    // For non-branded foods USDA gives per-100g; for branded, per serving.
    const basisGrams = isBranded && f.servingSize ? f.servingSize : 100
    const basis = isBranded && f.servingSize
      ? `${f.servingSize}${f.servingSizeUnit ?? "g"}`
      : "100g"
    return {
      fdcId: f.fdcId,
      name: f.description,
      brand: f.brandOwner || f.brandName || null,
      basis,        // human-readable, e.g. "100g" or "170g"
      basisGrams,   // numeric basis for unit conversions on the client
      calories: macros.calories,
      proteinG: macros.proteinG,
      carbsG: macros.carbsG,
      fatG: macros.fatG,
    }
  })

  return NextResponse.json({ results })
}

function pickMacros(nutrients: Array<{ nutrientId?: number; nutrientNumber?: string; value?: number }>) {
  // USDA identifies nutrients by either nutrientId or nutrientNumber. We accept either.
  const byId = (id: number, num: string) =>
    nutrients.find((n) => n.nutrientId === id || n.nutrientNumber === num)?.value ?? null

  return {
    calories: round1(byId(1008, "208")),
    proteinG: round1(byId(1003, "203")),
    carbsG: round1(byId(1005, "205")),
    fatG: round1(byId(1004, "204")),
  }
}

function round1(n: number | null): number | null {
  if (n == null) return null
  return Math.round(n * 10) / 10
}

/**
 * Strip quantity language from a USDA query so the keyword matcher only sees
 * the food name. e.g. "1 cup strawberry" -> "strawberry".
 *
 * Safety net only -- the UI now has separate quantity + unit fields, but users
 * may still type "2 oz chicken" out of habit.
 */
function cleanQueryForUsda(raw: string): string {
  const UNITS = /\b(cups?|ozs?|ounces?|tbsps?|tablespoons?|tsps?|teaspoons?|grams?|kg|lbs?|pounds?|mls?|liters?|slices?|pieces?|servings?|scoops?|cans?|bottles?|packages?|packets?|containers?|medium|large|small|whole|half|halves|quarter|sticks?|cloves?|pinch|dash|handful|bowl|plate|each|fl|fluid)\b/gi
  let q = raw.trim()
  q = q.replace(/^[\d\s\/.]+/, "") // leading numbers, fractions, dots
  q = q.replace(UNITS, "")
  q = q.replace(/[\d\/.]+/g, "") // any remaining digits/fractions inline
  q = q.replace(/\s+/g, " ").trim()
  return q || raw
}
