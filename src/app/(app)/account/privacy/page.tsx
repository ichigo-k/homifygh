"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, ShieldCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteCustomerAccount } from "./actions"

export default function PrivacyControlsPage() {
    const [confirmation, setConfirmation] = useState("")
    const [error, setError] = useState("")
    const [pending, startTransition] = useTransition()

    function handleDelete() {
        setError("")
        startTransition(async () => {
            const result = await deleteCustomerAccount(confirmation)
            if (result && !result.ok) setError(result.message)
        })
    }

    return (
        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
            <Link
                href="/account"
                className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Account settings
            </Link>

            <section className="mt-5 rounded-3xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h1 className="text-2xl font-extrabold">Privacy controls</h1>
                </div>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Your profile and booking information are used to operate Homify GH.
                    Contact support for a data export before deleting your account.
                </p>

                {/* Delete account */}
                <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
                    <div className="flex items-center gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <h2 className="font-bold">Delete account permanently</h2>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                        This permanently removes your account, profile, and all personal data.
                        Bookings with active disputes or unresolved payments must be settled first.
                        This action cannot be undone.
                    </p>

                    <label className="mt-4 block text-sm font-semibold">
                        To confirm, type{" "}
                        <span className="font-mono text-destructive">DELETE MY ACCOUNT</span>
                        <input
                            value={confirmation}
                            onChange={(e) => setConfirmation(e.target.value)}
                            placeholder="DELETE MY ACCOUNT"
                            className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 font-mono text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-destructive/30"
                        />
                    </label>

                    {error && (
                        <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <Button
                        variant="destructive"
                        className="mt-4 h-11 gap-2 rounded-xl px-5"
                        disabled={pending || confirmation !== "DELETE MY ACCOUNT"}
                        onClick={handleDelete}
                    >
                        {pending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        Delete my account
                    </Button>
                </div>
            </section>
        </main>
    )
}
