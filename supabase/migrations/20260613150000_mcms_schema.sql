-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CalculationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "department" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedByHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Metal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "metalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subGrade" TEXT,
    "multiplier" DECIMAL(10,4) NOT NULL,
    "extraPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "mechanicalProperties" JSONB NOT NULL,
    "toleranceProperties" JSONB NOT NULL,
    "bendProperties" JSONB NOT NULL,
    "chemicalComposition" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alloy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdById" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alloy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlloyComponent" (
    "id" TEXT NOT NULL,
    "alloyId" TEXT NOT NULL,
    "metalId" TEXT,
    "gradeId" TEXT,
    "rawMaterialId" TEXT,
    "compositionPercent" DECIMAL(7,4) NOT NULL,
    "quantity" DECIMAL(16,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlloyComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceList" (
    "id" TEXT NOT NULL,
    "metalId" TEXT,
    "rawMaterialId" TEXT,
    "supplierId" TEXT,
    "pricePerUnit" DECIMAL(16,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "source" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'India',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "metalId" TEXT,
    "rawMaterialId" TEXT,
    "oldPrice" DECIMAL(16,4),
    "newPrice" DECIMAL(16,4) NOT NULL,
    "updatedById" TEXT NOT NULL,
    "reason" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calculation" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alloyId" TEXT,
    "totalQuantity" DECIMAL(16,4) NOT NULL,
    "baseCost" DECIMAL(18,4) NOT NULL,
    "gstAmount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "finalCost" DECIMAL(18,4) NOT NULL,
    "snapshot" JSONB NOT NULL,
    "status" "CalculationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "oldCost" DECIMAL(18,4),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvalReason" TEXT,

    CONSTRAINT "Calculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculationItem" (
    "id" TEXT NOT NULL,
    "calculationId" TEXT NOT NULL,
    "metalId" TEXT,
    "rawMaterialId" TEXT,
    "gradeId" TEXT,
    "itemName" TEXT NOT NULL,
    "quantity" DECIMAL(16,4) NOT NULL,
    "compositionPct" DECIMAL(7,4),
    "unitPrice" DECIMAL(16,4) NOT NULL,
    "gradeMultiplier" DECIMAL(10,4) NOT NULL,
    "extraPrice" DECIMAL(16,4) NOT NULL,
    "baseCost" DECIMAL(18,4) NOT NULL,
    "snapshot" JSONB NOT NULL,

    CONSTRAINT "CalculationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "generatedById" TEXT NOT NULL,
    "calculationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_expiresAt_idx" ON "RefreshToken"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Metal_code_key" ON "Metal"("code");

-- CreateIndex
CREATE INDEX "Metal_name_idx" ON "Metal"("name");

-- CreateIndex
CREATE INDEX "Metal_category_status_idx" ON "Metal"("category", "status");

-- CreateIndex
CREATE INDEX "Metal_createdAt_idx" ON "Metal"("createdAt");

-- CreateIndex
CREATE INDEX "Grade_metalId_status_idx" ON "Grade"("metalId", "status");

-- CreateIndex
CREATE INDEX "Grade_name_idx" ON "Grade"("name");

-- CreateIndex
CREATE INDEX "Grade_status_idx" ON "Grade"("status");

-- CreateIndex
CREATE INDEX "Grade_createdAt_idx" ON "Grade"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_metalId_name_subGrade_key" ON "Grade"("metalId", "name", "subGrade");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterial_code_key" ON "RawMaterial"("code");

-- CreateIndex
CREATE INDEX "RawMaterial_name_status_idx" ON "RawMaterial"("name", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Alloy_code_key" ON "Alloy"("code");

-- CreateIndex
CREATE INDEX "Alloy_name_status_idx" ON "Alloy"("name", "status");

-- CreateIndex
CREATE INDEX "AlloyComponent_alloyId_idx" ON "AlloyComponent"("alloyId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");

-- CreateIndex
CREATE INDEX "Supplier_name_status_idx" ON "Supplier"("name", "status");

-- CreateIndex
CREATE INDEX "PriceList_metalId_active_effectiveFrom_idx" ON "PriceList"("metalId", "active", "effectiveFrom");

-- CreateIndex
CREATE INDEX "PriceList_rawMaterialId_active_effectiveFrom_idx" ON "PriceList"("rawMaterialId", "active", "effectiveFrom");

-- CreateIndex
CREATE INDEX "PriceList_supplierId_idx" ON "PriceList"("supplierId");

-- CreateIndex
CREATE INDEX "PriceHistory_metalId_updatedAt_idx" ON "PriceHistory"("metalId", "updatedAt");

-- CreateIndex
CREATE INDEX "PriceHistory_rawMaterialId_updatedAt_idx" ON "PriceHistory"("rawMaterialId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Calculation_batchId_key" ON "Calculation"("batchId");

-- CreateIndex
CREATE INDEX "Calculation_userId_createdAt_idx" ON "Calculation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Calculation_status_createdAt_idx" ON "Calculation"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Calculation_alloyId_idx" ON "Calculation"("alloyId");

-- CreateIndex
CREATE INDEX "Calculation_createdAt_idx" ON "Calculation"("createdAt");

-- CreateIndex
CREATE INDEX "Calculation_completedAt_idx" ON "Calculation"("completedAt");

-- CreateIndex
CREATE INDEX "CalculationItem_calculationId_idx" ON "CalculationItem"("calculationId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_createdAt_idx" ON "AuditLog"("entity", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_category_createdAt_idx" ON "Notification"("category", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Report_type_createdAt_idx" ON "Report"("type", "createdAt");

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
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_metalId_fkey" FOREIGN KEY ("metalId") REFERENCES "Metal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alloy" ADD CONSTRAINT "Alloy_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlloyComponent" ADD CONSTRAINT "AlloyComponent_alloyId_fkey" FOREIGN KEY ("alloyId") REFERENCES "Alloy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlloyComponent" ADD CONSTRAINT "AlloyComponent_metalId_fkey" FOREIGN KEY ("metalId") REFERENCES "Metal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlloyComponent" ADD CONSTRAINT "AlloyComponent_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlloyComponent" ADD CONSTRAINT "AlloyComponent_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_metalId_fkey" FOREIGN KEY ("metalId") REFERENCES "Metal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_metalId_fkey" FOREIGN KEY ("metalId") REFERENCES "Metal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_alloyId_fkey" FOREIGN KEY ("alloyId") REFERENCES "Alloy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationItem" ADD CONSTRAINT "CalculationItem_calculationId_fkey" FOREIGN KEY ("calculationId") REFERENCES "Calculation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationItem" ADD CONSTRAINT "CalculationItem_metalId_fkey" FOREIGN KEY ("metalId") REFERENCES "Metal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationItem" ADD CONSTRAINT "CalculationItem_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationItem" ADD CONSTRAINT "CalculationItem_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MechanicalProperty" ADD CONSTRAINT "MechanicalProperty_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChemicalProperty" ADD CONSTRAINT "ChemicalProperty_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonRecord" ADD CONSTRAINT "ComparisonRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
