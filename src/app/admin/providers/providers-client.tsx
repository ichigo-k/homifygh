"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, ChevronRight, MapPin, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export type ClientProvider = {
  id: string
  category: string
  locationLabel: string | null
  status: string
  updatedAt: Date
  user: {
    name: string
    email: string
    image: string | null
  }
}

interface ProvidersClientProps {
  providers: ClientProvider[]
  activeStatus: string
}

export function ProvidersClient({ providers, activeStatus }: ProvidersClientProps) {
  const [query, setQuery] = useState("")

  const filtered = providers.filter((p) => {
    const searchStr = `${p.user.name} ${p.user.email} ${p.category} ${p.locationLabel ?? ""}`.toLowerCase()
    return searchStr.includes(query.toLowerCase())
  })


  return (
    <div className="space-y-6">
      {/* Search and stats bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search applicants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-4 rounded-full border-border/40 bg-card hover:border-primary/20 focus-visible:ring-primary/20"
          />
        </div>
        <p className="text-xs text-muted-foreground self-end sm:self-center font-medium">
          Showing {filtered.length} of {providers.length} application{providers.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border/60 bg-card/50 p-12 text-center">
            <User className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <h3 className="mt-4 text-sm font-bold text-foreground">No applications found</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {query ? "Try adjusting your search query." : `There are no ${activeStatus.toLowerCase()} applications in the queue.`}
            </p>
          </div>
        ) : (
          filtered.map((p) => (
            <Link
              key={p.id}
              href={`/admin/providers/${p.id}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/40 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-md)]"
            >
              {/* Card top details */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <Avatar className="h-11 w-11 border border-border/20">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                      {p.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {p.user.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{p.user.email}</p>
                  </div>
                </div>

                <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-primary/5 text-primary border-transparent">
                  {p.category.replace("_", " ")}
                </Badge>
              </div>

              {/* Card bottom meta */}
              <div className="mt-6 flex items-center justify-between border-t border-border/30 pt-3.5 text-xs text-muted-foreground font-medium">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground/75" />
                  <span className="truncate max-w-[150px]">{p.locationLabel ?? "—"}</span>
                </span>
                
                <span className="inline-flex items-center gap-1 text-[11px] text-primary/70 group-hover:text-primary transition-colors">
                  <span>Review Details</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
