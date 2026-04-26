"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FlameIcon } from "@/components/Icons"

type PlanResponse = {
  started: boolean
  weekNumber: number | null
  phase: { name: string; liftTarget: string } | null
  today: {
    date: string
    suggestion: { dayLabel: string; suggested: string; workoutKey: string | null }
  }
}

export default function TodaysPlanCard() {
  const [plan, setPlan] = useState<PlanResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/training/plan")
      .then((r) => r.json())
      .then((data) => { setPlan(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white border border-[#e2dbd3] p-7 flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">Daily Movement</p>
          <p className="font-serif text-xl font-light text-stone-900">12-Week Plan</p>
        </div>
        <FlameIcon size={32} className="text-[#c07048] mt-0.5 shrink-0" />
      </div>

      <div className="h-px bg-[#e2dbd3]" />

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-stone-100 rounded w-3/4" />
          <div className="h-3 bg-stone-100 rounded w-full" />
          <div className="h-3 bg-stone-100 rounded w-5/6" />
        </div>
      ) : plan && !plan.started ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone-500 font-light leading-relaxed">
            A 12-week protocol of three full-body lifts per week plus walking + rowing.
            No running. Built for strength + fat loss.
          </p>
          <Link
            href="/plan"
            className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-5 py-2.5 self-start hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors"
          >
            Begin
          </Link>
        </div>
      ) : plan ? (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs tracking-[0.1em] uppercase text-stone-400 mb-1">
              {plan.phase?.name} &middot; Week {plan.weekNumber} of 12 &middot; {plan.today.suggestion.dayLabel}
            </p>
            <p className="font-serif text-2xl font-light text-stone-900">{plan.today.suggestion.suggested}</p>
          </div>

          {plan.phase && (
            <div className="border-t border-[#e2dbd3] pt-4 flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Phase target</p>
                <p className="text-sm text-stone-700 mt-0.5">{plan.phase.liftTarget}</p>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-1">
            <Link
              href={`/plan/log/${plan.today.date}`}
              className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-5 py-2 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors"
            >
              Log workout
            </Link>
            <Link
              href="/plan"
              className="text-xs tracking-[0.12em] uppercase text-stone-500 px-2 py-2 hover:text-stone-900 transition-colors"
            >
              Open plan
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-sm text-stone-400 font-light">Could not load plan.</p>
      )}
    </div>
  )
}
