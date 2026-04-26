"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type CheckIn = {
  id: string
  date: string
  weekNumber: number
  weightLbs: number | null
  waistIn: number | null
  hipsIn: number | null
  energy: number | null
  sleepHrs: number | null
  notes: string | null
}

type PlanResponse = {
  started: boolean
  weekNumber: number | null
  phase: { name: string } | null
  today: { date: string }
}

export default function CheckInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [plan, setPlan] = useState<PlanResponse | null>(null)
  const [history, setHistory] = useState<CheckIn[]>([])
  const [weight, setWeight] = useState("")
  const [waist, setWaist] = useState("")
  const [hips, setHips] = useState("")
  const [energy, setEnergy] = useState("")
  const [sleep, setSleep] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (!session) return
    Promise.all([
      fetch("/api/training/plan").then((r) => r.json()),
      fetch("/api/training/checkins").then((r) => r.json()),
    ]).then(([planData, checkinData]) => {
      setPlan(planData)
      setHistory(Array.isArray(checkinData) ? checkinData : [])
      // Pre-fill from this week's existing check-in if it exists
      if (planData.weekNumber && Array.isArray(checkinData)) {
        const thisWeek = checkinData.find((c: CheckIn) => c.weekNumber === planData.weekNumber)
        if (thisWeek) {
          setWeight(thisWeek.weightLbs?.toString() ?? "")
          setWaist(thisWeek.waistIn?.toString() ?? "")
          setHips(thisWeek.hipsIn?.toString() ?? "")
          setEnergy(thisWeek.energy?.toString() ?? "")
          setSleep(thisWeek.sleepHrs?.toString() ?? "")
          setNotes(thisWeek.notes ?? "")
        }
      }
    })
  }, [session])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/training/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: plan?.today.date,
        weightLbs: weight ? parseFloat(weight) : undefined,
        waistIn: waist ? parseFloat(waist) : undefined,
        hipsIn: hips ? parseFloat(hips) : undefined,
        energy: energy ? parseInt(energy, 10) : undefined,
        sleepHrs: sleep ? parseFloat(sleep) : undefined,
        notes: notes || undefined,
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      setHistory((prev) => {
        const others = prev.filter((c) => c.weekNumber !== updated.weekNumber)
        return [...others, updated].sort((a, b) => a.weekNumber - b.weekNumber)
      })
      setSavedAt(new Date())
    }
    setSaving(false)
  }

  if (status === "loading" || !plan) return null

  if (!plan.started) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <p className="text-sm text-stone-500 font-light">Start the 12-week plan first.</p>
        <Link
          href="/plan"
          className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-5 py-2.5 inline-block hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors"
        >
          Begin
        </Link>
      </div>
    )
  }

  // Compute simple trend numbers from history
  const sortedByWeek = [...history].sort((a, b) => a.weekNumber - b.weekNumber)
  const firstWeight = sortedByWeek.find((c) => c.weightLbs != null)?.weightLbs ?? null
  const lastWeight = [...sortedByWeek].reverse().find((c) => c.weightLbs != null)?.weightLbs ?? null
  const weightDelta =
    firstWeight != null && lastWeight != null && firstWeight !== lastWeight
      ? lastWeight - firstWeight
      : null

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="border-b border-[#e2dbd3] pb-6">
        <Link href="/plan" className="text-xs tracking-[0.1em] uppercase text-stone-400 hover:text-stone-700 transition-colors">
          ← Plan
        </Link>
        <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mt-4 mb-1">
          {plan.phase?.name} &middot; Week {plan.weekNumber} of 12
        </p>
        <h1 className="font-serif text-4xl font-light text-stone-900">Weekly check-in</h1>
      </div>

      {weightDelta !== null && (
        <div className="border border-[#e2dbd3] bg-white px-6 py-4 flex items-center justify-between">
          <p className="text-xs tracking-[0.1em] uppercase text-stone-500">Trend since week 1</p>
          <p className={`text-sm ${weightDelta < 0 ? "text-stone-700" : "text-stone-500"}`}>
            {weightDelta > 0 ? "+" : ""}{weightDelta.toFixed(1)} lbs
          </p>
        </div>
      )}

      <form onSubmit={save} className="bg-white border border-[#e2dbd3] p-7 space-y-6">
        <p className="text-xs tracking-[0.15em] uppercase text-stone-500">This week</p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <Field label="Weight (lbs)" value={weight} onChange={setWeight} placeholder="206" />
          <Field label="Waist (in)" value={waist} onChange={setWaist} placeholder="38" />
          <Field label="Hips (in)" value={hips} onChange={setHips} placeholder="44" />
          <Field label="Sleep (avg hrs)" value={sleep} onChange={setSleep} placeholder="7.5" />
          <Field label="Energy (1-10)" value={energy} onChange={setEnergy} placeholder="7" />
        </div>

        <div>
          <p className="text-xs tracking-[0.1em] uppercase text-stone-400 mb-2">Notes / wins / what felt hard</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-[#e2dbd3] p-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-transparent resize-none"
          />
        </div>

        <div className="flex justify-end items-center gap-4">
          {savedAt && (
            <p className="text-xs text-stone-400">Saved {savedAt.toLocaleTimeString()}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-6 py-2.5 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save check-in"}
          </button>
        </div>
      </form>

      {sortedByWeek.length > 0 && (
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-4">History</p>
          <div className="border border-[#e2dbd3] divide-y divide-[#e2dbd3] bg-white">
            {sortedByWeek.map((c) => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Week {c.weekNumber}</p>
                  <p className="text-sm text-stone-700 mt-0.5">
                    {c.weightLbs != null ? `${c.weightLbs} lbs` : "—"}
                    {c.waistIn != null ? ` · ${c.waistIn}" waist` : ""}
                    {c.hipsIn != null ? ` · ${c.hipsIn}" hips` : ""}
                  </p>
                </div>
                <p className="text-xs text-stone-400">{c.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label, value, onChange, placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <p className="text-xs tracking-[0.1em] uppercase text-stone-400 mb-2">{label}</p>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-b border-[#e2dbd3] pb-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-transparent transition-colors"
      />
    </div>
  )
}
