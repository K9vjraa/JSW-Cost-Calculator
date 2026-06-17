import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// ── Pre-process Database URL dynamically ─────────────────────────────────────
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = process.env.DB_PORT || "5432";
const dbUser = process.env.DB_USER || "postgres";
const dbPass = process.env.DB_PASSWORD || "admin123";
const dbName = process.env.DB_NAME || "mcms";

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl || dbUrl.includes("${") || dbUrl.includes("$(")) {
  dbUrl = `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
  process.env.DATABASE_URL = dbUrl;
}

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting JSW MCMS Demo Auth Seeding...");

  // Roles to check/ensure
  const rolesNeeded = [
    { name: "ADMIN", description: "System administrator — full read/write access." },
    { name: "EMPLOYEE", description: "Internal employee/cost engineer — create calculations, manage alloys." },
    { name: "USER", description: "External/Standard user — run calculations and view reports." }
  ];

  const roleMap: Record<string, string> = {};

  for (const r of rolesNeeded) {
    let role = await prisma.role.findUnique({
      where: { name: r.name }
    });

    if (!role) {
      console.log(`Creating missing role: ${r.name}`);
      role = await prisma.role.create({
        data: {
          name: r.name,
          description: r.description
        }
      });
    }
    roleMap[r.name] = role.id;
  }

  // Demo accounts
  const demoUsers = [
    {
      email: "admin@jsw-mcms.local",
      name: "Admin User",
      password: "MCMS@2026",
      role: "ADMIN",
      department: "IT Administration"
    },
    {
      email: "employee@jsw-mcms.local",
      name: "Employee User",
      password: "MCMS@2026",
      role: "EMPLOYEE",
      department: "Cost Engineering"
    },
    {
      email: "user@jsw-mcms.local",
      name: "Standard User",
      password: "MCMS@2026",
      role: "USER",
      department: "Client Services"
    }
  ];

  for (const u of demoUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: u.email }
    });

    const passwordHash = await bcrypt.hash(u.password, 12);

    if (existing) {
      // Check if password has changed (verify if hash matches the default password)
      const matches = await bcrypt.compare(u.password, existing.passwordHash);
      if (!matches) {
        console.log(`Updating password/status for existing user: ${u.email}`);
        await prisma.user.update({
          where: { email: u.email },
          data: {
            passwordHash,
            status: "ACTIVE"
          }
        });
      } else if (existing.status !== "ACTIVE") {
        console.log(`Ensuring existing user is ACTIVE: ${u.email}`);
        await prisma.user.update({
          where: { email: u.email },
          data: { status: "ACTIVE" }
        });
      } else {
        console.log(`Demo user already exists and is up to date: ${u.email}`);
      }
    } else {
      console.log(`Creating demo user: ${u.email}`);
      await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          passwordHash,
          roleId: roleMap[u.role],
          department: u.department,
          status: "ACTIVE"
        }
      });
    }
  }

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
