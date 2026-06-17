/*
  Warnings:

  - You are about to drop the column `additionalCost` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `scrapCost` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the column `transportCost` on the `Calculation` table. All the data in the column will be lost.
  - You are about to drop the `CalculationCharge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChargeConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CalculationCharge" DROP CONSTRAINT "CalculationCharge_calculationId_fkey";

-- AlterTable
ALTER TABLE "Calculation" DROP COLUMN "additionalCost",
DROP COLUMN "scrapCost",
DROP COLUMN "transportCost",
ALTER COLUMN "gstAmount" SET DEFAULT 0;

-- DropTable
DROP TABLE "CalculationCharge";

-- DropTable
DROP TABLE "ChargeConfig";

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "description" TEXT,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GstSlab" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "rate" DECIMAL(7,4) NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GstSlab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MechanicalProperty" (
    "id" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "uts" TEXT NOT NULL,
    "yieldStrength" TEXT NOT NULL,
    "elongation" TEXT NOT NULL,
    "hardness" TEXT NOT NULL,
    "thicknessTolerance" TEXT NOT NULL,
    "widthTolerance" TEXT NOT NULL,
    "flatnessTolerance" TEXT NOT NULL,
    "minBendRadius" TEXT NOT NULL,
    "bendRating" TEXT NOT NULL,
    "springback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MechanicalProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChemicalProperty" (
    "id" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "carbon" TEXT,
    "manganese" TEXT,
    "silicon" TEXT,
    "chromium" TEXT,
    "nickel" TEXT,
    "molybdenum" TEXT,
    "phosphorus" TEXT,
    "sulfur" TEXT,
    "aluminum" TEXT,
    "magnesium" TEXT,
    "iron" TEXT,
    "copper" TEXT,
    "zinc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChemicalProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComparisonRecord" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gradeIds" JSONB NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComparisonRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JswProductCatalog" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "steelType" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "subGrade" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "basePrice" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JswProductCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_category_idx" ON "SystemSetting"("category");

-- CreateIndex
CREATE UNIQUE INDEX "GstSlab_code_key" ON "GstSlab"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MechanicalProperty_gradeId_key" ON "MechanicalProperty"("gradeId");

-- CreateIndex
CREATE UNIQUE INDEX "ChemicalProperty_gradeId_key" ON "ChemicalProperty"("gradeId");

-- CreateIndex
CREATE UNIQUE INDEX "JswProductCatalog_category_steelType_grade_subGrade_key" ON "JswProductCatalog"("category", "steelType", "grade", "subGrade");

-- AddForeignKey
ALTER TABLE "MechanicalProperty" ADD CONSTRAINT "MechanicalProperty_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChemicalProperty" ADD CONSTRAINT "ChemicalProperty_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonRecord" ADD CONSTRAINT "ComparisonRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
