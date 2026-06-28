import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting raw SQL database migration...");

  try {
    // 1. Rename table
    await prisma.$executeRawUnsafe(`ALTER TABLE "ferro_alloy_master" RENAME TO "materials";`);
    console.log("Renamed table ferro_alloy_master to materials.");
  } catch (err: any) {
    if (err.message.includes("does not exist")) {
      console.log("Table ferro_alloy_master does not exist, assuming already renamed.");
    } else {
      throw err;
    }
  }

  // Helper function to safely rename columns
  const renameColumn = async (oldName: string, newName: string) => {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "materials" RENAME COLUMN "${oldName}" TO "${newName}";`);
      console.log(`Renamed column ${oldName} to ${newName}.`);
    } catch (err: any) {
      if (err.message.includes("does not exist")) {
        console.log(`Column ${oldName} does not exist (or already renamed).`);
      } else {
        throw err;
      }
    }
  };

  // Convert and rename RAW_MAT_ID to material_code
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "materials" ALTER COLUMN "RAW_MAT_ID" DROP DEFAULT;`);
    console.log("Dropped default sequence on RAW_MAT_ID.");
  } catch (err) {}

  await renameColumn("RAW_MAT_ID", "material_code");

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "materials" ALTER COLUMN "material_code" TYPE TEXT USING "material_code"::text;`);
    console.log("Converted material_code type to TEXT.");
  } catch (err: any) {
    console.error("Failed to convert type of material_code:", err.message);
  }

  // Rename other columns
  await renameColumn("ALLOY_NAME", "material_name");
  await renameColumn("ALLOY_DESCRIPTION", "description");
  await renameColumn("IS_AVAIL", "is_active");
  await renameColumn("IS_MICRO", "is_micro_alloy");
  await renameColumn("CURRENT_RATE", "current_rate");
  await renameColumn("UPDATED_BY_ID", "updated_by_id");
  await renameColumn("CREATED_AT", "created_at");
  await renameColumn("UPDATED_AT", "updated_at");

  // Helper function to safely add columns if they don't exist
  const addColumn = async (colDef: string) => {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "materials" ADD COLUMN ${colDef};`);
      console.log(`Added column definition: ${colDef}`);
    } catch (err: any) {
      if (err.message.includes("already exists")) {
        console.log(`Column in ${colDef} already exists.`);
      } else {
        throw err;
      }
    }
  };

  // Add missing columns
  await addColumn(`"category" TEXT`);
  await addColumn(`"unit" TEXT NOT NULL DEFAULT 'kg'`);
  await addColumn(`"supplier" TEXT`);
  await addColumn(`"status" TEXT NOT NULL DEFAULT 'ACTIVE'`);

  // Establish unique constraint
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "materials" ADD CONSTRAINT "materials_material_code_key" UNIQUE ("material_code");`);
    console.log("Established unique constraint on material_code.");
  } catch (err: any) {
    if (err.message.includes("already exists") || err.message.includes("multiple key values")) {
      console.log("Unique constraint already exists or check failed (possibly duplicate values).");
    } else {
      throw err;
    }
  }

  console.log("Database migration script finished successfully!");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
