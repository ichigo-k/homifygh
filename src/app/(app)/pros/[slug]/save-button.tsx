"use client"

import { useState, useTransition } from "react"
import { Bookmark, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleSavedProvider } from "../../saved/actions"

export function SaveButton({ providerId, initialSaved }: { providerId: string; initialSaved: boolean }) { const [saved, setSaved] = useState(initialSaved); const [pending, startTransition] = useTransition(); return <Button variant="outline" disabled={pending} className="rounded-xl" onClick={() => startTransition(async () => { const result = await toggleSavedProvider(providerId); setSaved(result.saved) })}>{pending ? <Loader2 className="animate-spin" /> : <Bookmark className={saved ? "fill-current" : ""} />}{saved ? "Saved" : "Save provider"}</Button> }
