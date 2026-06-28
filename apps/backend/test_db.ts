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
      const users = await prisma.user.findMany();
      console.log("Users:", users.map(u => ({ email: u.email, department: u.department, role: u.role })));
      await prisma.$disconnect();
      return;
    } catch (e: any) {
      console.log(`❌ Connection FAILED: ${e.message.split("\n")[0]}`);
    }
  }
}

main();
