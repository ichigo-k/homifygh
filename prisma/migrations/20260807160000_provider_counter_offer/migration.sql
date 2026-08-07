-- Provider counter-offers. Accepting a booking used to let the provider name
-- any price, which was then charged to the customer's wallet immediately —
-- so a GH₵400 "estimate" against a GH₵100 Flex offer took GH₵300 more from
-- the customer without them ever agreeing. A counter now goes back to the
-- customer and moves no money until they accept it.
--
-- Applied to the live Neon DB via the pg adapter (the Prisma migrate engine
-- can't reach the Neon pooler — see project notes). Statements are idempotent.

ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "counterAmount" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "counterAt" TIMESTAMP(3);
