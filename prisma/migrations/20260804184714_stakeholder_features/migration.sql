-- Wallet + Complaints + Flex negotiation + user preferences.
-- Applied to the live Neon DB via the pg adapter (the Prisma migrate engine
-- can't reach the Neon pooler — see project notes). Statements are idempotent.

DO $$ BEGIN
  CREATE TYPE "WalletTxnType" AS ENUM ('CREDIT','DEBIT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN','IN_REVIEW','RESOLVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "locationSharingEnabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "offeredAmount" DOUBLE PRECISION;

CREATE TABLE IF NOT EXISTS "WalletTransaction" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "type" "WalletTxnType" NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "WalletTransaction_userId_createdAt_idx" ON "WalletTransaction"("userId","createdAt");

CREATE TABLE IF NOT EXISTS "Complaint" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
  "response" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Complaint_userId_createdAt_idx" ON "Complaint"("userId","createdAt");

DO $$ BEGIN
  ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
