import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { ReviewActions } from "./review-actions"

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
  ].filter((d) => d.url)

  const statusVariant =
    provider.status === "APPROVED" ? "default" : provider.status === "REJECTED" ? "destructive" : "secondary"

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link
        href="/admin/providers"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{provider.user.name}</h1>
          <p className="text-sm text-muted-foreground">{provider.user.email}</p>
        </div>
        <Badge variant={statusVariant}>{provider.status}</Badge>
      </div>

      {/* Details */}
      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-border bg-card p-5 text-sm">
        <Detail label="Service" value={provider.category} />
        <Detail label="Location" value={provider.locationLabel ?? "—"} />
        <Detail label="Service radius" value={`${provider.serviceRadiusKm} km`} />
        <Detail label="Ghana Card no." value={provider.ghanaCardNumber ?? "—"} />
        <div className="col-span-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">About</dt>
          <dd className="mt-1">{provider.bio ?? "—"}</dd>
        </div>
      </dl>

      {/* KYC documents */}
      <p className="mt-6 text-sm font-semibold">Verification documents</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {docs.map((d) => (
          <a
            key={d.label}
            href={d.url!}
            target="_blank"
            rel="noopener noreferrer"
            className="group block overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-[4/3] w-full bg-muted">
              <Image src={d.url!} alt={d.label} fill sizes="33vw" className="object-cover transition-transform group-hover:scale-105" />
            </div>
            <p className="px-3 py-2 text-xs font-medium">{d.label}</p>
          </a>
        ))}
      </div>

      {/* Prior review note */}
      {provider.reviewNotes && (
        <div className="mt-5 rounded-xl bg-muted/40 px-4 py-3 text-sm">
          <span className="font-semibold">Last review note:</span> {provider.reviewNotes}
        </div>
      )}

      {/* Actions (only meaningful while not already decided, but allow re-decision) */}
      <div className="mt-6">
        <ReviewActions providerId={provider.id} />
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}
