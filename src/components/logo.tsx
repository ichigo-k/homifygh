import { cn } from "@/lib/utils"

/**
 * The "o" in homify, rendered as a green roundel with a house punched out of
 * it via the page background — so it reads as a true cutout in both light and
 * dark mode. Used inside <Logo>, and standalone as an app icon / favicon.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label="homify"
    >
      <circle cx="12" cy="12" r="11" className="fill-primary" />
      {/* house cutout — fill matches the surface so it looks punched through */}
      <path
        d="M6.6 12.4 L12 7.4 L17.4 12.4 V17.6 H6.6 Z"
        className="fill-background"
      />
    </svg>
  )
}

/**
 * Full wordmark lockup: homify GH, where the "o" is the LogoMark.
 * Theme-adaptive — the same component works on light and dark backgrounds.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-lg font-extrabold tracking-tight text-foreground",
        className
      )}
    >
      h
      <LogoMark className="mx-[0.5px] h-[0.82em] w-[0.82em]" />
      mify
      <span className="ml-1.5 text-[0.7em] font-semibold text-muted-foreground">
        GH
      </span>
    </span>
  )
}
