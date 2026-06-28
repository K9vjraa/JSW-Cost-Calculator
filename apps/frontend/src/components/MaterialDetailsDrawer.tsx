import { X } from "lucide-react";
import { Button, Badge, inr } from "@jsw-mcms/ui";
import type { RawMaterial } from "@/types";

interface PriceHistoryEntry {
  id: string;
  oldPrice?: number;
  old_rate?: number;
  newPrice?: number;
  new_rate?: number;
  createdAt?: string;
  created_at?: string;
  updatedBy?: { name: string };
  updated_by?: string;
}

interface MaterialDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  material: RawMaterial | null;
  priceHistory: PriceHistoryEntry[];
  onEdit?: () => void;
  isReadOnly?: boolean;
}

export function MaterialDetailsDrawer({
  isOpen,
  onClose,
  material,
  priceHistory,
  onEdit,
  isReadOnly = false,
}: MaterialDetailsDrawerProps) {
  if (!isOpen || !material) return null;

  const categoryMap: Record<string, string> = {
    "Ferro Alloy": "border-sky-100 bg-sky-50 text-sky-700",
    "Aluminium": "border-indigo-100 bg-indigo-50 text-indigo-700",
    "Flux": "border-amber-100 bg-amber-50 text-amber-700",
    "Carbon Additive": "border-slate-100 bg-slate-50 text-slate-700",
    "Calcium Alloy": "border-rose-100 bg-rose-50 text-rose-700",
    "Non-Ferrous": "border-emerald-100 bg-emerald-50 text-emerald-700",
  };

  const categoryBg = categoryMap[material.category || ""] || "border-slate-200 bg-slate-100 text-slate-500";

  // Filter price history for this material
  const materialHistory = priceHistory.slice(0, 5);

  const shortDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xs" />

      {/* Drawer Panel */}
      <div
        className="relative ml-auto w-full max-w-md bg-white shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 bg-linear-to-r from-slate-50 to-white p-4">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                {material.code}
              </span>
              <Badge className={`${categoryBg} text-[11px] font-semibold`}>
                {material.category || "Uncategorized"}
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {material.alloyName || material.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Current Pricing Section */}
          <div className="border-b border-slate-100 p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Current Pricing
            </h4>
            <div className="grid gap-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">
                  Current Rate (₹/kg)
                </span>
                <span className="text-lg font-mono font-bold text-success-fg">
                  {(material.currentRate || 0) > 0 ? inr(material.currentRate || 0) : "N/A"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">
                    Last Updated
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {material.updatedAt ? shortDate(material.updatedAt) : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">
                    Updated By
                  </span>
                  <span className="text-sm font-semibold text-slate-700 truncate">
                    {material.updatedBy?.name || "System"}
                  </span>
                </div>
              </div>
              {material.supplier && (
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">
                    Supplier
                  </span>
                  <span className="text-sm font-semibold text-slate-700">{material.supplier}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price History Section */}
          {materialHistory.length > 0 && (
            <div className="border-b border-slate-100 p-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Recent Price History
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
                      <th className="pb-2 pr-2">Date</th>
                      <th className="pb-2 pr-2 text-right">Old Rate</th>
                      <th className="pb-2 pr-2 text-right">New Rate</th>
                      <th className="pb-2 text-right">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialHistory.map((entry, idx) => {
                      const oldRate = Number(entry.old_rate || entry.oldPrice || 0);
                      const newRate = Number(entry.new_rate || entry.newPrice || 0);
                      const change =
                        oldRate > 0
                          ? (((newRate - oldRate) / oldRate) * 100).toFixed(2)
                          : "—";
                      const arrow =
                        Number(change) > 0 ? "↑" : Number(change) < 0 ? "↓" : "→";
                      const colorClass =
                        Number(change) > 0
                          ? "text-emerald-600"
                          : Number(change) < 0
                            ? "text-rose-600"
                            : "text-slate-500";

                      return (
                        <tr
                          key={entry.id || idx}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="py-2 pr-2 text-slate-600">
                            {entry.createdAt || entry.created_at
                              ? shortDate(entry.createdAt || entry.created_at)
                              : "N/A"}
                          </td>
                          <td className="py-2 pr-2 text-right font-mono text-slate-700">
                            {oldRate > 0 ? inr(oldRate) : "—"}
                          </td>
                          <td className="py-2 pr-2 text-right font-mono font-semibold text-slate-800">
                            {inr(newRate)}
                          </td>
                          <td className={`py-2 text-right font-semibold ${colorClass}`}>
                            {arrow} {change}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Material Details Section */}
          <div className="border-b border-slate-100 p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Material Details
            </h4>
            <div className="space-y-3 text-sm">
              {material.alloyDescription && (
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">
                    Description
                  </span>
                  <p className="text-slate-700 mt-1">{material.alloyDescription}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">
                    Micro Alloy
                  </span>
                  <Badge
                    className={`${
                      material.isMicro
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                    } text-[11px] font-semibold mt-1`}
                  >
                    {material.isMicro ? "YES" : "NO"}
                  </Badge>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">
                    Availability
                  </span>
                  <Badge
                    className={`${
                      material.isAvail
                        ? "border-success-border bg-success-bg text-success-fg"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                    } text-[11px] font-semibold mt-1`}
                  >
                    {material.isAvail ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!isReadOnly && (
          <div className="border-t border-slate-100 bg-slate-50 p-4 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button
                className="flex-1 bg-[#0057b8] hover:bg-[#004399]"
                onClick={onEdit}
              >
                Edit Material
              </Button>
            )}
          </div>
        )}
        {isReadOnly && (
          <div className="border-t border-slate-100 bg-slate-50 p-4">
            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
