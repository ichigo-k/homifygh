"use client"

import { useEffect, useRef, useState } from "react"

type RevealProps = {
  children: React.ReactNode
  /** Direction the element travels in from. */
  from?: "up" | "left" | "right"
  /** Delay before the transition starts, in ms. */
  delay?: number
  className?: string
}

const offsets: Record<NonNullable<RevealProps["from"]>, string> = {
  up: "translateY(40px)",
  left: "translateX(-48px)",
  right: "translateX(48px)",
}

/**
 * Cross-browser scroll reveal. Unlike the CSS `animation-timeline: view()`
 * system (Chromium-only), this uses IntersectionObserver + a CSS transition,
 * so it animates in every browser. Motion is driven by inline styles (not
 * Tailwind utilities) so it never depends on class generation, and it honours
 * prefers-reduced-motion.
 *
 * The reveal is reversible: the element animates in as it enters the viewport
 * and animates back out (in reverse) as it leaves, so it re-plays whenever you
 * scroll past it in either direction.
 */
export function Reveal({
  children,
  from = "up",
  delay = 0,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  const [animate, setAnimate] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Honour reduced-motion, or environments without IntersectionObserver:
    // show immediately with no movement.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setAnimate(false)
      setShown(true)
      return
    }

    // Already in view on mount? Show right away.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setShown(true)
    }

    // Toggle with visibility so it animates in on enter and back out on leave,
    // re-playing whenever you scroll past in either direction.
    const observer = new IntersectionObserver(
      ([entry]) => setShown(entry.isIntersecting),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    )
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : offsets[from],
        transition: animate
          ? "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)"
          : "none",
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  )
}
