/**
 * Brand illustrations for onboarding. Flat, theme-aware (colours come from the
 * design tokens via Tailwind fill-/stroke- utilities), so they adapt to light
 * and dark automatically. Import the component — no files in /public.
 */

type Props = { className?: string }

/** "I need a service" — a search/booking scene. */
export function CustomerIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 240 170" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-hidden="true">
      {/* backdrop */}
      <circle cx="120" cy="82" r="66" className="fill-accent/50" />
      <ellipse cx="120" cy="150" rx="90" ry="12" className="fill-accent" />

      {/* browser window */}
      <rect x="44" y="36" width="152" height="100" rx="12" className="fill-background stroke-border" strokeWidth="2.5" />
      <circle cx="58" cy="48" r="3.2" className="fill-muted-foreground/40" />
      <circle cx="69" cy="48" r="3.2" className="fill-muted-foreground/40" />
      <circle cx="80" cy="48" r="3.2" className="fill-muted-foreground/40" />
      <line x1="44" y1="60" x2="196" y2="60" className="stroke-border" strokeWidth="2" />

      {/* search field */}
      <rect x="60" y="72" width="120" height="16" rx="8" className="fill-muted" />
      <circle cx="71" cy="80" r="4" fill="none" className="stroke-primary" strokeWidth="2" />
      <line x1="74" y1="83" x2="77" y2="86" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />

      {/* result rows */}
      <rect x="60" y="100" width="62" height="7" rx="3.5" className="fill-muted" />
      <rect x="60" y="112" width="92" height="7" rx="3.5" className="fill-muted/70" />
      <rect x="60" y="124" width="48" height="7" rx="3.5" className="fill-muted/70" />

      {/* location pin badge */}
      <path d="M182 22c-9 0-16 7-16 16 0 11 16 24 16 24s16-13 16-24c0-9-7-16-16-16Z" className="fill-primary" />
      <circle cx="182" cy="38" r="6" className="fill-background" />
    </svg>
  )
}

/** "I provide a service" — a storefront with a verified badge. */
export function ProviderIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 240 170" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-hidden="true">
      {/* backdrop */}
      <circle cx="120" cy="82" r="66" className="fill-accent/50" />
      <ellipse cx="120" cy="150" rx="90" ry="12" className="fill-accent" />

      {/* store body */}
      <rect x="64" y="74" width="112" height="64" rx="6" className="fill-background stroke-border" strokeWidth="2.5" />

      {/* awning */}
      <path d="M54 70 L66 48 H174 L186 70 Z" className="fill-primary" />
      <path
        d="M54 70q9.4 13 18.8 0 9.4 13 18.8 0 9.4 13 18.8 0 9.4 13 18.8 0 9.4 13 18.8 0 9.4 13 18.8 0 9.4 13 18.8 0 9.4 13 18.8 0"
        className="fill-primary"
      />
      <path d="M54 70 L66 48 H174 L186 70 Z" className="fill-black/10" />

      {/* window */}
      <rect x="76" y="92" width="24" height="22" rx="2" className="fill-accent stroke-border" strokeWidth="2" />
      {/* sign */}
      <rect x="146" y="92" width="22" height="14" rx="3" className="fill-primary" />
      {/* door */}
      <rect x="106" y="98" width="30" height="40" rx="3" className="fill-accent stroke-border" strokeWidth="2" />
      <circle cx="130" cy="118" r="2" className="fill-primary" />

      {/* verified badge */}
      <circle cx="180" cy="44" r="15" className="fill-primary" />
      <path d="M173 44l5 5 9-10" fill="none" className="stroke-background" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
