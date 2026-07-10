import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = { title: "Homify GH — Find Home Services Near You", description: "Book trusted plumbers, electricians, carpenters, and more near you in Ghana." }
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" suppressHydrationWarning className="h-full antialiased"><body className="flex min-h-full flex-col font-sans"><ThemeProvider><Navbar /><main className="flex-1">{children}</main></ThemeProvider></body></html> }
