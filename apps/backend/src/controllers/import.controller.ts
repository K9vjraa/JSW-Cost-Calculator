import { Request, Response } from "express";
import { CsvImportService, type ImportResult } from "../services/csvImport.service.js";
import { asyncRoute } from "../utils/http.js";
import { prisma } from "../prisma/client.js";

/**
 * Controller to handle master data CSV imports.
 */
export const importMetals = asyncRoute(async (req: Request, res: Response) => {
  const { csvText } = req.body;
  if (!csvText) {
    res.status(400).json({ success: false, message: "csvText is required in body" });
    return;
  }
  const result = await CsvImportService.importMetals(csvText);
  res.json(result);
});

export const importGrades = asyncRoute(async (req: Request, res: Response) => {
  const { csvText } = req.body;
  if (!csvText) {
    res.status(400).json({ success: false, message: "csvText is required in body" });
    return;
  }
  const result = await CsvImportService.importGrades(csvText);
  res.json(result);
});

export const importPrices = asyncRoute(async (req: Request, res: Response) => {
  const { csvText } = req.body;
  if (!csvText) {
    res.status(400).json({ success: false, message: "csvText is required in body" });
    return;
  }
  const result = await CsvImportService.importPrices(csvText);
  res.json(result);
});

export const importAll = asyncRoute(async (req: Request, res: Response) => {
  const {
    metalsCsv,
    gradesCsv,
    pricesCsv,
    mechCsv,
    chemCsv,
    alloysCsv,
    usersCsv,
    calcsCsv,
    compsCsv,
    notifsCsv,
    auditsCsv,
    catalogCsv
  } = req.body;

  let imported = 0;
  let failed = 0;
  let skipped = 0;
  const errors: string[] = [];

  const runImport = async (name: string, csv: string | undefined, fn: (text: string) => Promise<ImportResult>) => {
    if (!csv) return;
    try {
      const res = await fn(csv);
      imported += res.imported;
      failed += res.failed;
      skipped += res.skipped;
      if (res.errors) errors.push(...res.errors.map(e => `[${name}] ${e}`));
    } catch (e: any) {
      failed++;
      errors.push(`[${name}] General Import Crash: ${e.message}`);
    }
  };

  await runImport("Users", usersCsv, CsvImportService.importUsers.bind(CsvImportService));
  await runImport("Metals", metalsCsv, CsvImportService.importMetals.bind(CsvImportService));
  await runImport("Grades", gradesCsv, CsvImportService.importGrades.bind(CsvImportService));
  await runImport("MechanicalProperties", mechCsv, CsvImportService.importMechanicalProperties.bind(CsvImportService));
  await runImport("ChemicalProperties", chemCsv, CsvImportService.importChemicalProperties.bind(CsvImportService));
  await runImport("Prices", pricesCsv, CsvImportService.importPrices.bind(CsvImportService));
  await runImport("Alloys", alloysCsv, CsvImportService.importAlloys.bind(CsvImportService));
  await runImport("Calculations", calcsCsv, CsvImportService.importCalculations.bind(CsvImportService));
  await runImport("Comparisons", compsCsv, CsvImportService.importComparisons.bind(CsvImportService));
  await runImport("Notifications", notifsCsv, CsvImportService.importNotifications.bind(CsvImportService));
  await runImport("AuditLogs", auditsCsv, CsvImportService.importAuditLogs.bind(CsvImportService));
  await runImport("Catalog", catalogCsv, CsvImportService.importJswCatalog.bind(CsvImportService));

  res.json({
    success: failed === 0,
    imported,
    failed,
    skipped,
    errors
  });
});

/**
 * Controller to fetch dynamic JSW product catalog entries.
 */
export const getCatalog = asyncRoute(async (_req: Request, res: Response) => {
  const catalog = await prisma.jswProductCatalog.findMany({
    orderBy: [
      { category: "asc" },
      { steelType: "asc" },
      { grade: "asc" }
    ]
  });
  res.json({ data: catalog });
});
