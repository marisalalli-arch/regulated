import React from "react"
import { auth } from "@/auth"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import HoroscopeCard from "@/components/HoroscopeCard"
import WorkoutCard from "@/components/WorkoutCard"
import TarotCard from "@/components/TarotCard"
import { EyeIcon, SparkleIcon, BloomIcon, FeatherIcon } from "@/components/Icons"

export default async function Dashboard() {
  const session = await auth()

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[72vh] text-center px-4">
        <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-6">Welcome</p>
        <h1 className="font-serif text-6xl md:text-7xl font-light text-stone-900 mb-5 leading-tight">
          Regulated
        </h1>
        <p className="text-stone-500 text-base max-w-md mb-10 leading-relaxed font-light">
          A personal growth platform for the woman who has everything — and still wants more.
          AI coaching, goal clarity, daily rituals, and journaling in one quiet space.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/register"
            className="text-xs tracking-[0.15em] uppercase border border-stone-900 text-stone-900 px-8 py-3 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors"
          >
            Begin
          </Link>
          <Link
            href="/login"
            className="text-xs tracking-[0.15em] uppercase text-stone-400 px-8 py-3 hover:text-stone-700 transition-colors"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-24 w-full max-w-3xl border-t border-[#e2dbd3] pt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
            {[
              { label: "AI Coach", desc: "Personalized coaching conversations", icon: <EyeIcon size={28} className="text-[#3e7a68] mb-3" /> },
              { label: "Goals", desc: "Clarity on what matters most", icon: <SparkleIcon size={28} className="text-[#b0883a] mb-3" /> },
              { label: "Habits", desc: "Daily rituals that hold", icon: <BloomIcon size={28} className="text-[#8a6a78] mb-3" /> },
              { label: "Journal", desc: "Guided reflection and inner work", icon: <FeatherIcon size={28} className="text-[#6a5a8a] mb-3" /> },
            ].map((f) => (
              <div key={f.label}>
                {f.icon}
                <p className="text-xs tracking-[0.15em] uppercase text-stone-900 mb-2">{f.label}</p>
                <p className="text-sm text-stone-400 font-light leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const userId = session.user.id
  const [goals, habits, journalEntries] = await Promise.all([
    prisma.goal.findMany({ where: { userId, status: "active" }, take: 3, orderBy: { createdAt: "desc" } }),
    prisma.habit.findMany({
      where: { userId },
      take: 5,
      orderBy: { streak: "desc" },
      include: { logs: { where: { date: new Date().toISOString().split("T")[0] } } },
    }),
    prisma.journalEntry.findMany({ where: { userId }, take: 3, orderBy: { createdAt: "desc" } }),
  ])

  const completedHabitsToday = habits.filter((h) => h.logs.length > 0).length

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-[#e2dbd3] pb-8">
        <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">{getDayOfWeek()}</p>
        <h1 className="font-serif text-5xl font-light text-stone-900">
          Good {getGreeting()}, {session.user.name?.split(" ")[0] || "there"}.
        </h1>
      </div>

      {/* Daily cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <HoroscopeCard />
        <WorkoutCard />
        <TarotCard />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-0 border border-[#e2dbd3] divide-x divide-[#e2dbd3]">
        <StatCell label="Active Goals" value={goals.length} />
        <StatCell label="Habits Today" value={`${completedHabitsToday} of ${habits.length}`} />
        <StatCell label="Journal Entries" value={journalEntries.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Goals */}
        <SectionCard title="Goals" href="/goals" linkLabel="View all">
          {goals.length === 0 ? (
            <EmptyState message="No active goals. Set your first intention." />
          ) : (
            <div className="space-y-5">
              {goals.map((g) => (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-stone-700">{g.title}</p>
                    <p className="text-xs text-stone-400">{g.progress}%</p>
                  </div>
                  <div className="h-px bg-[#e2dbd3] relative">
                    <div
                      className="absolute top-0 left-0 h-px bg-stone-500 transition-all"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Habits */}
        <SectionCard title="Today's Rituals" href="/habits" linkLabel="View all">
          {habits.length === 0 ? (
            <EmptyState message="No habits yet. Build your first ritual." />
          ) : (
            <div className="space-y-3">
              {habits.map((h) => {
                const done = h.logs.length > 0
                return (
                  <div key={h.id} className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full border transition-colors ${
                        done ? "bg-stone-600 border-stone-600" : "border-stone-300"
                      }`}
                      style={done ? {} : { borderColor: h.color }}
                    />
                    <span className={`flex-1 text-sm ${done ? "text-stone-400 line-through" : "text-stone-700"}`}>
                      {h.name}
                    </span>
                    {h.streak > 0 && (
                      <span className="text-xs text-stone-400">{h.streak}d</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Journal */}
      <SectionCard title="Journal" href="/journal" linkLabel="Write today">
        {journalEntries.length === 0 ? (
          <EmptyState message="No entries yet. Begin your practice." />
        ) : (
          <div className="space-y-5">
            {journalEntries.map((e) => (
              <div key={e.id} className="border-l border-[#e2dbd3] pl-4">
                <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed font-light">{e.content}</p>
                <p className="text-xs text-stone-400 mt-1.5">
                  {new Date(e.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                  {e.mood && <span className="ml-2 capitalize">{e.mood}</span>}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}

function getDayOfWeek() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-6 text-center">
      <p className="font-serif text-3xl font-light text-stone-900">{value}</p>
      <p className="text-xs tracking-[0.1em] uppercase text-stone-400 mt-1">{label}</p>
    </div>
  )
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "Goals": <SparkleIcon size={16} className="text-[#b0883a]" />,
  "Today's Rituals": <BloomIcon size={16} className="text-[#8a6a78]" />,
  "Journal": <FeatherIcon size={16} className="text-[#6a5a8a]" />,
}

function SectionCard({ title, href, linkLabel, children }: {
  title: string; href: string; linkLabel: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-[#e2dbd3] p-7">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {SECTION_ICONS[title]}
          <p className="text-xs tracking-[0.15em] uppercase text-stone-900">{title}</p>
        </div>
        <Link href={href} className="text-xs tracking-[0.1em] uppercase text-stone-400 hover:text-stone-700 transition-colors">
          {linkLabel}
        </Link>
      </div>
      {children}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-stone-400 font-light py-2">{message}</p>
}
