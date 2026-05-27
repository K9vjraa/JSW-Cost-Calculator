import { Router } from "express";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { asyncRoute, ApiError } from "../utils/http.js";
import { prisma } from "../prisma/client.js";
import { audit } from "../services/audit.js";

function attachPdf(res: any, fileName: string) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  return new PDFDocument({ margin: 42, size: "A4" });
}

function money(value: unknown) {
  return `INR ${Number(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

async function costRows(reportId?: string) {
  if (reportId) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new ApiError(404, "Report not found.");
  }
  return prisma.calculation.findMany({ include: { user: { select: { name: true } }, items: true }, orderBy: { createdAt: "desc" }, take: 250 });
}

export const exportRoutes = Router();

exportRoutes.get("/calculations/:id/pdf", asyncRoute(async (req, res) => {
  const calculation = await prisma.calculation.findUnique({ where: { id: String(req.params.id) }, include: { user: { select: { name: true } }, items: true } });
  if (!calculation) throw new ApiError(404, "Calculation not found.");
  const doc = attachPdf(res, `${calculation.batchId}.pdf`);
  doc.pipe(res);
  doc.fontSize(20).fillColor("#002b63").text("JSW Metal Cost Management System");
  doc.moveDown(0.4).fontSize(13).fillColor("#111111").text(`Calculation Receipt: ${calculation.batchId}`);
  doc.fontSize(10).text(`Created by: ${calculation.user.name}`);
  doc.text(`Mode: ${calculation.mode}`);
  doc.text(`Created: ${calculation.createdAt.toLocaleString("en-IN")}`);
  doc.moveDown().fontSize(12).text("Items");
  calculation.items.forEach((item) => {
    doc.fontSize(10).text(`${item.itemName} | ${item.quantity.toString()} kg | ${money(item.unitPrice)} / kg | Base ${money(item.baseCost)}`);
  });
  doc.moveDown().fontSize(12).text("Cost Breakdown");
  doc.fontSize(10).text(`Material Cost: ${money(calculation.baseCost)}`);
  doc.moveDown().fontSize(16).fillColor("#002b63").text(`Final Total: ${money(calculation.finalCost)}`);
  doc.end();
  await audit({ userId: req.actor!.id, action: "EXPORT_PDF", entity: "Calculation", entityId: calculation.id, details: { batchId: calculation.batchId }, ipAddress: req.ip });
}));

exportRoutes.get("/reports/:reportId/pdf", asyncRoute(async (req, res) => {
  const reportId = String(req.params.reportId);
  const rows = await costRows(reportId);
  const doc = attachPdf(res, "mcms-cost-report.pdf");
  doc.pipe(res);
  doc.fontSize(20).fillColor("#002b63").text("MCMS Cost Summary Report");
  doc.moveDown().fontSize(10).fillColor("#111111").text(`Generated ${new Date().toLocaleString("en-IN")}`);
  rows.forEach((row) => doc.moveDown(0.4).text(`${row.batchId} | ${row.name} | ${row.status} | Qty ${row.totalQuantity.toString()} | ${money(row.finalCost)}`));
  doc.end();
  await audit({ userId: req.actor!.id, action: "EXPORT_PDF", entity: "Report", entityId: reportId, details: { rows: rows.length }, ipAddress: req.ip });
}));

exportRoutes.get("/reports/:reportId/excel", asyncRoute(async (req, res) => {
  const reportId = String(req.params.reportId);
  const rows = await costRows(reportId);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Cost Summary");
  sheet.columns = [
    { header: "Batch ID", key: "batchId", width: 18 },
    { header: "Calculation", key: "name", width: 24 },
    { header: "Status", key: "status", width: 14 },
    { header: "Quantity (kg)", key: "quantity", width: 16 },
    { header: "Material Cost", key: "baseCost", width: 18 },
    { header: "Final Cost", key: "finalCost", width: 18 }
  ];
  rows.forEach((row) => sheet.addRow({ batchId: row.batchId, name: row.name, status: row.status, quantity: Number(row.totalQuantity), baseCost: Number(row.baseCost), finalCost: Number(row.finalCost) }));
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF002B63" } };
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="mcms-cost-report.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
  await audit({ userId: req.actor!.id, action: "EXPORT_EXCEL", entity: "Report", entityId: reportId, details: { rows: rows.length }, ipAddress: req.ip });
}));
