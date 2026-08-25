"use client"

import { useState, useTransition } from "react"
import { Bookmark, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleSavedProvider } from "../../saved/actions"

export function SaveButton({ providerId, initialSaved }: { providerId: string; initialSaved: boolean }) {
    const [saved, setSaved] = useState(initialSaved)
    const [pending, startTransition] = useTransition()

    return (
        <Button
            variant={saved ? "default" : "outline"}
            disabled={pending}
            className={`rounded-xl font-semibold shadow-md transition-all ${saved
                    ? "bg-white text-primary hover:bg-white/90 border-0"
                    : "bg-white/90 text-foreground hover:bg-white border-0"
                }`}
            onClick={() =>
                startTransition(async () => {
                    const result = await toggleSavedProvider(providerId)
                    setSaved(result.saved)
                })
            }
        >
            {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <>
                    <Bookmark className={`h-4 w-4 mr-1.5 ${saved ? "fill-primary text-primary" : ""}`} />
                    {saved ? "Saved" : "Save"}
                </>
            )}
        </Button>
    )
}
