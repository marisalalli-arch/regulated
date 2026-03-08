"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FeatherIcon } from "@/components/Icons"

type JournalEntry = {
  id: string
  content: string
  mood?: string
  prompt?: string
  createdAt: string
}

const MOODS = [
  { value: "great", label: "Great" },
  { value: "good", label: "Good" },
  { value: "okay", label: "Okay" },
  { value: "bad", label: "Low" },
  { value: "terrible", label: "Difficult" },
]

const PROMPTS = [
  "What am I most proud of today?",
  "What challenged me and what did I learn from it?",
  "What am I grateful for right now?",
  "What's one thing I want to improve about myself?",
  "How did I show up for myself and others today?",
  "What would make tomorrow even better?",
  "What fear is holding me back from my goals?",
  "What does my ideal life look like in one year?",
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })
}

export default function JournalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState("")
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<"write" | "history">("write")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (session) loadEntries()
  }, [session])

  async function loadEntries() {
    const res = await fetch("/api/journal")
    const data = await res.json()
    if (Array.isArray(data)) setEntries(data)
  }

  function pickRandomPrompt() {
    setSelectedPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
    setContent("")
  }

  async function saveEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSaving(true)
    await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, mood, prompt: selectedPrompt }),
    })
    setContent(""); setMood(""); setSelectedPrompt("")
    setSaving(false); loadEntries()
  }

  async function deleteEntry(id: string) {
    await fetch(`/api/journal/${id}`, { method: "DELETE" })
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  function startEdit(entry: JournalEntry) {
    setEditingId(entry.id)
    setEditContent(entry.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditContent("")
  }

  async function saveEdit(id: string) {
    if (!editContent.trim()) return
    setEditSaving(true)
    await fetch(`/api/journal/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    })
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, content: editContent } : e))
    )
    setEditingId(null)
    setEditContent("")
    setEditSaving(false)
  }

  if (status === "loading") return null

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="border-b border-[#e2dbd3] pb-6 flex items-end justify-between">
        <div className="flex items-end gap-4">
          <FeatherIcon size={40} className="text-[#6a5a8a] mb-1" />
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">Inner work</p>
            <h1 className="font-serif text-4xl font-light text-stone-900">Journal</h1>
          </div>
        </div>
        <button
          onClick={() => setView(view === "write" ? "history" : "write")}
          className="text-xs tracking-[0.12em] uppercase text-stone-400 hover:text-stone-700 transition-colors"
        >
          {view === "write" ? `History (${entries.length})` : "Write"}
        </button>
      </div>

      {view === "write" ? (
        <div className="space-y-6">
          {/* Date */}
          <p className="font-serif text-lg font-light text-stone-500">{today}</p>

          {/* Prompt */}
          <div className="flex items-center gap-4">
            <button
              onClick={pickRandomPrompt}
              className="text-xs tracking-[0.1em] uppercase text-stone-500 border border-[#e2dbd3] px-4 py-2 hover:border-stone-400 hover:text-stone-700 transition-colors bg-white"
            >
              Inspire me
            </button>
            {selectedPrompt && (
              <button onClick={() => setSelectedPrompt("")} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">Clear</button>
            )}
          </div>

          {selectedPrompt && (
            <div className="border-l-2 border-[#e2dbd3] pl-4">
              <p className="text-sm text-stone-600 font-light italic">{selectedPrompt}</p>
            </div>
          )}

          {/* Mood */}
          <div>
            <p className="text-xs tracking-[0.1em] uppercase text-stone-400 mb-3">How are you feeling?</p>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(mood === m.value ? "" : m.value)}
                  className={`text-xs tracking-wide px-4 py-1.5 border transition-colors ${
                    mood === m.value
                      ? "border-stone-700 text-stone-900 bg-stone-50"
                      : "border-[#e2dbd3] text-stone-500 hover:border-stone-400"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={saveEntry} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={selectedPrompt ? selectedPrompt : "Begin writing..."}
              rows={10}
              className="w-full bg-white border border-[#e2dbd3] px-5 py-4 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-400 resize-none leading-relaxed font-light transition-colors"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-stone-300">{content.length} characters</p>
              <button
                type="submit"
                disabled={!content.trim() || saving}
                className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-6 py-2.5 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save entry"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-0">
          {entries.length === 0 ? (
            <p className="text-sm text-stone-400 font-light py-8">No entries yet. Begin your practice.</p>
          ) : (
            <div className="border border-[#e2dbd3] divide-y divide-[#e2dbd3]">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-white px-6 py-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <p className="font-serif text-sm font-light text-stone-600">
                        {formatDate(entry.createdAt)}
                      </p>
                      {entry.mood && (
                        <span className="text-xs text-stone-400 capitalize">{entry.mood}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {editingId !== entry.id && (
                        <button
                          onClick={() => startEdit(entry)}
                          className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-xs text-stone-300 hover:text-stone-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {entry.prompt && (
                    <p className="text-xs text-stone-400 italic mb-2">{entry.prompt}</p>
                  )}

                  {editingId === entry.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={6}
                        autoFocus
                        className="w-full bg-[#faf9f7] border border-[#e2dbd3] focus:border-stone-400 px-4 py-3 text-sm text-stone-700 resize-none leading-relaxed font-light focus:outline-none transition-colors"
                      />
                      <div className="flex items-center gap-4 justify-end">
                        <button
                          onClick={cancelEdit}
                          className="text-xs tracking-wide text-stone-400 hover:text-stone-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(entry.id)}
                          disabled={!editContent.trim() || editSaving}
                          className="text-xs tracking-[0.12em] uppercase border border-stone-900 text-stone-900 px-5 py-2 hover:bg-stone-900 hover:text-[#f5f2ee] transition-colors disabled:opacity-40"
                        >
                          {editSaving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-stone-600 leading-relaxed font-light whitespace-pre-wrap">{entry.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
