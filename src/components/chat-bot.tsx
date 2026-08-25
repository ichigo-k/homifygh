"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react"

type Msg = { from: "bot" | "user"; text: string; href?: string; hrefLabel?: string }

/**
 * A lightweight, rules-based help assistant. It answers common "how do I…"
 * questions about bookings and navigating the app entirely on the client — no
 * external AI service is called, so it's free to run and works offline.
 */
const KB: { keywords: string[]; answer: string; href?: string; hrefLabel?: string }[] = [
  { keywords: ["book", "booking", "request", "hire", "how do i book"], answer: "To book a service: open Find a pro, pick a provider, then fill in the date, address and job details and tap “Request booking”. The provider confirms an estimate before any payment.", href: "/search", hrefLabel: "Find a pro" },
  { keywords: ["cancel"], answer: "You can cancel a pending or confirmed booking from My bookings → Active, using the Cancel button on the job card.", href: "/bookings", hrefLabel: "My bookings" },
  { keywords: ["delete", "history", "remove"], answer: "Cancelled bookings can be removed from My bookings → History with the Delete button.", href: "/bookings", hrefLabel: "My bookings" },
  { keywords: ["price", "cost", "negotiate", "flex", "offer", "cheap"], answer: "Each provider shows a starting price. With Flex you can propose your own price when booking — the provider can accept it or send a counter offer.", href: "/search", hrefLabel: "Browse pros" },
  { keywords: ["wallet", "deposit", "money", "balance", "pay"], answer: "Open More → Wallet to top up your balance and use it towards bookings.", href: "/wallet", hrefLabel: "Open wallet" },
  { keywords: ["complaint", "report", "issue", "problem"], answer: "Lodge a complaint from More → Complaints and our team will follow up.", href: "/complaints", hrefLabel: "Lodge a complaint" },
  { keywords: ["location", "address", "where"], answer: "When booking, tap “Use my location” to auto-fill your address, or type it manually. You can also enable live location in Settings.", href: "/settings", hrefLabel: "Settings" },
  { keywords: ["review", "rate", "rating", "star"], answer: "After a job is marked complete, open My bookings → History and tap “Leave a review”. Only completed bookings can be reviewed.", href: "/bookings", hrefLabel: "My bookings" },
  { keywords: ["save", "saved", "shortlist", "bookmark"], answer: "Tap the bookmark on any provider’s profile to save them. Find them later under Saved.", href: "/saved", hrefLabel: "Saved pros" },
  { keywords: ["verified", "trust", "safe"], answer: "Verified providers have passed identity review. Use the “Verified only” filter on Find a pro to see just those.", href: "/search", hrefLabel: "Find a pro" },
  { keywords: ["account", "profile", "details", "edit"], answer: "Update your name, phone and other details under More → Account.", href: "/account", hrefLabel: "Account" },
  { keywords: ["notification", "alerts"], answer: "Booking updates arrive under Notifications. You can turn notifications on or off in Settings.", href: "/notifications", hrefLabel: "Notifications" },
  { keywords: ["dark", "theme", "mode", "light"], answer: "Use the sun/moon toggle in the top bar to switch between light and dark mode." },
]

const SUGGESTIONS = ["How do I book a service?", "How does Flex pricing work?", "How do I deposit into my wallet?", "How do I cancel a booking?"]

function answerFor(input: string): Msg {
  const q = input.toLowerCase()
  const hit = KB.find((entry) => entry.keywords.some((k) => q.includes(k)))
  if (hit) return { from: "bot", text: hit.answer, href: hit.href, hrefLabel: hit.hrefLabel }
  return {
    from: "bot",
    text: "I can help with bookings, Flex pricing, your wallet, complaints, reviews, saved pros and settings. Try asking one of those — or lodge a complaint if you need a human.",
    href: "/help",
    hrefLabel: "Help & feedback",
  }
}

export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "Hi! I’m the Homify assistant. Ask me how to book, negotiate a price, use your wallet, or find your way around the app." },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, open])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { from: "user", text: trimmed }, answerFor(trimmed)])
    setInput("")
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Ask the Homify assistant for help"
        aria-label="Open help assistant"
        className="fixed bottom-20 right-3 z-[80] flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:bottom-6 sm:right-6 sm:h-11 sm:w-11"
      >
        {open ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
      </button>

      {open && (
        <div className="fixed bottom-28 right-3 z-[80] flex h-[28rem] w-[calc(100vw-1.5rem)] max-w-xs sm:max-w-sm flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl sm:bottom-20 sm:right-6">
          <div className="flex items-center gap-3 border-b border-border bg-primary/5 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-bold">Homify Assistant</p>
              <p className="text-xs text-muted-foreground">Answers about bookings & the app</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.from === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {m.text}
                  {m.href && (
                    <Link href={m.href} onClick={() => setOpen(false)} className="mt-2 flex items-center gap-1 text-xs font-bold underline underline-offset-2">
                      <Sparkles className="h-3 w-3" />
                      {m.hrefLabel ?? "Open"}
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input) }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <button type="submit" title="Send message" aria-label="Send" className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
