"use client"

import { useEffect, useRef, useState } from "react"
import { Star } from "lucide-react"

type Item = {
  name: string
  location: string
  text: string
  rating: number
  date: string
}

// Arc geometry. Circle centre is off-screen left so only the right edge
// (a short vertical curve) is visible inside the panel.
const R = 155
const CX = 85
const CY = 245

const D = 62    // half-arc span in degrees (total arc = 2D)
const FADE = 20 // wide fade zone so wrap is totally invisible
const SPEED = 12 // degrees per second downward drift

function wrapBand(a: number) {
  const p = 2 * D
  return (((a + D) % p) + p) % p - D
}

function arcPath() {
  const r = (d: number) => (d * Math.PI) / 180
  const x0 = CX + R * Math.cos(r(-D)), y0 = CY + R * Math.sin(r(-D))
  const x1 = CX + R * Math.cos(r(D)),  y1 = CY + R * Math.sin(r(D))
  return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`
}

export function TestimonialsCarousel({ items }: { items: Item[] }) {
  const n = items.length
  const SPACING = (2 * D) / n
  const [rot, setRot] = useState(0)
  const paused = useRef(false)

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const loop = (t: number) => {
      const dt = (t - last) / 1000
      last = t
      if (!paused.current) setRot((r) => r + SPEED * dt)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const placed = items.map((item, i) => {
    const pos = wrapBand(i * SPACING + rot)
    const abs = Math.abs(pos)
    // cosine factor: 1 at centre (pos=0) → 0 at edges (pos=±D)
    const factor = Math.max(0, Math.cos((pos / D) * (Math.PI / 2)))
    // Direct cartesian position — avatar centre is exactly on the arc
    const rad = (pos * Math.PI) / 180
    const x = CX + R * Math.cos(rad)
    const y = CY + R * Math.sin(rad)
    // Fade in/out near the ends; fully transparent at ±D so wrap is invisible
    const opacity = abs <= D - FADE ? 1 : abs >= D ? 0 : (D - abs) / FADE
    // Size and font scale smoothly with factor
    const size = Math.round(46 + 46 * factor)           // 46 → 92 px
    const fontSize = Math.round(13 + 17 * factor)       // 13 → 30 px
    // Label fades in only as avatar nears centre (factor > 0.6)
    const labelOpacity = Math.max(0, (factor - 0.6) / 0.4)
    return { item, i, pos, abs, factor, x, y, opacity, size, fontSize, labelOpacity }
  })

  const active = placed.reduce((a, b) => (b.abs < a.abs ? b : a)).i

  function select(i: number) {
    setRot((r) => r - wrapBand(i * SPACING + r))
  }

  return (
    <div
      className="grid items-center gap-12 md:grid-cols-2"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      {/* Left: curved arc of avatars */}
      <div className="relative mx-auto h-[490px] w-full max-w-md">
        <svg
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 text-border"
          width="300"
          height="490"
          style={{ overflow: "visible" }}
        >
          <path
            d={arcPath()}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 7"
            strokeLinecap="round"
          />
        </svg>

        {placed.map(({ item, i, x, y, opacity, size, fontSize, factor, labelOpacity }) => (
          <button
            key={item.name}
            onClick={() => select(i)}
            aria-label={`Show review from ${item.name}`}
            className="absolute"
            style={{
              left: x,
              top: y,
              // Centre the avatar exactly on the computed arc point
              transform: "translate(-50%, -50%)",
              zIndex: Math.round(factor * 10),
              opacity,
              // No CSS transition — rAF drives every frame so it's already smooth
            }}
          >
            <span
              className="flex items-center justify-center rounded-full bg-accent font-bold text-primary ring-4 ring-card"
              style={{
                width: size,
                height: size,
                fontSize,
                }}
            >
              {item.name.charAt(0)}
            </span>

            {/* Name + rating label — fades in smoothly near centre */}
            {labelOpacity > 0.02 && (
              <span
                className="pointer-events-none absolute left-[calc(100%+1rem)] top-1/2 -translate-y-1/2 whitespace-nowrap text-left"
                style={{ opacity: labelOpacity }}
              >
                <span className="block text-lg font-bold text-foreground">
                  {item.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-sm">
                  <Star className="h-4 w-4 fill-warm text-warm" />
                  <span className="font-bold text-foreground">{item.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">on {item.date}</span>
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Right: quote */}
      <div className="relative min-h-[210px]">
        <span aria-hidden className="font-serif text-7xl leading-none text-primary/25">
          &ldquo;
        </span>
        <blockquote
          key={active}
          className="-mt-6 max-w-md animate-[fade-in_0.6s_ease] font-serif text-xl italic leading-relaxed text-foreground"
        >
          {items[active].text}
        </blockquote>
        <p className="mt-5 text-sm text-muted-foreground">
          {items[active].name} · {items[active].location}
        </p>

        <div className="mt-7 flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => select(i)}
              aria-label={`Go to review ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-border hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
