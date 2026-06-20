"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function resolve(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = (localStorage.getItem("theme") ?? "system") as Theme
    const resolved = resolve(stored)
    setThemeState(stored)
    setResolvedTheme(resolved)
    applyTheme(resolved)
    setMounted(true)

    // Keep in sync when OS preference changes while theme is "system"
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onMediaChange = () => {
      if ((localStorage.getItem("theme") ?? "system") === "system") {
        const next = mq.matches ? "dark" : "light"
        setResolvedTheme(next)
        applyTheme(next)
      }
    }
    mq.addEventListener("change", onMediaChange)
    return () => mq.removeEventListener("change", onMediaChange)
  }, [])

  function setTheme(next: Theme) {
    localStorage.setItem("theme", next)
    const resolved = resolve(next)
    setThemeState(next)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }

  // Suppress flash of wrong theme before mount
  if (!mounted) return null

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
