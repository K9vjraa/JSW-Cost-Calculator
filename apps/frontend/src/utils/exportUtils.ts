import { jsPDF } from "jspdf";
import * as xlsx from "xlsx";
import type { SummaryItem } from "../components/LiveSummaryPanel";

export const exportToPDF = (items: SummaryItem[], totalCost: number, grandTotalWeight: number) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 87, 184); // JSW Blue
  doc.text("JSW Metal Cost Management System", 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Live Cost Sheet Summary", 14, 30);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

  // Using simple text formatting if autoTable is not installed
  let yPos = 50;
  
  // Columns
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("No.", 14, yPos);
  doc.text("Item / Description", 25, yPos);
  doc.text("Quantity", 110, yPos);
  doc.text("Unit Price", 140, yPos);
  doc.text("Total Cost", 170, yPos);
  
  yPos += 5;
  doc.setLineWidth(0.5);
  doc.line(14, yPos, 195, yPos);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  items.forEach((item, i) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(`${i + 1}`, 14, yPos);
    // Slice name if too long
    const shortName = item.name.length > 40 ? item.name.slice(0, 37) + '...' : item.name;
    doc.text(shortName, 25, yPos);
    doc.text(`${item.quantity.toLocaleString("en-IN", { maximumFractionDigits: 2 })} kg`, 110, yPos);
    doc.text(`${item.unitPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, 140, yPos);
    doc.text(`${item.baseCost.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, 170, yPos);
    yPos += 8;
  });

  yPos += 2;
  doc.setLineWidth(0.5);
  doc.line(14, yPos, 195, yPos);
  yPos += 10;

  // Footer / Totals
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Grand Totals:", 110, yPos);
  doc.text(`Weight: ${grandTotalWeight.toLocaleString("en-IN", { maximumFractionDigits: 2 })} kg`, 140, yPos);
  doc.setTextColor(0, 87, 184); // JSW Blue
  doc.text(`INR ${totalCost.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, 170, yPos);

  doc.save(`JSW_MCMS_CostSheet_${new Date().getTime()}.pdf`);
};

export const exportToExcel = (items: SummaryItem[], totalCost: number, grandTotalWeight: number) => {
  const worksheetData = items.map((item, index) => ({
    "S.No": index + 1,
    "Item / Description": item.name,
    "Quantity (kg)": item.quantity,
    "Unit Price (INR/kg)": item.unitPrice,
    "Total Cost (INR)": item.baseCost
  }));

  // Add empty row then totals
  worksheetData.push({
    "S.No": "" as any,
    "Item / Description": "GRAND TOTALS",
    "Quantity (kg)": grandTotalWeight,
    "Unit Price (INR/kg)": "" as any,
    "Total Cost (INR)": totalCost
  });

  const worksheet = xlsx.utils.json_to_sheet(worksheetData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Cost Sheet");

  // Adjust column widths
  worksheet["!cols"] = [
    { wch: 8 },  // S.No
    { wch: 40 }, // Item
    { wch: 15 }, // Qty
    { wch: 20 }, // Unit Price
    { wch: 20 }  // Total Cost
  ];

  xlsx.writeFile(workbook, `JSW_MCMS_CostSheet_${new Date().getTime()}.xlsx`);
};

export const exportToCSV = (items: SummaryItem[], totalCost: number, grandTotalWeight: number) => {
  const worksheetData = items.map((item, index) => ({
    "S.No": index + 1,
    "Item / Description": item.name,
    "Quantity (kg)": item.quantity,
    "Unit Price (INR/kg)": item.unitPrice,
    "Total Cost (INR)": item.baseCost
  }));

  worksheetData.push({
    "S.No": "" as any,
    "Item / Description": "GRAND TOTALS",
    "Quantity (kg)": grandTotalWeight,
    "Unit Price (INR/kg)": "" as any,
    "Total Cost (INR)": totalCost
  });

  const worksheet = xlsx.utils.json_to_sheet(worksheetData);
  const csvContent = xlsx.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `JSW_MCMS_CostSheet_${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
