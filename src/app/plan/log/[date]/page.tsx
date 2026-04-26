"use client"

import { useEffect, useState, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

type Exercise = {
  key: string
  name: string
  equipment: string
  cue: string
}

type Workout = {
  key: "A" | "B" | "C"
  name: string
  focus: string
  warmup: string
  exercises: Exercise[]
}

type CardioOption = {
  key: string
  name: string
  howTo: string
  cadence: string
}

type PlanResponse = {
  workouts: Workout[]
  cardioOptions: CardioOption[]
  weekNumber: number | null
  phase: { name: string; liftTarget: string } | null
  today: { suggestion: { workoutKey: string | null } }
}

type ExerciseEntry = {
  key: string
  name: string
  equipment: string
  cue: string
  sets: { weight: string; reps: string }[]
}

const NUM_SETS_BY_PHASE: Record<string, number> = {
  Foundation: 3,
  Build: 4, // 3 + 1 burnout
  Push: 4,
  Peak: 4,
}

export default function LogWorkoutPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialKey = searchParams.get("workoutKey")

  const [plan, setPlan] = useState<PlanResponse | null>(null)
  const [workoutKey, setWorkoutKey] = useState<string>(initialKey || "")
  const [exercises, setExercises] = useState<ExerciseEntry[]>([])
  const [durationMin, setDurationMin] = useState<string>("")
  const [striveScore, setStriveScore] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  function buildExerciseEntries(planData: PlanResponse, key: string): ExerciseEntry[] {
    const w = planData.workouts.find((x) => x.key === key)
    if (!w) return []
    const numSets = NUM_SETS_BY_PHASE[planData.phase?.name ?? "Foundation"] ?? 3
    return w.exercises.map((e) => ({
      key: e.key,
      name: e.name,
      equipment: e.equipment,
      cue: e.cue,
      sets: Array.from({ length: numSets }, () => ({ weight: "", reps: "" })),
    }))
  }

  function selectWorkout(key: string) {
    setWorkoutKey(key)
    if (plan) setExercises(buildExerciseEntries(plan, key))
  }

  useEffect(() => {
    if (!session) return
    fetch("/api/training/plan")
      .then((r) => r.json())
      .then((data: PlanResponse) => {
        setPlan(data)
        const initial = workoutKey || data.today?.suggestion?.workoutKey || ""
        if (initial) {
          setWorkoutKey(initial)
          setExercises(buildExerciseEntries(data, initial))
        }
      })
    // We intentionally only run this once when session arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  function updateSet(exIdx: number, setIdx: number, field: "weight" | "reps", value: string) {
    setExercises((prev) => {
      const next = [...prev]
      const sets = [...next[exIdx].sets]
      sets[setIdx] = { ...sets[setIdx], [field]: value }
      next[exIdx] = { ...next[exIdx], sets }
      return next
    })
  }

  function addSetTo(exIdx: number) {
    setExercises((prev) => {
      const next = [...prev]
      next[exIdx] = { ...next[exIdx], sets: [...next[exIdx].sets, { weight: "", reps: "" }] }
      return next
    })
  }

  async function save() {
    if (!workoutKey) return
    setSaving(true)
    const isLift = workoutKey === "A" || workoutKey === "B" || workoutKey === "C"

    const exercisesPayload = isLift
      ? exercises.map((e, idx) => ({
          exerciseKey: e.key,
          exerciseName: e.name,
          orderIndex: idx,
          setWeights: e.sets
            .map((s) => parseFloat(s.weight))
            .filter((n) => !Number.isNaN(n)),
          setReps: e.sets
            .map((s) => parseInt(s.reps, 10))
            .filter((n) => !Number.isNaN(n)),
        }))
      : []

    const cardioMatch = plan?.cardioOptions.find((c) => c.key === workoutKey)
    const workoutName = cardioMatch?.name

    const res = await fetch("/api/training/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        workoutKey,
        workoutName,
        durationMin: durationMin ? parseInt(durationMin, 10) : undefined,
        striveScore: striveScore ? parseFloat(striveScore) : undefined,
        notes: notes || undefined,
        exercises: exercisesPayload,
      }),
    })

    if (res.ok) {
      const created = await res.json()
      setSavedId(created.id)
    }
    setSaving(false)
  }

  if (status === "loading" || !plan) return null

  const isLift = workoutKey === "A" || workoutKey === "B" || workoutKey === "C"
  const currentLift = plan.workouts.find((w) => w.key === workoutKey)
  const currentCardio = plan.cardioOptions.find((c) => c.key === workoutKey)
  const phaseName = plan.phase?.name ?? ""

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="border-b border-[#e2dbd3] pb-6">
        <Link href="/plan" className="text-xs tracking-[0.1em] uppercase text-stone-400 hover:text-stone-700 transition-colors">
          ← Plan
        </Link>
        <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mt-4 mb-1">
          {phaseName}{plan.weekNumber ? ` · Week ${plan.weekNumber}` : ""} · {date}
        </p>
        <h1 className="font-serif text-4xl font-light text-stone-900">Log workout</h1>
      </div>

      {savedId && (
        <div className="bg-stone-50 border border-[#e2dbd3] px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-stone-700">Saved.</p>
          <Link href="/plan" className="text-xs tracking-[0.12em] uppercase text-stone-500 hover:text-stone-900 transition-colors">
            Done
          </Link>
        </div>
      )}

      {/* Workout type picker */}
      <div className="bg-white border border-[#e2dbd3] p-6 space-y-4">
        <p className="text-xs tracking-[0.15em] uppercase text-stone-500">What did you do?</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {plan.workouts.map((w) => (
            <button
              key={w.key}
              type="button"
              onClick={() => selectWorkout(w.key)}
              className={`text-left px-4 py-3 border transition-colors ${
                workoutKey === w.key
                  ? "border-stone-900 bg-stone-900 text-[#f5f2ee]"
                  : "border-[#e2dbd3] text-stone-700 hover:border-stone-500"
              }`}
            >
              <p className="text-xs tracking-[0.12em] uppercase">Workout {w.key}</p>
              <p className="text-xs mt-1 opacity-70">{w.focus}</p>
            </button>
          ))}
          {plan.cardioOptions.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => selectWorkout(c.key)}
              className={`text-left px-4 py-3 border transition-colors ${
                workoutKey === c.key
                  ? "border-stone-900 bg-stone-900 text-[#f5f2ee]"
                  : "border-[#e2dbd3] text-stone-700 hover:border-stone-500"
              }`}
            >
              <p className="text-xs tracking-[0.12em] uppercase">{c.name}</p>
              <p className="text-xs mt-1 opacity-70">{c.cadence}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Lift logger */}
      {isLift && currentLift && (
        <div className="bg-white border border-[#e2dbd3] p-6 space-y-6">
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">Workout {currentLift.key}</p>
            <p className="font-serif text-xl font-light text-stone-900">{currentLift.name}</p>
            <p className="text-xs text-stone-400 mt-2 italic">{currentLift.warmup}</p>
          </div>

          <div className="space-y-5">
            {exercises.map((ex, exIdx) => (
              <div key={ex.key} className="border-t border-[#e2dbd3] pt-5">
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm text-stone-800">{ex.name}</p>
                  <p className="text-xs text-stone-400">{ex.equipment}</p>
                </div>
                <p className="text-xs text-stone-400 font-light leading-relaxed mb-3">{ex.cue}</p>

                <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} className="contents">
                      <p className="text-xs tracking-[0.1em] uppercase text-stone-400 w-12">Set {setIdx + 1}</p>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="lbs"
                        value={set.weight}
                        onChange={(e) => updateSet(exIdx, setIdx, "weight", e.target.value)}
                        className="border-b border-[#e2dbd3] pb-1 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-transparent"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="reps"
                        value={set.reps}
                        onChange={(e) => updateSet(exIdx, setIdx, "reps", e.target.value)}
                        className="border-b border-[#e2dbd3] pb-1 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-transparent"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addSetTo(exIdx)}
                  className="text-xs text-stone-400 hover:text-stone-700 transition-colors mt-2"
                >
                  + Add set
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cardio logger */}
      {!isLift && currentCardio && (
        <div className="bg-white border border-[#e2dbd3] p-6 space-y-5">
          <div>
            <p className="font-serif text-xl font-light text-stone-900">{currentCardio.name}</p>
            <p className="text-xs text-stone-400 mt-2 italic leading-relaxed">{currentCardio.howTo}</p>
          </div>
          <div>
            <p className="text-xs tracking-[0.1em] uppercase text-stone-400 mb-2">Duration (min)</p>
            <input
              type="number"
              inputMode="numeric"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className="w-32 border-b border-[#e2dbd3] pb-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-transparent"
              placeholder="30"
            />
          </div>
        </div>
      )}

      {/* Notes + save */}
      {workoutKey && (
        <div className="bg-white border border-[#e2dbd3] p-6 space-y-4">
          <div>
            <p className="text-xs tracking-[0.1em] uppercase text-stone-400 mb-2">Strive score (optional)</p>
            <input
              type="number"
              inputMode="decimal"
              value={striveScore}
              onChange={(e) => setStriveScore(e.target.value)}
              placeholder="e.g. 142"
              className="w-32 border-b border-[#e2dbd3] pb-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-transparent"
            />
          </div>
          <div>
            <p className="text-xs tracking-[0.1em] uppercase text-stone-400 mb-2">Notes (optional)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="How did it feel? Anything to remember next week?"
              className="w-full border border-[#e2dbd3] p-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-transparent resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-6 py-2.5 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save session"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
