import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { CsvImportService } from "../services/csvImport.service.js";
import { prisma } from "../prisma/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Start JSW MCMS Sequential Seeding of 12 CSV Files...");

  const files = [
    { name: "users.csv", action: CsvImportService.importUsers.bind(CsvImportService) },
    { name: "metals.csv", action: CsvImportService.importMetals.bind(CsvImportService) },
    { name: "grades.csv", action: CsvImportService.importGrades.bind(CsvImportService) },
    { name: "mechanical_properties.csv", action: CsvImportService.importMechanicalProperties.bind(CsvImportService) },
    { name: "chemical_composition.csv", action: CsvImportService.importChemicalProperties.bind(CsvImportService) },
    { name: "price_master.csv", action: CsvImportService.importPrices.bind(CsvImportService) },
    { name: "alloy_composition.csv", action: CsvImportService.importAlloys.bind(CsvImportService) },
    { name: "calculations.csv", action: CsvImportService.importCalculations.bind(CsvImportService) },
    { name: "comparison_table.csv", action: CsvImportService.importComparisons.bind(CsvImportService) },
    { name: "notifications.csv", action: CsvImportService.importNotifications.bind(CsvImportService) },
    { name: "audit_logs.csv", action: CsvImportService.importAuditLogs.bind(CsvImportService) },
    { name: "jsw_product_catalog.csv", action: CsvImportService.importJswCatalog.bind(CsvImportService) }
  ];

  for (const file of files) {
    const filePath = path.join(__dirname, `../data/${file.name}`);
    if (fs.existsSync(filePath)) {
      console.log(`⏳ Seeding file: ${file.name}`);
      const csv = fs.readFileSync(filePath, "utf-8");
      const res = await file.action(csv);
      console.log(`✅ Finished ${file.name} - Imported: ${res.imported}, Skipped: ${res.skipped}, Failed: ${res.failed}`);
    } else {
      console.error(`⚠️ CSV file not found at ${filePath}`);
    }
  }

  console.log("🎉 Seeding completed for all JSW MCMS Master Datasets!");
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((err) => {
    console.error("Master Seeding Failure:", err);
    process.exit(1);
  });
