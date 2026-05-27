import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const properties = {
  ss304: {
    mechanicalProperties: { uts: "515 MPa", yieldStrength: "205 MPa", elongation: "45%" },
    toleranceProperties: { thickness: "+/- 0.10 mm", flatness: "Standard" },
    bendProperties: { minimumRadius: "2.0T", rating: "Good" },
    chemicalComposition: { chromium: "18.0%", nickel: "8.0%", carbon: "0.08%" }
  },
  ss316: {
    mechanicalProperties: { uts: "580 MPa", yieldStrength: "290 MPa", elongation: "40%" },
    toleranceProperties: { thickness: "+/- 0.08 mm", flatness: "Tight" },
    bendProperties: { minimumRadius: "2.2T", rating: "Good" },
    chemicalComposition: { chromium: "16.0%", nickel: "10.0%", molybdenum: "2.0%" }
  },
  alloy: {
    mechanicalProperties: { uts: "700 MPa", yieldStrength: "420 MPa", elongation: "25%" },
    toleranceProperties: { thickness: "+/- 0.12 mm", flatness: "Standard" },
    bendProperties: { minimumRadius: "1.8T", rating: "Excellent" },
    chemicalComposition: { carbon: "0.20%", manganese: "1.20%", chromium: "1.00%" }
  }
};

async function main() {
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

  const [steel, iron, alloySteel] = await Promise.all(
    [
      ["Stainless Steel", "MTL-SS", "Ferrous"],
      ["Iron", "MTL-FE", "Ferrous"],
      ["Alloy Steel", "MTL-AS", "Alloy"]
    ].map(([name, code, category]) =>
      prisma.metal.upsert({ where: { code }, update: { name, category }, create: { name, code, category } })
    )
  );

  const [ss304, ss316, lowAlloy] = await Promise.all([
    prisma.grade.upsert({
      where: { metalId_name_subGrade: { metalId: steel.id, name: "SS304", subGrade: "" } },
      update: { multiplier: "1.02", extraPrice: "0", ...properties.ss304 },
      create: { metalId: steel.id, name: "SS304", subGrade: "", multiplier: "1.02", extraPrice: "0", ...properties.ss304 }
    }),
    prisma.grade.upsert({
      where: { metalId_name_subGrade: { metalId: steel.id, name: "SS316", subGrade: "" } },
      update: { multiplier: "1.08", extraPrice: "2.50", ...properties.ss316 },
      create: { metalId: steel.id, name: "SS316", subGrade: "", multiplier: "1.08", extraPrice: "2.50", ...properties.ss316 }
    }),
    prisma.grade.upsert({
      where: { metalId_name_subGrade: { metalId: alloySteel.id, name: "Low Alloy", subGrade: "" } },
      update: { multiplier: "1.12", extraPrice: "4.00", ...properties.alloy },
      create: { metalId: alloySteel.id, name: "Low Alloy", subGrade: "", multiplier: "1.12", extraPrice: "4.00", ...properties.alloy }
    })
  ]);

  const rawMaterials = await Promise.all(
    [
      ["Iron Pellets", "RM-FE", "Primary iron feed"],
      ["Nickel", "RM-NI", "Nickel addition"],
      ["Chromium", "RM-CR", "Chromium alloy feed"],
      ["Scrap Blend", "RM-SCR", "Approved process scrap"]
    ].map(([name, code, description]) =>
      prisma.rawMaterial.upsert({ where: { code }, update: { name, description }, create: { name, code, description } })
    )
  );
  const raw = Object.fromEntries(rawMaterials.map((item) => [item.code, item]));

  const supplier = await prisma.supplier.upsert({
    where: { code: "SUP-JSW-01" },
    update: { name: "JSW Approved Supply Desk", email: "supplierdesk@jsw.local" },
    create: { name: "JSW Approved Supply Desk", code: "SUP-JSW-01", email: "supplierdesk@jsw.local", contactName: "Anita Rao", phone: "+91 22 5550 2026" }
  });

  await Promise.all([
    [steel.id, null, "62.50"],
    [iron.id, null, "80.00"],
    [alloySteel.id, null, "72.00"],
    [null, raw["RM-FE"].id, "80.00"],
    [null, raw["RM-NI"].id, "850.00"],
    [null, raw["RM-CR"].id, "650.00"],
    [null, raw["RM-SCR"].id, "35.00"]
  ].map(async ([metalId, rawMaterialId, price]) => {
    const existing = await prisma.priceList.findFirst({ where: { metalId: metalId || undefined, rawMaterialId: rawMaterialId || undefined, active: true } });
    if (!existing) {
      await prisma.priceList.create({
        data: {
          metalId: metalId || undefined,
          rawMaterialId: rawMaterialId || undefined,
          supplierId: supplier.id,
          pricePerUnit: String(price),
          source: "Seed price master",
          effectiveFrom: new Date("2026-05-01T00:00:00.000Z")
        }
      });
    }
  }));

  const alloy = await prisma.alloy.upsert({
    where: { code: "ALY-SS304-BATCH" },
    update: { name: "SS304 Batch Alloy", type: "Stainless Steel", createdById: procurement.id },
    create: { name: "SS304 Batch Alloy", code: "ALY-SS304-BATCH", type: "Stainless Steel", createdById: procurement.id }
  });
  await prisma.alloyComponent.deleteMany({ where: { alloyId: alloy.id } });
  await prisma.alloyComponent.createMany({
    data: [
      { alloyId: alloy.id, metalId: steel.id, gradeId: ss304.id, compositionPercent: "70" },
      { alloyId: alloy.id, rawMaterialId: raw["RM-NI"].id, compositionPercent: "20" },
      { alloyId: alloy.id, rawMaterialId: raw["RM-CR"].id, compositionPercent: "10" }
    ]
  });

  const snapshot = {
    mode: "alloy",
    formula: "Base cost = Qty * Price",
    items: [{ name: "SS304", quantity: "1000", unitPrice: "62.5", gradeMultiplier: "1.02" }],
    charges: []
  };
  const calculation = await prisma.calculation.upsert({
    where: { batchId: "BATCH-1023" },
    update: { finalCost: "63750", status: "COMPLETED", snapshot },
    create: {
      batchId: "BATCH-1023",
      name: "SS304 Cost Run",
      mode: "alloy",
      userId: procurement.id,
      alloyId: alloy.id,
      totalQuantity: "1000",
      baseCost: "63750",
      finalCost: "63750",
      snapshot,
      status: "COMPLETED",
      completedAt: new Date()
    }
  });
  await prisma.calculationItem.deleteMany({ where: { calculationId: calculation.id } });
  await prisma.calculationItem.create({
    data: {
      calculationId: calculation.id,
      metalId: steel.id,
      gradeId: ss304.id,
      itemName: "SS304",
      quantity: "1000",
      unitPrice: "62.5",
      gradeMultiplier: "1.02",
      extraPrice: "0",
      baseCost: "63750",
      snapshot: snapshot.items[0]
    }
  });

  if ((await prisma.notification.count()) === 0) {
    await prisma.notification.createMany({
      data: [
        { userId: admin.id, title: "Price master refreshed", message: "Nickel price list is active for May.", category: "PRICE", priority: "HIGH" },
        { userId: procurement.id, title: "Calculation completed", message: "BATCH-1023 is ready for report export.", category: "CALCULATION" },
        { title: "Price list verified", message: "Metal cost calculation is active for standard grades.", category: "PRICE", priority: "LOW" }
      ]
    });
  }
  if ((await prisma.auditLog.count()) === 0) {
    await prisma.auditLog.createMany({
      data: [
        { userId: admin.id, action: "SEED_PRICE", entity: "PriceList", entityId: supplier.id, details: { message: "Seed price master created" } },
        { userId: procurement.id, action: "COMPLETE", entity: "Calculation", entityId: calculation.id, details: { batchId: calculation.batchId } }
      ]
    });
  }

  await prisma.report.upsert({
    where: { id: "6fcfca5b-99ad-4109-927a-9b8bdd66e8e6" },
    update: { name: "Monthly Cost Summary", filters: { range: "May 2026" } },
    create: { id: "6fcfca5b-99ad-4109-927a-9b8bdd66e8e6", name: "Monthly Cost Summary", type: "cost-summary", filters: { range: "May 2026" }, generatedById: finance.id }
  });

  console.log("Seeded MCMS demo data.", {
    users: [admin.email, procurement.email, finance.email, production.email],
    password: "MCMS@2026"
  });
}

main()
  .finally(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  });
