import { PrismaClient } from "@prisma/client";

async function main() {
  const urls = [
    process.env.DATABASE_URL
  ];

  for (const url of urls) {
    if (!url) continue;
    console.log(`Trying connection to: ${url.replace(/:[^@:]*@/, ":****@")}`);
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url
        }
      }
    });
    try {
      await prisma.$connect();
      console.log("🟢 Connection SUCCESS!");
      const usersCount = await prisma.user.count();
      console.log(`   Found ${usersCount} users in database.`);
      await prisma.$disconnect();
      return;
    } catch (e: any) {
      console.log(`❌ Connection FAILED: ${e.message.split("\n")[0]}`);
    }
  }
}

main();
