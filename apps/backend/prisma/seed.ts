import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Grade technical property templates ─────────────────────────────────────
const props = {
  ss304: {
    mechanicalProperties: { uts: "515 MPa", yieldStrength: "205 MPa", elongation: "45%", hardness: "HRB 80" },
    toleranceProperties: { thickness: "+/- 0.10 mm", width: "+/- 3 mm", flatness: "Standard IS:513" },
    bendProperties: { minimumRadius: "2.0T", rating: "Good", springback: "Moderate" },
    chemicalComposition: { chromium: "18.0–20.0%", nickel: "8.0–10.5%", carbon: "≤0.08%", manganese: "≤2.0%", silicon: "≤0.75%" }
  },
  ss316: {
    mechanicalProperties: { uts: "580 MPa", yieldStrength: "290 MPa", elongation: "40%", hardness: "HRB 95" },
    toleranceProperties: { thickness: "+/- 0.08 mm", width: "+/- 2 mm", flatness: "Tight IS:513" },
    bendProperties: { minimumRadius: "2.2T", rating: "Good", springback: "Moderate" },
    chemicalComposition: { chromium: "16.0–18.0%", nickel: "10.0–14.0%", molybdenum: "2.0–3.0%", carbon: "≤0.08%", manganese: "≤2.0%" }
  },
  ss316l: {
    mechanicalProperties: { uts: "570 MPa", yieldStrength: "270 MPa", elongation: "40%", hardness: "HRB 90" },
    toleranceProperties: { thickness: "+/- 0.08 mm", width: "+/- 2 mm", flatness: "Tight IS:513" },
    bendProperties: { minimumRadius: "2.0T", rating: "Excellent", springback: "Low" },
    chemicalComposition: { chromium: "16.0–18.0%", nickel: "10.0–14.0%", molybdenum: "2.0–3.0%", carbon: "≤0.03%", manganese: "≤2.0%" }
  },
  lowAlloy: {
    mechanicalProperties: { uts: "700 MPa", yieldStrength: "420 MPa", elongation: "25%", hardness: "HRB 95" },
    toleranceProperties: { thickness: "+/- 0.12 mm", width: "+/- 4 mm", flatness: "Standard" },
    bendProperties: { minimumRadius: "1.8T", rating: "Excellent", springback: "Low" },
    chemicalComposition: { carbon: "0.20%", manganese: "1.20%", chromium: "1.00%", silicon: "0.30%", vanadium: "0.10%" }
  },
  highAlloy: {
    mechanicalProperties: { uts: "850 MPa", yieldStrength: "560 MPa", elongation: "18%", hardness: "HRC 28" },
    toleranceProperties: { thickness: "+/- 0.10 mm", width: "+/- 3 mm", flatness: "Precision" },
    bendProperties: { minimumRadius: "2.5T", rating: "Good", springback: "High" },
    chemicalComposition: { carbon: "0.35%", manganese: "0.90%", chromium: "1.50%", molybdenum: "0.20%", silicon: "0.25%" }
  },
  carbonLow: {
    mechanicalProperties: { uts: "420 MPa", yieldStrength: "260 MPa", elongation: "30%", hardness: "HRB 75" },
    toleranceProperties: { thickness: "+/- 0.15 mm", width: "+/- 5 mm", flatness: "Standard IS:1079" },
    bendProperties: { minimumRadius: "1.5T", rating: "Very Good", springback: "Low" },
    chemicalComposition: { carbon: "≤0.15%", manganese: "≤0.60%", silicon: "≤0.35%", phosphorus: "≤0.030%", sulfur: "≤0.030%" }
  },
  carbonMedium: {
    mechanicalProperties: { uts: "600 MPa", yieldStrength: "390 MPa", elongation: "20%", hardness: "HRB 88" },
    toleranceProperties: { thickness: "+/- 0.12 mm", width: "+/- 4 mm", flatness: "Standard IS:1079" },
    bendProperties: { minimumRadius: "2.0T", rating: "Good", springback: "Moderate" },
    chemicalComposition: { carbon: "0.25–0.40%", manganese: "0.60–1.00%", silicon: "0.15–0.35%", phosphorus: "≤0.035%", sulfur: "≤0.035%" }
  }
};

async function main() {
  console.log("🌱  Seeding MCMS database...");

  // ── Roles ──────────────────────────────────────────────────────────────────
  const roleRows = await Promise.all(
    [
      ["ADMIN", "System administration, complete read/write access to masters, pricing, users, and settings"],
      ["EMPLOYEE", "Operational access for calculations, comparisons, reports, and read-only masters"],
      ["USER", "Standard costing calculation and grade comparison access"]
    ].map(([name, description]) =>
      prisma.role.upsert({ where: { name }, update: { description }, create: { name, description } })
    )
  );
  const roles = Object.fromEntries(roleRows.map((role) => [role.name, role]));
  const passwordHash = await bcrypt.hash("MCMS@2026", 12);

  // ── Users ──────────────────────────────────────────────────────────────────
  const [admin, procurement, finance, production, employee, user] = await Promise.all(
    [
      ["Admin User", "admin@jsw-mcms.local", "ADMIN", "IT Administration"],
      ["Rahul Sharma", "procurement@jsw-mcms.local", "EMPLOYEE", "Procurement"],
      ["Meera Iyer", "finance@jsw-mcms.local", "EMPLOYEE", "Finance"],
      ["Neha Verma", "production@jsw-mcms.local", "EMPLOYEE", "Production"],
      ["Standard Employee", "employee@jsw-mcms.local", "EMPLOYEE", "Operations"],
      ["Standard User", "user@jsw-mcms.local", "USER", "Calculations"]
    ].map(([name, email, roleName, department]) =>
      prisma.user.upsert({
        where: { email },
        update: { name, roleId: roles[roleName].id, department, passwordHash },
        create: { name, email, department, roleId: roles[roleName].id, passwordHash }
      })
    )
  );

  // ── Metals ─────────────────────────────────────────────────────────────────
  const [steel, iron, alloySteel, carbonSteel, copper] = await Promise.all(
    [
      ["Stainless Steel", "MTL-SS", "Ferrous", "Austenitic stainless steel family with high corrosion resistance"],
      ["Iron", "MTL-FE", "Ferrous", "Primary iron base metal for structural applications"],
      ["Alloy Steel", "MTL-AS", "Alloy", "Chrome-moly and vanadium alloy steels for high-strength applications"],
      ["Carbon Steel", "MTL-CS", "Ferrous", "Plain carbon steel grades for general structural and automotive use"],
      ["Copper", "MTL-CU", "Non-Ferrous", "Pure copper for electrical and thermal conductivity applications"]
    ].map(([name, code, category, description]) =>
      prisma.metal.upsert({
        where: { code },
        update: { name, category, description },
        create: { name, code, category, description }
      })
    )
  );

  // ── Grades ─────────────────────────────────────────────────────────────────
  const [ss304, ss316, ss316l, lowAlloy, highAlloy, carbonLow, carbonMedium] = await Promise.all([
    prisma.grade.upsert({
      where: { metalId_name_subGrade: { metalId: steel.id, name: "SS304", subGrade: "" } },
      update: { multiplier: "1.02", extraPrice: "0", ...props.ss304 },
      create: { metalId: steel.id, name: "SS304", subGrade: "", multiplier: "1.02", extraPrice: "0", ...props.ss304 }
    }),
    prisma.grade.upsert({
      where: { metalId_name_subGrade: { metalId: steel.id, name: "SS316", subGrade: "" } },
      update: { multiplier: "1.08", extraPrice: "2.50", ...props.ss316 },
      create: { metalId: steel.id, name: "SS316", subGrade: "", multiplier: "1.08", extraPrice: "2.50", ...props.ss316 }
    }),
    prisma.grade.upsert({
      where: { metalId_name_subGrade: { metalId: steel.id, name: "SS316L", subGrade: "" } },
      update: { multiplier: "1.10", extraPrice: "3.00", ...props.ss316l },
      create: { metalId: steel.id, name: "SS316L", subGrade: "", multiplier: "1.10", extraPrice: "3.00", ...props.ss316l }
    }),
    prisma.grade.upsert({
      where: { metalId_name_subGrade: { metalId: alloySteel.id, name: "Low Alloy", subGrade: "" } },
      update: { multiplier: "1.12", extraPrice: "4.00", ...props.lowAlloy },
      create: { metalId: alloySteel.id, name: "Low Alloy", subGrade: "", multiplier: "1.12", extraPrice: "4.00", ...props.lowAlloy }
    }),
    prisma.grade.upsert({
      where: { metalId_name_subGrade: { metalId: alloySteel.id, name: "High Alloy", subGrade: "" } },
      update: { multiplier: "1.22", extraPrice: "8.50", ...props.highAlloy },
      create: { metalId: alloySteel.id, name: "High Alloy", subGrade: "", multiplier: "1.22", extraPrice: "8.50", ...props.highAlloy }
    }),
    prisma.grade.upsert({
      where: { metalId_name_subGrade: { metalId: carbonSteel.id, name: "Low Carbon", subGrade: "" } },
      update: { multiplier: "1.00", extraPrice: "0", ...props.carbonLow },
      create: { metalId: carbonSteel.id, name: "Low Carbon", subGrade: "", multiplier: "1.00", extraPrice: "0", ...props.carbonLow }
    }),
    prisma.grade.upsert({
      where: { metalId_name_subGrade: { metalId: carbonSteel.id, name: "Medium Carbon", subGrade: "" } },
      update: { multiplier: "1.06", extraPrice: "1.50", ...props.carbonMedium },
      create: { metalId: carbonSteel.id, name: "Medium Carbon", subGrade: "", multiplier: "1.06", extraPrice: "1.50", ...props.carbonMedium }
    })
  ]);

  // ── Raw Materials ──────────────────────────────────────────────────────────
  const rawMaterials = await Promise.all(
    [
      ["Iron Pellets", "RM-FE", "Primary iron feed material for EAF process"],
      ["Nickel", "RM-NI", "Nickel addition for austenitic stainless steel"],
      ["Chromium", "RM-CR", "Chromium alloy feed for corrosion resistance"],
      ["Scrap Blend", "RM-SCR", "Approved process scrap from JSW facility"],
      ["Molybdenum", "RM-MO", "Molybdenum addition for pitting resistance in SS316"],
      ["Manganese", "RM-MN", "Manganese feed for alloy steel grades"],
      ["Ferrosilicon", "RM-FSI", "Silicon carrier for deoxidation"],
      ["Lime", "RM-LM", "Flux material for slag control"]
    ].map(([name, code, description]) =>
      prisma.rawMaterial.upsert({ where: { code }, update: { name, description }, create: { name, code, description } })
    )
  );
  const raw = Object.fromEntries(rawMaterials.map((item) => [item.code, item]));

  // ── Suppliers ─────────────────────────────────────────────────────────────
  const [supplier1, supplier2] = await Promise.all([
    prisma.supplier.upsert({
      where: { code: "SUP-JSW-01" },
      update: { name: "JSW Approved Supply Desk", email: "supplierdesk@jsw.local" },
      create: {
        name: "JSW Approved Supply Desk", code: "SUP-JSW-01", email: "supplierdesk@jsw.local",
        contactName: "Anita Rao", phone: "+91 22 5550 2026"
      }
    }),
    prisma.supplier.upsert({
      where: { code: "SUP-ESSAR-02" },
      update: { name: "Essar Steel India", email: "procurement@essar.local" },
      create: {
        name: "Essar Steel India", code: "SUP-ESSAR-02", email: "procurement@essar.local",
        contactName: "Vikram Mehta", phone: "+91 20 5550 3030"
      }
    })
  ]);

  // ── Price Lists ────────────────────────────────────────────────────────────
  const priceSeed: [string | null, string | null, string, string, string][] = [
    [steel.id, null, "62.50", "JSW-MASTER-SS", "SUP-JSW-01"],
    [iron.id, null, "80.00", "JSW-MASTER-FE", "SUP-JSW-01"],
    [alloySteel.id, null, "72.00", "JSW-MASTER-AS", "SUP-JSW-01"],
    [carbonSteel.id, null, "48.00", "JSW-MASTER-CS", "SUP-JSW-01"],
    [copper.id, null, "720.00", "LME-SPOT-CU", "SUP-ESSAR-02"],
    [null, raw["RM-FE"].id, "80.00", "JSW-RM-FE", "SUP-JSW-01"],
    [null, raw["RM-NI"].id, "850.00", "LME-NI", "SUP-ESSAR-02"],
    [null, raw["RM-CR"].id, "650.00", "LME-CR", "SUP-ESSAR-02"],
    [null, raw["RM-SCR"].id, "35.00", "JSW-SCRAP", "SUP-JSW-01"],
    [null, raw["RM-MO"].id, "1200.00", "LME-MO", "SUP-ESSAR-02"],
    [null, raw["RM-MN"].id, "185.00", "JSW-MN", "SUP-JSW-01"],
    [null, raw["RM-FSI"].id, "90.00", "JSW-FSI", "SUP-JSW-01"],
    [null, raw["RM-LM"].id, "12.00", "JSW-LIME", "SUP-JSW-01"]
  ];

  await Promise.all(
    priceSeed.map(async ([metalId, rawMaterialId, price, source, supplierCode]) => {
      const supplierId = supplierCode === "SUP-JSW-01" ? supplier1.id : supplier2.id;
      const existing = await prisma.priceList.findFirst({
        where: { metalId: metalId || undefined, rawMaterialId: rawMaterialId || undefined, active: true }
      });
      if (!existing) {
        await prisma.priceList.create({
          data: {
            metalId: metalId || undefined,
            rawMaterialId: rawMaterialId || undefined,
            supplierId,
            pricePerUnit: price,
            source,
            effectiveFrom: new Date("2026-05-01T00:00:00.000Z")
          }
        });
      }
    })
  );

  // ── Alloys ────────────────────────────────────────────────────────────────
  const [alloySS304, alloySS316, alloyCarbonSteel, alloyAlloySteel] = await Promise.all([
    prisma.alloy.upsert({
      where: { code: "ALY-SS304-BATCH" },
      update: { name: "SS304 Batch Alloy", type: "Stainless Steel", createdById: procurement.id },
      create: { name: "SS304 Batch Alloy", code: "ALY-SS304-BATCH", type: "Stainless Steel", createdById: procurement.id }
    }),
    prisma.alloy.upsert({
      where: { code: "ALY-SS316-BATCH" },
      update: { name: "SS316 Marine Grade Alloy", type: "Stainless Steel", createdById: procurement.id },
      create: { name: "SS316 Marine Grade Alloy", code: "ALY-SS316-BATCH", type: "Stainless Steel", createdById: procurement.id }
    }),
    prisma.alloy.upsert({
      where: { code: "ALY-CS-STD" },
      update: { name: "Carbon Steel Standard Blend", type: "Carbon Steel", createdById: production.id },
      create: { name: "Carbon Steel Standard Blend", code: "ALY-CS-STD", type: "Carbon Steel", createdById: production.id }
    }),
    prisma.alloy.upsert({
      where: { code: "ALY-AS-HIGH" },
      update: { name: "High-Strength Alloy Steel", type: "Alloy Steel", createdById: production.id },
      create: { name: "High-Strength Alloy Steel", code: "ALY-AS-HIGH", type: "Alloy Steel", createdById: production.id }
    })
  ]);

  // Alloy components
  await prisma.alloyComponent.deleteMany({ where: { alloyId: { in: [alloySS304.id, alloySS316.id, alloyCarbonSteel.id, alloyAlloySteel.id] } } });
  await prisma.alloyComponent.createMany({
    data: [
      // SS304 batch: 70% steel, 20% nickel, 10% chromium
      { alloyId: alloySS304.id, metalId: steel.id, gradeId: ss304.id, compositionPercent: "70" },
      { alloyId: alloySS304.id, rawMaterialId: raw["RM-NI"].id, compositionPercent: "20" },
      { alloyId: alloySS304.id, rawMaterialId: raw["RM-CR"].id, compositionPercent: "10" },
      // SS316 batch: 65% steel, 20% nickel, 10% chromium, 5% molybdenum
      { alloyId: alloySS316.id, metalId: steel.id, gradeId: ss316.id, compositionPercent: "65" },
      { alloyId: alloySS316.id, rawMaterialId: raw["RM-NI"].id, compositionPercent: "20" },
      { alloyId: alloySS316.id, rawMaterialId: raw["RM-CR"].id, compositionPercent: "10" },
      { alloyId: alloySS316.id, rawMaterialId: raw["RM-MO"].id, compositionPercent: "5" },
      // Carbon Steel: 80% CS, 15% iron pellets, 5% scrap
      { alloyId: alloyCarbonSteel.id, metalId: carbonSteel.id, gradeId: carbonLow.id, compositionPercent: "80" },
      { alloyId: alloyCarbonSteel.id, rawMaterialId: raw["RM-FE"].id, compositionPercent: "15" },
      { alloyId: alloyCarbonSteel.id, rawMaterialId: raw["RM-SCR"].id, compositionPercent: "5" },
      // Alloy Steel: 70% AS, 20% iron, 7% manganese, 3% ferrosilicon
      { alloyId: alloyAlloySteel.id, metalId: alloySteel.id, gradeId: highAlloy.id, compositionPercent: "70" },
      { alloyId: alloyAlloySteel.id, rawMaterialId: raw["RM-FE"].id, compositionPercent: "20" },
      { alloyId: alloyAlloySteel.id, rawMaterialId: raw["RM-MN"].id, compositionPercent: "7" },
      { alloyId: alloyAlloySteel.id, rawMaterialId: raw["RM-FSI"].id, compositionPercent: "3" }
    ]
  });

  // ── Calculations ──────────────────────────────────────────────────────────
  const calcSeeds: Array<{
    batchId: string; name: string; mode: string; userId: string; alloyId?: string;
    totalQuantity: string; baseCost: string; finalCost: string; status: "COMPLETED" | "DRAFT";
  }> = [
    {
      batchId: "BATCH-1023", name: "SS304 Cost Run – May 2026", mode: "alloy",
      userId: procurement.id, alloyId: alloySS304.id,
      totalQuantity: "1000", baseCost: "63750.0000", finalCost: "63750.0000", status: "COMPLETED"
    },
    {
      batchId: "BATCH-1024", name: "SS316 Marine Grade Costing", mode: "alloy",
      userId: procurement.id, alloyId: alloySS316.id,
      totalQuantity: "500", baseCost: "42560.0000", finalCost: "42560.0000", status: "COMPLETED"
    },
    {
      batchId: "BATCH-1025", name: "Carbon Steel Structural Run", mode: "metal",
      userId: production.id, alloyId: alloyCarbonSteel.id,
      totalQuantity: "2000", baseCost: "97200.0000", finalCost: "97200.0000", status: "COMPLETED"
    },
    {
      batchId: "BATCH-1026", name: "High-Strength Alloy Steel Q2", mode: "alloy",
      userId: finance.id, alloyId: alloyAlloySteel.id,
      totalQuantity: "750", baseCost: "55800.0000", finalCost: "55800.0000", status: "COMPLETED"
    },
    {
      batchId: "BATCH-1027", name: "SS304 Draft – June Forecast", mode: "metal",
      userId: procurement.id,
      totalQuantity: "1500", baseCost: "93750.0000", finalCost: "93750.0000", status: "DRAFT"
    }
  ];

  const snapshot = {
    version: 1,
    mode: "alloy",
    pricedAt: new Date("2026-05-15T09:00:00.000Z").toISOString(),
    masterLocked: true,
    charges: [],
    items: []
  };

  for (const calc of calcSeeds) {
    const existing = await prisma.calculation.findUnique({ where: { batchId: calc.batchId } });
    if (!existing) {
      await prisma.calculation.create({
        data: {
          batchId: calc.batchId,
          name: calc.name,
          mode: calc.mode,
          userId: calc.userId,
          alloyId: calc.alloyId,
          totalQuantity: calc.totalQuantity,
          baseCost: calc.baseCost,
          finalCost: calc.finalCost,
          snapshot: { ...snapshot, mode: calc.mode, name: calc.name },
          status: calc.status,
          completedAt: calc.status === "COMPLETED" ? new Date("2026-05-15T12:00:00.000Z") : null
        }
      });
    }
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  if ((await prisma.notification.count()) === 0) {
    await prisma.notification.createMany({
      data: [
        { userId: admin.id, title: "Price master refreshed", message: "Nickel price list is active for May 2026.", category: "PRICE", priority: "HIGH" },
        { userId: procurement.id, title: "Calculation completed", message: "BATCH-1023 is ready for report export.", category: "CALCULATION" },
        { userId: finance.id, title: "Report generated", message: "Monthly Cost Summary for May 2026 is available.", category: "REPORT" },
        { title: "System maintenance", message: "Scheduled backup at 02:00 IST. No downtime expected.", category: "SYSTEM", priority: "LOW" },
        { userId: production.id, title: "Price alert", message: "Molybdenum LME price increased by 3.2% this week.", category: "PRICE", priority: "HIGH" }
      ]
    });
  }

  // ── Audit Logs ────────────────────────────────────────────────────────────
  if ((await prisma.auditLog.count()) === 0) {
    const calcRow = await prisma.calculation.findUnique({ where: { batchId: "BATCH-1023" } });
    await prisma.auditLog.createMany({
      data: [
        { userId: admin.id, action: "SEED_PRICE", entity: "PriceList", entityId: supplier1.id, details: { message: "Seed price master created" } },
        { userId: procurement.id, action: "COMPLETE", entity: "Calculation", entityId: calcRow?.id ?? "unknown", details: { batchId: "BATCH-1023" } },
        { userId: admin.id, action: "CREATE", entity: "User", entityId: employee.id, details: { email: employee.email, role: "EMPLOYEE" } },
        { userId: finance.id, action: "EXPORT_PDF", entity: "Report", entityId: "monthly-may-26", details: { rows: 5 } }
      ]
    });
  }

  // ── Reports ───────────────────────────────────────────────────────────────
  await prisma.report.upsert({
    where: { id: "6fcfca5b-99ad-4109-927a-9b8bdd66e8e6" },
    update: { name: "Monthly Cost Summary – May 2026", filters: { range: "May 2026" } },
    create: {
      id: "6fcfca5b-99ad-4109-927a-9b8bdd66e8e6",
      name: "Monthly Cost Summary – May 2026",
      type: "cost-summary",
      filters: { range: "May 2026" },
      generatedById: finance.id
    }
  });

  // ── GST Slabs ─────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.gstSlab.upsert({
      where: { code: "GST-18" },
      update: { rate: "18", name: "Standard Rate 18%", active: true },
      create: { code: "GST-18", name: "Standard Rate 18%", rate: "18", description: "Applicable to most metal products and semi-fabricated goods", active: true }
    }),
    prisma.gstSlab.upsert({
      where: { code: "GST-12" },
      update: { rate: "12", name: "Concessional Rate 12%", active: true },
      create: { code: "GST-12", name: "Concessional Rate 12%", rate: "12", description: "Applicable to certain flat-rolled steel products", active: true }
    }),
    prisma.gstSlab.upsert({
      where: { code: "GST-5" },
      update: { rate: "5", name: "Reduced Rate 5%", active: true },
      create: { code: "GST-5", name: "Reduced Rate 5%", rate: "5", description: "Applicable to industrial scrap and recycled materials", active: true }
    }),
    prisma.gstSlab.upsert({
      where: { code: "GST-0" },
      update: { rate: "0", name: "Exempt / Zero Rated", active: true },
      create: { code: "GST-0", name: "Exempt / Zero Rated", rate: "0", description: "Export supplies and SEZ transactions", active: true }
    })
  ]);

  // ── System Settings ───────────────────────────────────────────────────────
  const settings: Array<{ key: string; value: string; label: string; category: string; description: string }> = [
    { key: "default_gst_rate", value: "18", label: "Default GST Rate (%)", category: "TAXATION", description: "Applied to calculation final cost unless overridden" },
    { key: "price_validity_days", value: "30", label: "Price Master Validity (Days)", category: "PRICING", description: "Number of days a price master entry is considered current" },
    { key: "currency", value: "INR", label: "Base Currency", category: "GENERAL", description: "Default currency for all calculations" },
    { key: "weight_unit", value: "kg", label: "Default Weight Unit", category: "GENERAL", description: "Base unit for all quantity fields" },
    { key: "max_alloy_components", value: "10", label: "Max Alloy Components", category: "CALCULATION", description: "Maximum number of components allowed per alloy definition" },
    { key: "calculation_decimal_places", value: "4", label: "Calculation Decimal Precision", category: "CALCULATION", description: "Number of decimal places maintained in cost calculations" },
    { key: "session_timeout_minutes", value: "60", label: "Session Timeout (Minutes)", category: "SECURITY", description: "Idle session timeout duration before forced re-authentication" },
    { key: "max_login_attempts", value: "5", label: "Max Login Attempts", category: "SECURITY", description: "Failed login attempts before account is temporarily locked" }
  ];

  await Promise.all(
    settings.map(({ key, value, label, category, description }) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value, label, category, description },
        create: { key, value, label, category, description }
      })
    )
  );

  console.log("✅  MCMS seed complete.", {
    users: [admin.email, procurement.email, finance.email, production.email, employee.email, user.email],
    password: "MCMS@2026",
    metals: 5,
    grades: 7,
    rawMaterials: rawMaterials.length,
    alloys: 4,
    calculations: calcSeeds.length,
    gstSlabs: 4,
    settings: settings.length
  });
}

main()
  .finally(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  });
