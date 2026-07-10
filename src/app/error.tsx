"use client"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center p-8 text-center"><AlertCircle className="h-9 w-9 text-destructive" /><h1 className="mt-4 text-2xl font-extrabold">Something went wrong</h1><p className="mt-2 text-sm text-muted-foreground">The request could not be completed. Your information is safe.</p><Button className="mt-5" onClick={reset}>Try again</Button></div> }
