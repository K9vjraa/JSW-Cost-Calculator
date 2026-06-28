import { useState, useRef, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { 
  X, 
  UploadCloud, 
  FileDown, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Database,
  ArrowRight,
  Download
} from "lucide-react";

interface GradeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ParsedRow = any;

export function GradeImportModal({ isOpen, onClose, onSuccess }: GradeImportModalProps) {
  const [step, setStep] = useState<"upload" | "preview" | "saving">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [validRows, setValidRows] = useState<ParsedRow[]>([]);
  const [invalidRows, setInvalidRows] = useState<ParsedRow[]>([]);
  const [activeTab, setActiveTab] = useState<"valid" | "invalid">("valid");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFile = (file: File) => {
    const validExts = [".xlsx", ".xls", ".csv"];
    const ext = file.name.slice((Math.max(0, file.name.lastIndexOf(".")) || Infinity)).toLowerCase();
    if (!validExts.includes(ext)) {
      toast.error("Invalid file format. Please upload an Excel or CSV file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        validateData(jsonData);
      } catch (err) {
        toast.error("Failed to parse file. Ensure it is not corrupted.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateData = (data: any[]) => {
    const valid: any[] = [];
    const invalid: any[] = [];
    const seenCodes = new Set<string>();

    data.forEach((row, index) => {
      const code = String(row["Grade Code"] || "").trim();
      const name = String(row["Grade Name"] || "").trim();
      const metal = String(row["Metal Class"] || "").trim();
      const premium = Number(row["Premium"]);
      const multiplier = Number(row["Multiplier"]);
      
      let errorReason = "";

      if (!code) errorReason += "Missing Grade Code. ";
      if (!name) errorReason += "Missing Grade Name. ";
      if (!metal) errorReason += "Missing Metal Class. ";
      if (seenCodes.has(code)) errorReason += "Duplicate Grade Code in file. ";
      if (row["Premium"] !== "" && isNaN(premium)) errorReason += "Premium must be a number. ";
      if (row["Multiplier"] !== "" && isNaN(multiplier)) errorReason += "Multiplier must be a number. ";

      if (code) seenCodes.add(code);

      if (errorReason) {
        invalid.push({ ...row, RowNumber: index + 2, Error: errorReason.trim() });
      } else {
        valid.push({
          code,
          name,
          metal,
          premium: isNaN(premium) ? 0 : premium,
          multiplier: isNaN(multiplier) ? 1 : multiplier,
          status: String(row["Status"] || "Draft").trim()
        });
      }
    });

    setValidRows(valid);
    setInvalidRows(invalid);
    setActiveTab(valid.length > 0 ? "valid" : "invalid");
    setStep("preview");
  };

  const downloadTemplate = () => {
    const headers = [
      { "Grade Code": "", "Grade Name": "", "Metal Class": "", "Sub Grade": "", "Multiplier": "", "Premium": "", "Status": "" }
    ];
    const ws = XLSX.utils.json_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Grade_Import_Template.xlsx");
    toast.success("Template downloaded.");
  };

  const downloadErrorReport = () => {
    if (invalidRows.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(invalidRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errors");
    XLSX.writeFile(wb, "Grade_Import_Errors.xlsx");
    toast.success("Error report downloaded.");
  };

  const handleBulkSave = () => {
    if (validRows.length === 0) {
      toast.error("No valid records to save.");
      return;
    }
    setStep("saving");
    
    // Simulate API Batch Save Delay
    setTimeout(() => {
      toast.success(`Successfully imported ${validRows.length} grades.`);
      toast.info("Note: The batch endpoint is simulated for this demo.", { icon: "🚧" });
      onSuccess();
      setTimeout(() => { reset(); }, 500); // Reset after closing
    }, 2000);
  };

  const reset = () => {
    setStep("upload");
    setValidRows([]);
    setInvalidRows([]);
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-sm shadow-sm overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-jsw-corp">Import Master Grades</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload a spreadsheet to bulk create or update master records.</p>
          </div>
          <button onClick={onClose} disabled={step === "saving"} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          
          {step === "upload" && (
            <div className="space-y-6">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-sm p-12 text-center transition-colors ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white hover:border-slate-400"
                }`}
              >
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="size-6 text-slate-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Drag & Drop your Excel file here</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">Supports .xlsx, .xls, and .csv up to 10MB.</p>
                
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".xlsx,.xls,.csv" className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} className="bg-jsw-corp hover:bg-jsw-corp/90 text-white shadow-sm font-semibold h-9 px-6">
                  Browse Files
                </Button>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-sm p-4 flex items-start gap-3">
                <FileDown className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Need a template?</h4>
                  <p className="text-xs text-blue-700/80 mt-1 mb-3">Download our strict data template to ensure your structural formatting passes validation.</p>
                  <Button onClick={downloadTemplate} variant="outline" size="sm" className="h-8 text-xs font-bold text-blue-700 bg-white border-blue-200 hover:bg-blue-50">
                    Download Template
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm h-full flex flex-col min-h-[400px]">
              
              <div className="flex items-center gap-4 border-b border-slate-200 p-2">
                <button 
                  onClick={() => setActiveTab("valid")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-sm transition-colors ${
                    activeTab === "valid" ? "bg-green-50 text-green-700" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <CheckCircle2 className="size-4" /> Ready to Import ({validRows.length})
                </button>
                <button 
                  onClick={() => setActiveTab("invalid")}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-sm transition-colors ${
                    activeTab === "invalid" ? "bg-red-50 text-red-700" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <AlertTriangle className="size-4" /> Issues Found ({invalidRows.length})
                </button>
              </div>

              <div className="flex-1 overflow-auto p-0">
                {activeTab === "valid" && (
                  validRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-slate-400 min-h-[250px]">
                      <Database className="size-8 text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-600">No Valid Records</p>
                      <p className="text-xs mt-1">Review the issues tab to fix structural errors.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-bold text-slate-600">Grade Code</th>
                          <th className="px-4 py-3 font-bold text-slate-600">Grade Name</th>
                          <th className="px-4 py-3 font-bold text-slate-600">Metal Class</th>
                          <th className="px-4 py-3 font-bold text-slate-600">Multiplier</th>
                          <th className="px-4 py-3 font-bold text-slate-600">Premium</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {validRows.slice(0, 100).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-bold text-slate-700">{row.code}</td>
                            <td className="px-4 py-2.5 font-medium text-slate-600">{row.name}</td>
                            <td className="px-4 py-2.5 font-medium text-slate-600">{row.metal}</td>
                            <td className="px-4 py-2.5 font-medium text-slate-600">{row.multiplier}</td>
                            <td className="px-4 py-2.5 font-medium text-slate-600">{row.premium}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}

                {activeTab === "invalid" && (
                  invalidRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-slate-400 min-h-[250px]">
                      <CheckCircle2 className="size-8 text-green-400 mb-3" />
                      <p className="text-sm font-bold text-slate-600">Data looks clean!</p>
                      <p className="text-xs mt-1">No parsing structural errors were detected.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-red-50/50 sticky top-0 border-b border-red-100">
                        <tr>
                          <th className="px-4 py-3 font-bold text-slate-600 w-16">Row</th>
                          <th className="px-4 py-3 font-bold text-red-600">Error Description</th>
                          <th className="px-4 py-3 font-bold text-slate-600">Grade Code (Raw)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invalidRows.map((row, i) => (
                          <tr key={i} className="hover:bg-red-50/30">
                            <td className="px-4 py-2.5 font-bold text-slate-500">#{row.RowNumber}</td>
                            <td className="px-4 py-2.5 font-bold text-red-600">{row.Error}</td>
                            <td className="px-4 py-2.5 font-medium text-slate-600">{row["Grade Code"] || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}
              </div>
            </div>
          )}

          {step === "saving" && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative">
                <Loader2 className="size-10 text-blue-600 animate-spin mb-4" />
                <div className="absolute inset-0 rounded-full blur-xl bg-blue-400/20 animate-pulse"></div>
              </div>
              <h3 className="text-base font-bold text-jsw-corp">Committing Records...</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">Dispatching bulk payload to the secure Master Data backend infrastructure. Please do not close this window.</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center">
          {step === "preview" ? (
            <Button onClick={reset} variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100 h-9">
              Cancel & Start Over
            </Button>
          ) : (
            <div /> // Spacer
          )}

          <div className="flex items-center gap-3">
            {step === "upload" && (
              <Button onClick={() => { reset(); onClose(); }} variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100 h-9">
                Cancel
              </Button>
            )}

            {step === "preview" && (
              <>
                {invalidRows.length > 0 && (
                  <Button onClick={downloadErrorReport} variant="outline" className="border-red-200 text-red-700 bg-red-50 hover:bg-red-100 font-bold h-9">
                    <Download className="mr-2 size-4" /> Download Error Log
                  </Button>
                )}
                <Button 
                  onClick={handleBulkSave} 
                  disabled={validRows.length === 0}
                  className="bg-jsw-corp hover:bg-jsw-corp/90 text-white shadow-sm font-semibold h-9 px-6"
                >
                  Import {validRows.length} Grades <ArrowRight className="ml-2 size-4" />
                </Button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
