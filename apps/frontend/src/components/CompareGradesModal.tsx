/**
 * CompareGradesModal — full comparison matrix with difference highlighting and PDF export.
 * Compares 2–5 grades side-by-side, highlights differing cells in amber.
 * PDF export uses jsPDF (already a project dependency).
 */

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { SplitSquareHorizontal, X, FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { shortDate } from "@/utils";

interface CompareGradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrades: any[];
}

export function CompareGradesModal({ isOpen, onClose, selectedGrades }: CompareGradesModalProps) {
  const tableRef = useRef<HTMLTableElement>(null);

  if (!isOpen || selectedGrades.length < 2) return null;

  // Returns true if any grade differs on this field
  const isDifferent = (extractor: (g: any) => string) => {
    const vals = selectedGrades.map(extractor);
    return vals.some((v) => v !== vals[0]);
  };

  const rows: { label: string; extract: (g: any) => string; highlight?: boolean }[] = [
    { label: "Grade Code", extract: (g) => g.code ?? g.name.toUpperCase().replace(/\s+/g, "-") },
    { label: "Grade Name", extract: (g) => g.name ?? "—" },
    { label: "Metal Class", extract: (g) => g.metal?.name ?? "—", highlight: true },
    { label: "Sub Grade", extract: (g) => g.subGrade ?? "—", highlight: true },
    { label: "Multiplier", extract: (g) => Number(g.multiplier ?? 1).toFixed(3), highlight: true },
    { label: "Premium (₹)", extract: (g) => Number(g.extraPrice ?? g.premium ?? 0).toFixed(2), highlight: true },
    { label: "Status", extract: (g) => g.status ?? "—", highlight: true },
    { label: "Chemistry — C (%)", extract: (g) => g.chemicalComposition?.C ?? g.chemicalComposition?.c ?? "—", highlight: true },
    { label: "Chemistry — Si (%)", extract: (g) => g.chemicalComposition?.Si ?? g.chemicalComposition?.si ?? "—", highlight: true },
    { label: "Chemistry — Mn (%)", extract: (g) => g.chemicalComposition?.Mn ?? g.chemicalComposition?.mn ?? "—", highlight: true },
    { label: "Chemistry — Cr (%)", extract: (g) => g.chemicalComposition?.Cr ?? g.chemicalComposition?.cr ?? "—", highlight: true },
    { label: "Chemistry — Ni (%)", extract: (g) => g.chemicalComposition?.Ni ?? g.chemicalComposition?.ni ?? "—", highlight: true },
    { label: "Last Updated", extract: (g) => shortDate(g.updatedAt) },
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(14);
    doc.text("JSW — Grade Comparison Report", 14, 16);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    const head = [["Attribute", ...selectedGrades.map((g) => g.name)]];
    const body = rows.map((row) => [row.label, ...selectedGrades.map(row.extract)]);

    autoTable(doc, {
      head,
      body,
      startY: 28,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [0, 38, 82], textColor: 255, fontStyle: "bold" },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index > 0) {
          const rowDef = rows[data.row.index];
          if (rowDef?.highlight && isDifferent(rowDef.extract)) {
            data.cell.styles.fillColor = [255, 251, 235]; // amber-50
            data.cell.styles.textColor = [120, 53, 15];   // amber-900
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    doc.save(`JSW_Grade_Comparison_${Date.now()}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-[95vw] max-w-[1100px] max-h-[88vh] bg-white rounded-sm shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <SplitSquareHorizontal className="size-4 text-blue-600" />
              Compare Grades
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparing {selectedGrades.length} grades · Cells highlighted in{" "}
              <span className="font-semibold text-amber-700">amber</span> differ across selections.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table ref={tableRef} className="w-full text-left border-collapse text-xs">
            <thead>
              <tr>
                <th className="sticky top-0 left-0 z-20 bg-slate-100 border-b border-r border-slate-200 px-4 py-3 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider w-44">
                  Attribute
                </th>
                {selectedGrades.map((g, i) => (
                  <th
                    key={g.id ?? i}
                    className="sticky top-0 z-10 bg-slate-50 border-b border-l border-slate-200 px-4 py-3"
                  >
                    <p className="font-bold text-slate-800 text-sm">{g.name}</p>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                      {g.metal?.name ?? "—"} · {g.status ?? "ACTIVE"}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                const diff = (row.highlight ?? false) && isDifferent(row.extract);
                return (
                  <tr
                    key={ri}
                    className={`border-b border-slate-100 transition-colors ${ri % 2 === 0 ? "bg-white" : "bg-slate-50/40"} hover:bg-blue-50/30`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-600 bg-slate-50/60 border-r border-slate-200 sticky left-0 z-10 whitespace-nowrap">
                      {row.label}
                    </td>
                    {selectedGrades.map((g, i) => {
                      const val = row.extract(g);
                      return (
                        <td
                          key={g.id ?? i}
                          className={`px-4 py-3 border-l border-slate-100 font-medium ${
                            diff
                              ? "bg-amber-50/60 text-amber-900 font-bold"
                              : "text-slate-700"
                          }`}
                        >
                          {val}
                          {diff && (
                            <span className="ml-1.5 inline-flex items-center rounded px-1 py-0.5 text-[9px] font-bold bg-amber-200 text-amber-800 uppercase tracking-wide">
                              Diff
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400">
            {rows.filter((r) => r.highlight && isDifferent(r.extract)).length} attribute
            {rows.filter((r) => r.highlight && isDifferent(r.extract)).length !== 1 ? "s" : ""} differ
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="text-xs font-semibold h-8 gap-1.5"
            >
              <FileDown className="size-3.5" /> Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold h-8"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
