import type { Metadata } from "next"
import Link from "next/link"
import { Briefcase, Building2, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Careers | Homify GH",
  description: "Join the Homify GH team and help revolutionize home services in Ghana.",
}

const openings = [
  { title: "Senior Full Stack Engineer (Next.js & Node)", team: "Engineering", location: "Accra / Remote", type: "Full-time" },
  { title: "Operations & Provider Verification Specialist", team: "Operations", location: "Accra, Ghana", type: "Full-time" },
  { title: "Customer Support & Complaints Lead", team: "Support", location: "Accra, Ghana", type: "Full-time" },
]

export default function CareersPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Careers</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Work with us at Homify GH</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          We are building the future of home services in Ghana. If you are passionate about technology, empower artisans, and enjoy creating impactful products, we&apos;d love to hear from you.
        </p>

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">Open Roles</h2>
          {openings.map((job) => (
            <div key={job.title} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-background p-5">
              <div>
                <h3 className="font-bold">{job.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{job.team}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.type}</span>
                </div>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition hover:bg-primary/20"
              >
                Apply now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
