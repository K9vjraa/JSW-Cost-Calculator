const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.count();
  const rawMaterials = await prisma.rawMaterial.count();
  const grades = await prisma.grade.count();
  const metals = await prisma.metal.count();
  console.log('Database Counts:');
  console.log('Users:', users);
  console.log('Metals:', metals);
  console.log('Raw Materials:', rawMaterials);
  console.log('Grades:', grades);
}
main().catch(console.error).finally(() => prisma.$disconnect());
