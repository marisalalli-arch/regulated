"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BloomIcon } from "@/components/Icons"

type HabitLog = { date: string; completed: boolean }
type Habit = {
  id: string
  name: string
  description?: string
  color: string
  streak: number
  logs: HabitLog[]
}

const COLORS = ["#a8957e", "#c4a4a0", "#8a9e8a", "#9aacbd", "#b0a0c4", "#c4b89a", "#a0b4b0"]

export default function HabitsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [habits, setHabits] = useState<Habit[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)
  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (session) loadHabits()
  }, [session])

  async function loadHabits() {
    const res = await fetch("/api/habits")
    const data = await res.json()
    if (Array.isArray(data)) setHabits(data)
  }

  async function createHabit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, color }),
    })
    setName(""); setDescription(""); setColor(COLORS[0])
    setShowForm(false); setSaving(false); loadHabits()
  }

  async function toggleHabit(habitId: string, currentlyDone: boolean) {
    const res = await fetch(`/api/habits/${habitId}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, completed: !currentlyDone }),
    })
    const data = await res.json()
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h
        const newLogs = currentlyDone
          ? h.logs.filter((l) => l.date !== today)
          : [...h.logs, { date: today, completed: true }]
        return { ...h, logs: newLogs, streak: data.streak ?? h.streak }
      })
    )
  }

  async function deleteHabit(id: string) {
    await fetch(`/api/habits/${id}`, { method: "DELETE" })
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }

  const completedToday = habits.filter((h) => h.logs.some((l) => l.date === today)).length

  if (status === "loading") return null

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="border-b border-[#e2dbd3] pb-6 flex items-end justify-between">
        <div className="flex items-end gap-4">
          <BloomIcon size={40} className="text-[#8a6a78] mb-1" />
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">Daily rituals</p>
            <h1 className="font-serif text-4xl font-light text-stone-900">Habits</h1>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-5 py-2.5 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors"
        >
          {showForm ? "Cancel" : "Add habit"}
        </button>
      </div>

      {habits.length > 0 && (
        <div className="border border-[#e2dbd3] bg-white px-6 py-4 flex items-center justify-between">
          <p className="text-xs tracking-[0.1em] uppercase text-stone-500">Today&apos;s progress</p>
          <div className="flex items-center gap-4">
            <div className="w-32 h-px bg-[#e2dbd3] relative">
              <div
                className="absolute top-0 left-0 h-px bg-stone-600 transition-all"
                style={{ width: habits.length ? `${(completedToday / habits.length) * 100}%` : "0%" }}
              />
            </div>
            <p className="text-xs text-stone-400">{completedToday} of {habits.length}</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={createHabit} className="bg-white border border-[#e2dbd3] p-7 space-y-5">
          <p className="text-xs tracking-[0.15em] uppercase text-stone-500">New ritual</p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name your habit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border-b border-[#e2dbd3] pb-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-transparent transition-colors"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-b border-[#e2dbd3] pb-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-transparent transition-colors"
            />
            <div>
              <p className="text-xs text-stone-400 tracking-wide mb-2">Colour</p>
              <div className="flex gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-stone-400" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-6 py-2.5 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors disabled:opacity-40"
            >
              {saving ? "Saving..." : "Add ritual"}
            </button>
          </div>
        </form>
      )}

      {habits.length === 0 && !showForm && (
        <p className="text-sm text-stone-400 font-light py-8">No habits yet. Build your first ritual.</p>
      )}

      <div className="border border-[#e2dbd3] divide-y divide-[#e2dbd3]">
        {habits.map((habit) => {
          const doneToday = habit.logs.some((l) => l.date === today)
          return (
            <div key={habit.id} className={`bg-white px-6 py-5 flex items-center gap-5 transition-colors ${doneToday ? "bg-stone-50" : ""}`}>
              <button
                onClick={() => toggleHabit(habit.id, doneToday)}
                className={`w-5 h-5 rounded-full border flex-shrink-0 transition-colors ${
                  doneToday ? "border-stone-600 bg-stone-600" : "border-stone-300 hover:border-stone-500"
                }`}
                style={!doneToday ? { borderColor: habit.color } : {}}
              />
              <div className="flex-1">
                <p className={`text-sm ${doneToday ? "text-stone-400 line-through" : "text-stone-800"}`}>{habit.name}</p>
                {habit.description && <p className="text-xs text-stone-400 font-light mt-0.5">{habit.description}</p>}
              </div>
              {habit.streak > 0 && (
                <p className="text-xs text-stone-400">{habit.streak} day{habit.streak !== 1 ? "s" : ""}</p>
              )}
              <button
                onClick={() => deleteHabit(habit.id)}
                className="text-xs text-stone-300 hover:text-stone-500 transition-colors"
              >
                Remove
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
