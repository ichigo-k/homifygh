import { redirect } from "next/navigation"

// Disputes and complaints were merged into a single Trust & Safety hub.
// This route is kept so old links and bookmarks continue to work.
export default function AdminDisputesRedirect() {
  redirect("/admin/complaints")
}
