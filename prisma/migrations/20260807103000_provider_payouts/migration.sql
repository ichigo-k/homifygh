-- Provider payouts. Until now the customer's wallet was debited when a booking
-- was placed and trued up when the provider quoted, but completing the job only
-- flipped the status — the held funds were never credited to anyone. These
-- columns record the settlement written when a job completes.
--
-- Applied to the live Neon DB via the pg adapter (the Prisma migrate engine
-- can't reach the Neon pooler — see project notes). Statements are idempotent.

ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "platformFee" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "providerPayout" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "payoutAt" TIMESTAMP(3);

-- Bookings completed before payouts existed are left unsettled on purpose:
-- their funds were never credited, so back-filling a payout column would claim
-- a transfer that never happened. Settle them deliberately instead.
