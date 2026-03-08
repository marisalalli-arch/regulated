"use client"

import { useEffect, useState } from "react"
import { FlameIcon } from "@/components/Icons"

type Workout = {
  instructor: string
  type: string
  duration: number
  title: string
  description: string
  intensity: string
}

export default function WorkoutCard() {
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/workout")
      .then((r) => r.json())
      .then((data) => { if (data?.instructor) setWorkout(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white border border-[#e2dbd3] p-7 flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">Daily Movement</p>
          <p className="font-serif text-xl font-light text-stone-900">Peloton</p>
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
      ) : workout ? (
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-serif text-2xl font-light text-stone-900 mb-1">{workout.title}</p>
            <p className="text-sm text-stone-500 font-light leading-relaxed">{workout.description}</p>
          </div>

          <div className="border-t border-[#e2dbd3] pt-4 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Instructor</p>
              <p className="text-sm text-stone-700 mt-0.5">{workout.instructor}</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Type</p>
              <p className="text-sm text-stone-700 mt-0.5">{workout.type}</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Duration</p>
              <p className="text-sm text-stone-700 mt-0.5">{workout.duration} min</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Intensity</p>
              <p className="text-sm text-stone-700 mt-0.5">{workout.intensity}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-stone-400 font-light">Could not load today's workout.</p>
      )}
    </div>
  )
}
