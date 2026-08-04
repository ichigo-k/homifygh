"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Bell, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/back-button"
import { markAllNotificationsRead, markNotificationRead } from "./actions"

export type NotificationItem = { id: string; title: string; message: string; href: string | null; read: boolean; createdAt: string }

export function NotificationsClient({ items }: { items: NotificationItem[] }) {
  const [pending, startTransition] = useTransition()
  const unread = items.filter((item) => !item.read).length
  return <main className="min-h-screen bg-muted/20"><div className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><BackButton className="mb-4" /><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Activity center</p><h1 className="mt-1 text-3xl font-extrabold">Notifications</h1><p className="mt-1 text-sm text-muted-foreground">Booking and account updates in one place.</p></div>{unread > 0 && <Button variant="outline" disabled={pending} onClick={() => startTransition(() => markAllNotificationsRead())}>{pending ? <Loader2 className="animate-spin" /> : <Check className="h-4 w-4" />}Mark all read</Button>}</div><section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">{items.length ? <div className="divide-y divide-border">{items.map((item) => <Link key={item.id} href={item.href ?? "#"} onClick={() => !item.read && startTransition(() => markNotificationRead(item.id))} className={`flex gap-4 p-5 transition hover:bg-muted/30 ${item.read ? "" : "bg-accent/30"}`}><span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.read ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}><Bell className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-3"><strong className="text-sm">{item.title}</strong><span className="text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}</span></span><span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.message}</span></span></Link>)}</div> : <div className="py-16 text-center"><Bell className="mx-auto h-7 w-7 text-muted-foreground" /><p className="mt-3 font-semibold">No notifications yet</p><p className="mt-1 text-sm text-muted-foreground">Important booking updates will appear here.</p></div>}</section></div></main>
}
