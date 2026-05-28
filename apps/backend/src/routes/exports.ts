import { Router, type Response } from "express";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { asyncRoute, ApiError } from "../utils/http.js";
import { prisma } from "../prisma/client.js";
import { audit } from "../services/audit.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function money(value: unknown) {
  return `INR ${Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function moneyNum(value: unknown) {
  return Number(value ?? 0);
}

function attachPdf(res: Response, fileName: string) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  return new PDFDocument({ margin: 42, size: "A4", bufferPages: false });
}

/** Fetch calculations for report, optionally scoped to a report record */
async function calcRows(reportId?: string) {
  if (reportId) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new ApiError(404, "Report not found.");
  }
  return prisma.calculation.findMany({
    include: { user: { select: { name: true } }, items: true },
    orderBy: { createdAt: "desc" },
    take: 500
  });
}

/** CSV-escape a cell value */
function csvCell(value: unknown): string {
  const s = String(value ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(",");
}

// ── Header block shared by all PDFs ───────────────────────────────────────────
function pdfHeader(doc: InstanceType<typeof PDFDocument>, title: string, subtitle?: string) {
  doc.rect(0, 0, doc.page.width, 80).fill("#002b63");
  doc.fillColor("#ffffff").fontSize(18).font("Helvetica-Bold")
    .text("JSW Metal Cost Management System", 42, 20, { width: doc.page.width - 84 });
  doc.fontSize(11).font("Helvetica")
    .text(title, 42, 44, { width: doc.page.width - 84 });
  if (subtitle) {
    doc.fontSize(9).fillColor("#c8d8f0").text(subtitle, 42, 60);
  }
  doc.fillColor("#111111").moveDown(2.5);
}

function pdfDivider(doc: InstanceType<typeof PDFDocument>) {
  doc.moveTo(42, doc.y).lineTo(doc.page.width - 42, doc.y).strokeColor("#d6dfeb").lineWidth(0.5).stroke();
  doc.moveDown(0.5);
}

// ── Router ────────────────────────────────────────────────────────────────────

export const exportRoutes = Router();

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATION PDF — single calculation receipt
// ─────────────────────────────────────────────────────────────────────────────
exportRoutes.get(
  "/calculations/:id/pdf",
  asyncRoute(async (req, res) => {
    const calculation = await prisma.calculation.findUnique({
      where: { id: String(req.params.id) },
      include: { user: { select: { name: true } }, items: true, alloy: true }
    });
    if (!calculation) throw new ApiError(404, "Calculation not found.");
    if (
      req.actor!.role !== "ADMIN" &&
      req.actor!.role !== "EMPLOYEE" &&
      calculation.userId !== req.actor!.id
    ) {
      throw new ApiError(403, "Access denied.");
    }

    const doc = attachPdf(res, `${calculation.batchId}.pdf`);
    doc.pipe(res);

    pdfHeader(
      doc,
      `Calculation Receipt: ${calculation.batchId}`,
      `${calculation.name} · ${calculation.mode.toUpperCase()} mode`
    );

    // Meta table
    const meta = [
      ["Batch ID", calculation.batchId],
      ["Created By", calculation.user.name],
      ["Status", calculation.status],
      ["Mode", calculation.mode],
      ["Created", calculation.createdAt.toLocaleString("en-IN")],
      ...(calculation.alloy ? [["Alloy", calculation.alloy.name]] : [])
    ];
    meta.forEach(([label, val]) => {
      doc.fontSize(9).fillColor("#56657a").font("Helvetica-Bold").text(label, 42, doc.y, { continued: true, width: 120 });
      doc.fillColor("#10233d").font("Helvetica").text(val ?? "", { align: "left" });
    });

    doc.moveDown();
    pdfDivider(doc);

    // Items table header
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#002b63").text("Cost Items", 42);
    doc.moveDown(0.3);

    doc.fontSize(8).fillColor("#56657a").font("Helvetica-Bold");
    doc.text("Item", 42, doc.y, { width: 200, continued: true });
    doc.text("Qty (kg)", 242, doc.y, { width: 70, continued: true });
    doc.text("Unit Price", 312, doc.y, { width: 80, continued: true });
    doc.text("Multiplier", 392, doc.y, { width: 60, continued: true });
    doc.text("Base Cost", 452, doc.y, { width: 80, align: "right" });
    doc.moveDown(0.3);
    pdfDivider(doc);

    doc.font("Helvetica").fillColor("#10233d").fontSize(8);
    calculation.items.forEach((item) => {
      doc.text(item.itemName, 42, doc.y, { width: 200, continued: true });
      doc.text(Number(item.quantity).toFixed(2), 242, doc.y, { width: 70, continued: true });
      doc.text(money(item.unitPrice), 312, doc.y, { width: 80, continued: true });
      doc.text(Number(item.gradeMultiplier).toFixed(3), 392, doc.y, { width: 60, continued: true });
      doc.text(money(item.baseCost), 452, doc.y, { width: 80, align: "right" });
    });

    doc.moveDown();
    pdfDivider(doc);

    // Cost breakdown
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#002b63").text("Cost Breakdown", 42);
    doc.moveDown(0.3);

    const snap = calculation.snapshot as any;
    const charges: Array<{ name: string; computedAmount: string; isCredit: boolean }> =
      snap?.charges ?? [];

    doc.fontSize(9).font("Helvetica").fillColor("#10233d");
    doc.text(`Material Cost (Base):`, 42, doc.y, { continued: true, width: 300 });
    doc.text(money(calculation.baseCost), { align: "right" });

    charges.forEach((charge) => {
      const label = charge.isCredit ? `  − ${charge.name}` : `  + ${charge.name}`;
      doc.text(label, 42, doc.y, { continued: true, width: 300 });
      doc.text(money(charge.computedAmount), { align: "right" });
    });

    if (calculation.gstAmount && Number(calculation.gstAmount) > 0) {
      doc.text("  + GST:", 42, doc.y, { continued: true, width: 300 });
      doc.text(money(calculation.gstAmount), { align: "right" });
    }

    doc.moveDown(0.5);
    doc.rect(42, doc.y, doc.page.width - 84, 28).fill("#edf5ff");
    doc.fontSize(13).font("Helvetica-Bold").fillColor("#002b63")
      .text(`Final Total:`, 52, doc.y + 7, { continued: true, width: 300 });
    doc.text(money(calculation.finalCost), { align: "right" });

    doc.end();

    await audit({
      userId: req.actor!.id,
      action: "EXPORT_PDF",
      entity: "Calculation",
      entityId: calculation.id,
      details: { batchId: calculation.batchId },
      ipAddress: req.ip
    });
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// REPORT PDF — multi-calculation summary
// ─────────────────────────────────────────────────────────────────────────────
exportRoutes.get(
  "/reports/:reportId/pdf",
  asyncRoute(async (req, res) => {
    const reportId = String(req.params.reportId);
    const rows = await calcRows(reportId);
    const totalCost = rows.reduce((sum, r) => sum + moneyNum(r.finalCost), 0);

    const doc = attachPdf(res, `mcms-cost-report-${reportId}.pdf`);
    doc.pipe(res);

    pdfHeader(
      doc,
      "MCMS Cost Summary Report",
      `Generated ${new Date().toLocaleString("en-IN")} · ${rows.length} calculations`
    );

    // Summary KPIs
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#002b63")
      .text(`Total Calculations: ${rows.length}`, 42, doc.y, { continued: true, width: 200 });
    doc.fillColor("#111111").font("Helvetica")
      .text(`Total Cost: ${money(totalCost)}`, { align: "right" });
    doc.moveDown();
    pdfDivider(doc);

    // Rows
    doc.fontSize(8).font("Helvetica-Bold").fillColor("#56657a");
    doc.text("Batch ID", 42, doc.y, { width: 100, continued: true });
    doc.text("Name", 142, doc.y, { width: 150, continued: true });
    doc.text("Status", 292, doc.y, { width: 70, continued: true });
    doc.text("Qty (kg)", 362, doc.y, { width: 60, continued: true });
    doc.text("Final Cost", 422, doc.y, { width: 100, align: "right" });
    pdfDivider(doc);

    doc.font("Helvetica").fillColor("#10233d");
    rows.forEach((row, i) => {
      if (i > 0 && i % 25 === 0) doc.addPage();
      doc.text(row.batchId, 42, doc.y, { width: 100, continued: true });
      doc.text(row.name, 142, doc.y, { width: 150, continued: true });
      doc.text(row.status, 292, doc.y, { width: 70, continued: true });
      doc.text(Number(row.totalQuantity).toFixed(2), 362, doc.y, { width: 60, continued: true });
      doc.text(money(row.finalCost), 422, doc.y, { width: 100, align: "right" });
    });

    doc.end();

    await audit({
      userId: req.actor!.id,
      action: "EXPORT_PDF",
      entity: "Report",
      entityId: reportId,
      details: { rows: rows.length, totalCost },
      ipAddress: req.ip
    });
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// REPORT EXCEL
// ─────────────────────────────────────────────────────────────────────────────
exportRoutes.get(
  "/reports/:reportId/excel",
  asyncRoute(async (req, res) => {
    const reportId = String(req.params.reportId);
    const rows = await calcRows(reportId);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "JSW MCMS";
    workbook.created = new Date();

    // ── Summary sheet ──────────────────────────────────────────────────────
    const summary = workbook.addWorksheet("Summary");
    summary.mergeCells("A1:F1");
    summary.getCell("A1").value = "JSW Metal Cost Management System — Cost Summary Report";
    summary.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF002B63" } };
    summary.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDF5FF" } };
    summary.getRow(2).values = ["Batch ID", "Calculation Name", "Mode", "Status", "Quantity (kg)", "Final Cost (INR)"];
    summary.getRow(2).font = { bold: true, color: { argb: "FFFFFFFF" } };
    summary.getRow(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF002B63" } };
    summary.columns = [
      { key: "batchId", width: 18 },
      { key: "name", width: 28 },
      { key: "mode", width: 14 },
      { key: "status", width: 14 },
      { key: "quantity", width: 16 },
      { key: "cost", width: 20 }
    ];

    rows.forEach((row, i) => {
      const r = summary.addRow({
        batchId: row.batchId,
        name: row.name,
        mode: row.mode,
        status: row.status,
        quantity: moneyNum(row.totalQuantity),
        cost: moneyNum(row.finalCost)
      });
      if (i % 2 === 0) {
        r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F8FC" } };
      }
    });

    // Total row
    const totalRow = summary.addRow({
      batchId: "TOTAL",
      name: "",
      mode: "",
      status: "",
      quantity: rows.reduce((s, r) => s + moneyNum(r.totalQuantity), 0),
      cost: rows.reduce((s, r) => s + moneyNum(r.finalCost), 0)
    });
    totalRow.font = { bold: true };
    totalRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDF5FF" } };

    // ── Item detail sheet ──────────────────────────────────────────────────
    const detail = workbook.addWorksheet("Item Detail");
    detail.getRow(1).values = ["Batch ID", "Calculation", "Item", "Qty (kg)", "Unit Price", "Grade Mult.", "Extra Price", "Base Cost"];
    detail.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    detail.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF002B63" } };
    detail.columns = [
      { width: 16 }, { width: 26 }, { width: 20 },
      { width: 12 }, { width: 16 }, { width: 14 }, { width: 14 }, { width: 16 }
    ];

    rows.forEach((row) => {
      row.items.forEach((item) => {
        detail.addRow([
          row.batchId, row.name, item.itemName,
          moneyNum(item.quantity), moneyNum(item.unitPrice),
          moneyNum(item.gradeMultiplier), moneyNum(item.extraPrice), moneyNum(item.baseCost)
        ]);
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="mcms-cost-report-${reportId}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();

    await audit({
      userId: req.actor!.id,
      action: "EXPORT_EXCEL",
      entity: "Report",
      entityId: reportId,
      details: { rows: rows.length },
      ipAddress: req.ip
    });
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// REPORT CSV
// ─────────────────────────────────────────────────────────────────────────────
exportRoutes.get(
  "/reports/:reportId/csv",
  asyncRoute(async (req, res) => {
    const reportId = String(req.params.reportId);
    const rows = await calcRows(reportId);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="mcms-cost-report-${reportId}.csv"`);

    // BOM for Excel UTF-8 compatibility
    res.write("\uFEFF");
    res.write(csvRow(["Batch ID", "Calculation Name", "Mode", "Status", "Quantity (kg)", "Base Cost (INR)", "GST (INR)", "Final Cost (INR)", "Created By", "Created At"]) + "\r\n");

    rows.forEach((row) => {
      res.write(
        csvRow([
          row.batchId,
          row.name,
          row.mode,
          row.status,
          Number(row.totalQuantity).toFixed(4),
          Number(row.baseCost).toFixed(4),
          Number((row as any).gstAmount ?? 0).toFixed(4),
          Number(row.finalCost).toFixed(4),
          (row as any).user.name,
          row.createdAt.toISOString()
        ]) + "\r\n"
      );
    });

    res.end();

    await audit({
      userId: req.actor!.id,
      action: "EXPORT_CSV",
      entity: "Report",
      entityId: reportId,
      details: { rows: rows.length },
      ipAddress: req.ip
    });
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// BULK CALCULATIONS CSV — all calculations without a report scope
// ─────────────────────────────────────────────────────────────────────────────
exportRoutes.get(
  "/calculations/csv",
  asyncRoute(async (req, res) => {
    const { from, to, status } = req.query as Record<string, string | undefined>;
    const where = {
      ...(req.actor!.role === "USER" ? { userId: req.actor!.id } : {}),
      ...(status ? { status: status as any } : {}),
      ...(from || to
        ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } }
        : {})
    };

    const rows = await prisma.calculation.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5000
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="mcms-calculations-${new Date().toISOString().slice(0, 10)}.csv"`
    );

    res.write("\uFEFF");
    res.write(csvRow(["Batch ID", "Name", "Mode", "Status", "Quantity (kg)", "Base Cost", "GST", "Final Cost", "User", "Created At"]) + "\r\n");

    rows.forEach((row) => {
      res.write(
        csvRow([
          row.batchId, row.name, row.mode, row.status,
          Number(row.totalQuantity).toFixed(4),
          Number(row.baseCost).toFixed(4),
          Number((row as any).gstAmount ?? 0).toFixed(4),
          Number(row.finalCost).toFixed(4),
          (row as any).user.name,
          row.createdAt.toISOString()
        ]) + "\r\n"
      );
    });

    res.end();

    await audit({
      userId: req.actor!.id,
      action: "EXPORT_CSV",
      entity: "Calculation",
      entityId: "bulk",
      details: { rows: rows.length, filters: { from, to, status } },
      ipAddress: req.ip
    });
  })
);
