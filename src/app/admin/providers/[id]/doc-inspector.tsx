"use client"

import { useState } from "react"
import Image from "next/image"
import { Eye, ExternalLink, ShieldCheck, UserCheck } from "lucide-react"

interface Document {
  label: string
  url: string
}

interface DocInspectorProps {
  documents: Document[]
}

export function DocInspector({ documents }: DocInspectorProps) {
  const [activeIdx, setActiveIdx] = useState(0)

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground bg-card">
        No verification documents uploaded.
      </div>
    )
  }

  const activeDoc = documents[activeIdx]

  return (
    <div className="space-y-4">
      {/* Active Inspector Window */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/30 aspect-[4/3] w-full flex items-center justify-center group shadow-inner">
        {/* Blurred background for premium aspect fill */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-10 pointer-events-none scale-110"
          style={{ backgroundImage: `url(${activeDoc.url})` }}
        />
        
        <Image
          src={activeDoc.url}
          alt={activeDoc.label}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
          priority
        />

        {/* Hover overlay with quick actions */}
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <a
            href={activeDoc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-background px-4 py-2 text-xs font-bold text-foreground shadow-[var(--shadow-md)] hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open Original</span>
          </a>
        </div>

        {/* Label badge */}
        <span className="absolute bottom-3 left-3 rounded-md bg-background/80 px-2.5 py-1 text-[11px] font-bold text-foreground backdrop-blur-sm shadow-[var(--shadow-sm)] border border-border/40">
          {activeDoc.label}
        </span>
      </div>

      {/* Thumbnails grid */}
      <div className="grid grid-cols-3 gap-3">
        {documents.map((doc, idx) => {
          const isActive = idx === activeIdx
          return (
            <button
              key={doc.label}
              onClick={() => setActiveIdx(idx)}
              className={`relative text-left overflow-hidden rounded-xl border transition-all duration-300 aspect-[4/3] focus:outline-none ${
                isActive
                  ? "border-primary ring-2 ring-primary/10 shadow-[var(--shadow-sm)]"
                  : "border-border/60 hover:border-border hover:shadow-[var(--shadow-xs)]"
              }`}
            >
              <Image
                src={doc.url}
                alt={doc.label}
                fill
                sizes="100px"
                className="object-cover"
              />
              <span className={`absolute inset-0 transition-opacity ${
                isActive ? "bg-primary/5" : "bg-background/20 group-hover:opacity-0"
              }`} />
              <div className="absolute bottom-0 inset-x-0 bg-background/90 border-t border-border/20 px-2 py-1 text-[10px] font-bold truncate">
                {doc.label.split(" — ")[1] || doc.label}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
