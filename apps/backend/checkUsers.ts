import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@jsw-mcms.local' } });
  const pdqc = await prisma.user.findUnique({ where: { email: 'pdqc@jsw-mcms.local' } });
  
  console.log('Admin:', admin);
  console.log('PDQC:', pdqc);
}

checkUsers().catch(console.error).finally(() => prisma.$disconnect());
