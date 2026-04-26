"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type ExerciseLog = {
  id: string
  exerciseKey: string
  exerciseName: string
  orderIndex: number
  setWeights: number[]
  setReps: number[]
  notes: string | null
}

type Session = {
  id: string
  date: string
  weekNumber: number
  phase: string
  workoutKey: string
  workoutName: string
  durationMin: number | null
  striveScore: number | null
  notes: string | null
  exerciseLogs: ExerciseLog[]
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (!session) return
    fetch("/api/training/sessions")
      .then((r) => r.json())
      .then((data: Session[]) => {
        if (Array.isArray(data)) setSessions(data)
        setLoading(false)
      })
  }, [session])

  if (status === "loading") return null

  // Group sessions by week
  const byWeek = sessions.reduce<Record<number, Session[]>>((acc, s) => {
    acc[s.weekNumber] = acc[s.weekNumber] ?? []
    acc[s.weekNumber].push(s)
    return acc
  }, {})

  const weekNumbers = Object.keys(byWeek).map(Number).sort((a, b) => b - a)

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="border-b border-[#e2dbd3] pb-6">
        <Link href="/plan" className="text-xs tracking-[0.1em] uppercase text-stone-400 hover:text-stone-700 transition-colors">
          ← Plan
        </Link>
        <h1 className="font-serif text-4xl font-light text-stone-900 mt-4">History</h1>
        {sessions.length > 0 && (
          <p className="text-xs tracking-[0.1em] uppercase text-stone-400 mt-2">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""} logged
          </p>
        )}
      </div>

      {loading && <p className="text-sm text-stone-400 font-light">Loading...</p>}

      {!loading && sessions.length === 0 && (
        <p className="text-sm text-stone-400 font-light py-8">
          No sessions logged yet. Start with today.
        </p>
      )}

      {weekNumbers.map((weekNumber) => (
        <div key={weekNumber}>
          <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-4">
            Week {weekNumber} &middot; {byWeek[weekNumber][0].phase}
          </p>
          <div className="border border-[#e2dbd3] divide-y divide-[#e2dbd3] bg-white">
            {byWeek[weekNumber].map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SessionRow({ session }: { session: Session }) {
  const [open, setOpen] = useState(false)
  const isLift = session.workoutKey === "A" || session.workoutKey === "B" || session.workoutKey === "C"

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-stone-50 transition-colors"
      >
        <div>
          <p className="text-xs tracking-[0.1em] uppercase text-stone-400">{session.date}</p>
          <p className="text-sm text-stone-700 mt-0.5">{session.workoutName}</p>
        </div>
        <div className="text-xs text-stone-400 text-right">
          <p>
            {isLift
              ? `${session.exerciseLogs.length} exercise${session.exerciseLogs.length !== 1 ? "s" : ""}`
              : session.durationMin
              ? `${session.durationMin} min`
              : ""}
          </p>
          {session.striveScore != null && (
            <p className="text-[10px] tracking-[0.1em] uppercase text-[#c07048] mt-0.5">
              Strive {session.striveScore}
            </p>
          )}
        </div>
      </button>

      {open && isLift && session.exerciseLogs.length > 0 && (
        <div className="px-6 py-4 bg-stone-50 border-t border-[#e2dbd3] space-y-3">
          {session.exerciseLogs.map((ex) => (
            <div key={ex.id}>
              <p className="text-xs text-stone-700">{ex.exerciseName}</p>
              <p className="text-xs text-stone-400 font-light mt-0.5">
                {ex.setWeights.length === 0
                  ? "—"
                  : ex.setWeights
                      .map((w, i) => `${w} × ${ex.setReps[i] ?? "?"}`)
                      .join("  ·  ")}
              </p>
            </div>
          ))}
          {session.notes && (
            <p className="text-xs text-stone-500 font-light italic mt-3">&ldquo;{session.notes}&rdquo;</p>
          )}
        </div>
      )}

      {open && !isLift && session.notes && (
        <div className="px-6 py-4 bg-stone-50 border-t border-[#e2dbd3]">
          <p className="text-xs text-stone-500 font-light italic">&ldquo;{session.notes}&rdquo;</p>
        </div>
      )}
    </div>
  )
}
