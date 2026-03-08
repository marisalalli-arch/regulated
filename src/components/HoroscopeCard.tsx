"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MoonIcon } from "@/components/Icons"

type Horoscope = { reading: string; focusWord: string; sunSign: string; rising?: string | null }

export default function HoroscopeCard() {
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null)
  const [loading, setLoading] = useState(true)
  const [missingBirthdate, setMissingBirthdate] = useState(false)

  useEffect(() => {
    fetch("/api/horoscope")
      .then((r) => r.json())
      .then((data) => {
        if (data?.missingBirthdate) { setMissingBirthdate(true) }
        else if (data?.reading) { setHoroscope(data) }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const signLine = horoscope
    ? `${horoscope.sunSign} Sun${horoscope.rising ? ` · ${horoscope.rising} Rising` : ""}`
    : "Daily Reading"

  return (
    <div className="bg-white border border-[#e2dbd3] p-7 flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">Daily Reading</p>
          <p className="font-serif text-xl font-light text-stone-900">
            {horoscope ? signLine : "Horoscope"}
          </p>
        </div>
        <MoonIcon size={32} className="text-[#6e5fa8] mt-0.5 shrink-0" />
      </div>

      <div className="h-px bg-[#e2dbd3]" />

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-stone-100 rounded w-full" />
          <div className="h-3 bg-stone-100 rounded w-5/6" />
          <div className="h-3 bg-stone-100 rounded w-4/6" />
        </div>
      ) : missingBirthdate ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-stone-500 font-light leading-relaxed">
            Add your birth date to unlock your personalized daily horoscope.
          </p>
          <Link
            href="/profile"
            className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-4 py-2 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors self-start"
          >
            Set birth date
          </Link>
        </div>
      ) : horoscope ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone-600 font-light leading-relaxed">{horoscope.reading}</p>
          <div className="border-t border-[#e2dbd3] pt-4">
            <p className="text-xs tracking-[0.12em] uppercase text-stone-400 mb-1">Today&apos;s word</p>
            <p className="font-serif text-lg font-light text-stone-800">{horoscope.focusWord}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-stone-400 font-light">The stars are quiet today.</p>
      )}
    </div>
  )
}
