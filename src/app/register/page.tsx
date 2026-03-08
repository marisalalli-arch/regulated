"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Something went wrong.")
      setLoading(false)
      return
    }
    await signIn("credentials", { email, password, redirect: false })
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-serif text-3xl font-light text-stone-900 mb-2">Begin your practice.</p>
          <p className="text-xs tracking-[0.1em] uppercase text-stone-400">Create your Regulated account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs tracking-[0.12em] uppercase text-stone-500 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#e2dbd3] px-4 py-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] uppercase text-stone-500 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white border border-[#e2dbd3] px-4 py-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] uppercase text-stone-500 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-white border border-[#e2dbd3] px-4 py-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 transition-colors"
              placeholder="Min. 8 characters"
            />
          </div>

          {error && <p className="text-xs text-rose-500 tracking-wide">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-stone-900 text-stone-900 py-3 text-xs tracking-[0.15em] uppercase hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors disabled:opacity-40 mt-2"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 tracking-wide mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-stone-700 hover:text-stone-900 underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
