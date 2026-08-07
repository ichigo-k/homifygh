-- Withdrawals. Completing a job credits the provider's wallet, but until now
-- there was no way to get that money out. A request debits the balance
-- immediately (so it can't be double-spent while pending) and an admin either
-- marks it paid or rejects it, which refunds the balance.
--
-- Applied to the live Neon DB via the pg adapter (the Prisma migrate engine
-- can't reach the Neon pooler — see project notes). Statements are idempotent.

DO $$ BEGIN
  CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING','PAID','REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PayoutMethod" AS ENUM ('MOBILE_MONEY','BANK_TRANSFER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE "Provider"
  ADD COLUMN IF NOT EXISTS "payoutMethod" "PayoutMethod",
  ADD COLUMN IF NOT EXISTS "payoutAccountName" TEXT,
  ADD COLUMN IF NOT EXISTS "payoutAccountNumber" TEXT;

CREATE TABLE IF NOT EXISTS "Withdrawal" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
  "method" "PayoutMethod" NOT NULL,
  "accountName" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "reference" TEXT,
  "note" TEXT,
  "reviewedById" TEXT,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Withdrawal_status_createdAt_idx" ON "Withdrawal" ("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Withdrawal_userId_createdAt_idx" ON "Withdrawal" ("userId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_reviewedById_fkey"
    FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
