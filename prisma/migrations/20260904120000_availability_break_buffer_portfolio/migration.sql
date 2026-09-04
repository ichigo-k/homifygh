-- Availability: daily break window + travel/buffer time (all additive, nullable/defaulted)
ALTER TABLE "Provider"
  ADD COLUMN IF NOT EXISTS "breakStart" TEXT,
  ADD COLUMN IF NOT EXISTS "breakEnd" TEXT,
  ADD COLUMN IF NOT EXISTS "bufferMinutes" INTEGER NOT NULL DEFAULT 0;

-- Portfolio: optional before/after pairing + a category tag
ALTER TABLE "PortfolioImage"
  ADD COLUMN IF NOT EXISTS "beforeImageUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "category" TEXT;
