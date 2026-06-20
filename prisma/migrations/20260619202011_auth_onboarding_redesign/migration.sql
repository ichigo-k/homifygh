-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "ghanaCardBackUrl" TEXT,
ADD COLUMN     "ghanaCardFrontUrl" TEXT,
ADD COLUMN     "ghanaCardNumber" TEXT,
ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "selfieUrl" TEXT,
ADD COLUMN     "status" "ProviderStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "storeName" TEXT,
ADD COLUMN     "storeSetupComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "storeSlug" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "interests" "Category"[] DEFAULT ARRAY[]::"Category"[],
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "locationLabel" TEXT,
ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Provider_storeSlug_key" ON "Provider"("storeSlug");

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

