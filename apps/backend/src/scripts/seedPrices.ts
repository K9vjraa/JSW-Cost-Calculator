import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { CsvImportService } from "../services/csvImport.service.js";
import { prisma } from "../prisma/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🌱 Seeding JSW price master data...");
  const filePath = path.join(__dirname, "../data/price_master.csv");

  if (!fs.existsSync(filePath)) {
    console.error(`Error: price_master.csv not found at ${filePath}`);
    process.exit(1);
  }

  const csvText = fs.readFileSync(filePath, "utf-8");
  const result = await CsvImportService.importPrices(csvText);

  console.log(" price list seed results:", {
    imported: result.imported,
    skipped: result.skipped,
    failed: result.failed,
  });
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((err) => {
    console.error("Prices seed error:", err);
    process.exit(1);
  });
