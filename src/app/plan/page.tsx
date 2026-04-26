"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FlameIcon } from "@/components/Icons"

type PhaseConfig = {
  name: string
  weeks: number[]
  focus: string
  liftTarget: string
  cardio: string
}

type WeeklySlot = {
  dayIndex: number
  dayLabel: string
  suggested: string
  workoutKey: string | null
}

type PlanResponse = {
  started: boolean
  startDate: string | null
  weekNumber: number | null
  phase: PhaseConfig | null
  today: { date: string; suggestion: WeeklySlot }
  phases: PhaseConfig[]
  weeklySchedule: WeeklySlot[]
}

export default function PlanPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [plan, setPlan] = useState<PlanResponse | null>(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (!session) return
    fetch("/api/training/plan")
      .then((r) => r.json())
      .then(setPlan)
  }, [session])

  async function startPlan() {
    setStarting(true)
    await fetch("/api/training/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    const res = await fetch("/api/training/plan")
    if (res.ok) setPlan(await res.json())
    setStarting(false)
  }

  if (status === "loading" || !plan) return null

  // ----- "Begin" state -----
  if (!plan.started) {
    return (
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="border-b border-[#e2dbd3] pb-6 flex items-end gap-4">
          <FlameIcon size={40} className="text-[#c07048] mb-1" />
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">Strength + fat loss</p>
            <h1 className="font-serif text-4xl font-light text-stone-900">12-Week Plan</h1>
          </div>
        </div>

        <div className="bg-white border border-[#e2dbd3] p-8 space-y-6">
          <p className="text-sm text-stone-600 font-light leading-relaxed">
            A 12-week protocol of three full-body lifts per week, walking + rowing for cardio
            (no running), and a weekly check-in. Built around your dumbbells, treadmill, rower,
            BOSU, and TRX.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Length</p>
              <p className="text-stone-700 mt-1">12 weeks</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Lifts</p>
              <p className="text-stone-700 mt-1">3 per week</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Cardio</p>
              <p className="text-stone-700 mt-1">Walk + row</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Phases</p>
              <p className="text-stone-700 mt-1">4 (3 weeks each)</p>
            </div>
          </div>

          <button
            onClick={startPlan}
            disabled={starting}
            className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-6 py-3 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors disabled:opacity-40"
          >
            {starting ? "Beginning..." : "Begin today"}
          </button>
        </div>
      </div>
    )
  }

  // ----- Active plan state -----
  const today = plan.today
  const phase = plan.phase!
  const weekNumber = plan.weekNumber!
  const isLift = today.suggestion.workoutKey === "A" || today.suggestion.workoutKey === "B" || today.suggestion.workoutKey === "C"

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <div className="border-b border-[#e2dbd3] pb-6 flex items-end justify-between">
        <div className="flex items-end gap-4">
          <FlameIcon size={40} className="text-[#c07048] mb-1" />
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">
              {phase.name} &middot; Week {weekNumber} of 12
            </p>
            <h1 className="font-serif text-4xl font-light text-stone-900">12-Week Plan</h1>
          </div>
        </div>
        <Link
          href="/plan/history"
          className="text-xs tracking-[0.12em] uppercase text-stone-400 hover:text-stone-700 transition-colors"
        >
          History
        </Link>
      </div>

      {/* Phase progress bar */}
      <div className="border border-[#e2dbd3] bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs tracking-[0.1em] uppercase text-stone-500">Phase progress</p>
          <p className="text-xs text-stone-400">Week {weekNumber} / 12</p>
        </div>
        <div className="w-full h-px bg-[#e2dbd3] relative">
          <div
            className="absolute top-0 left-0 h-px bg-stone-600 transition-all"
            style={{ width: `${(weekNumber / 12) * 100}%` }}
          />
        </div>
        <p className="text-xs text-stone-400 font-light mt-3 leading-relaxed">{phase.focus}</p>
      </div>

      {/* Today's workout */}
      <div className="bg-white border border-[#e2dbd3] p-7 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">Today &middot; {today.suggestion.dayLabel}</p>
            <p className="font-serif text-2xl font-light text-stone-900">{today.suggestion.suggested}</p>
          </div>
        </div>
        <div className="h-px bg-[#e2dbd3]" />
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div>
            <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Phase target</p>
            <p className="text-stone-700 mt-0.5">{phase.liftTarget}</p>
          </div>
          <div>
            <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Cardio for the week</p>
            <p className="text-stone-700 mt-0.5">{phase.cardio}</p>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Link
            href={`/plan/log/${today.date}`}
            className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-5 py-2.5 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors"
          >
            {isLift ? "Log workout" : "Log a session"}
          </Link>
          <Link
            href="/plan/checkin"
            className="text-xs tracking-[0.12em] uppercase text-stone-500 px-5 py-2.5 hover:text-stone-900 transition-colors"
          >
            Weekly check-in
          </Link>
        </div>
      </div>

      {/* This week's schedule */}
      <div>
        <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-4">This week</p>
        <div className="border border-[#e2dbd3] divide-y divide-[#e2dbd3] bg-white">
          {plan.weeklySchedule
            .slice() // Mon-first ordering matches the array
            .sort((a, b) => (a.dayIndex === 0 ? 7 : a.dayIndex) - (b.dayIndex === 0 ? 7 : b.dayIndex))
            .map((slot) => (
              <div key={slot.dayIndex} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-[0.1em] uppercase text-stone-400">{slot.dayLabel}</p>
                  <p className="text-sm text-stone-700 mt-0.5">{slot.suggested}</p>
                </div>
                {slot.workoutKey && (
                  <Link
                    href={`/plan/log/${today.date}?workoutKey=${slot.workoutKey}`}
                    className="text-xs tracking-[0.1em] uppercase text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    Log
                  </Link>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* All phases */}
      <div>
        <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-4">The 4 phases</p>
        <div className="border border-[#e2dbd3] divide-y divide-[#e2dbd3] bg-white">
          {plan.phases.map((p) => {
            const isCurrent = p.weeks.includes(weekNumber)
            return (
              <div key={p.name} className={`px-6 py-5 ${isCurrent ? "bg-stone-50" : ""}`}>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="font-serif text-lg text-stone-900">
                    {p.name}
                    {isCurrent && (
                      <span className="ml-3 text-[10px] tracking-[0.15em] uppercase text-[#c07048]">Current</span>
                    )}
                  </p>
                  <p className="text-xs text-stone-400">Wks {p.weeks.join("-")}</p>
                </div>
                <p className="text-sm text-stone-500 font-light leading-relaxed mb-2">{p.focus}</p>
                <p className="text-xs text-stone-400">{p.liftTarget}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
