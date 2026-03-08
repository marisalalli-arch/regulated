"use client"

import { useEffect, useState } from "react"
import { GemIcon } from "@/components/Icons"

type Tarot = {
  cardName: string
  arcana: string
  orientation: string
  keywords: string
  description: string
  advice: string
}

export default function TarotCard() {
  const [tarot, setTarot] = useState<Tarot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tarot")
      .then((r) => r.json())
      .then((data) => { if (data?.cardName) setTarot(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="bg-[#1c1917] border border-[#2c2520] p-7 flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-stone-500 mb-1">Tarot</p>
          <p className="font-serif text-xl font-light text-stone-200">Card of the Day</p>
        </div>
        <GemIcon size={32} className="text-[#9e6880] mt-0.5 shrink-0" />
      </div>

      <div className="h-px bg-[#2c2520]" />

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-stone-800 rounded w-3/4" />
          <div className="h-3 bg-stone-800 rounded w-full" />
          <div className="h-3 bg-stone-800 rounded w-5/6" />
        </div>
      ) : tarot ? (
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-serif text-2xl font-light text-stone-100 mb-1">{tarot.cardName}</p>
            <div className="flex gap-3">
              <p className="text-xs tracking-[0.1em] uppercase text-stone-500">{tarot.arcana} Arcana</p>
              <span className="text-stone-700">·</span>
              <p className="text-xs tracking-[0.1em] uppercase text-stone-500">{tarot.orientation}</p>
            </div>
          </div>

          <p className="text-sm text-stone-400 font-light leading-relaxed">{tarot.description}</p>

          <div className="flex flex-wrap gap-2">
            {(tarot.keywords || "").split(",").filter(Boolean).map((kw) => (
              <span key={kw} className="text-xs tracking-wide text-stone-600 border border-stone-700 px-2.5 py-0.5">
                {kw.trim()}
              </span>
            ))}
          </div>

          <div className="border-t border-[#2c2520] pt-4">
            <p className="text-xs tracking-[0.12em] uppercase text-stone-600 mb-2">Guidance</p>
            <p className="text-sm text-stone-300 font-light italic leading-relaxed">{tarot.advice}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-stone-600 font-light">The cards are resting.</p>
      )}
    </div>
  )
}
