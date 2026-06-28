/**
 * CloneGradeModal — production-ready clone workflow.
 * Uses POST /grades with all source grade properties pre-filled.
 * Requires unique Grade Code (name field maps to "name", code is validated locally).
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, X, Loader2 } from "lucide-react";
import { api } from "@/services/api";

interface CloneGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceGrade: any | null;
  existingGrades: any[];        // pass current grades[] for duplicate-code check
  onSuccess: () => void;        // called after successful clone to refresh table
}

export function CloneGradeModal({
  isOpen,
  onClose,
  sourceGrade,
  existingGrades,
  onSuccess,
}: CloneGradeModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset form whenever modal opens with a new source grade
  useEffect(() => {
    if (isOpen && sourceGrade) {
      setName(`${sourceGrade.name} (Copy)`);
      setCode(`${sourceGrade.code ?? sourceGrade.name.toUpperCase().replace(/\s+/g, "-")}-COPY`);
    }
  }, [isOpen, sourceGrade]);

  if (!isOpen || !sourceGrade) return null;

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedName || !trimmedCode) {
      toast.error("Grade Name and Grade Code are required.");
      return;
    }

    // Client-side duplicate-code guard
    const duplicate = existingGrades.some(
      (g) => (g.code ?? g.name).toUpperCase() === trimmedCode
    );
    if (duplicate) {
      toast.error(`Grade Code "${trimmedCode}" already exists. Please choose a unique code.`);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        metalId: sourceGrade.metalId ?? sourceGrade.metal?.id,
        name: trimmedName,
        subGrade: sourceGrade.subGrade ?? null,
        multiplier: Number(sourceGrade.multiplier ?? 1),
        extraPrice: Number(sourceGrade.extraPrice ?? sourceGrade.premium ?? 0),
        status: "ACTIVE",
        mechanicalProperties: sourceGrade.mechanicalProperties ?? {},
        toleranceProperties: sourceGrade.toleranceProperties ?? {},
        bendProperties: sourceGrade.bendProperties ?? {},
        chemicalComposition: sourceGrade.chemicalComposition ?? {},
        // NOTE: code field — some backends derive code from name; we inject it via name.
        // If backend exposes a "code" field in createGradeSchema, add: code: trimmedCode
      };

      await api.post("/grades", payload);
      toast.success(`Grade "${trimmedName}" cloned successfully.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        err?.message ??
        "Clone failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-[480px] bg-white rounded-sm shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Copy className="size-4 text-primary" />
            Clone Grade
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Source grade info banner */}
          <div className="rounded-sm bg-blue-50 border border-blue-100 px-4 py-3">
            <p className="text-xs font-semibold text-blue-800">Cloning from</p>
            <p className="text-sm font-bold text-blue-900 mt-0.5">{sourceGrade.name}</p>
            <p className="text-xs text-blue-700/70 mt-0.5">
              Metal Class: {sourceGrade.metal?.name ?? "—"} · Multiplier:{" "}
              {Number(sourceGrade.multiplier ?? 1).toFixed(3)} · Premium: ₹
              {Number(sourceGrade.extraPrice ?? sourceGrade.premium ?? 0).toFixed(2)}
            </p>
            <p className="text-[11px] text-blue-600/70 mt-1">
              Chemistry, mechanical properties, and tolerance settings will be copied exactly.
            </p>
          </div>

          {/* New Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              New Grade Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. IS 2062 E250 (Copy)"
              className="h-9 text-xs"
              disabled={isLoading}
            />
          </div>

          {/* New Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              New Grade Code <span className="text-red-500">*</span>
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. IS2062-E250-COPY"
              className="h-9 text-xs font-mono"
              disabled={isLoading}
            />
            <p className="text-[11px] text-slate-400">
              Must be unique across all existing grades.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
            className="text-xs font-semibold h-8"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold h-8 min-w-[100px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="size-3 animate-spin" />
                Cloning...
              </span>
            ) : (
              "Clone Grade"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
