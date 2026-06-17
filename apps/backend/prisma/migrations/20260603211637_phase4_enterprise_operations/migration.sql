-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CalculationStatus" ADD VALUE 'SUBMITTED';
ALTER TYPE "CalculationStatus" ADD VALUE 'APPROVED';

-- AlterTable
ALTER TABLE "Calculation" ADD COLUMN     "approvalReason" TEXT,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "oldCost" DECIMAL(18,4);

-- AlterTable
ALTER TABLE "PriceList" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'APPROVED';

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
