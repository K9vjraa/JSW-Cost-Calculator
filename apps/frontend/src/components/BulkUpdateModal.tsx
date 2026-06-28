/**
 * BulkUpdateModal — production-ready bulk update workflow.
 * Calls PUT /grades/:id for every selected grade sequentially.
 * Only sends fields the user explicitly changed (blank = no change).
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ListChecks, X, Loader2, AlertTriangle } from "lucide-react";
import { api } from "@/services/api";

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrades: any[];        // full grade objects, not just IDs
  metals: { id: string; name: string }[];
  onSuccess: () => void;
}

export function BulkUpdateModal({
  isOpen,
  onClose,
  selectedGrades,
  metals,
  onSuccess,
}: BulkUpdateModalProps) {
  const [status, setStatus] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [premium, setPremium] = useState("");
  const [metalId, setMetalId] = useState("");

  // Confirmation step
  const [showConfirm, setShowConfirm] = useState(false);

  // Progress tracking
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, failed: 0 });

  if (!isOpen) return null;

  const hasAnyChange = status || multiplier || premium || metalId;

  const buildPatch = () => {
    const patch: Record<string, any> = {};
    if (status) patch.status = status;
    if (multiplier !== "" && !isNaN(Number(multiplier))) patch.multiplier = Number(multiplier);
    if (premium !== "" && !isNaN(Number(premium))) patch.extraPrice = Number(premium);
    if (metalId) patch.metalId = metalId;
    return patch;
  };

  const handleConfirm = async () => {
    const patch = buildPatch();
    setIsLoading(true);
    setProgress({ done: 0, failed: 0 });

    let done = 0;
    let failed = 0;

    for (const grade of selectedGrades) {
      try {
        await api.put(`/grades/${grade.id}`, patch);
        done++;
        setProgress({ done, failed });
      } catch {
        failed++;
        setProgress({ done, failed });
      }
    }

    setIsLoading(false);

    if (failed === 0) {
      toast.success(`${done} grade${done !== 1 ? "s" : ""} updated successfully.`);
      onSuccess();
      handleClose();
    } else if (done > 0) {
      toast.warning(`${done} updated, ${failed} failed. Review the failed records.`);
      onSuccess();
      handleClose();
    } else {
      toast.error("All updates failed. Check your permissions or network connection.");
      setShowConfirm(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setStatus("");
    setMultiplier("");
    setPremium("");
    setMetalId("");
    setShowConfirm(false);
    setProgress({ done: 0, failed: 0 });
    onClose();
  };

  // ── Confirmation Step ────────────────────────────────────────────────────────
  if (showConfirm) {
    const patch = buildPatch();
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="w-[440px] bg-white rounded-sm shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-amber-50">
            <AlertTriangle className="size-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-800">Confirm Bulk Update</h2>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <p className="text-xs text-slate-600">
              You are about to apply the following changes to{" "}
              <strong className="text-slate-900">{selectedGrades.length} grade{selectedGrades.length !== 1 ? "s" : ""}</strong>:
            </p>

            <div className="rounded-sm bg-slate-50 border border-slate-200 divide-y divide-slate-100">
              {Object.entries(patch).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between px-4 py-2">
                  <span className="text-xs font-semibold text-slate-500 capitalize">
                    {key === "extraPrice" ? "Premium (₹)" : key === "metalId" ? "Metal Class" : key}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {key === "metalId" ? (metals.find((m) => m.id === val)?.name ?? val) : String(val)}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 italic">This action cannot be undone. Affected grades:</p>
            <ul className="max-h-32 overflow-y-auto text-xs text-slate-700 space-y-1 rounded border border-slate-200 p-3 bg-white">
              {selectedGrades.map((g) => (
                <li key={g.id} className="font-medium">• {g.name}</li>
              ))}
            </ul>

            {isLoading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Updating {selectedGrades.length} records…</span>
                  <span>{progress.done + progress.failed} / {selectedGrades.length}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-200"
                    style={{ width: `${((progress.done + progress.failed) / selectedGrades.length) * 100}%` }}
                  />
                </div>
                {progress.failed > 0 && (
                  <p className="text-[11px] text-red-600 font-semibold">
                    {progress.failed} record{progress.failed !== 1 ? "s" : ""} failed
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(false)}
              disabled={isLoading}
              className="text-xs font-semibold h-8"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8 min-w-[120px]"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3 animate-spin" />
                  Updating…
                </span>
              ) : (
                `Confirm Update`
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form Step ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-[480px] bg-white rounded-sm shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ListChecks className="size-4 text-blue-600" />
            Bulk Update Grades
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          <p className="text-xs text-slate-500">
            Updating{" "}
            <strong className="text-slate-800">
              {selectedGrades.length} selected grade{selectedGrades.length !== 1 ? "s" : ""}
            </strong>
            . Leave a field blank to keep its existing value unchanged.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 rounded-sm border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">— No Change —</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Metal Class */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Metal Class</label>
              <select
                value={metalId}
                onChange={(e) => setMetalId(e.target.value)}
                className="h-9 rounded-sm border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">— No Change —</option>
                {metals.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Multiplier */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Multiplier Override</label>
              <Input
                type="number"
                step="0.001"
                min="0"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                placeholder="— No Change —"
                className="h-9 text-xs"
              />
            </div>

            {/* Premium */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Premium Override (₹)</label>
              <Input
                type="number"
                step="1"
                min="0"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
                placeholder="— No Change —"
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="text-xs font-semibold h-8"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!hasAnyChange) {
                toast.error("Please change at least one field before updating.");
                return;
              }
              setShowConfirm(true);
            }}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8"
          >
            Preview & Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
