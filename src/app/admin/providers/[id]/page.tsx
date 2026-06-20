import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { ReviewActions } from "./review-actions"
import { DocInspector } from "./doc-inspector"
import { ArrowLeft, MapPin, Mail, Sparkles, User, FileText, Calendar, ShieldCheck, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function ProviderReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const provider = await prisma.provider.findUnique({
    where: { id },
    include: { user: true, reviewedBy: true },
  })
  if (!provider) notFound()

  const docs = [
    { label: "Ghana Card — front", url: provider.ghanaCardFrontUrl },
    { label: "Ghana Card — back", url: provider.ghanaCardBackUrl },
    { label: "Selfie", url: provider.selfieUrl },
  ].filter((d): d is { label: string; url: string } => !!d.url)

  const statusVariant =
    provider.status === "APPROVED" 
      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 border-emerald-200/40 dark:border-emerald-900/30" 
      : provider.status === "REJECTED" 
      ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 border-rose-200/40 dark:border-rose-900/30" 
      : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 border-amber-200/40 dark:border-amber-900/30"

  const statusLabel = provider.status.charAt(0) + provider.status.slice(1).toLowerCase()

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 fade-in">
      {/* ─── BREADCRUMB ───────────────────────────────────────── */}
      <div>
        <Link
          href="/admin/providers"
          className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to queue</span>
        </Link>
      </div>

      {/* ─── INSPECTOR HERO ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Applicant Inspector
          </span>
          <h1 className="text-2xl font-black tracking-tight text-foreground mt-2">{provider.user.name}</h1>
          <p className="text-sm text-muted-foreground">ID Verification and Profile Review</p>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold leading-none shadow-[var(--shadow-xs)]", statusVariant)}>
          <span className="relative flex h-2 w-2">
            <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping", 
              provider.status === "APPROVED" ? "bg-emerald-400" : provider.status === "REJECTED" ? "bg-rose-400" : "bg-amber-400"
            )} />
            <span className={cn("relative inline-flex rounded-full h-2 w-2",
              provider.status === "APPROVED" ? "bg-emerald-500" : provider.status === "REJECTED" ? "bg-rose-500" : "bg-amber-500"
            )} />
          </span>
          <span>{statusLabel}</span>
        </span>
      </div>

      {/* ─── INSPECTOR GRID ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Applicant details & notes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info Card */}
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-[var(--shadow-sm)]">
            <h3 className="text-sm font-bold text-foreground mb-4">Application Details</h3>
            
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-sm">
              <Detail label="Service category" icon={Sparkles}>
                <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide bg-primary/5 text-primary border-transparent">
                  {provider.category.replace("_", " ")}
                </Badge>
              </Detail>
              <Detail label="Ghana Card number" icon={FileText} value={provider.ghanaCardNumber ?? "—"} />
              <Detail label="Service location" icon={MapPin} value={provider.locationLabel ?? "—"} />
              <Detail label="Service radius" icon={Calendar} value={`${provider.serviceRadiusKm} km`} />
              
              <div className="sm:col-span-2 pt-3 border-t border-border/30">
                <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground/75" />
                  <span>About Bio</span>
                </dt>
                <dd className="mt-2 text-foreground leading-relaxed pl-5 text-xs sm:text-sm">
                  {provider.bio ?? "No bio description provided."}
                </dd>
              </div>
            </dl>
          </div>

          {/* Verification Trail / History */}
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-[var(--shadow-sm)] space-y-4">
            <h3 className="text-sm font-bold text-foreground">Verification Trail</h3>
            
            <div className="relative border-l border-border/60 pl-6 ml-3 py-1 space-y-6 text-xs sm:text-sm">
              {/* Event 1: Application submitted */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-muted border border-border text-[9px] font-bold">
                  1
                </span>
                <div>
                  <p className="font-semibold text-foreground">KYC Submitted</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {provider.createdAt.toLocaleDateString(undefined, { dateStyle: "long" })} at{" "}
                    {provider.createdAt.toLocaleTimeString(undefined, { timeStyle: "short" })}
                  </p>
                </div>
              </div>

              {/* Event 2: Moderation action */}
              {provider.reviewedAt && (
                <div className="relative">
                  <span className={cn(
                    "absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold border",
                    provider.status === "APPROVED" ? "bg-emerald-50 border-emerald-200 text-emerald-500" : "bg-rose-50 border-rose-200 text-rose-500"
                  )}>
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">
                      Application {provider.status === "APPROVED" ? "Approved" : "Rejected"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Reviewed by <span className="font-semibold text-foreground">{provider.reviewedBy?.name ?? "Moderator"}</span> on{" "}
                      {provider.reviewedAt.toLocaleDateString(undefined, { dateStyle: "long" })} at{" "}
                      {provider.reviewedAt.toLocaleTimeString(undefined, { timeStyle: "short" })}
                    </p>
                    
                    {provider.reviewNotes && (
                      <div className="mt-3 rounded-xl bg-rose-500/5 border border-rose-200/20 p-3 text-xs leading-relaxed max-w-lg">
                        <span className="font-bold text-rose-600 dark:text-rose-400 block mb-0.5">Review Note:</span>
                        <p className="text-muted-foreground">{provider.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Document inspector & actions */}
        <div className="space-y-6">
          {/* Documents Inspector */}
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-[var(--shadow-sm)] space-y-4">
            <h3 className="text-sm font-bold text-foreground">Verification Documents</h3>
            <DocInspector documents={docs} />
          </div>

          {/* Action Panel */}
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-[var(--shadow-sm)] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Verification Action</h3>
              <p className="text-xs text-muted-foreground">Submit the final moderation status</p>
            </div>
            
            <ReviewActions providerId={provider.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

interface DetailProps {
  label: string
  icon: any
  value?: string
  children?: React.ReactNode
}

function Detail({ label, icon: Icon, value, children }: DetailProps) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground/75" />
        <span>{label}</span>
      </dt>
      <dd className="mt-2 font-semibold text-foreground pl-5">
        {children || value}
      </dd>
    </div>
  )
}
