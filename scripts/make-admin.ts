/**
 * Promote a user to ADMIN (moderator) by email.
 * Usage:  npx tsx scripts/make-admin.ts someone@example.com
 */
import "dotenv/config"
import { prisma } from "../src/lib/prisma"

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error("Usage: npx tsx scripts/make-admin.ts <email>")
    process.exit(1)
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN", onboardingComplete: true },
  })

  console.log(`✓ ${user.email} is now ADMIN`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
