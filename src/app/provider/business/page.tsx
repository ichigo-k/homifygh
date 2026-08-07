import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { BusinessTools } from "./business-tools"

export default async function BusinessPage() { const user = await requireRole("PROVIDER"); const provider = await prisma.provider.findUniqueOrThrow({ where: { userId: user.id }, include: { services: { orderBy: [{ active: "desc" }, { createdAt: "desc" }] }, portfolio: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } } }); return <main className="min-h-screen bg-muted/20"><div className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><Link href="/provider" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back to workspace</Link><BusinessTools services={provider.services} portfolio={provider.portfolio} /></div></main> }
