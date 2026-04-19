"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LeafIcon } from "@/components/Icons"

type FoodEntry = {
  id: string
  name: string
  calories: number | null
  mealType: string
  notes: string | null
  date: string
  createdAt: string
}

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
  { value: "meal", label: "Other" },
]

function formatDisplayDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })
}

function toDateStr(date: Date) {
  return date.toISOString().split("T")[0]
}

function offsetDate(dateStr: string, days: number) {
  const [year, month, day] = dateStr.split("-").map(Number)
  const d = new Date(year, month - 1, day)
  d.setDate(d.getDate() + days)
  return toDateStr(d)
}

export default function FoodLogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const today = toDateStr(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [name, setName] = useState("")
  const [calories, setCalories] = useState("")
  const [mealType, setMealType] = useState("meal")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (session) loadEntries(selectedDate)
  }, [session, selectedDate])

  async function loadEntries(date: string) {
    const res = await fetch(`/api/foodlog?date=${date}`)
    const data = await res.json()
    if (Array.isArray(data)) setEntries(data)
  }

  async function addEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await fetch("/api/foodlog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        calories: calories ? Number(calories) : null,
        mealType,
        notes: notes.trim() || null,
        date: selectedDate,
      }),
    })
    setName(""); setCalories(""); setNotes(""); setMealType("meal")
    setSaving(false)
    loadEntries(selectedDate)
  }

  async function deleteEntry(id: string) {
    await fetch(`/api/foodlog/${id}`, { method: "DELETE" })
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  if (status === "loading") return null

  const totalCalories = entries.reduce((sum, e) => sum + (e.calories ?? 0), 0)
  const hasCalories = entries.some((e) => e.calories !== null)

  const grouped = MEAL_TYPES.reduce<Record<string, FoodEntry[]>>((acc, m) => {
    acc[m.value] = entries.filter((e) => e.mealType === m.value)
    return acc
  }, {})

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="border-b border-[#e2dbd3] pb-6 flex items-end justify-between">
        <div className="flex items-end gap-4">
          <LeafIcon size={40} className="text-[#5a7a5a] mb-1" />
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">Daily nourishment</p>
            <h1 className="font-serif text-4xl font-light text-stone-900">Food Log</h1>
          </div>
        </div>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSelectedDate(offsetDate(selectedDate, -1))}
          className="text-xs tracking-[0.1em] uppercase text-stone-400 hover:text-stone-700 transition-colors"
        >
          ← Previous
        </button>
        <p className="font-serif text-base font-light text-stone-600">
          {formatDisplayDate(selectedDate)}
          {selectedDate === today && (
            <span className="ml-3 text-xs tracking-wide uppercase text-stone-400">Today</span>
          )}
        </p>
        <button
          onClick={() => setSelectedDate(offsetDate(selectedDate, 1))}
          disabled={selectedDate >= today}
          className="text-xs tracking-[0.1em] uppercase text-stone-400 hover:text-stone-700 transition-colors disabled:opacity-30"
        >
          Next →
        </button>
      </div>

      {/* Calorie total */}
      {hasCalories && (
        <div className="border border-[#e2dbd3] px-6 py-4 flex items-center justify-between bg-white">
          <p className="text-xs tracking-[0.12em] uppercase text-stone-400">Total calories</p>
          <p className="font-serif text-2xl font-light text-stone-700">{totalCalories}</p>
        </div>
      )}

      {/* Add entry form */}
      <form onSubmit={addEntry} className="space-y-4 border border-[#e2dbd3] bg-white p-6">
        <p className="text-xs tracking-[0.15em] uppercase text-stone-500 mb-2">Log food</p>

        <div className="flex gap-2 flex-wrap">
          {MEAL_TYPES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMealType(m.value)}
              className={`text-xs tracking-wide px-4 py-1.5 border transition-colors ${
                mealType === m.value
                  ? "border-stone-700 text-stone-900 bg-stone-50"
                  : "border-[#e2dbd3] text-stone-500 hover:border-stone-400"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What did you eat?"
          required
          className="w-full bg-transparent border-b border-[#e2dbd3] pb-2 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
        />

        <div className="flex gap-4">
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Calories (optional)"
            min={0}
            className="flex-1 bg-transparent border-b border-[#e2dbd3] pb-2 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="flex-1 bg-transparent border-b border-[#e2dbd3] pb-2 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-6 py-2.5 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors disabled:opacity-40"
          >
            {saving ? "Saving..." : "Add entry"}
          </button>
        </div>
      </form>

      {/* Entries grouped by meal type */}
      {entries.length === 0 ? (
        <p className="text-sm text-stone-400 font-light py-4">Nothing logged yet. Begin tracking your nourishment.</p>
      ) : (
        <div className="space-y-6">
          {MEAL_TYPES.filter((m) => grouped[m.value].length > 0).map((m) => (
            <div key={m.value}>
              <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-3">{m.label}</p>
              <div className="border border-[#e2dbd3] divide-y divide-[#e2dbd3]">
                {grouped[m.value].map((entry) => (
                  <div key={entry.id} className="bg-white px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-700">{entry.name}</p>
                      {entry.notes && (
                        <p className="text-xs text-stone-400 mt-0.5 font-light">{entry.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-5 shrink-0">
                      {entry.calories !== null && (
                        <span className="text-xs text-stone-400 font-light">{entry.calories} cal</span>
                      )}
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-xs text-stone-300 hover:text-stone-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
