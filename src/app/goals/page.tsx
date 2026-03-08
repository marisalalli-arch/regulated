"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SparkleIcon } from "@/components/Icons"

type Goal = {
  id: string
  title: string
  description?: string
  category: string
  status: string
  progress: number
  targetDate?: string
  createdAt: string
}

const CATEGORIES = ["personal", "career", "health", "relationships", "finance", "learning"]

export default function GoalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("personal")
  const [targetDate, setTargetDate] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (session) loadGoals()
  }, [session])

  async function loadGoals() {
    const res = await fetch("/api/goals")
    const data = await res.json()
    if (Array.isArray(data)) setGoals(data)
  }

  async function createGoal(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category, targetDate }),
    })
    setTitle(""); setDescription(""); setCategory("personal"); setTargetDate("")
    setShowForm(false); setSaving(false); loadGoals()
  }

  async function updateProgress(id: string, progress: number) {
    await fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress }),
    })
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, progress } : g)))
  }

  async function completeGoal(id: string) {
    await fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed", progress: 100 }),
    })
    loadGoals()
  }

  async function deleteGoal(id: string) {
    await fetch(`/api/goals/${id}`, { method: "DELETE" })
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  const active = goals.filter((g) => g.status === "active")
  const completed = goals.filter((g) => g.status === "completed")

  if (status === "loading") return null

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="border-b border-[#e2dbd3] pb-6 flex items-end justify-between">
        <div className="flex items-end gap-4">
          <SparkleIcon size={40} className="text-[#b0883a] mb-1" />
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">Your intentions</p>
            <h1 className="font-serif text-4xl font-light text-stone-900">Goals</h1>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-5 py-2.5 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors"
        >
          {showForm ? "Cancel" : "Add goal"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createGoal} className="bg-white border border-[#e2dbd3] p-7 space-y-5">
          <p className="text-xs tracking-[0.15em] uppercase text-stone-500">New intention</p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="What do you want to achieve?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border-b border-[#e2dbd3] pb-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-transparent transition-colors"
            />
            <textarea
              placeholder="Describe it further (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border-b border-[#e2dbd3] pb-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-transparent resize-none transition-colors"
            />
            <div className="flex gap-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 border-b border-[#e2dbd3] pb-2 text-sm text-stone-700 focus:outline-none bg-transparent"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="flex-1 border-b border-[#e2dbd3] pb-2 text-sm text-stone-700 focus:outline-none bg-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-6 py-2.5 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors disabled:opacity-40"
            >
              {saving ? "Saving..." : "Set intention"}
            </button>
          </div>
        </form>
      )}

      {active.length === 0 && !showForm && (
        <p className="text-sm text-stone-400 font-light py-8">No active goals. Set your first intention.</p>
      )}

      <div className="space-y-0 divide-y divide-[#e2dbd3]">
        {active.map((goal) => (
          <div key={goal.id} className="bg-white border border-[#e2dbd3] border-b-0 last:border-b p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-stone-900 font-light mb-0.5">{goal.title}</p>
                {goal.description && (
                  <p className="text-xs text-stone-400 font-light">{goal.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs tracking-wide text-stone-400 capitalize">{goal.category}</span>
                  {goal.targetDate && (
                    <span className="text-xs text-stone-400">
                      {new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-4 shrink-0">
                <button
                  onClick={() => completeGoal(goal.id)}
                  className="text-xs tracking-wide text-stone-400 hover:text-stone-700 transition-colors"
                >
                  Complete
                </button>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-xs tracking-wide text-stone-300 hover:text-stone-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-stone-400 mb-1.5">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="h-px bg-[#e2dbd3] relative">
                <div
                  className="absolute top-0 left-0 h-px bg-stone-500 transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <input
                type="range"
                min={0} max={100} step={5}
                value={goal.progress}
                onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))}
                className="w-full mt-2 accent-stone-700 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                style={{ height: "12px", marginTop: "-6px" }}
              />
            </div>
          </div>
        ))}
      </div>

      {completed.length > 0 && (
        <div className="space-y-0">
          <p className="text-xs tracking-[0.12em] uppercase text-stone-400 mb-4">Completed ({completed.length})</p>
          <div className="divide-y divide-[#e2dbd3] border border-[#e2dbd3]">
            {completed.map((goal) => (
              <div key={goal.id} className="bg-white px-6 py-4 flex items-center justify-between">
                <span className="text-sm text-stone-400 line-through font-light">{goal.title}</span>
                <button onClick={() => deleteGoal(goal.id)} className="text-xs text-stone-300 hover:text-stone-500 transition-colors">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
