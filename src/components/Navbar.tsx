"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

const links = [
  { href: "/", label: "Home" },
  { href: "/coach", label: "Coach" },
  { href: "/goals", label: "Goals" },
  { href: "/habits", label: "Habits" },
  { href: "/journal", label: "Journal" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <nav className="sticky top-0 z-50 bg-[#f5f2ee]/90 backdrop-blur-sm border-b border-[#e2dbd3]">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
        <Link
          href="/"
          className="font-serif text-xl font-light tracking-[0.12em] text-stone-900"
        >
          regulated
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs tracking-[0.12em] uppercase transition-colors ${
                pathname === link.href
                  ? "text-stone-900"
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          {session ? (
            <>
              <span className="text-xs tracking-wide text-stone-400 hidden sm:block">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-xs tracking-[0.1em] uppercase text-stone-400 hover:text-stone-700 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-xs tracking-[0.1em] uppercase text-stone-400 hover:text-stone-700 transition-colors">
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-xs tracking-[0.1em] uppercase border border-stone-900 text-stone-900 px-5 py-2 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-[#e2dbd3] px-6 py-3 flex gap-6 overflow-x-auto">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-xs tracking-[0.1em] uppercase whitespace-nowrap transition-colors ${
              pathname === link.href ? "text-stone-900" : "text-stone-400"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
