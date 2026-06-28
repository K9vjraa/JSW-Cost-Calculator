-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "profiles" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "profiles" ADD COLUMN "deactivatedAt" TIMESTAMP(3);
ALTER TABLE "profiles" ADD COLUMN "deactivatedById" UUID;
