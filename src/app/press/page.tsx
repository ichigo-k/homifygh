import type { Metadata } from "next"
import Link from "next/link"
import { Download, Newspaper } from "lucide-react"

export const metadata: Metadata = {
  title: "Press & Media | Homify GH",
  description: "Press releases, brand assets, and news coverage for Homify GH.",
}

export default function PressPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Press Room</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Homify GH in the News</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Find press announcements, brand guidelines, and media contact info for Homify GH.
        </p>

        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 className="flex items-center gap-2 font-bold"><Newspaper className="h-5 w-5 text-primary" />Media Contacts</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              For interview requests, news inquiries, or media assets, please reach out to our press team at:
            </p>
            <a href="mailto:press@homify.gh" className="mt-2 inline-block font-semibold text-primary underline">
              press@homify.gh
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 className="flex items-center gap-2 font-bold"><Download className="h-5 w-5 text-primary" />Brand Assets & Kit</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Logos, brand colors, executive headshots, and platform screenshots available for media publication.
            </p>
            <Link href="/contact" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              Request media kit
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
