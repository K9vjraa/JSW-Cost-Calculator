import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting JSW MCMS Demo Auth Seeding...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@jsw-mcms.local" },
    update: {
      department: "COSTING",
      name: "Costing Admin"
    },
    create: {
      id: "9383886f-1438-4f46-81e7-ad77a7fa0450",
      name: "Costing Admin",
      email: "admin@jsw-mcms.local",
      role: "COSTING_DEPARTMENT",
      department: "COSTING"
    }
  });

  const pdqc = await prisma.user.upsert({
    where: { email: "pdqc@jsw-mcms.local" },
    update: {
      department: "PDQC",
      name: "PDQC Specialist"
    },
    create: {
      id: "04d9b76c-b7d9-4e71-a329-20bd6baade11",
      name: "PDQC Specialist",
      email: "pdqc@jsw-mcms.local",
      role: "PDQC",
      department: "PDQC"
    }
  });

  console.log("✅ Demo Auth Seeding Completed Successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Demo Auth Seeding Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
