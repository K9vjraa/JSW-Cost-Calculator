import { alloyComponentSchema, createAlloySchema } from "../validations/metal.validator.js";
import { prisma } from "../prisma/client.js";

async function runTests() {
  console.log("--- Testing Zod Validation ---");

  const validPayload = {
    metalId: "123e4567-e89b-12d3-a456-426614174000",
    compositionPercent: 50
  };

  const invalidPayload1 = {
    compositionPercent: 50
    // all sources null/undefined
  };

  const invalidPayload2 = {
    metalId: "123e4567-e89b-12d3-a456-426614174000",
    gradeId: "123e4567-e89b-12d3-a456-426614174001",
    compositionPercent: 50
  };

  try {
    alloyComponentSchema.parse(validPayload);
    console.log("✅ Valid payload passed Zod");
  } catch (e) {
    console.error("❌ Valid payload failed Zod", e);
  }

  try {
    alloyComponentSchema.parse(invalidPayload1);
    console.error("❌ Invalid payload 1 passed Zod (Should have failed)");
  } catch (e) {
    console.log("✅ Invalid payload 1 failed Zod correctly");
  }

  try {
    alloyComponentSchema.parse(invalidPayload2);
    console.error("❌ Invalid payload 2 passed Zod (Should have failed)");
  } catch (e) {
    console.log("✅ Invalid payload 2 failed Zod correctly");
  }

  console.log("\n--- Testing Prisma Middleware ---");
  
  try {
    await prisma.alloyComponent.create({
      data: {
        alloyId: "test", // Doesn't matter if it fails FK, it should fail middleware first
        compositionPercent: 50
      }
    });
  } catch (e: any) {
    if (e.message.includes("Exactly one component source must be selected.")) {
      console.log("✅ Prisma middleware caught empty source");
    } else {
      console.log("❌ Prisma middleware threw different error for empty source:", e.message);
    }
  }

  try {
    await prisma.alloyComponent.create({
      data: {
        alloyId: "test",
        metalId: "123e4567-e89b-12d3-a456-426614174000",
        rawMaterialId: "123e4567-e89b-12d3-a456-426614174000",
        compositionPercent: 50
      }
    });
  } catch (e: any) {
    if (e.message.includes("Exactly one component source must be selected.")) {
      console.log("✅ Prisma middleware caught multiple sources");
    } else {
      console.log("❌ Prisma middleware threw different error for multiple sources:", e.message);
    }
  }

  console.log("Done testing.");
}

runTests().catch(console.error).finally(() => process.exit(0));
