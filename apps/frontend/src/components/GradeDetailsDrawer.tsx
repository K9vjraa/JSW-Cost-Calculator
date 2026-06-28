import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Activity, Shield, GitMerge, FileText } from "lucide-react"

export interface GradeDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: any | null;
  metals: any[];
}

export function GradeDetailsDrawer({ open, onOpenChange, grade, metals }: GradeDetailsDrawerProps) {
  if (!grade) return null;

  const metal = metals.find(m => m.id === grade.metalId);

  // Status Badge Helper
  let statusBadgeColor = "border-slate-200 bg-slate-100 text-slate-500";
  let statusLabel = "Unknown";
  if (grade.status === "ACTIVE") {
    statusBadgeColor = "border-success-border bg-success-bg text-success-fg";
    statusLabel = "Active";
  } else if (grade.status === "DRAFT") {
    statusBadgeColor = "border-amber-200 bg-amber-50 text-amber-700";
    statusLabel = "Draft";
  } else if (grade.status === "INACTIVE") {
    statusBadgeColor = "border-red-200 bg-red-50 text-red-700";
    statusLabel = "Inactive";
  }

  // Chemistry mapping
  const chemCr = grade.chemicalComposition?.Cr || "0";
  const chemNi = grade.chemicalComposition?.Ni || "0";
  const chemC = grade.chemicalComposition?.C || "0";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[450px] sm:max-w-[450px] overflow-y-auto flex flex-col gap-6 p-0 border-l border-slate-200">
        
        {/* Header Block */}
        <div className="bg-slate-50 p-6 pb-4 border-b border-slate-200 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">Grade Master Record</span>
              <SheetTitle className="text-2xl font-black tracking-tight text-primary">{grade.name}</SheetTitle>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={`${statusBadgeColor} shadow-sm px-2.5 py-0.5 font-bold uppercase tracking-wider text-[10px]`}>
              {statusLabel}
            </Badge>
            <span className="text-xs font-semibold text-slate-400">ID: {grade.id?.slice(0, 8) || "SYS-GEN"}</span>
          </div>
        </div>

        <div className="px-6 flex flex-col gap-8 pb-8">
          
          {/* Overview / Grade Information */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><FileText className="size-3.5" /> Grade Information</h3>
            <div className="grid grid-cols-2 gap-4 rounded-sm border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Metal Class</span>
                <span className="text-sm font-semibold text-slate-700">{metal?.name || "Generic"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sub Grade</span>
                <span className="text-sm font-semibold text-slate-700">{grade.subGrade || "-"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Multiplier</span>
                <span className="text-sm font-black text-blue-600">{Number(grade.multiplier || 1).toFixed(2)}x</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Premium</span>
                <span className="text-sm font-black text-rose-600">₹{Number(grade.extraPrice || 0).toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Chemistry Breakdown */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Activity className="size-3.5" /> Target Chemistry</h3>
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Carbon (C)</span>
                  <span className="text-xs font-black text-slate-800">{chemC}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-800 rounded-full" style={{ width: `${Math.min(Number(chemC) * 5, 100)}%` }} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Chromium (Cr)</span>
                  <span className="text-xs font-black text-sky-900">{chemCr}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${Math.min(Number(chemCr) * 5, 100)}%` }} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Nickel (Ni)</span>
                  <span className="text-xs font-black text-rose-900">{chemNi}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(Number(chemNi) * 5, 100)}%` }} />
                </div>
              </div>

            </div>
          </section>

          {/* Audit Timeline */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Shield className="size-3.5" /> Audit Timeline</h3>
            <div className="rounded-sm border border-slate-200 bg-slate-50 p-4 shadow-sm text-sm">
              <div className="flex gap-4 items-start relative pb-4">
                <div className="absolute left-1.5 top-2 bottom-0 w-px bg-slate-200"></div>
                <div className="size-3 rounded-full bg-blue-600 ring-4 ring-blue-50 z-10 shrink-0 mt-1"></div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-slate-700">Last Modified</span>
                  <span className="text-xs text-slate-500">{new Date(grade.updatedAt || new Date()).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span className="text-xs font-medium text-slate-400 mt-1">By System Administrator</span>
                </div>
              </div>
              <div className="flex gap-4 items-start relative">
                <div className="size-3 rounded-full bg-slate-300 ring-4 ring-slate-100 z-10 shrink-0 mt-1"></div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-slate-700">Record Created</span>
                  <span className="text-xs text-slate-500">{new Date(grade.createdAt || "2026-01-01T00:00:00Z").toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span className="text-xs font-medium text-slate-400 mt-1">Initial Data Import</span>
                </div>
              </div>
            </div>
          </section>

          {/* Linked Materials */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><GitMerge className="size-3.5" /> Linked Master Data</h3>
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-center text-center h-24">
              <div className="flex flex-col gap-1 items-center">
                <span className="text-sm font-semibold text-slate-600">Material Mapping Available in Workspace</span>
                <span className="text-xs text-slate-400">View detailed routing in Calculation Workspace.</span>
              </div>
            </div>
          </section>

        </div>
      </SheetContent>
    </Sheet>
  );
}
