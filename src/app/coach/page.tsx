"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { EyeIcon } from "@/components/Icons"

type Message = {
  role: "user" | "assistant"
  content: string
}

const SUGGESTED_PROMPTS = [
  "Help me set a meaningful goal for this month",
  "I'm struggling with motivation. What can I do?",
  "How can I build better morning habits?",
  "I want to improve my work-life balance",
]

export default function CoachPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetch("/api/chat")
        .then((r) => r.json())
        .then((data: Message[]) => {
          if (Array.isArray(data)) setMessages(data)
        })
    }
  }, [session])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return

    const userMsg: Message = { role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setStreaming(true)

    const assistantMsg: Message = { role: "assistant", content: "" }
    setMessages((prev) => [...prev, assistantMsg])

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: messages.slice(-20),
      }),
    })

    if (!res.body) return

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: updated[updated.length - 1].content + chunk,
        }
        return updated
      })
    }

    setStreaming(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (status === "loading") return null

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
      <div className="border-b border-[#e2dbd3] pb-6 mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-1">Your coach</p>
          <h1 className="font-serif text-3xl font-light text-stone-900">Rox</h1>
        </div>
        <EyeIcon size={36} className="text-[#3e7a68] mb-1" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-6">
        {messages.length === 0 && (
          <div className="py-10">
            <p className="font-serif text-xl font-light text-stone-700 mb-2">
              How can I support you today?
            </p>
            <p className="text-sm text-stone-400 font-light mb-8">
              I&apos;m here to help you grow, clarify your goals, and stay accountable.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-left text-sm border border-[#e2dbd3] bg-white px-4 py-3 text-stone-600 hover:border-stone-400 hover:text-stone-800 transition-colors font-light"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 border border-[#e2dbd3] bg-white flex items-center justify-center shrink-0 mt-1">
                <span className="text-xs font-serif text-stone-500">R</span>
              </div>
            )}
            <div
              className={`max-w-[78%] px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-stone-900 text-stone-100"
                  : "bg-white border border-[#e2dbd3] text-stone-700"
              }`}
            >
              {msg.content}
              {streaming && i === messages.length - 1 && msg.role === "assistant" && (
                <span className="inline-block w-0.5 h-3.5 bg-stone-400 ml-1 animate-pulse" />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border border-[#e2dbd3] bg-white flex gap-0 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write to your coach..."
          rows={1}
          disabled={streaming}
          className="flex-1 resize-none text-sm text-stone-800 placeholder-stone-300 focus:outline-none max-h-32 px-5 py-4 bg-transparent font-light"
          style={{ minHeight: "52px" }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || streaming}
          className="border-l border-[#e2dbd3] text-xs tracking-[0.1em] uppercase text-stone-500 px-6 py-4 hover:bg-stone-900 hover:text-white hover:border-stone-900 disabled:opacity-30 transition-colors shrink-0 self-stretch"
        >
          Send
        </button>
      </div>
    </div>
  )
}
