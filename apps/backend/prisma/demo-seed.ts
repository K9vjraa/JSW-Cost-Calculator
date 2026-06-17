/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  JSW MCMS — Internship Demo Dataset Generator                              ║
 * ║  Clears old data and populates realistic JSW industrial environment data   ║
 * ║  Users: 25 | Metals: 52 | Grades: 104 | Calculations: 160 | Price History: 200║
 * ║  Audit Logs: 500 | Notifications: 100 | Reports: 15 | Catalog: 28         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { PrismaClient, CalculationStatus, NotificationPriority } from "@prisma/client";
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

// Utility helper to generate past dates
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// Helper to generate a random number in range
function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Helper to pick a random item from array
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Technical properties templates for grades
const baseTechnicalProperties = {
  mechanicalProperties: {
    uts: "410-520 MPa",
    yieldStrength: "250 MPa min",
    elongation: "23%",
    hardness: "HRB 70-80"
  },
  toleranceProperties: {
    thickness: "+/- 0.08 mm",
    width: "+/- 3 mm",
    flatness: "Standard IS:1852"
  },
  bendProperties: {
    minimumRadius: "1.5T",
    rating: "Good",
    springback: "Low"
  },
  chemicalComposition: {
    carbon: "0.15%",
    manganese: "0.80%",
    silicon: "0.20%",
    phosphorus: "0.035%",
    sulfur: "0.035%"
  }
};

async function main() {
  console.log("🌱  Starting JSW MCMS Demo Data Seeding...\n");

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 0 — Database Teardown
  // ══════════════════════════════════════════════════════════════════════════
  console.log("🗑️   Clearing existing database records...");
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.comparisonRecord.deleteMany({});
  await prisma.calculationItem.deleteMany({});
  await prisma.calculation.deleteMany({});
  await prisma.alloyComponent.deleteMany({});
  await prisma.alloy.deleteMany({});
  await prisma.priceHistory.deleteMany({});
  await prisma.priceList.deleteMany({});
  await prisma.mechanicalProperty.deleteMany({});
  await prisma.chemicalProperty.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.metal.deleteMany({});
  await prisma.rawMaterial.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.gstSlab.deleteMany({});
  await prisma.systemSetting.deleteMany({});
  await prisma.jswProductCatalog.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  console.log("   ✓ All tables cleared.\n");

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 1 — Roles
  // ══════════════════════════════════════════════════════════════════════════
  console.log("🔐  Seeding user roles...");
  const roleNames = ["SUPER_ADMIN", "ADMIN", "EMPLOYEE", "USER"];
  const roleRows = await Promise.all(
    roleNames.map((name) =>
      prisma.role.create({
        data: {
          name,
          description: `${name} role for JSW costing boundaries.`
        }
      })
    )
  );
  const roles = Object.fromEntries(roleRows.map((r) => [r.name, r]));
  console.log(`   ✓ ${roleRows.length} roles created.\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 2 — Users (Exactly 25 users across 5 departments)
  // ══════════════════════════════════════════════════════════════════════════
  console.log("👤  Generating 25 JSW enterprise users...");
  const passwordHash = await bcrypt.hash("MCMS@2026", 10);

  const userDefinitions = [
    // Presentation demo accounts
    { name: "Admin User", email: "admin@jsw-mcms.local", role: "ADMIN", dept: "IT Administration" },
    { name: "Employee User", email: "employee@jsw-mcms.local", role: "EMPLOYEE", dept: "Cost Engineering" },
    { name: "Standard User", email: "user@jsw-mcms.local", role: "USER", dept: "Client Services" },
    // 1 SUPER_ADMIN
    { name: "Sajjan Jindal", email: "superadmin@jsw.in", role: "SUPER_ADMIN", dept: "Operations" },
    // 3 ADMIN
    { name: "Demo Admin", email: "demo.admin@jsw.in", role: "ADMIN", dept: "Operations" },
    { name: "Amit Banerjee", email: "amit.banerjee@jsw.in", role: "ADMIN", dept: "Finance" },
    { name: "Sunita Reddy", email: "sunita.reddy@jsw.in", role: "ADMIN", dept: "Procurement" },
    // 6 EMPLOYEE
    { name: "Arjun Mehta", email: "arjun.mehta@jsw.in", role: "EMPLOYEE", dept: "Procurement" },
    { name: "Priya Nair", email: "priya.nair@jsw.in", role: "EMPLOYEE", dept: "Production" },
    { name: "Suresh Iyer", email: "suresh.iyer@jsw.in", role: "EMPLOYEE", dept: "Finance" },
    { name: "Rahul Sharma", email: "rahul.sharma@jsw.in", role: "EMPLOYEE", dept: "Quality" },
    { name: "Kiran Joshi", email: "kiran.joshi@jsw.in", role: "EMPLOYEE", dept: "Operations" },
    { name: "Vikas Sen", email: "vikas.sen@jsw.in", role: "EMPLOYEE", dept: "Procurement" },
    // 15 USER
    { name: "Rajesh Kumar", email: "user1@jsw.in", role: "USER", dept: "Production" },
    { name: "Neha Gupta", email: "user2@jsw.in", role: "USER", dept: "Procurement" },
    { name: "Sanjay Shah", email: "user3@jsw.in", role: "USER", dept: "Operations" },
    { name: "Aditi Rao", email: "user4@jsw.in", role: "USER", dept: "Quality" },
    { name: "Manoj Tiwari", email: "user5@jsw.in", role: "USER", dept: "Finance" },
    { name: "Pooja Patel", email: "user6@jsw.in", role: "USER", dept: "Production" },
    { name: "Rohan Varma", email: "user7@jsw.in", role: "USER", dept: "Procurement" },
    { name: "Divya Mishra", email: "user8@jsw.in", role: "USER", dept: "Operations" },
    { name: "Anil Kapoor", email: "user9@jsw.in", role: "USER", dept: "Quality" },
    { name: "Swati Deshmukh", email: "user10@jsw.in", role: "USER", dept: "Finance" },
    { name: "Vijay Mallya", email: "user11@jsw.in", role: "USER", dept: "Production" },
    { name: "Karan Johar", email: "user12@jsw.in", role: "USER", dept: "Procurement" },
    { name: "Gaurav Chopra", email: "user13@jsw.in", role: "USER", dept: "Operations" },
    { name: "Preeti Zinta", email: "user14@jsw.in", role: "USER", dept: "Quality" },
    { name: "Aamir Khan", email: "user15@jsw.in", role: "USER", dept: "Finance" }
  ];

  const userRows = await Promise.all(
    userDefinitions.map((ud) =>
      prisma.user.create({
        data: {
          name: ud.name,
          email: ud.email,
          passwordHash,
          department: ud.dept,
          status: "ACTIVE",
          roleId: roles[ud.role].id,
          lastLoginAt: daysAgo(Math.floor(randomRange(1, 10)))
        }
      })
    )
  );
  console.log(`   ✓ ${userRows.length} users seeded.\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 3 — Suppliers
  // ══════════════════════════════════════════════════════════════════════════
  console.log("🏭  Seeding industrial suppliers...");
  const supplierData = [
    { name: "JSW Steel Ltd. (Vijayanagar)", code: "SUP-JSW-VNJ", email: "sales.vnj@jsw.in" },
    { name: "JSW Steel Ltd. (Dolvi)", code: "SUP-JSW-DLV", email: "sales.dlv@jsw.in" },
    { name: "JSW Steel Ltd. (Salem)", code: "SUP-JSW-SLM", email: "sales.slm@jsw.in" },
    { name: "NMDC Iron Ore Supply", code: "SUP-NMDC-ORE", email: "logistics@nmdc.co.in" }
  ];
  const supplierRows = await Promise.all(
    supplierData.map((s) => prisma.supplier.create({ data: s }))
  );
  const suppliers = Object.fromEntries(supplierRows.map((s) => [s.code, s]));
  console.log(`   ✓ ${supplierRows.length} suppliers created.\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 4 — Metals (52 JSW metals)
  // ══════════════════════════════════════════════════════════════════════════
  console.log("⚙️   Generating 52 JSW catalog metals...");
  const metalSpecs = [
    { name: "Mild Steel Hot Rolled Coil (E250A)", code: "JSW-MS-HR-COIL-E250A", category: "Ferrous", price: 63.75 },
    { name: "Mild Steel Hot Rolled Sheet (E350)", code: "JSW-MS-HR-SHEET-E350", category: "Ferrous", price: 65.20 },
    { name: "Mild Steel Hot Rolled Plate (E250)", code: "JSW-MS-HR-PLATE-E250", category: "Ferrous", price: 67.50 },
    { name: "Mild Steel Cold Rolled Coil (D)", code: "JSW-MS-CR-COIL-D", category: "Ferrous", price: 68.40 },
    { name: "Mild Steel Cold Rolled Sheet (DD)", code: "JSW-MS-CR-SHEET-DD", category: "Ferrous", price: 70.10 },
    { name: "Mild Steel Cold Rolled Extra Deep (EDD)", code: "JSW-MS-CR-EDD", category: "Ferrous", price: 71.50 },
    { name: "TMT Rebar Fe500D Construction", code: "JSW-TMT-FE500D", category: "Ferrous", price: 58.90 },
    { name: "TMT Rebar Fe550D High Strength", code: "JSW-TMT-FE550D", category: "Ferrous", price: 60.30 },
    { name: "TMT Rebar Fe600 Super High Strength", code: "JSW-TMT-FE600", category: "Ferrous", price: 62.10 },
    { name: "Galvanized Plain Coil (GP)", code: "JSW-GI-GP-COIL", category: "Galvanized", price: 72.80 },
    { name: "Galvanized Corrugated Sheet (GC)", code: "JSW-GI-GC-SHEET", category: "Galvanized", price: 73.50 },
    { name: "Galvalume Coil (GL)", code: "JSW-GL-COIL", category: "Galvanized", price: 74.50 },
    { name: "Galvannealed Auto Sheet (GA)", code: "JSW-GA-AUTO-SHEET", category: "Galvanized", price: 78.50 },
    { name: "Prepainted Galvanized Coil (PPGI)", code: "JSW-PPGI-COIL", category: "Galvanized", price: 84.00 },
    { name: "Prepainted Galvalume Coil (PPGL)", code: "JSW-PPGL-COIL", category: "Galvanized", price: 86.50 },
    { name: "Color Coated Sheet (PPGI-COLOR)", code: "JSW-COLOR-SHEET", category: "Galvanized", price: 85.00 },
    { name: "Silicon Steel Electrical M43", code: "JSW-ES-M43", category: "Specialty", price: 95.00 },
    { name: "Silicon Steel Electrical M36", code: "JSW-ES-M36", category: "Specialty", price: 98.20 },
    { name: "Silicon Steel Electrical M27", code: "JSW-ES-M27", category: "Specialty", price: 102.50 },
    { name: "CRGO Oriented Silicon Steel", code: "JSW-CRGO-ORIENTED", category: "Specialty", price: 115.00 },
    { name: "CRNGO Non-Oriented Silicon Steel", code: "JSW-CRNGO-NONORIENTED", category: "Specialty", price: 108.00 },
    { name: "Structural Steel MS Angle", code: "JSW-STRUCT-ANGLE", category: "Ferrous", price: 66.80 },
    { name: "Structural Steel MS Channel", code: "JSW-STRUCT-CHANNEL", category: "Ferrous", price: 67.90 },
    { name: "Structural Steel H-Beam", code: "JSW-STRUCT-HBEAM", category: "Ferrous", price: 71.40 },
    { name: "Structural Steel I-Beam", code: "JSW-STRUCT-IBEAM", category: "Ferrous", price: 70.80 },
    { name: "Structural Steel Welded Section", code: "JSW-STRUCT-WELDED", category: "Ferrous", price: 72.50 },
    { name: "Stainless Steel Grade 304", code: "JSW-SS-304", category: "Stainless", price: 165.00 },
    { name: "Stainless Steel Grade 316", code: "JSW-SS-316", category: "Stainless", price: 220.00 },
    { name: "Stainless Steel Grade 321", code: "JSW-SS-321", category: "Stainless", price: 185.00 },
    { name: "Stainless Steel Grade 409", code: "JSW-SS-409", category: "Stainless", price: 120.00 },
    { name: "Stainless Steel Grade 430", code: "JSW-SS-430", category: "Stainless", price: 135.00 },
    { name: "Duplex Stainless Steel 2205", code: "JSW-SS-DUPLEX-2205", category: "Stainless", price: 290.00 },
    { name: "Super Duplex Stainless Steel 2507", code: "JSW-SS-SDUPLEX-2507", category: "Stainless", price: 340.00 },
    { name: "Medium Carbon Steel C45", code: "JSW-CS-C45", category: "Ferrous", price: 60.50 },
    { name: "High Carbon Steel C80", code: "JSW-CS-C80", category: "Ferrous", price: 65.20 },
    { name: "High-Strength Low-Alloy S600", code: "JSW-HSLA-S600", category: "Alloy", price: 85.00 },
    { name: "Alloy Steel Chrome Moly 13CrMo44", code: "JSW-AS-13CRMO44", category: "Alloy", price: 110.00 },
    { name: "Alloy Steel Chrome Moly 15CrMo6", code: "JSW-AS-15CRMO6", category: "Alloy", price: 118.00 },
    { name: "Tool Steel High Speed M2", code: "JSW-TS-M2", category: "Tool", price: 350.00 },
    { name: "Tool Steel Cold Work D2", code: "JSW-TS-D2", category: "Tool", price: 280.00 },
    { name: "Tool Steel Hot Work H13", code: "JSW-TS-H13", category: "Tool", price: 310.00 },
    { name: "Spring Steel Carbon SUP9", code: "JSW-SPRING-SUP9", category: "Alloy", price: 88.00 },
    { name: "Spring Steel Carbon SUP11A", code: "JSW-SPRING-SUP11A", category: "Alloy", price: 92.50 },
    { name: "Nickel Alloy Monel 400", code: "JSW-ALY-MONEL400", category: "Alloy", price: 480.00 },
    { name: "Nickel Alloy Inconel 625", code: "JSW-ALY-INCONEL625", category: "Alloy", price: 650.00 },
    { name: "Nickel Alloy Incoloy 800", code: "JSW-ALY-INCOLOY800", category: "Alloy", price: 540.00 },
    { name: "Nickel Alloy Hastelloy C276", code: "JSW-ALY-HASTELLOYC276", category: "Alloy", price: 720.00 },
    { name: "Titanium Grade 2", code: "JSW-TI-GR2", category: "Specialty", price: 850.00 },
    { name: "Titanium Grade 5", code: "JSW-TI-GR5", category: "Specialty", price: 1100.00 },
    { name: "Boiler Quality Plate (IS 2002)", code: "JSW-BQ-PLATE-IS2002", category: "Ferrous", price: 58.70 },
    { name: "Weathering Steel Corten-A", code: "JSW-CORTEN-A", category: "Alloy", price: 92.40 },
    { name: "Weathering Steel Corten-B", code: "JSW-CORTEN-B", category: "Alloy", price: 94.80 }
  ];

  const metalRows = await Promise.all(
    metalSpecs.map((spec) =>
      prisma.metal.create({
        data: {
          name: spec.name,
          code: spec.code,
          category: spec.category,
          unit: "kg",
          status: "ACTIVE",
          description: `JSW Industrial Spec ${spec.name} conforming to IS standard.`
        }
      })
    )
  );

  // Seed active prices for all metals
  await Promise.all(
    metalRows.map((metal, idx) =>
      prisma.priceList.create({
        data: {
          metalId: metal.id,
          pricePerUnit: metalSpecs[idx].price.toFixed(4),
          currency: "INR",
          unit: "kg",
          source: "JSW-MASTER-RATE-2026",
          effectiveFrom: daysAgo(60),
          active: true,
          status: "APPROVED",
          supplierId: suppliers["SUP-JSW-VNJ"].id
        }
      })
    )
  );
  console.log(`   ✓ ${metalRows.length} metals created with active pricing sheets.\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 5 — Grades & Physical Properties (Exactly 104 grades mapped to metals)
  // ══════════════════════════════════════════════════════════════════════════
  console.log("📋  Generating 104 grades with multi-tier properties and physical mappings...");
  const gradeRows: any[] = [];
  for (let i = 0; i < metalRows.length; i++) {
    const metal = metalRows[i];
    
    // Grade 1 - Standard
    const grade1 = await prisma.grade.create({
      data: {
        metalId: metal.id,
        name: `${metal.name} G-Standard`,
        subGrade: "STD",
        multiplier: "1.0000",
        extraPrice: "0.00",
        ...baseTechnicalProperties,
        status: "ACTIVE"
      }
    });

    await prisma.mechanicalProperty.create({
      data: {
        gradeId: grade1.id,
        uts: "410-520 MPa",
        yieldStrength: "250 MPa min",
        elongation: "23%",
        hardness: "HRB 70-80",
        thicknessTolerance: "+/- 0.08 mm",
        widthTolerance: "+/- 3 mm",
        flatnessTolerance: "Standard IS:1852",
        minBendRadius: "1.5T",
        bendRating: "Good",
        springback: "Low"
      }
    });

    await prisma.chemicalProperty.create({
      data: {
        gradeId: grade1.id,
        carbon: "0.15%",
        manganese: "0.80%",
        silicon: "0.20%",
        chromium: "0.05%",
        nickel: "0.05%",
        molybdenum: "0.01%",
        phosphorus: "0.035%",
        sulfur: "0.035%"
      }
    });

    // Grade 2 - Premium
    const grade2 = await prisma.grade.create({
      data: {
        metalId: metal.id,
        name: `${metal.name} G-Premium`,
        subGrade: "PREM",
        multiplier: (1.05 + i * 0.003).toFixed(4),
        extraPrice: (5.00 + i * 0.75).toFixed(2),
        ...baseTechnicalProperties,
        status: "ACTIVE"
      }
    });

    await prisma.mechanicalProperty.create({
      data: {
        gradeId: grade2.id,
        uts: "450-560 MPa",
        yieldStrength: "280 MPa min",
        elongation: "20%",
        hardness: "HRB 75-85",
        thicknessTolerance: "+/- 0.06 mm",
        widthTolerance: "+/- 2 mm",
        flatnessTolerance: "Standard IS:1852",
        minBendRadius: "2.0T",
        bendRating: "Excellent",
        springback: "Low"
      }
    });

    await prisma.chemicalProperty.create({
      data: {
        gradeId: grade2.id,
        carbon: "0.18%",
        manganese: "0.95%",
        silicon: "0.22%",
        chromium: "0.10%",
        nickel: "0.10%",
        molybdenum: "0.02%",
        phosphorus: "0.030%",
        sulfur: "0.030%"
      }
    });

    gradeRows.push(grade1, grade2);
  }
  console.log(`   ✓ ${gradeRows.length} grades seeded (2 grades per metal with mechanical/chemical records).\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 6 — Raw Materials
  // ══════════════════════════════════════════════════════════════════════════
  console.log("🪨  Generating raw material composition agents...");
  const rawMaterialSpecs = [
    { name: "Iron Ore Pellets", code: "RM-FE-PEL", price: 12.50 },
    { name: "Prime Heavy Scrap HMS1", code: "RM-SCRAP", price: 32.00 },
    { name: "Ferro-Manganese FeMn75", code: "RM-FEMN", price: 85.00 },
    { name: "Ferro-Silicon FeSi75", code: "RM-FESI", price: 92.00 },
    { name: "Ferro-Chrome FeCr60", code: "RM-FECR", price: 110.00 },
    { name: "Pure Nickel Cathodes", code: "RM-NI", price: 1250.00 },
    { name: "Carbon Additives Coke", code: "RM-CARBON", price: 18.00 },
    { name: "Lime Flux Calcined", code: "RM-LIME", price: 8.50 },
    { name: "Niobium Micro-Alloy", code: "RM-NB", price: 3400.00 },
    { name: "Vanadium pentoxide", code: "RM-V", price: 2100.00 }
  ];

  const rawRows = await Promise.all(
    rawMaterialSpecs.map((spec) =>
      prisma.rawMaterial.create({
        data: {
          name: spec.name,
          code: spec.code,
          unit: "kg",
          status: "ACTIVE",
          description: `Base industrial input element ${spec.name}`
        }
      })
    )
  );

  // Seed active prices for raw materials
  await Promise.all(
    rawRows.map((rm, idx) =>
      prisma.priceList.create({
        data: {
          rawMaterialId: rm.id,
          pricePerUnit: rawMaterialSpecs[idx].price.toFixed(4),
          currency: "INR",
          unit: "kg",
          source: "JSW-RAW-VALUATION-2026",
          effectiveFrom: daysAgo(60),
          active: true,
          status: "APPROVED",
          supplierId: suppliers["SUP-NMDC-ORE"].id
        }
      })
    )
  );
  console.log(`   ✓ ${rawRows.length} raw materials created with active valuation cards.\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 7 — Price History (Exactly 200 historical changes spread over 12 months)
  // ══════════════════════════════════════════════════════════════════════════
  console.log("📈  Generating 200 historical price fluctuations (last 12 months)...");
  const priceHistoryCreators = userRows.filter((u) => u.email.endsWith("admin@jsw.in") || u.email.includes("arjun"));
  const priceHistoryData: any[] = [];

  for (let i = 0; i < 200; i++) {
    const isMetal = Math.random() > 0.3;
    const targetDate = daysAgo(Math.floor(randomRange(1, 365)));
    const creator = pickRandom(priceHistoryCreators);

    if (isMetal) {
      const metalIdx = Math.floor(randomRange(0, metalRows.length));
      const metal = metalRows[metalIdx];
      const basePrice = metalSpecs[metalIdx].price;
      const oldPrice = basePrice * randomRange(0.88, 0.98);
      const newPrice = oldPrice * randomRange(0.96, 1.06);
      const changePct = ((newPrice - oldPrice) / oldPrice) * 100;

      priceHistoryData.push({
        metalId: metal.id,
        oldPrice: oldPrice.toFixed(4),
        newPrice: newPrice.toFixed(4),
        reason: `LME Market correction of ${changePct.toFixed(2)}% | Effective ${targetDate.toLocaleDateString()}`,
        updatedById: creator.id,
        updatedAt: targetDate
      });
    } else {
      const rmIdx = Math.floor(randomRange(0, rawRows.length));
      const rawMat = rawRows[rmIdx];
      const basePrice = rawMaterialSpecs[rmIdx].price;
      const oldPrice = basePrice * randomRange(0.90, 0.98);
      const newPrice = oldPrice * randomRange(0.95, 1.05);
      const changePct = ((newPrice - oldPrice) / oldPrice) * 100;

      priceHistoryData.push({
        rawMaterialId: rawMat.id,
        oldPrice: oldPrice.toFixed(4),
        newPrice: newPrice.toFixed(4),
        reason: `Global raw commodity update ${changePct.toFixed(2)}% | Applied ${targetDate.toLocaleDateString()}`,
        updatedById: creator.id,
        updatedAt: targetDate
      });
    }
  }

  // Write price history
  for (const ph of priceHistoryData) {
    await prisma.priceHistory.create({
      data: ph
    });
  }
  console.log(`   ✓ ${priceHistoryData.length} price history changes successfully generated.\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 8 — Calculations (100 COMPLETED, 40 DRAFT, 20 APPROVED = 160 total)
  // ══════════════════════════════════════════════════════════════════════════
  console.log("🧮  Generating 160 calculations (100 COMPLETED, 40 DRAFT, 20 APPROVED)...");
  
  const calculationStatuses: { status: CalculationStatus; count: number }[] = [
    { status: "COMPLETED", count: 100 },
    { status: "DRAFT", count: 40 },
    { status: "APPROVED", count: 20 }
  ];

  const productPrefixes = ["JSW NeoSteel", "JSW AutoForm", "JSW BoilerGuard", "JSW StrucMax", "JSW ArmorPlat", "JSW GalvanShield"];
  let calcIndex = 0;

  for (const item of calculationStatuses) {
    console.log(`   └─ Generating ${item.count} ${item.status} calculations...`);
    for (let c = 0; c < item.count; c++) {
      calcIndex++;
      const user = pickRandom(userRows);
      const metalIdx = Math.floor(randomRange(0, metalRows.length));
      const metal = metalRows[metalIdx];
      
      // Select standard or premium grade mapped to this metal
      const mGrades = gradeRows.filter((g) => g.metalId === metal.id);
      const grade = pickRandom(mGrades);

      // Quantities scale: 200kg to 5000kg. High value metals get lower quantity, ferrous gets higher
      let quantity = Math.floor(randomRange(500, 4500));
      if (metal.category === "Alloy" || metal.category === "Stainless") {
        quantity = Math.floor(randomRange(250, 1500));
      } else if (metal.code.includes("MONEL")) {
        quantity = Math.floor(randomRange(50, 300)); // monel is very expensive (₹480/kg)
      }

      // Calculation pricing variables
      const metalBaseRate = metalSpecs[metalIdx].price;
      const multiplier = parseFloat(grade.multiplier.toString());
      const additionalCost = parseFloat(grade.extraPrice.toString());
      
      const itemUnitPrice = metalBaseRate * multiplier + additionalCost;
      const mainItemBaseCost = quantity * itemUnitPrice;

      // Add a couple of raw material elements as alloys
      const rm1 = pickRandom(rawRows);
      const rmUnitPrice = rawMaterialSpecs.find((spec) => spec.code === rm1.code)!.price;
      const rm1Qty = quantity * 0.10; // 10% scrap/flux
      const rm1BaseCost = rm1Qty * rmUnitPrice;

      const baseCostVal = mainItemBaseCost + rm1BaseCost;

      // Add JSW standardized logistics surcharges (1.5% percent levy + 250 INR flat handling)
      const logisticsLevy = baseCostVal * 0.015;
      const handlingFlat = 250.00;
      
      const subTotal = baseCostVal + logisticsLevy + handlingFlat;
      const gstAmountVal = subTotal * 0.18;
      const finalCostVal = subTotal + gstAmountVal;

      // Ensure that at least 14 calculations (which fall in COMPLETED) are seeded specifically for the last 7 days (2 per day)
      // to keep dashboard chart active.
      let createdDate: Date;
      if (item.status === "COMPLETED" && c < 14) {
        const dayOffset = Math.floor(c / 2); // 0, 0, 1, 1, 2, 2, ..., 6, 6
        createdDate = daysAgo(dayOffset);
        createdDate.setHours(Math.floor(randomRange(9, 17)), Math.floor(randomRange(0, 59)));
      } else {
        createdDate = daysAgo(Math.floor(randomRange(1, 180)));
      }

      // Enforce user cost boundary check
      // Target: Material Cost: 10,000 - 250,000 | Final Cost: 15,000 - 500,000
      // If cost exceeds maximum ranges, scale it down
      let baseCostFinal = baseCostVal;
      let finalCostFinal = finalCostVal;
      let gstFinal = gstAmountVal;
      let finalQty = quantity;

      if (baseCostFinal > 250000) {
        const factor = 240000 / baseCostFinal;
        finalQty = Math.floor(quantity * factor);
        baseCostFinal = baseCostFinal * factor;
        gstFinal = gstFinal * factor;
        finalCostFinal = finalCostFinal * factor;
      } else if (baseCostFinal < 10000) {
        const factor = 11000 / baseCostFinal;
        finalQty = Math.floor(quantity * factor);
        baseCostFinal = baseCostFinal * factor;
        gstFinal = gstFinal * factor;
        finalCostFinal = finalCostFinal * factor;
      }

      const batchId = `JSW-BATCH-2026-${calcIndex.toString().padStart(4, "0")}`;
      const productName = `${pickRandom(productPrefixes)} - ${metal.code} Lot-${Math.floor(randomRange(10, 99))}`;

      const snapshot = {
        version: 1,
        name: productName,
        mode: "alloy",
        pricedAt: createdDate.toISOString(),
        masterLocked: true,
        currency: "INR",
        weightUnit: "kg",
        charges: [
          { label: "Logistics Surcharge", rate: 1.5, type: "percent" },
          { label: "Handling Fee", rate: 250, type: "flat" }
        ]
      };

      const approver = pickRandom(userRows.filter((u) => u.roleId === roles["ADMIN"].id || u.roleId === roles["SUPER_ADMIN"].id));

      await prisma.calculation.create({
        data: {
          batchId,
          name: productName,
          mode: "alloy",
          userId: user.id,
          totalQuantity: finalQty.toFixed(4),
          baseCost: baseCostFinal.toFixed(4),
          gstAmount: gstFinal.toFixed(4),
          finalCost: finalCostFinal.toFixed(4),
          snapshot,
          status: item.status,
          createdAt: createdDate,
          updatedAt: createdDate,
          completedAt: item.status === "COMPLETED" || item.status === "APPROVED" ? createdDate : null,
          approvedById: item.status === "APPROVED" ? approver.id : null,
          approvedAt: item.status === "APPROVED" ? createdDate : null,
          approvalReason: item.status === "APPROVED" ? "Verified calculation aligns with JSW standard pricing cards." : null,
          items: {
            create: [
              {
                metalId: metal.id,
                gradeId: grade.id,
                itemName: `${metal.name} (${grade.name})`,
                quantity: finalQty.toFixed(4),
                compositionPct: "90.0000",
                unitPrice: itemUnitPrice.toFixed(4),
                gradeMultiplier: multiplier.toFixed(4),
                extraPrice: additionalCost.toFixed(2),
                baseCost: mainItemBaseCost.toFixed(4),
                snapshot: { basePrice: metalBaseRate.toFixed(4), multiplier: multiplier.toFixed(4) }
              },
              {
                rawMaterialId: rm1.id,
                itemName: `${rm1.name} Composition Additive`,
                quantity: (finalQty * 0.10).toFixed(4),
                compositionPct: "10.0000",
                unitPrice: rmUnitPrice.toFixed(4),
                gradeMultiplier: "1.0000",
                extraPrice: "0.00",
                baseCost: rm1BaseCost.toFixed(4),
                snapshot: { basePrice: rmUnitPrice.toFixed(4) }
              }
            ]
          }
        }
      });
    }
  }
  console.log(`   ✓ 160 calculations generated with embedded billing items.\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 9 — Audit Logs (Exactly 500 audit events)
  // ══════════════════════════════════════════════════════════════════════════
  console.log("📝  Generating 500 immutable system audit logs (last 6 months)...");
  const auditActions = [
    { action: "LOGIN", entity: "User", msg: "User authenticated successfully via credentials" },
    { action: "LOGOUT", entity: "User", msg: "Session closed by user" },
    { action: "CREATE", entity: "Calculation", msg: "Created cost calculation sheet" },
    { action: "UPDATE", entity: "Calculation", msg: "Draft worksheet updated" },
    { action: "APPROVE", entity: "Calculation", msg: "Calculation batch approved for production" },
    { action: "EXPORT_PDF", entity: "Report", msg: "Report exported to PDF document" },
    { action: "EXPORT_EXCEL", entity: "Report", msg: "Report exported to Excel sheet" },
    { action: "PRICE_UPDATE", entity: "PriceList", msg: "Metal base price modified in catalog" }
  ];

  const auditRows: any[] = [];
  for (let i = 0; i < 500; i++) {
    const user = pickRandom(userRows);
    const targetDate = daysAgo(Math.floor(randomRange(1, 180)));
    const actionSpec = pickRandom(auditActions);
    const ipAddress = `10.18.${Math.floor(randomRange(10, 99))}.${Math.floor(randomRange(10, 250))}`;

    auditRows.push({
      userId: user.id,
      action: actionSpec.action,
      entity: actionSpec.entity,
      ipAddress,
      details: { message: actionSpec.msg, timestamp: targetDate.toISOString() },
      createdAt: targetDate
    });
  }

  // Batch insert in chunks to prevent PostgreSQL query size overflow
  const chunkSize = 100;
  for (let i = 0; i < auditRows.length; i += chunkSize) {
    const chunk = auditRows.slice(i, i + chunkSize);
    await prisma.auditLog.createMany({ data: chunk });
  }
  console.log(`   ✓ 500 audit logs entries created and timestamped.\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 10 — Notifications (Exactly 100 notifications)
  // ══════════════════════════════════════════════════════════════════════════
  console.log("🔔  Generating 100 priority notifications...");
  const notificationTemplates = [
    { title: "Price Alert - Steel Surge", msg: "Mild Steel base rate increased by 2.5% LME correction.", cat: "PRICE", priority: NotificationPriority.HIGH },
    { title: "Calculation Submitted", msg: "Calculation worksheet submitted and awaiting approval.", cat: "CALCULATION", priority: NotificationPriority.MEDIUM },
    { title: "Sheet Approved", msg: "Metal cost calculation sheet approved by finance.", cat: "CALCULATION", priority: NotificationPriority.LOW },
    { title: "Database Backup Success", msg: "Nightly PostgreSQL dump backup completed successfully.", cat: "SYSTEM", priority: NotificationPriority.LOW },
    { title: "Export Failed", msg: "Excel compilation timeout due to temporary memory limit.", cat: "SYSTEM", priority: NotificationPriority.HIGH },
    { title: "Supplier Pricing Update", msg: "Dolvi JSW plant updated raw material scrap coefficients.", cat: "PRICE", priority: NotificationPriority.MEDIUM }
  ];

  const notificationRows: any[] = [];
  for (let i = 0; i < 100; i++) {
    const user = pickRandom(userRows);
    const targetDate = daysAgo(Math.floor(randomRange(1, 180)));
    const temp = pickRandom(notificationTemplates);

    notificationRows.push({
      userId: user.id,
      title: temp.title,
      message: temp.msg,
      category: temp.cat,
      priority: temp.priority,
      readAt: Math.random() > 0.6 ? targetDate : null,
      createdAt: targetDate
    });
  }

  for (let i = 0; i < notificationRows.length; i += chunkSize) {
    const chunk = notificationRows.slice(i, i + chunkSize);
    await prisma.notification.createMany({ data: chunk });
  }
  console.log(`   ✓ 100 notifications generated.\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 11 — Reports
  // ══════════════════════════════════════════════════════════════════════════
  console.log("📄  Generating demo reports links...");
  const reportTypes = [
    { name: "Monthly Cost Summary - JSW Steel", type: "cost-summary" },
    { name: "Metallurgical Composition Output", type: "alloy-analysis" },
    { name: "Metal Production Usage Report", type: "metal-usage" },
    { name: "Cost Engineer Log Auditing", type: "user-activity" }
  ];

  const reportRows: any[] = [];
  for (let i = 0; i < 15; i++) {
    const user = pickRandom(userRows);
    const spec = pickRandom(reportTypes);
    const targetDate = daysAgo(Math.floor(randomRange(1, 180)));

    reportRows.push({
      name: `${spec.name} - Batch Q${Math.floor(randomRange(1, 3))}`,
      type: spec.type,
      filters: { range: "Custom 6 Months", generateType: spec.type },
      generatedById: user.id,
      createdAt: targetDate
    });
  }

  for (const report of reportRows) {
    await prisma.report.create({ data: report });
  }
  console.log(`   ✓ ${reportRows.length} report templates initialized.\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 12 — GST Slabs & Settings
  // ══════════════════════════════════════════════════════════════════════════
  console.log("📊  Initializing GST slabs and settings...");
  await prisma.gstSlab.createMany({
    data: [
      { name: "GST Steel Standard", code: "GST-18", rate: "0.1800", description: "Standard GST for steel products" },
      { name: "GST Specialty Custom", code: "GST-28", rate: "0.2800", description: "Luxury or specialty alloys slab" },
      { name: "GST Nil Rate", code: "GST-0", rate: "0.0000", description: "Exempted export items" },
      { name: "GST Concessional Rate", code: "GST-12", rate: "0.1200", description: "Concessional GST for metals" },
      { name: "GST Concessional Scrap", code: "GST-5", rate: "0.0500", description: "Concessional GST for scrap materials" }
    ]
  });

  await prisma.systemSetting.createMany({
    data: [
      { key: "CORS_ORIGIN", value: "http://localhost:5173", label: "CORS Allowed Origin" },
      { key: "TOKEN_EXPIRY_ACCESS", value: "15m", label: "Access Token Lifetime" },
      { key: "TOKEN_EXPIRY_REFRESH", value: "7d", label: "Refresh Token Lifetime" },
      { key: "APP_NAME", value: "JSW Metal Cost Management System", label: "Application Name" },
      { key: "default_gst_rate", value: "18", label: "Default GST Rate (%)", category: "TAXATION", description: "Applied to calculation final cost unless overridden" },
      { key: "price_validity_days", value: "30", label: "Price Master Validity (Days)", category: "PRICING", description: "Number of days a price master entry is considered current" },
      { key: "currency", value: "INR", label: "Base Currency", category: "GENERAL", description: "Default currency for all calculations" },
      { key: "weight_unit", value: "kg", label: "Default Weight Unit", category: "GENERAL", description: "Base unit for all quantity fields" },
      { key: "max_alloy_components", value: "10", label: "Max Alloy Components", category: "CALCULATION", description: "Maximum number of components allowed per alloy definition" },
      { key: "calculation_decimal_places", value: "4", label: "Calculation Decimal Precision", category: "CALCULATION", description: "Number of decimal places maintained in cost calculations" },
      { key: "session_timeout_minutes", value: "60", label: "Session Timeout (Minutes)", category: "SECURITY", description: "Idle session timeout duration before forced re-authentication" },
      { key: "max_login_attempts", value: "5", label: "Max Login Attempts", category: "SECURITY", description: "Failed login attempts before account is temporarily locked" }
    ]
  });
  console.log("   ✓ GST and System parameters configured.\n");

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 13 — Saved Comparison Records (10 templates)
  // ══════════════════════════════════════════════════════════════════════════
  console.log("📊  Generating 10 saved comparison records...");
  const comparisonTemplates = [
    { name: "Hot Rolled Sheet vs Coil Specs" },
    { name: "Structural Angles vs Channels" },
    { name: "TMT Rebars Fe500D vs Fe600" },
    { name: "Stainless Steel 304 vs 316 Marine" },
    { name: "Duplex SS vs SS316" },
    { name: "Electrical Silicon Steel Comparison" },
    { name: "Titanium Alloys vs Nickel Alloys" },
    { name: "Cold Rolled Sheets Drawing Grades" },
    { name: "Weathering Steel Corten Comparison" },
    { name: "Tool Steels Hardness Analysis" }
  ];

  for (let i = 0; i < comparisonTemplates.length; i++) {
    const template = comparisonTemplates[i];
    // Pick 3 random grades from gradeRows
    const selectedGrades = [
      pickRandom(gradeRows).id,
      pickRandom(gradeRows).id,
      pickRandom(gradeRows).id
    ];

    await prisma.comparisonRecord.create({
      data: {
        name: template.name,
        gradeIds: selectedGrades,
        userId: pickRandom(userRows).id
      }
    });
  }
  console.log("   ✓ 10 saved comparison records seeded.\n");

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 14 — JSW Product Catalog (28 items)
  // ══════════════════════════════════════════════════════════════════════════
  console.log("📦  Generating JSW Product Catalog...");
  const catalogData = [
    { category: "MS Hot Rolled", steelType: "HR Coil E250A", grade: "E250A", subGrade: "Standard", basePrice: 63.75, image: "coil" },
    { category: "MS Hot Rolled", steelType: "HR Coil E250A", grade: "E250A", subGrade: "L", basePrice: 64.25, image: "coil" },
    { category: "MS Hot Rolled", steelType: "HR Coil E250A", grade: "E275", subGrade: "Standard", basePrice: 64.75, image: "coil" },
    { category: "MS Hot Rolled", steelType: "HR Coil E250A", grade: "E275", subGrade: "L", basePrice: 65.25, image: "coil" },
    { category: "MS Hot Rolled", steelType: "HR Sheet", grade: "E350", subGrade: "Standard", basePrice: 65.20, image: "sheet" },
    { category: "MS Hot Rolled", steelType: "HR Sheet", grade: "E410", subGrade: "Standard", basePrice: 66.80, image: "sheet" },
    { category: "MS Hot Rolled", steelType: "HR Plate", grade: "E250", subGrade: "Standard", basePrice: 67.50, image: "plate" },
    { category: "MS Hot Rolled", steelType: "HR Plate", grade: "E350", subGrade: "Standard", basePrice: 68.90, image: "plate" },
    
    { category: "MS Cold Rolled", steelType: "CR Coil", grade: "D", subGrade: "Standard", basePrice: 68.40, image: "coil" },
    { category: "MS Cold Rolled", steelType: "CR Coil", grade: "DD", subGrade: "Standard", basePrice: 69.80, image: "coil" },
    { category: "MS Cold Rolled", steelType: "CR Coil", grade: "EDD", subGrade: "Standard", basePrice: 71.50, image: "coil" },
    { category: "MS Cold Rolled", steelType: "CR Sheet", grade: "D", subGrade: "Standard", basePrice: 70.10, image: "sheet" },
    { category: "MS Cold Rolled", steelType: "CR Sheet", grade: "DD", subGrade: "Standard", basePrice: 71.30, image: "sheet" },
    
    { category: "TMT", steelType: "TMT Fe500D", grade: "Fe500D", subGrade: "Standard", basePrice: 58.90, image: "bar" },
    { category: "TMT", steelType: "TMT Fe550D", grade: "Fe550D", subGrade: "Standard", basePrice: 60.30, image: "bar" },
    { category: "TMT", steelType: "TMT Fe600", grade: "Fe600", subGrade: "Standard", basePrice: 62.10, image: "bar" },
    
    { category: "Coated Steel", steelType: "Galvanized Coil", grade: "GP", subGrade: "Standard", basePrice: 72.80, image: "coil" },
    { category: "Coated Steel", steelType: "Galvanized Coil", grade: "GC", subGrade: "Standard", basePrice: 73.50, image: "coil" },
    { category: "Coated Steel", steelType: "Galvalume Sheet", grade: "GL", subGrade: "Standard", basePrice: 74.50, image: "sheet" },
    
    { category: "Wire Rods", steelType: "MS Wire Rod", grade: "SAE1006", subGrade: "Standard", basePrice: 61.20, image: "rod" },
    { category: "Wire Rods", steelType: "MS Wire Rod", grade: "SAE1008", subGrade: "Standard", basePrice: 62.40, image: "rod" },
    { category: "Wire Rods", steelType: "Carbon Steel Wire Rod", grade: "EN8D", subGrade: "Standard", basePrice: 64.60, image: "rod" },
    { category: "Wire Rods", steelType: "Carbon Steel Wire Rod", grade: "EN9", subGrade: "Standard", basePrice: 66.10, image: "rod" },
    
    { category: "Structural Steel", steelType: "MS Angle", grade: "E250", subGrade: "Standard", basePrice: 66.80, image: "angle" },
    { category: "Structural Steel", steelType: "MS Channel", grade: "E250", subGrade: "Standard", basePrice: 67.90, image: "channel" },
    { category: "Structural Steel", steelType: "H-Beam", grade: "E250", subGrade: "Standard", basePrice: 71.40, image: "beam" },
    { category: "Structural Steel", steelType: "H-Beam", grade: "E350", subGrade: "Standard", basePrice: 73.20, image: "beam" }
  ];

  await prisma.jswProductCatalog.createMany({
    data: catalogData.map((item) => ({
      category: item.category,
      steelType: item.steelType,
      grade: item.grade,
      subGrade: item.subGrade,
      image: item.image,
      basePrice: item.basePrice.toFixed(4)
    }))
  });
  console.log(`   ✓ ${catalogData.length} product catalog items seeded.\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  console.log("═".repeat(70));
  console.log("✅  JSW MCMS Demo Data Seeding Completed Successfully!");
  console.log(`   Total Users        : ${userRows.length}`);
  console.log(`   Total Metals       : ${metalRows.length}`);
  console.log(`   Total Grades       : ${gradeRows.length}`);
  console.log(`   Total Calculations : 160 (100 COMPLETED, 40 DRAFT, 20 APPROVED)`);
  console.log(`   Price History      : 200 records`);
  console.log(`   Audit Logs         : 500 logs`);
  console.log(`   Notifications      : 100 alerts`);
  console.log(`   Reports            : ${reportRows.length} records`);
  console.log(`   Saved Comparisons  : ${comparisonTemplates.length} records`);
  console.log(`   Catalog Products   : ${catalogData.length} products`);
  console.log("═".repeat(70));
  console.log("\n🔐  Use the presentation credentials to login:");
  console.log("   SUPER ADMIN: superadmin@jsw.in  / MCMS@2026");
  console.log("   ADMIN    : admin@jsw-mcms.local  / MCMS@2026");
  console.log("   EMPLOYEE : employee@jsw-mcms.local  / MCMS@2026");
  console.log("   USER     : user@jsw-mcms.local  / MCMS@2026\n");
}

main()
  .catch((e) => {
    console.error("❌  Demo Seed failed: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
