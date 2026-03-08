"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getSunSign, ZODIAC_SIGNS } from "@/lib/astrology"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [birthdate, setBirthdate] = useState("")
  const [risingSign, setRisingSign] = useState("")
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.name) setName(data.name)
          if (data.birthdate) setBirthdate(data.birthdate)
          if (data.risingSign) setRisingSign(data.risingSign)
        })
    }
  }, [session])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, birthdate: birthdate || null, risingSign: risingSign || null }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const sunSign = birthdate ? getSunSign(birthdate) : null

  if (status === "loading") return null

  return (
    <div className="max-w-lg mx-auto space-y-10">
      <div className="border-b border-[#e2dbd3] pb-6">
        <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">Account</p>
        <h1 className="font-serif text-4xl font-light text-stone-900">Profile</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Name */}
        <div>
          <label className="block text-xs tracking-[0.12em] uppercase text-stone-500 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-b border-[#e2dbd3] pb-2 text-sm text-stone-800 focus:outline-none focus:border-stone-500 bg-transparent transition-colors"
            placeholder="Your name"
          />
        </div>

        {/* Birth date */}
        <div>
          <label className="block text-xs tracking-[0.12em] uppercase text-stone-500 mb-2">Birth date</label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="w-full border-b border-[#e2dbd3] pb-2 text-sm text-stone-700 focus:outline-none focus:border-stone-500 bg-transparent transition-colors"
          />
          {sunSign && (
            <p className="text-xs text-stone-400 mt-2 tracking-wide">
              Sun sign: <span className="text-stone-600">{sunSign}</span>
            </p>
          )}
        </div>

        {/* Rising sign */}
        <div>
          <label className="block text-xs tracking-[0.12em] uppercase text-stone-500 mb-2">
            Rising sign <span className="normal-case text-stone-400">(optional)</span>
          </label>
          <select
            value={risingSign}
            onChange={(e) => setRisingSign(e.target.value)}
            className="w-full border-b border-[#e2dbd3] pb-2 text-sm text-stone-700 focus:outline-none bg-transparent transition-colors"
          >
            <option value="">Unknown</option>
            {ZODIAC_SIGNS.map((sign) => (
              <option key={sign} value={sign}>{sign}</option>
            ))}
          </select>
          <p className="text-xs text-stone-400 mt-2">Your rising sign is determined by your birth time and location.</p>
        </div>

        {sunSign && (
          <div className="border border-[#e2dbd3] bg-white px-5 py-4">
            <p className="text-xs tracking-[0.12em] uppercase text-stone-400 mb-1">Your placement</p>
            <p className="font-serif text-lg font-light text-stone-800">
              {sunSign} Sun{risingSign ? ` · ${risingSign} Rising` : ""}
            </p>
            <p className="text-xs text-stone-400 mt-1 font-light">Your daily horoscope will be written for this placement.</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {saved && <p className="text-xs text-stone-400 tracking-wide">Saved.</p>}
          {!saved && <span />}
          <button
            type="submit"
            disabled={saving}
            className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-6 py-2.5 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  )
}
