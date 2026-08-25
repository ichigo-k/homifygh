import type { Metadata } from "next"
import SafetyPage from "../safety/page"

export const metadata: Metadata = {
  title: "Trust & Safety | Homify GH",
  description: "Learn how Homify GH verifies professionals and keeps customers safe across Ghana.",
}

export default function TrustAndSafetyPage() {
  return <SafetyPage />
}
