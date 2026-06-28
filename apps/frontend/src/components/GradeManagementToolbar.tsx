import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Download, 
  Upload, 
  Copy, 
  ListChecks, 
  SplitSquareHorizontal, 
  MoreVertical,
  ChevronDown,
  RefreshCw,
  Printer,
  FileDown,
  HelpCircle
} from "lucide-react";

export interface GradeManagementToolbarProps {
  selectedIds: Set<string>;
  onImport: () => void;
  onExport: (format: "excel" | "csv" | "pdf", scope: "selected" | "page" | "all") => void;
  onClone: () => void;
  onBulkUpdate: () => void;
  onCompare: () => void;
  onRefresh: () => void;
  onPrint: () => void;
  onDownloadTemplate: () => void;
}

export function GradeManagementToolbar({
  selectedIds,
  onImport,
  onExport,
  onClone,
  onBulkUpdate,
  onCompare,
  onRefresh,
  onPrint,
  onDownloadTemplate
}: GradeManagementToolbarProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  const numSelected = selectedIds?.size || 0;
  const canClone = numSelected === 1;
  const canBulkUpdate = numSelected > 1;
  const canCompare = numSelected >= 2 && numSelected <= 5;

  return (
    <div className="flex flex-wrap items-center gap-2 relative z-10">
      <Button 
        onClick={onImport}
        variant="outline" size="sm" className="h-9 font-semibold text-slate-700 bg-white border-slate-200 shadow-sm hover:bg-slate-50"
      >
        <Download className="mr-2 size-4 text-blue-600" /> Import Excel
      </Button>

      <div className="relative" ref={exportRef}>
        <Button 
          onClick={() => setIsExportOpen(!isExportOpen)}
          variant="outline" size="sm" className="h-9 font-semibold text-slate-700 bg-white border-slate-200 shadow-sm hover:bg-slate-50"
        >
          <Upload className="mr-2 size-4 text-blue-600" /> Export <ChevronDown className="ml-1.5 size-3 text-slate-500" />
        </Button>
        {isExportOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-sm shadow-sm border border-slate-200 py-1 z-50 overflow-hidden">
            <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">Excel</div>
            <button onClick={() => { onExport("excel", "selected"); setIsExportOpen(false); }} disabled={numSelected === 0} className="w-full text-left px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Export Selected</button>
            <button onClick={() => { onExport("excel", "page"); setIsExportOpen(false); }} className="w-full text-left px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Export Current Page</button>
            <button onClick={() => { onExport("excel", "all"); setIsExportOpen(false); }} className="w-full text-left px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Export All Filtered</button>
            
            <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50 border-y border-slate-100">CSV</div>
            <button onClick={() => { onExport("csv", "selected"); setIsExportOpen(false); }} disabled={numSelected === 0} className="w-full text-left px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Export Selected</button>
            <button onClick={() => { onExport("csv", "page"); setIsExportOpen(false); }} className="w-full text-left px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Export Current Page</button>
            <button onClick={() => { onExport("csv", "all"); setIsExportOpen(false); }} className="w-full text-left px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Export All Filtered</button>

            <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50 border-y border-slate-100">PDF</div>
            <button onClick={() => { onExport("pdf", "page"); setIsExportOpen(false); }} className="w-full text-left px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Export Current Page</button>
          </div>
        )}
      </div>

      <Button 
        onClick={onClone}
        disabled={!canClone}
        variant="outline" size="sm" className="h-9 font-semibold text-slate-700 bg-white border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-50"
      >
        <Copy className="mr-2 size-4 text-blue-600" /> Clone Grade
      </Button>

      <Button 
        onClick={onBulkUpdate}
        disabled={!canBulkUpdate}
        variant="outline" size="sm" className="h-9 font-semibold text-slate-700 bg-white border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-50"
      >
        <ListChecks className="mr-2 size-4 text-blue-600" /> Bulk Update
      </Button>

      <Button 
        onClick={onCompare}
        disabled={!canCompare}
        variant="outline" size="sm" className="h-9 font-semibold text-slate-700 bg-white border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-50"
      >
        <SplitSquareHorizontal className="mr-2 size-4 text-blue-600" /> Compare Grades
      </Button>

      <div className="relative" ref={moreRef}>
        <Button 
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          variant="outline" size="sm" className="h-9 font-semibold text-slate-700 bg-white border-slate-200 shadow-sm hover:bg-slate-50"
        >
          <MoreVertical className="mr-1 size-4 text-slate-500" /> More <ChevronDown className="ml-1 size-3 text-slate-500" />
        </Button>
        {isMoreOpen && (
          <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-sm shadow-sm border border-slate-200 py-1 z-50">
            <button onClick={() => { onRefresh(); setIsMoreOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center"><RefreshCw className="size-3.5 mr-2 text-slate-400" /> Refresh Data</button>
            <button onClick={() => { onPrint(); setIsMoreOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center"><Printer className="size-3.5 mr-2 text-slate-400" /> Print View</button>
            <div className="my-1 h-px bg-slate-100"></div>
            <button onClick={() => { onDownloadTemplate(); setIsMoreOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center"><FileDown className="size-3.5 mr-2 text-slate-400" /> Download Import Template</button>
            <button onClick={() => { toast.info("Help Center loaded."); setIsMoreOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center"><HelpCircle className="size-3.5 mr-2 text-slate-400" /> Help</button>
          </div>
        )}
      </div>
    </div>
  );
}
