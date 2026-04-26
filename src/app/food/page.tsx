"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const DAILY_TARGETS = {
  calories: 1700,
  proteinG: 145,
  carbsG: 155,
  fatG: 60,
  waterOz: 100,
}
const MEAL_TYPES = ["breakfast", "lunch", "snack", "dinner"] as const
type MealType = (typeof MEAL_TYPES)[number]

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snack: "Snack",
  dinner: "Dinner",
}

type FoodEntry = {
  id: string
  date: string
  mealType: MealType
  name: string
  calories: number | null
  proteinG: number | null
  carbsG: number | null
  fatG: number | null
}

type FoodResponse = {
  date: string
  entries: FoodEntry[]
  totals: { calories: number; proteinG: number; carbsG: number; fatG: number }
}

type SupplementItem = { id: string; name: string; taken: boolean }
type SupplementResponse = { date: string; supplements: SupplementItem[] }
type WaterResponse = { date: string; waterOz: number }
type LookupResult = {
  fdcId: number
  name: string
  brand: string | null
  basis: string       // "100g" or e.g. "170g"
  basisGrams: number  // numeric grams the macros are per
  calories: number | null
  proteinG: number | null
  carbsG: number | null
  fatG: number | null
}

// Approximate grams per unit. Mass units are exact; volume units assume
// water-density (1ml = 1g), which is rough -- veggies, oils, etc. vary.
const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  oz: 28.35,
  lb: 453.6,
  kg: 1000,
  ml: 1,
  cup: 240,
  tbsp: 15,
  tsp: 5,
  serving: 0,   // special: don't convert, multiplier = qty
}
const UNIT_OPTIONS: { value: string; label: string }[] = [
  { value: "g", label: "g" },
  { value: "oz", label: "oz" },
  { value: "lb", label: "lb" },
  { value: "kg", label: "kg" },
  { value: "ml", label: "ml" },
  { value: "cup", label: "cup" },
  { value: "tbsp", label: "tbsp" },
  { value: "tsp", label: "tsp" },
  { value: "serving", label: "serving" },
]

function todayYMD() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function FoodPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [date, setDate] = useState(todayYMD())
  const [data, setData] = useState<FoodResponse | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [mealType, setMealType] = useState<MealType>("breakfast")
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [unit, setUnit] = useState<string>("cup")
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fat, setFat] = useState("")
  const [saving, setSaving] = useState(false)
  const [looking, setLooking] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookupResults, setLookupResults] = useState<LookupResult[] | null>(null)
  const [waterOz, setWaterOz] = useState(0)
  const [supplements, setSupplements] = useState<SupplementItem[]>([])
  const [newSupp, setNewSupp] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const load = useCallback(async (forDate: string) => {
    const res = await fetch(`/api/food?date=${forDate}`)
    if (res.ok) setData(await res.json())
  }, [])

  useEffect(() => {
    if (!session) return
    fetch(`/api/food?date=${date}`)
      .then((r) => r.json())
      .then(setData)
    fetch(`/api/tracking/water?date=${date}`)
      .then((r) => r.json())
      .then((d: WaterResponse) => setWaterOz(d.waterOz ?? 0))
    fetch(`/api/tracking/supplements?date=${date}`)
      .then((r) => r.json())
      .then((d: SupplementResponse) => setSupplements(d.supplements ?? []))
  }, [session, date])

  async function adjustWater(deltaOz: number) {
    const optimistic = Math.max(0, waterOz + deltaOz)
    setWaterOz(optimistic) // optimistic UI
    const res = await fetch("/api/tracking/water", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, deltaOz }),
    })
    if (res.ok) {
      const d: WaterResponse = await res.json()
      setWaterOz(d.waterOz)
    }
  }

  async function setWaterTotal(value: number) {
    const res = await fetch("/api/tracking/water", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, setOz: value }),
    })
    if (res.ok) {
      const d: WaterResponse = await res.json()
      setWaterOz(d.waterOz)
    }
  }

  async function toggleSupplement(supp: SupplementItem) {
    const next = !supp.taken
    setSupplements((prev) => prev.map((s) => (s.id === supp.id ? { ...s, taken: next } : s)))
    await fetch("/api/tracking/supplements/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplementId: supp.id, date, taken: next }),
    })
  }

  async function addSupplement(e: React.FormEvent) {
    e.preventDefault()
    if (!newSupp.trim()) return
    const res = await fetch("/api/tracking/supplements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSupp.trim() }),
    })
    if (res.ok) {
      const created = await res.json()
      setSupplements((prev) => [...prev, { id: created.id, name: created.name, taken: false }])
      setNewSupp("")
    }
  }

  async function removeSupplement(id: string) {
    await fetch(`/api/tracking/supplements/${id}`, { method: "DELETE" })
    setSupplements((prev) => prev.filter((s) => s.id !== id))
  }

  async function addEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    setSaving(true)
    await fetch("/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        mealType,
        name,
        calories: calories ? parseFloat(calories) : undefined,
        proteinG: protein ? parseFloat(protein) : undefined,
        carbsG: carbs ? parseFloat(carbs) : undefined,
        fatG: fat ? parseFloat(fat) : undefined,
      }),
    })
    setName(""); setCalories(""); setProtein(""); setCarbs(""); setFat("")
    setQuantity("1"); setUnit("cup")
    setSaving(false)
    load(date)
  }

  async function removeEntry(id: string) {
    await fetch(`/api/food/${id}`, { method: "DELETE" })
    load(date)
  }

  async function lookupMacros() {
    if (!name.trim()) return
    setLooking(true)
    setLookupError(null)
    setLookupResults(null)
    try {
      const res = await fetch("/api/food/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLookupError(data?.error || "Lookup failed")
      } else if (!data.results || data.results.length === 0) {
        setLookupError("No matches found. Try a simpler name (e.g. 'greek yogurt').")
      } else {
        setLookupResults(data.results)
      }
    } catch {
      setLookupError("Network error")
    }
    setLooking(false)
  }

  function pickResult(r: LookupResult) {
    const qty = parseFloat(quantity) || 1
    let multiplier: number
    if (unit === "serving") {
      // No conversion -- multiplier is just the quantity (1 serving, 2 servings, etc.)
      multiplier = qty
    } else {
      const grams = (UNIT_TO_GRAMS[unit] ?? 1) * qty
      multiplier = grams / r.basisGrams
    }
    setName(`${qty} ${unit} ${r.name}${r.brand ? ` (${r.brand})` : ""}`)
    setCalories(r.calories != null ? String(round1(r.calories * multiplier)) : "")
    setProtein(r.proteinG != null ? String(round1(r.proteinG * multiplier)) : "")
    setCarbs(r.carbsG != null ? String(round1(r.carbsG * multiplier)) : "")
    setFat(r.fatG != null ? String(round1(r.fatG * multiplier)) : "")
    setLookupResults(null)
  }

  function round1(n: number): number {
    return Math.round(n * 10) / 10
  }

  if (status === "loading") return null

  const isToday = date === todayYMD()
  const totals = data?.totals ?? { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }

  // Group entries by meal
  const grouped: Record<MealType, FoodEntry[]> = {
    breakfast: [], lunch: [], snack: [], dinner: [],
  }
  ;(data?.entries ?? []).forEach((e) => {
    if (grouped[e.mealType]) grouped[e.mealType].push(e)
  })

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <div className="border-b border-[#e2dbd3] pb-6 flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">
            {isToday ? "Today" : new Date(date + "T00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-serif text-4xl font-light text-stone-900">Food</h1>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={todayYMD()}
          className="text-xs tracking-[0.1em] uppercase text-stone-500 border-b border-[#e2dbd3] pb-1 bg-transparent focus:outline-none focus:border-stone-500"
        />
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-[#e2dbd3] divide-x divide-[#e2dbd3] bg-white">
        <MacroStat label="Calories" value={totals.calories} target={DAILY_TARGETS.calories} unit="" />
        <MacroStat label="Protein" value={totals.proteinG} target={DAILY_TARGETS.proteinG} unit="g" />
        <MacroStat label="Carbs" value={totals.carbsG} target={DAILY_TARGETS.carbsG} unit="g" />
        <MacroStat label="Fat" value={totals.fatG} target={DAILY_TARGETS.fatG} unit="g" />
      </div>

      {/* Hydration + Supplements side-by-side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Hydration */}
        <div className="bg-white border border-[#e2dbd3] p-6 space-y-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs tracking-[0.15em] uppercase text-stone-500">Hydration</p>
            <p className="text-xs text-stone-400">{waterOz} / {DAILY_TARGETS.waterOz} oz</p>
          </div>
          <div className="w-full h-px bg-[#e2dbd3] relative">
            <div
              className="absolute top-0 left-0 h-px bg-[#5a8aac] transition-all"
              style={{ width: `${Math.min(100, (waterOz / DAILY_TARGETS.waterOz) * 100)}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[8, 12, 16, 20].map((oz) => (
              <button
                key={oz}
                onClick={() => adjustWater(oz)}
                className="text-xs tracking-[0.1em] uppercase border border-[#e2dbd3] text-stone-600 px-3 py-1.5 hover:border-stone-500 hover:text-stone-900 transition-colors"
              >
                +{oz} oz
              </button>
            ))}
            <button
              onClick={() => adjustWater(-8)}
              disabled={waterOz === 0}
              className="text-xs tracking-[0.1em] uppercase border border-[#e2dbd3] text-stone-400 px-3 py-1.5 hover:border-stone-500 hover:text-stone-700 transition-colors disabled:opacity-40"
            >
              -8 oz
            </button>
            <button
              onClick={() => setWaterTotal(0)}
              disabled={waterOz === 0}
              className="text-xs tracking-[0.1em] uppercase text-stone-300 px-3 py-1.5 hover:text-stone-500 transition-colors disabled:opacity-40 ml-auto"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Supplements */}
        <div className="bg-white border border-[#e2dbd3] p-6 space-y-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs tracking-[0.15em] uppercase text-stone-500">Supplements</p>
            <p className="text-xs text-stone-400">
              {supplements.filter((s) => s.taken).length} / {supplements.length} taken
            </p>
          </div>

          {supplements.length === 0 ? (
            <p className="text-xs text-stone-400 font-light italic">No supplements added yet.</p>
          ) : (
            <div className="space-y-2">
              {supplements.map((s) => (
                <div key={s.id} className="flex items-center gap-3 group">
                  <button
                    onClick={() => toggleSupplement(s)}
                    className={`w-4 h-4 rounded-full border flex-shrink-0 transition-colors ${
                      s.taken ? "border-stone-600 bg-stone-600" : "border-stone-300 hover:border-stone-500"
                    }`}
                  />
                  <span className={`flex-1 text-sm ${s.taken ? "text-stone-400 line-through" : "text-stone-700"}`}>
                    {s.name}
                  </span>
                  <button
                    onClick={() => removeSupplement(s.id)}
                    className="text-xs text-stone-300 hover:text-stone-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={addSupplement} className="flex gap-2 pt-2 border-t border-[#e2dbd3]">
            <input
              type="text"
              placeholder="Add supplement (e.g. Vitamin D)"
              value={newSupp}
              onChange={(e) => setNewSupp(e.target.value)}
              className="flex-1 border-b border-[#e2dbd3] pb-1 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-transparent"
            />
            <button
              type="submit"
              disabled={!newSupp.trim()}
              className="text-xs tracking-[0.1em] uppercase text-stone-500 px-2 hover:text-stone-900 transition-colors disabled:opacity-40"
            >
              Add
            </button>
          </form>
        </div>
      </div>

      {/* Add entry */}
      <div className="bg-white border border-[#e2dbd3] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs tracking-[0.15em] uppercase text-stone-500">Add food</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-xs tracking-[0.12em] uppercase text-stone-400 hover:text-stone-700 transition-colors"
            >
              + New entry
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={addEntry} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMealType(m)}
                  className={`text-xs tracking-[0.12em] uppercase py-2 border transition-colors ${
                    mealType === m
                      ? "border-stone-900 bg-stone-900 text-[#f5f2ee]"
                      : "border-[#e2dbd3] text-stone-700 hover:border-stone-500"
                  }`}
                >
                  {MEAL_LABELS[m]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-[80px_100px_1fr] gap-2 items-end">
              <div>
                <p className="text-xs tracking-[0.1em] uppercase text-stone-400 mb-1">Qty</p>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.25"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full border-b border-[#e2dbd3] pb-2 text-sm text-stone-800 focus:outline-none focus:border-stone-500 bg-transparent"
                />
              </div>
              <div>
                <p className="text-xs tracking-[0.1em] uppercase text-stone-400 mb-1">Unit</p>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full border-b border-[#e2dbd3] pb-2 text-sm text-stone-800 focus:outline-none focus:border-stone-500 bg-transparent appearance-none cursor-pointer"
                >
                  {UNIT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs tracking-[0.1em] uppercase text-stone-400 mb-1">Food</p>
                <input
                  type="text"
                  placeholder="e.g. strawberry, greek yogurt, salmon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      lookupMacros()
                    }
                  }}
                  required
                  className="w-full border-b border-[#e2dbd3] pb-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-transparent"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={lookupMacros}
              disabled={looking || !name.trim()}
              className="text-xs tracking-[0.12em] uppercase text-stone-500 border border-[#e2dbd3] px-4 py-2 hover:border-stone-500 hover:text-stone-900 transition-colors disabled:opacity-40"
            >
              {looking ? "Looking..." : "Look up macros"}
            </button>

            {lookupError && (
              <p className="text-xs text-[#c07048]">{lookupError}</p>
            )}

            {lookupResults && lookupResults.length > 0 && (
              <div className="border border-[#e2dbd3] bg-stone-50 p-4 space-y-3">
                <p className="text-xs tracking-[0.12em] uppercase text-stone-500">
                  Pick a match &middot; macros will scale to your {quantity} {unit}
                </p>
                <div className="space-y-1">
                  {lookupResults.map((r) => (
                    <button
                      key={r.fdcId}
                      type="button"
                      onClick={() => pickResult(r)}
                      className="w-full text-left p-3 border border-[#e2dbd3] bg-white hover:border-stone-500 transition-colors"
                    >
                      <p className="text-sm text-stone-800">{r.name}</p>
                      <p className="text-xs text-stone-400 mt-1 font-light">
                        {r.brand ? `${r.brand} · ` : ""}per {r.basis}
                        {r.calories != null && ` · ${r.calories} cal`}
                        {r.proteinG != null && ` · ${r.proteinG}g P`}
                        {r.carbsG != null && ` · ${r.carbsG}g C`}
                        {r.fatG != null && ` · ${r.fatG}g F`}
                      </p>
                    </button>
                  ))}
                </div>
                {(unit === "cup" || unit === "tbsp" || unit === "tsp" || unit === "ml") && (
                  <p className="text-[10px] text-stone-400 font-light italic">
                    Note: volume conversions assume water density. Solid foods (oats, yogurt) will be a bit off &mdash; use g or oz for accuracy.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-4 gap-3">
              <MacroInput label="Cals" value={calories} onChange={setCalories} />
              <MacroInput label="Protein g" value={protein} onChange={setProtein} />
              <MacroInput label="Carbs g" value={carbs} onChange={setCarbs} />
              <MacroInput label="Fat g" value={fat} onChange={setFat} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs tracking-[0.12em] uppercase text-stone-400 hover:text-stone-700 transition-colors px-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-5 py-2 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors disabled:opacity-40"
              >
                {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Entries grouped by meal */}
      <div className="space-y-6">
        {MEAL_TYPES.map((m) => {
          const items = grouped[m]
          if (items.length === 0) return null
          const mealCals = items.reduce((s, i) => s + (i.calories ?? 0), 0)
          const mealProt = items.reduce((s, i) => s + (i.proteinG ?? 0), 0)
          return (
            <div key={m}>
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-xs tracking-[0.15em] uppercase text-stone-400">{MEAL_LABELS[m]}</p>
                <p className="text-xs text-stone-400">
                  {Math.round(mealCals)} cal &middot; {Math.round(mealProt)}g protein
                </p>
              </div>
              <div className="border border-[#e2dbd3] divide-y divide-[#e2dbd3] bg-white">
                {items.map((e) => (
                  <div key={e.id} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-stone-700">{e.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5 font-light">
                        {e.calories != null ? `${Math.round(e.calories)} cal` : "—"}
                        {e.proteinG != null ? ` · ${e.proteinG}g P` : ""}
                        {e.carbsG != null ? ` · ${e.carbsG}g C` : ""}
                        {e.fatG != null ? ` · ${e.fatG}g F` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => removeEntry(e.id)}
                      className="text-xs text-stone-300 hover:text-stone-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {(data?.entries.length ?? 0) === 0 && (
          <p className="text-sm text-stone-400 font-light py-8">
            Nothing logged for this day yet.
          </p>
        )}
      </div>

      <div className="text-xs text-stone-400 text-center pt-6 border-t border-[#e2dbd3]">
        <Link href="/plan" className="tracking-[0.1em] uppercase hover:text-stone-700 transition-colors">
          Plan
        </Link>
      </div>
    </div>
  )
}

function MacroStat({ label, value, target, unit }: {
  label: string; value: number; target: number; unit: string
}) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0
  const over = value > target
  return (
    <div className="p-5">
      <p className="text-xs tracking-[0.1em] uppercase text-stone-400 mb-1">{label}</p>
      <p className="font-serif text-2xl font-light text-stone-900">
        {Math.round(value)}<span className="text-sm text-stone-400 font-sans"> / {target}{unit}</span>
      </p>
      <div className="w-full h-px bg-[#e2dbd3] relative mt-3">
        <div
          className={`absolute top-0 left-0 h-px transition-all ${over ? "bg-[#c07048]" : "bg-stone-600"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function MacroInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <p className="text-xs tracking-[0.1em] uppercase text-stone-400 mb-1">{label}</p>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-[#e2dbd3] pb-1 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-transparent"
      />
    </div>
  )
}
