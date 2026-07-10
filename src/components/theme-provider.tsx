"use client"

import { createContext, useContext, useEffect, useState } from "react"
type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"
interface ThemeContextValue { theme: Theme; resolvedTheme: ResolvedTheme; setTheme: (theme: Theme) => void }
const ThemeContext = createContext<ThemeContextValue>({ theme: "system", resolvedTheme: "light", setTheme: () => {} })
export function useTheme() { return useContext(ThemeContext) }
function systemTheme(): ResolvedTheme { return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" }
function resolve(theme: Theme): ResolvedTheme { return theme === "system" ? systemTheme() : theme }
function applyTheme(theme: ResolvedTheme) { document.documentElement.classList.toggle("dark", theme === "dark") }
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => typeof window === "undefined" ? "system" : (localStorage.getItem("theme") as Theme | null) ?? "system")
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => typeof window === "undefined" ? "light" : resolve((localStorage.getItem("theme") as Theme | null) ?? "system"))
  useEffect(() => { applyTheme(resolvedTheme); const media = window.matchMedia("(prefers-color-scheme: dark)"); const onChange = () => { if (theme === "system") { const next = media.matches ? "dark" : "light"; setResolvedTheme(next); applyTheme(next) } }; media.addEventListener("change", onChange); return () => media.removeEventListener("change", onChange) }, [resolvedTheme, theme])
  function setTheme(next: Theme) { localStorage.setItem("theme", next); const resolved = resolve(next); setThemeState(next); setResolvedTheme(resolved); applyTheme(resolved) }
  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>
}
