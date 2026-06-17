import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { CsvImportService } from "../services/csvImport.service.js";
import { prisma } from "../prisma/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🌱 Seeding JSW metals master data...");
  const filePath = path.join(__dirname, "../data/metals.csv");
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: metals.csv not found at ${filePath}`);
    process.exit(1);
  }

  const csvText = fs.readFileSync(filePath, "utf-8");
  const result = await CsvImportService.importMetals(csvText);

  console.log(" metals seed results:", {
    imported: result.imported,
    skipped: result.skipped,
    failed: result.failed,
    errors: result.errors,
  });
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((err) => {
    console.error("Metals seed error:", err);
    process.exit(1);
  });
