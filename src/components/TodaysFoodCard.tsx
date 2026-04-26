"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SparkleIcon } from "@/components/Icons"

const DAILY_TARGETS = { calories: 1700, proteinG: 145, waterOz: 100 }

type FoodResponse = {
  date: string
  totals: { calories: number; proteinG: number; carbsG: number; fatG: number }
  entries: { id: string }[]
}
type WaterResponse = { waterOz: number }
type SupplementsResponse = { supplements: { id: string; name: string; taken: boolean }[] }

export default function TodaysFoodCard() {
  const [data, setData] = useState<FoodResponse | null>(null)
  const [water, setWater] = useState(0)
  const [supps, setSupps] = useState<SupplementsResponse["supplements"]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/food").then((r) => r.json()),
      fetch("/api/tracking/water").then((r) => r.json()),
      fetch("/api/tracking/supplements").then((r) => r.json()),
    ])
      .then(([f, w, s]: [FoodResponse, WaterResponse, SupplementsResponse]) => {
        setData(f)
        setWater(w.waterOz ?? 0)
        setSupps(s.supplements ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const totals = data?.totals
  const entryCount = data?.entries.length ?? 0
  const calPct = totals ? Math.min(100, (totals.calories / DAILY_TARGETS.calories) * 100) : 0
  const protPct = totals ? Math.min(100, (totals.proteinG / DAILY_TARGETS.proteinG) * 100) : 0
  const waterPct = Math.min(100, (water / DAILY_TARGETS.waterOz) * 100)
  const suppsTaken = supps.filter((s) => s.taken).length

  return (
    <div className="bg-white border border-[#e2dbd3] p-7 flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">Daily Fuel</p>
          <p className="font-serif text-xl font-light text-stone-900">Food</p>
        </div>
        <SparkleIcon size={32} className="text-[#8a9e8a] mt-0.5 shrink-0" />
      </div>

      <div className="h-px bg-[#e2dbd3]" />

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-stone-100 rounded w-3/4" />
          <div className="h-3 bg-stone-100 rounded w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Calories</p>
              <p className="text-xs text-stone-500">
                {Math.round(totals?.calories ?? 0)} / {DAILY_TARGETS.calories}
              </p>
            </div>
            <div className="w-full h-px bg-[#e2dbd3] relative">
              <div
                className="absolute top-0 left-0 h-px bg-stone-600 transition-all"
                style={{ width: `${calPct}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Protein</p>
              <p className="text-xs text-stone-500">
                {Math.round(totals?.proteinG ?? 0)}g / {DAILY_TARGETS.proteinG}g
              </p>
            </div>
            <div className="w-full h-px bg-[#e2dbd3] relative">
              <div
                className="absolute top-0 left-0 h-px bg-[#3e7a68] transition-all"
                style={{ width: `${protPct}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Water</p>
              <p className="text-xs text-stone-500">{water} / {DAILY_TARGETS.waterOz} oz</p>
            </div>
            <div className="w-full h-px bg-[#e2dbd3] relative">
              <div
                className="absolute top-0 left-0 h-px bg-[#5a8aac] transition-all"
                style={{ width: `${waterPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-400 font-light">
            <span>
              {entryCount === 0
                ? "Nothing logged yet today."
                : `${entryCount} food item${entryCount !== 1 ? "s" : ""}`}
            </span>
            {supps.length > 0 && (
              <span>
                {suppsTaken}/{supps.length} supps
              </span>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <Link
              href="/food"
              className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-5 py-2 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors"
            >
              {entryCount === 0 ? "Log first meal" : "Add food"}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
