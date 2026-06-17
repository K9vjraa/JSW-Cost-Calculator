import { prisma } from "../prisma/client.js";
import { parseCSV } from "../utils/csv.js";
import { Decimal } from "decimal.js";
import bcrypt from "bcryptjs";

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  skipped: number;
  errors: string[];
}

/**
 * Enterprise Service to parse, validate, and import CSV datasets.
 */
export class CsvImportService {
  
  /**
   * Helper to write system audit logs of the import event.
   */
  private static async logAudit(action: string, entity: string, details: any) {
    try {
      await prisma.auditLog.create({
        data: {
          action,
          entity,
          details: JSON.stringify(details),
        },
      });
    } catch (e) {
      console.error("Audit log creation failed in CSV Import Service:", e);
    }
  }

  /**
   * 1. Import Metals
   * CSV Header: id,name,code,category,unit,status,description
   */
  public static async importMetals(csvText: string): Promise<ImportResult> {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return { success: true, imported: 0, failed: 0, skipped: 0, errors: ["Empty CSV file"] };
    }

    const headers = rows[0].map(h => h.toLowerCase());
    const idIdx = headers.indexOf("id");
    const nameIdx = headers.indexOf("name");
    const codeIdx = headers.indexOf("code");
    const catIdx = headers.indexOf("category");
    const unitIdx = headers.indexOf("unit");
    const statusIdx = headers.indexOf("status");
    const descIdx = headers.indexOf("description");

    if (nameIdx === -1 || codeIdx === -1 || catIdx === -1) {
      return { success: false, imported: 0, failed: 1, skipped: 0, errors: ["Missing required columns: name, code, category"] };
    }

    let imported = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 3) {
        failed++;
        errors.push(`Row ${i + 1}: Insufficient columns`);
        continue;
      }

      const code = row[codeIdx]?.trim();
      const name = row[nameIdx]?.trim();
      const category = row[catIdx]?.trim();

      if (!code || !name || !category) {
        failed++;
        errors.push(`Row ${i + 1}: Code, name, and category are mandatory`);
        continue;
      }

      const id = idIdx !== -1 && row[idIdx] ? row[idIdx].trim() : undefined;
      const unit = unitIdx !== -1 && row[unitIdx] ? row[unitIdx].trim() : "kg";
      const status = statusIdx !== -1 && row[statusIdx] ? row[statusIdx].trim() : "ACTIVE";
      const description = descIdx !== -1 ? row[descIdx]?.trim() : null;

      try {
        // Check for duplicates
        const existing = await prisma.metal.findFirst({
          where: { OR: [id ? { id } : {}, { code }] }
        });

        if (existing) {
          skipped++;
          continue;
        }

        await prisma.metal.create({
          data: {
            id,
            name,
            code,
            category,
            unit,
            status,
            description,
          }
        });
        imported++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${i + 1}: Database insertion failed - ${err.message}`);
      }
    }

    await this.logAudit("IMPORT_METALS", "Metal", { imported, failed, skipped });
    return { success: true, imported, failed, skipped, errors };
  }

  /**
   * 2. Import Grades
   * CSV Header: id,metalId,name,subGrade,multiplier,extraPrice,status
   */
  public static async importGrades(csvText: string): Promise<ImportResult> {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return { success: true, imported: 0, failed: 0, skipped: 0, errors: ["Empty CSV file"] };
    }

    const headers = rows[0].map(h => h.toLowerCase());
    const idIdx = headers.indexOf("id");
    const metalIdIdx = headers.indexOf("metalid");
    const nameIdx = headers.indexOf("name");
    const subIdx = headers.indexOf("subgrade");
    const multIdx = headers.indexOf("multiplier");
    const extraIdx = headers.indexOf("extraprice");
    const statusIdx = headers.indexOf("status");

    if (metalIdIdx === -1 || nameIdx === -1 || multIdx === -1) {
      return { success: false, imported: 0, failed: 1, skipped: 0, errors: ["Missing required columns: metalId, name, multiplier"] };
    }

    let imported = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 3) {
        failed++;
        errors.push(`Row ${i + 1}: Insufficient columns`);
        continue;
      }

      const metalIdOrCode = row[metalIdIdx]?.trim();
      const name = row[nameIdx]?.trim();
      const multiplierStr = row[multIdx]?.trim();

      if (!metalIdOrCode || !name || !multiplierStr) {
        failed++;
        errors.push(`Row ${i + 1}: metalId, name, and multiplier are mandatory`);
        continue;
      }

      const multiplier = Number(multiplierStr);
      if (isNaN(multiplier) || multiplier <= 0) {
        failed++;
        errors.push(`Row ${i + 1}: Multiplier must be greater than 0`);
        continue;
      }

      const id = idIdx !== -1 && row[idIdx] ? row[idIdx].trim() : undefined;
      const subGrade = subIdx !== -1 ? row[subIdx]?.trim() || "" : "";
      const extraPrice = extraIdx !== -1 && row[extraIdx] ? Number(row[extraIdx]) : 0;
      const status = statusIdx !== -1 && row[statusIdx] ? row[statusIdx].trim() : "ACTIVE";

      try {
        // Resolve metalId
        const metal = await prisma.metal.findFirst({
          where: { OR: [{ id: metalIdOrCode }, { code: metalIdOrCode }] }
        });

        if (!metal) {
          failed++;
          errors.push(`Row ${i + 1}: Metal code/ID '${metalIdOrCode}' not found`);
          continue;
        }

        // Check duplicate grade on metal + name + subGrade
        const existing = await prisma.grade.findFirst({
          where: {
            metalId: metal.id,
            name,
            subGrade
          }
        });

        if (existing) {
          skipped++;
          continue;
        }

        await prisma.grade.create({
          data: {
            id,
            metalId: metal.id,
            name,
            subGrade,
            multiplier: new Decimal(multiplier),
            extraPrice: new Decimal(extraPrice),
            mechanicalProperties: JSON.stringify({uts: "Standard", yieldStrength: "Standard", elongation: "Standard", hardness: "Standard"}),
            chemicalComposition: JSON.stringify({carbon: "Standard"}),
            toleranceProperties: JSON.stringify({}),
            bendProperties: JSON.stringify({}),
            status
          }
        });
        imported++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${i + 1}: Database insertion failed - ${err.message}`);
      }
    }

    await this.logAudit("IMPORT_GRADES", "Grade", { imported, failed, skipped });
    return { success: true, imported, failed, skipped, errors };
  }

  /**
   * 3. Import Price Master
   * CSV Header: id,metalId,rawMaterialId,supplierId,pricePerUnit,currency,unit,source,location,effectiveFrom,active
   */
  public static async importPrices(csvText: string): Promise<ImportResult> {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return { success: true, imported: 0, failed: 0, skipped: 0, errors: ["Empty CSV file"] };
    }

    const headers = rows[0].map(h => h.toLowerCase());
    const idIdx = headers.indexOf("id");
    const metalIdIdx = headers.indexOf("metalid");
    const rmIdx = headers.indexOf("rawmaterialid");
    const supIdx = headers.indexOf("supplierid");
    const priceIdx = headers.indexOf("priceperunit");
    const currIdx = headers.indexOf("currency");
    const unitIdx = headers.indexOf("unit");
    const sourceIdx = headers.indexOf("source");
    const locIdx = headers.indexOf("location");
    const effIdx = headers.indexOf("effectivefrom");
    const activeIdx = headers.indexOf("active");

    if (priceIdx === -1) {
      return { success: false, imported: 0, failed: 1, skipped: 0, errors: ["Missing required columns: pricePerUnit"] };
    }

    let imported = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Ensure we have a JSW supplier seed
    let defaultSupplier = await prisma.supplier.findFirst();
    if (!defaultSupplier) {
      defaultSupplier = await prisma.supplier.create({
        data: {
          name: "JSW Approved Supply Desk",
          code: "SUP-JSW-01",
          email: "supplierdesk@jsw.local"
        }
      });
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const priceStr = row[priceIdx]?.trim();
      if (!priceStr) {
        failed++;
        errors.push(`Row ${i + 1}: pricePerUnit is mandatory`);
        continue;
      }

      const price = Number(priceStr);
      if (isNaN(price) || price <= 0) {
        failed++;
        errors.push(`Row ${i + 1}: Price must be greater than 0`);
        continue;
      }

      const metalIdOrCode = metalIdIdx !== -1 ? row[metalIdIdx]?.trim() : null;
      const rmIdOrCode = rmIdx !== -1 ? row[rmIdx]?.trim() : null;
      const supCode = supIdx !== -1 ? row[supIdx]?.trim() : null;

      try {
        let metalId: string | null = null;
        let rawMaterialId: string | null = null;
        let supplierId = defaultSupplier.id;

        if (metalIdOrCode) {
          const metal = await prisma.metal.findFirst({
            where: { OR: [{ id: metalIdOrCode }, { code: metalIdOrCode }] }
          });
          if (metal) metalId = metal.id;
        }

        if (rmIdOrCode) {
          let rm = await prisma.rawMaterial.findFirst({
            where: { OR: [{ id: rmIdOrCode }, { code: rmIdOrCode }] }
          });
          if (!rm) {
            // Seed raw material if not found
            rm = await prisma.rawMaterial.create({
              data: {
                id: rmIdOrCode.startsWith("rm-") ? rmIdOrCode : undefined,
                code: rmIdOrCode.toUpperCase(),
                name: rmIdOrCode.toUpperCase(),
              }
            });
          }
          rawMaterialId = rm.id;
        }

        if (supCode) {
          let supplier = await prisma.supplier.findUnique({ where: { code: supCode } });
          if (!supplier) {
            supplier = await prisma.supplier.create({
              data: { name: supCode, code: supCode, email: "supply@desk.local" }
            });
          }
          supplierId = supplier.id;
        }

        const id = idIdx !== -1 && row[idIdx] ? row[idIdx].trim() : undefined;
        const currency = currIdx !== -1 && row[currIdx] ? row[currIdx].trim() : "INR";
        const unit = unitIdx !== -1 && row[unitIdx] ? row[unitIdx].trim() : "kg";
        const source = sourceIdx !== -1 && row[sourceIdx] ? row[sourceIdx].trim() : "CSV Import";
        const location = locIdx !== -1 && row[locIdx] ? row[locIdx].trim() : "India";
        const effectiveFrom = effIdx !== -1 && row[effIdx] ? new Date(row[effIdx]) : new Date();
        const active = activeIdx !== -1 ? row[activeIdx]?.trim().toLowerCase() === "true" : true;

        // Prevent duplicate active price for same metal/rm
        if (active) {
          await prisma.priceList.updateMany({
            where: { metalId, rawMaterialId, active: true },
            data: { active: false }
          });
        }

        await prisma.priceList.create({
          data: {
            id,
            metalId,
            rawMaterialId,
            supplierId,
            pricePerUnit: new Decimal(price),
            currency,
            unit,
            source,
            location,
            effectiveFrom,
            active
          }
        });
        imported++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${i + 1}: Database price insert failed - ${err.message}`);
      }
    }

    await this.logAudit("IMPORT_PRICES", "PriceList", { imported, failed, skipped });
    return { success: true, imported, failed, skipped, errors };
  }

  /**
   * 4. Import JSW Product Catalog
   * CSV Header: category,steelType,grade,subGrade,image,basePrice
   */
  public static async importJswCatalog(csvText: string): Promise<ImportResult> {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return { success: true, imported: 0, failed: 0, skipped: 0, errors: ["Empty CSV file"] };
    }

    const headers = rows[0].map(h => h.toLowerCase());
    const catIdx = headers.indexOf("category");
    const steelIdx = headers.indexOf("steeltype");
    const gradeIdx = headers.indexOf("grade");
    const subIdx = headers.indexOf("subgrade");
    const imgIdx = headers.indexOf("image");
    const priceIdx = headers.indexOf("baseprice");

    if (catIdx === -1 || steelIdx === -1 || gradeIdx === -1 || priceIdx === -1) {
      return { success: false, imported: 0, failed: 1, skipped: 0, errors: ["Missing catalog required columns: category, steelType, grade, basePrice"] };
    }

    let imported = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const category = row[catIdx]?.trim();
      const steelType = row[steelIdx]?.trim();
      const grade = row[gradeIdx]?.trim();
      const priceStr = row[priceIdx]?.trim();

      if (!category || !steelType || !grade || !priceStr) {
        failed++;
        errors.push(`Row ${i + 1}: Category, Steel Type, Grade, and Base Price are mandatory`);
        continue;
      }

      const basePrice = Number(priceStr);
      if (isNaN(basePrice) || basePrice < 0) {
        failed++;
        errors.push(`Row ${i + 1}: Base price must be 0 or greater`);
        continue;
      }

      const subGrade = subIdx !== -1 ? row[subIdx]?.trim() || "Standard" : "Standard";
      const image = imgIdx !== -1 ? row[imgIdx]?.trim() || "coil" : "coil";

      try {
        const existing = await prisma.jswProductCatalog.findUnique({
          where: {
            category_steelType_grade_subGrade: {
              category,
              steelType,
              grade,
              subGrade
            }
          }
        });

        if (existing) {
          await prisma.jswProductCatalog.update({
            where: { id: existing.id },
            data: { image, basePrice: new Decimal(basePrice) }
          });
          skipped++; // Count as skipped/updated
          continue;
        }

        await prisma.jswProductCatalog.create({
          data: {
            category,
            steelType,
            grade,
            subGrade,
            image,
            basePrice: new Decimal(basePrice)
          }
        });
        imported++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${i + 1}: Catalog insertion failed - ${err.message}`);
      }
    }

    await this.logAudit("IMPORT_CATALOG", "JswProductCatalog", { imported, failed, skipped });
    return { success: true, imported, failed, skipped, errors };
  }

  /**
   * 5. Import Mechanical Properties
   * CSV Header: id,gradeId,gradeName,uts,yieldStrength,elongation,hardness,thicknessTolerance,widthTolerance,flatnessTolerance,minBendRadius,bendRating,springback
   */
  public static async importMechanicalProperties(csvText: string): Promise<ImportResult> {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return { success: true, imported: 0, failed: 0, skipped: 0, errors: [] };
    }

    const headers = rows[0].map(h => h.toLowerCase());
    const idIdx = headers.indexOf("id");
    const gradeIdIdx = headers.indexOf("gradeid");
    const utsIdx = headers.indexOf("uts");
    const ysIdx = headers.indexOf("yieldstrength");
    const elIdx = headers.indexOf("elongation");
    const hdIdx = headers.indexOf("hardness");
    const thickIdx = headers.indexOf("thicknesstolerance");
    const widthIdx = headers.indexOf("widthtolerance");
    const flatIdx = headers.indexOf("flatnesstolerance");
    const bendIdx = headers.indexOf("minbendradius");
    const ratingIdx = headers.indexOf("bendrating");
    const springIdx = headers.indexOf("springback");

    if (gradeIdIdx === -1 || utsIdx === -1 || ysIdx === -1) {
      return { success: false, imported: 0, failed: 1, skipped: 0, errors: ["Missing columns: gradeId, uts, yieldStrength"] };
    }

    let imported = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const gradeIdOrName = row[gradeIdIdx]?.trim();
      const uts = row[utsIdx]?.trim();
      const yieldStrength = row[ysIdx]?.trim();

      if (!gradeIdOrName || !uts || !yieldStrength) {
        failed++;
        errors.push(`Row ${i + 1}: gradeId, uts, and yieldStrength are mandatory`);
        continue;
      }

      try {
        const grade = await prisma.grade.findFirst({
          where: { OR: [{ id: gradeIdOrName }, { name: gradeIdOrName }] }
        });

        if (!grade) {
          failed++;
          errors.push(`Row ${i + 1}: Grade '${gradeIdOrName}' not found`);
          continue;
        }

        const id = idIdx !== -1 && row[idIdx] ? row[idIdx].trim() : undefined;
        const elongation = elIdx !== -1 ? row[elIdx]?.trim() || "Standard" : "Standard";
        const hardness = hdIdx !== -1 ? row[hdIdx]?.trim() || "Standard" : "Standard";
        const thicknessTolerance = thickIdx !== -1 ? row[thickIdx]?.trim() || "Standard" : "Standard";
        const widthTolerance = widthIdx !== -1 ? row[widthIdx]?.trim() || "Standard" : "Standard";
        const flatnessTolerance = flatIdx !== -1 ? row[flatIdx]?.trim() || "Standard" : "Standard";
        const minBendRadius = bendIdx !== -1 ? row[bendIdx]?.trim() || "Standard" : "Standard";
        const bendRating = ratingIdx !== -1 ? row[ratingIdx]?.trim() || "Standard" : "Standard";
        const springback = springIdx !== -1 ? row[springIdx]?.trim() || "Standard" : "Standard";

        // Upsert into MechanicalProperty table
        await prisma.mechanicalProperty.upsert({
          where: { gradeId: grade.id },
          update: { uts, yieldStrength, elongation, hardness, thicknessTolerance, widthTolerance, flatnessTolerance, minBendRadius, bendRating, springback },
          create: { id, gradeId: grade.id, uts, yieldStrength, elongation, hardness, thicknessTolerance, widthTolerance, flatnessTolerance, minBendRadius, bendRating, springback }
        });

        // Sync back to JSON fields in Grade for retro-compatibility
        await prisma.grade.update({
          where: { id: grade.id },
          data: {
            mechanicalProperties: JSON.stringify({ uts, yieldStrength, elongation, hardness }),
            toleranceProperties: JSON.stringify({ thickness: thicknessTolerance, width: widthTolerance, flatness: flatnessTolerance }),
            bendProperties: JSON.stringify({ minimumRadius: minBendRadius, rating: bendRating, springback })
          }
        });

        imported++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${i + 1}: Mechanical Properties save failed - ${err.message}`);
      }
    }

    return { success: true, imported, failed, skipped, errors };
  }

  /**
   * 6. Import Chemical Properties
   * CSV Header: id,gradeId,gradeName,carbon,manganese,silicon,chromium,nickel,molybdenum,phosphorus,sulfur,aluminum,magnesium,iron,copper,zinc
   */
  public static async importChemicalProperties(csvText: string): Promise<ImportResult> {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return { success: true, imported: 0, failed: 0, skipped: 0, errors: [] };
    }

    const headers = rows[0].map(h => h.toLowerCase());
    const idIdx = headers.indexOf("id");
    const gradeIdIdx = headers.indexOf("gradeid");
    const cIdx = headers.indexOf("carbon");
    const mnIdx = headers.indexOf("manganese");
    const siIdx = headers.indexOf("silicon");
    const crIdx = headers.indexOf("chromium");
    const niIdx = headers.indexOf("nickel");
    const moIdx = headers.indexOf("molybdenum");
    const pIdx = headers.indexOf("phosphorus");
    const sIdx = headers.indexOf("sulfur");
    const alIdx = headers.indexOf("aluminum");
    const mgIdx = headers.indexOf("magnesium");
    const feIdx = headers.indexOf("iron");
    const cuIdx = headers.indexOf("copper");
    const znIdx = headers.indexOf("zinc");

    if (gradeIdIdx === -1) {
      return { success: false, imported: 0, failed: 1, skipped: 0, errors: ["Missing gradeId column"] };
    }

    let imported = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const gradeIdOrName = row[gradeIdIdx]?.trim();
      if (!gradeIdOrName) {
        failed++;
        errors.push(`Row ${i + 1}: gradeId is mandatory`);
        continue;
      }

      try {
        const grade = await prisma.grade.findFirst({
          where: { OR: [{ id: gradeIdOrName }, { name: gradeIdOrName }] }
        });

        if (!grade) {
          failed++;
          errors.push(`Row ${i + 1}: Grade '${gradeIdOrName}' not found`);
          continue;
        }

        const id = idIdx !== -1 && row[idIdx] ? row[idIdx].trim() : undefined;
        const carbon = cIdx !== -1 ? row[cIdx]?.trim() || null : null;
        const manganese = mnIdx !== -1 ? row[mnIdx]?.trim() || null : null;
        const silicon = siIdx !== -1 ? row[siIdx]?.trim() || null : null;
        const chromium = crIdx !== -1 ? row[crIdx]?.trim() || null : null;
        const nickel = niIdx !== -1 ? row[niIdx]?.trim() || null : null;
        const molybdenum = moIdx !== -1 ? row[moIdx]?.trim() || null : null;
        const phosphorus = pIdx !== -1 ? row[pIdx]?.trim() || null : null;
        const sulfur = sIdx !== -1 ? row[sIdx]?.trim() || null : null;
        const aluminum = alIdx !== -1 ? row[alIdx]?.trim() || null : null;
        const magnesium = mgIdx !== -1 ? row[mgIdx]?.trim() || null : null;
        const iron = feIdx !== -1 ? row[feIdx]?.trim() || null : null;
        const copper = cuIdx !== -1 ? row[cuIdx]?.trim() || null : null;
        const zinc = znIdx !== -1 ? row[znIdx]?.trim() || null : null;

        // Upsert structured ChemicalProperty
        await prisma.chemicalProperty.upsert({
          where: { gradeId: grade.id },
          update: { carbon, manganese, silicon, chromium, nickel, molybdenum, phosphorus, sulfur, aluminum, magnesium, iron, copper, zinc },
          create: { id, gradeId: grade.id, carbon, manganese, silicon, chromium, nickel, molybdenum, phosphorus, sulfur, aluminum, magnesium, iron, copper, zinc }
        });

        // Sync chemical composition JSON to Grade
        const jsonChem: any = {};
        if (carbon) jsonChem.carbon = carbon;
        if (manganese) jsonChem.manganese = manganese;
        if (silicon) jsonChem.silicon = silicon;
        if (chromium) jsonChem.chromium = chromium;
        if (nickel) jsonChem.nickel = nickel;
        if (molybdenum) jsonChem.molybdenum = molybdenum;
        if (phosphorus) jsonChem.phosphorus = phosphorus;
        if (sulfur) jsonChem.sulfur = sulfur;
        if (aluminum) jsonChem.aluminum = aluminum;
        if (magnesium) jsonChem.magnesium = magnesium;
        if (iron) jsonChem.iron = iron;
        if (copper) jsonChem.copper = copper;
        if (zinc) jsonChem.zinc = zinc;

        await prisma.grade.update({
          where: { id: grade.id },
          data: { chemicalComposition: JSON.stringify(jsonChem) }
        });

        imported++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${i + 1}: Chemical Properties save failed - ${err.message}`);
      }
    }

    return { success: true, imported, failed, skipped, errors };
  }

  /**
   * 7. Import Alloy Compositions
   * CSV Header: id,alloyCode,alloyName,alloyType,metalId,gradeId,rawMaterialId,compositionPercent,quantity
   */
  public static async importAlloys(csvText: string): Promise<ImportResult> {
    const rows = parseCSV(csvText);
    if (rows.length === 0) return { success: true, imported: 0, failed: 0, skipped: 0, errors: [] };

    const headers = rows[0].map(h => h.toLowerCase());
    const idIdx = headers.indexOf("id");
    const codeIdx = headers.indexOf("alloycode");
    const nameIdx = headers.indexOf("alloyname");
    const typeIdx = headers.indexOf("alloytype");
    const metalIdx = headers.indexOf("metalid");
    const gradeIdx = headers.indexOf("gradeid");
    const rmIdx = headers.indexOf("rawmaterialid");
    const compIdx = headers.indexOf("compositionpercent");
    const qtyIdx = headers.indexOf("quantity");

    if (codeIdx === -1 || nameIdx === -1 || compIdx === -1) {
      return { success: false, imported: 0, failed: 1, skipped: 0, errors: ["Missing alloy fields"] };
    }

    let imported = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const alloyCode = row[codeIdx]?.trim();
      const alloyName = row[nameIdx]?.trim();
      const compPercent = Number(row[compIdx]);

      if (!alloyCode || !alloyName || isNaN(compPercent)) {
        failed++;
        errors.push(`Row ${i + 1}: Alloy Code, Name, and Composition % are mandatory`);
        continue;
      }

      const alloyType = typeIdx !== -1 ? row[typeIdx]?.trim() || "Stainless Steel" : "Stainless Steel";
      const metalIdOrCode = metalIdx !== -1 ? row[metalIdx]?.trim() : null;
      const gradeIdOrName = gradeIdx !== -1 ? row[gradeIdx]?.trim() : null;
      const rmIdOrCode = rmIdx !== -1 ? row[rmIdx]?.trim() : null;

      try {
        // Upsert main Alloy
        const alloy = await prisma.alloy.upsert({
          where: { code: alloyCode },
          update: { name: alloyName, type: alloyType },
          create: { code: alloyCode, name: alloyName, type: alloyType }
        });

        let metalId: string | null = null;
        let gradeId: string | null = null;
        let rawMaterialId: string | null = null;

        if (metalIdOrCode) {
          const metal = await prisma.metal.findFirst({
            where: { OR: [{ id: metalIdOrCode }, { code: metalIdOrCode }] }
          });
          if (metal) metalId = metal.id;
        }

        if (gradeIdOrName) {
          const grade = await prisma.grade.findFirst({
            where: { OR: [{ id: gradeIdOrName }, { name: gradeIdOrName }] }
          });
          if (grade) gradeId = grade.id;
        }

        if (rmIdOrCode) {
          const rm = await prisma.rawMaterial.findFirst({
            where: { OR: [{ id: rmIdOrCode }, { code: rmIdOrCode }] }
          });
          if (rm) rawMaterialId = rm.id;
        }

        const id = idIdx !== -1 && row[idIdx] ? row[idIdx].trim() : undefined;
        const quantity = qtyIdx !== -1 && row[qtyIdx] ? Number(row[qtyIdx]) : null;

        await prisma.alloyComponent.create({
          data: {
            id,
            alloyId: alloy.id,
            metalId,
            gradeId,
            rawMaterialId,
            compositionPercent: new Decimal(compPercent),
            quantity: quantity ? new Decimal(quantity) : null
          }
        });

        imported++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${i + 1}: Alloy component load failed - ${err.message}`);
      }
    }

    return { success: true, imported, failed, skipped, errors };
  }

  /**
   * 8. Import Users
   */
  public static async importUsers(csvText: string): Promise<ImportResult> {
    const rows = parseCSV(csvText);
    if (rows.length === 0) return { success: true, imported: 0, failed: 0, skipped: 0, errors: [] };

    const headers = rows[0].map(h => h.toLowerCase());
    const idIdx = headers.indexOf("id");
    const nameIdx = headers.indexOf("name");
    const emailIdx = headers.indexOf("email");
    const pwIdx = headers.indexOf("passwordhash");
    const depIdx = headers.indexOf("department");
    const statusIdx = headers.indexOf("status");
    const roleIdx = headers.indexOf("rolename");

    if (emailIdx === -1 || nameIdx === -1) {
      return { success: false, imported: 0, failed: 1, skipped: 0, errors: ["Missing name or email columns"] };
    }

    let imported = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Ensure Roles exist
    const costingRole = await prisma.role.upsert({ where: { name: "COSTING_DEPARTMENT" }, update: {}, create: { name: "COSTING_DEPARTMENT", description: "Costing Department" } });
    const pdqcRole = await prisma.role.upsert({ where: { name: "PDQC" }, update: {}, create: { name: "PDQC", description: "PDQC Team" } });

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const email = row[emailIdx]?.trim();
      const name = row[nameIdx]?.trim();
      if (!email || !name) {
        failed++;
        continue;
      }

      const id = idIdx !== -1 && row[idIdx] ? row[idIdx].trim() : undefined;
      const passHash = pwIdx !== -1 && row[pwIdx] ? row[pwIdx].trim() : await bcrypt.hash("MCMS@2026", 12);
      const department = depIdx !== -1 ? row[depIdx]?.trim() : "Operations";
      const status = statusIdx !== -1 ? row[statusIdx]?.trim() : "ACTIVE";
      const roleName = roleIdx !== -1 ? row[roleIdx]?.trim().toUpperCase() : "PDQC";

      const activeRole = roleName === "COSTING_DEPARTMENT" ? costingRole : pdqcRole;

      try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          skipped++;
          continue;
        }

        await prisma.user.create({
          data: {
            id,
            name,
            email,
            passwordHash: passHash,
            department,
            status,
            roleId: activeRole.id
          }
        });
        imported++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${i + 1}: User save failed - ${err.message}`);
      }
    }

    return { success: true, imported, failed, skipped, errors };
  }

  /**
   * 9. Import Calculations
   */
  public static async importCalculations(csvText: string): Promise<ImportResult> {
    const rows = parseCSV(csvText);
    if (rows.length === 0) return { success: true, imported: 0, failed: 0, skipped: 0, errors: [] };

    const headers = rows[0].map(h => h.toLowerCase());
    const idIdx = headers.indexOf("id");
    const batchIdx = headers.indexOf("batchid");
    const nameIdx = headers.indexOf("name");
    const modeIdx = headers.indexOf("mode");
    const userIdx = headers.indexOf("userid");
    const alloyIdx = headers.indexOf("alloyid");
    const qtyIdx = headers.indexOf("totalquantity");
    const baseIdx = headers.indexOf("basecost");
    const gstIdx = headers.indexOf("gstamount");
    const finalIdx = headers.indexOf("finalcost");
    const statusIdx = headers.indexOf("status");
    const compIdx = headers.indexOf("completedat");

    if (batchIdx === -1 || nameIdx === -1 || userIdx === -1) {
      return { success: false, imported: 0, failed: 1, skipped: 0, errors: ["Missing calculation catalog fields"] };
    }

    let imported = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Ensure we have a default user to fall back on
    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      const costingRole = await prisma.role.upsert({ where: { name: "COSTING_DEPARTMENT" }, update: {}, create: { name: "COSTING_DEPARTMENT" } });
      defaultUser = await prisma.user.create({
        data: { name: "System Admin", email: "admin@jsw-mcms.local", passwordHash: "dummy", roleId: costingRole.id }
      });
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const batchId = row[batchIdx]?.trim();
      const name = row[nameIdx]?.trim();
      const userRef = row[userIdx]?.trim();

      if (!batchId || !name || !userRef) {
        failed++;
        continue;
      }

      try {
        const existing = await prisma.calculation.findUnique({ where: { batchId } });
        if (existing) {
          skipped++;
          continue;
        }

        let user = await prisma.user.findFirst({
          where: { OR: [{ id: userRef }, { email: userRef }] }
        });
        const userId = user ? user.id : defaultUser.id;

        const id = idIdx !== -1 && row[idIdx] ? row[idIdx].trim() : undefined;
        const mode = modeIdx !== -1 ? row[modeIdx]?.trim() || "metal" : "metal";
        const alloyRef = alloyIdx !== -1 ? row[alloyIdx]?.trim() : null;
        
        let alloyId: string | null = null;
        if (alloyRef) {
          const alloy = await prisma.alloy.findFirst({ where: { OR: [{ id: alloyRef }, { code: alloyRef }] } });
          if (alloy) alloyId = alloy.id;
        }

        const totalQuantity = qtyIdx !== -1 && row[qtyIdx] ? Number(row[qtyIdx]) : 100;
        const baseCost = baseIdx !== -1 && row[baseIdx] ? Number(row[baseIdx]) : 0;
        const gstAmount = gstIdx !== -1 && row[gstIdx] ? Number(row[gstIdx]) : 0;
        const finalCost = finalIdx !== -1 && row[finalIdx] ? Number(row[finalIdx]) : baseCost;
        const status = statusIdx !== -1 && row[statusIdx]?.trim().toUpperCase() === "COMPLETED" ? "COMPLETED" : "DRAFT";
        const completedAt = compIdx !== -1 && row[compIdx] ? new Date(row[compIdx]) : null;

        await prisma.calculation.create({
          data: {
            id,
            batchId,
            name,
            mode,
            userId,
            alloyId,
            totalQuantity: new Decimal(totalQuantity),
            baseCost: new Decimal(baseCost),
            gstAmount: new Decimal(gstAmount),
            finalCost: new Decimal(finalCost),
            status,
            completedAt,
            snapshot: JSON.stringify({ version: 1, pricedAt: new Date().toISOString(), items: [] })
          }
        });
        imported++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${i + 1}: Calculation save failed - ${err.message}`);
      }
    }

    return { success: true, imported, failed, skipped, errors };
  }

  /**
   * 10. Import Comparison Table
   */
  public static async importComparisons(csvText: string): Promise<ImportResult> {
    const rows = parseCSV(csvText);
    if (rows.length === 0) return { success: true, imported: 0, failed: 0, skipped: 0, errors: [] };

    const headers = rows[0].map(h => h.toLowerCase());
    const idIdx = headers.indexOf("id");
    const nameIdx = headers.indexOf("name");
    const gradeIdx = headers.indexOf("gradeids");
    const userIdx = headers.indexOf("userid");

    if (nameIdx === -1 || gradeIdx === -1) {
      return { success: false, imported: 0, failed: 1, skipped: 0, errors: ["Missing comparison columns"] };
    }

    let imported = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const name = row[nameIdx]?.trim();
      const gradeIdsStr = row[gradeIdx]?.trim();

      if (!name || !gradeIdsStr) {
        failed++;
        continue;
      }

      try {
        const id = idIdx !== -1 && row[idIdx] ? row[idIdx].trim() : undefined;
        const userRef = userIdx !== -1 ? row[userIdx]?.trim() : null;
        let userId: string | null = null;
        if (userRef) {
          const user = await prisma.user.findFirst({ where: { OR: [{ id: userRef }, { email: userRef }] } });
          if (user) userId = user.id;
        }

        // Parse grade IDs array safely
        let gradeIds: string[] = [];
        try {
          gradeIds = JSON.parse(gradeIdsStr);
        } catch {
          gradeIds = gradeIdsStr.split(";").map(id => id.trim());
        }

        await prisma.comparisonRecord.create({
          data: {
            id,
            name,
            gradeIds: JSON.stringify(gradeIds),
            userId
          }
        });
        imported++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${i + 1}: Comparison save failed - ${err.message}`);
      }
    }

    return { success: true, imported, failed, skipped, errors };
  }

  /**
   * 11. Import Notifications
   */
  public static async importNotifications(csvText: string): Promise<ImportResult> {
    const rows = parseCSV(csvText);
    if (rows.length === 0) return { success: true, imported: 0, failed: 0, skipped: 0, errors: [] };

    const headers = rows[0].map(h => h.toLowerCase());
    const idIdx = headers.indexOf("id");
    const userIdx = headers.indexOf("userid");
    const titleIdx = headers.indexOf("title");
    const msgIdx = headers.indexOf("message");
    const catIdx = headers.indexOf("category");
    const priIdx = headers.indexOf("priority");
    const readIdx = headers.indexOf("readat");

    if (titleIdx === -1 || msgIdx === -1) {
      return { success: false, imported: 0, failed: 1, skipped: 0, errors: ["Missing notification columns"] };
    }

    let imported = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const title = row[titleIdx]?.trim();
      const message = row[msgIdx]?.trim();

      if (!title || !message) {
        failed++;
        continue;
      }

      try {
        const id = idIdx !== -1 && row[idIdx] ? row[idIdx].trim() : undefined;
        const userRef = userIdx !== -1 ? row[userIdx]?.trim() : null;
        let userId: string | null = null;
        if (userRef) {
          const user = await prisma.user.findFirst({ where: { OR: [{ id: userRef }, { email: userRef }] } });
          if (user) userId = user.id;
        }

        const category = catIdx !== -1 ? row[catIdx]?.trim() || "SYSTEM" : "SYSTEM";
        const priority = priIdx !== -1 && ["LOW", "MEDIUM", "HIGH"].includes(row[priIdx]?.trim().toUpperCase())
          ? (row[priIdx]?.trim().toUpperCase() as any)
          : "MEDIUM";
        const readAt = readIdx !== -1 && row[readIdx] ? new Date(row[readIdx]) : null;

        await prisma.notification.create({
          data: {
            id,
            userId,
            title,
            message,
            category,
            priority,
            readAt
          }
        });
        imported++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${i + 1}: Notification save failed - ${err.message}`);
      }
    }

    return { success: true, imported, failed, skipped, errors };
  }

  /**
   * 12. Import Audit Logs
   */
  public static async importAuditLogs(csvText: string): Promise<ImportResult> {
    const rows = parseCSV(csvText);
    if (rows.length === 0) return { success: true, imported: 0, failed: 0, skipped: 0, errors: [] };

    const headers = rows[0].map(h => h.toLowerCase());
    const idIdx = headers.indexOf("id");
    const userIdx = headers.indexOf("userid");
    const actIdx = headers.indexOf("action");
    const entIdx = headers.indexOf("entity");
    const entIdIdx = headers.indexOf("entityid");
    const ipIdx = headers.indexOf("ipaddress");
    const detIdx = headers.indexOf("details");

    if (actIdx === -1 || entIdx === -1) {
      return { success: false, imported: 0, failed: 1, skipped: 0, errors: ["Missing action or entity columns"] };
    }

    let imported = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const action = row[actIdx]?.trim();
      const entity = row[entIdx]?.trim();

      if (!action || !entity) {
        failed++;
        continue;
      }

      try {
        const id = idIdx !== -1 && row[idIdx] ? row[idIdx].trim() : undefined;
        const userRef = userIdx !== -1 ? row[userIdx]?.trim() : null;
        let userId: string | null = null;
        if (userRef) {
          const user = await prisma.user.findFirst({ where: { OR: [{ id: userRef }, { email: userRef }] } });
          if (user) userId = user.id;
        }

        const entityId = entIdIdx !== -1 ? row[entIdIdx]?.trim() || null : null;
        const ipAddress = ipIdx !== -1 ? row[ipIdx]?.trim() || "127.0.0.1" : "127.0.0.1";
        const detailsStr = detIdx !== -1 ? row[detIdx]?.trim() || "{}" : "{}";
        let details = {};
        try {
          details = JSON.parse(detailsStr);
        } catch {
          details = { raw: detailsStr };
        }

        await prisma.auditLog.create({
          data: {
            id,
            userId,
            action,
            entity,
            entityId,
            ipAddress,
            details: JSON.stringify(details)
          }
        });
        imported++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${i + 1}: Audit log save failed - ${err.message}`);
      }
    }

    return { success: true, imported, failed, skipped, errors };
  }
}
