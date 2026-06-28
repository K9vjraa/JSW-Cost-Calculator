import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking applied migrations...");
  try {
    const migrations: any = await prisma.$queryRaw`
      SELECT id, checksum, finished_at, migration_name 
      FROM _prisma_migrations 
      ORDER BY finished_at ASC;
    `;
    console.log("Migrations applied:", migrations);
  } catch (err) {
    console.error("Error checking migrations:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
