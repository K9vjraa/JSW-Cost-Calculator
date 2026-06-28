/*
  Warnings:

  - The `createdById` column on the `Alloy` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `userId` column on the `AuditLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `approvedById` column on the `Calculation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `userId` column on the `ComparisonRecord` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `userId` column on the `Notification` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `RawMaterial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `userId` on the `Calculation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedById` on the `PriceHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `generatedById` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Alloy" DROP CONSTRAINT "Alloy_createdById_fkey";

-- DropForeignKey
ALTER TABLE "AlloyComponent" DROP CONSTRAINT "AlloyComponent_rawMaterialId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Calculation" DROP CONSTRAINT "Calculation_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "Calculation" DROP CONSTRAINT "Calculation_userId_fkey";

-- DropForeignKey
ALTER TABLE "CalculationItem" DROP CONSTRAINT "CalculationItem_rawMaterialId_fkey";

-- DropForeignKey
ALTER TABLE "ComparisonRecord" DROP CONSTRAINT "ComparisonRecord_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "PriceHistory" DROP CONSTRAINT "PriceHistory_rawMaterialId_fkey";

-- DropForeignKey
ALTER TABLE "PriceHistory" DROP CONSTRAINT "PriceHistory_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "PriceList" DROP CONSTRAINT "PriceList_rawMaterialId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_generatedById_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- AlterTable
ALTER TABLE "Alloy" DROP COLUMN "createdById",
ADD COLUMN     "createdById" UUID;

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID;

-- AlterTable
ALTER TABLE "Calculation" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
DROP COLUMN "approvedById",
ADD COLUMN     "approvedById" UUID;

-- AlterTable
ALTER TABLE "ComparisonRecord" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID;

-- AlterTable
ALTER TABLE "PriceHistory" ADD COLUMN     "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "updatedById",
ADD COLUMN     "updatedById" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "generatedById",
ADD COLUMN     "generatedById" UUID NOT NULL;

-- DropTable
DROP TABLE "RawMaterial";

-- DropTable
DROP TABLE "RefreshToken";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ferro_alloy_master" (
    "id" TEXT NOT NULL,
    "ALLOY_NAME" TEXT NOT NULL,
    "RAW_MAT_CD" TEXT NOT NULL,
    "category" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "CURRENT_RATE" DECIMAL(16,4),
    "supplier" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "ALLOY_DESCRIPTION" TEXT,
    "IS_AVAIL" BOOLEAN NOT NULL DEFAULT true,
    "IS_MICRO" BOOLEAN NOT NULL DEFAULT false,
    "createdById" UUID,
    "UPDATED_BY_ID" UUID,
    "CREATED_AT" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UPDATED_AT" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ferro_alloy_master_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "profiles_created_at_idx" ON "profiles"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ferro_alloy_master_RAW_MAT_CD_key" ON "ferro_alloy_master"("RAW_MAT_CD");

-- CreateIndex
CREATE INDEX "ferro_alloy_master_ALLOY_NAME_status_idx" ON "ferro_alloy_master"("ALLOY_NAME", "status");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Calculation_userId_createdAt_idx" ON "Calculation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- AddForeignKey
ALTER TABLE "ferro_alloy_master" ADD CONSTRAINT "ferro_alloy_master_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ferro_alloy_master" ADD CONSTRAINT "ferro_alloy_master_UPDATED_BY_ID_fkey" FOREIGN KEY ("UPDATED_BY_ID") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alloy" ADD CONSTRAINT "Alloy_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlloyComponent" ADD CONSTRAINT "AlloyComponent_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "ferro_alloy_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "ferro_alloy_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "ferro_alloy_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationItem" ADD CONSTRAINT "CalculationItem_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "ferro_alloy_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonRecord" ADD CONSTRAINT "ComparisonRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
