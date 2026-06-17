import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { CsvImportService } from "../services/csvImport.service.js";
import { prisma } from "../prisma/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🌱 Seeding JSW grades, mechanical and chemical spec properties...");
  
  const gradesPath = path.join(__dirname, "../data/grades.csv");
  const mechPath = path.join(__dirname, "../data/mechanical_properties.csv");
  const chemPath = path.join(__dirname, "../data/chemical_composition.csv");

  // 1. Grades
  if (fs.existsSync(gradesPath)) {
    const csv = fs.readFileSync(gradesPath, "utf-8");
    const res = await CsvImportService.importGrades(csv);
    console.log(" grades seed results:", { imported: res.imported, skipped: res.skipped, failed: res.failed });
  } else {
    console.error("grades.csv not found");
  }

  // 2. Mechanical Spec Properties
  if (fs.existsSync(mechPath)) {
    const csv = fs.readFileSync(mechPath, "utf-8");
    const res = await CsvImportService.importMechanicalProperties(csv);
    console.log(" mechanical properties seed results:", { imported: res.imported, failed: res.failed });
  } else {
    console.error("mechanical_properties.csv not found");
  }

  // 3. Chemical Spec Composition
  if (fs.existsSync(chemPath)) {
    const csv = fs.readFileSync(chemPath, "utf-8");
    const res = await CsvImportService.importChemicalProperties(csv);
    console.log(" chemical composition seed results:", { imported: res.imported, failed: res.failed });
  } else {
    console.error("chemical_composition.csv not found");
  }
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((err) => {
    console.error("Grades seed error:", err);
    process.exit(1);
  });
