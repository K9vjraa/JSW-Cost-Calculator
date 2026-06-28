import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Plus, 
  Trash2, 
  Lock, 
  ShieldCheck, 
  ShieldAlert, 
  GripVertical, 
  AlertTriangle, 
  Search, 
  Upload, 
  X, 
  FileSpreadsheet, 
  History, 
  Sparkles 
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input, Button, Badge, Checkbox, Select, Modal, inr } from "@jsw-mcms/ui";
import { toast } from "sonner";
import type { RawMaterial } from "@/types";

export interface RawMaterialItem {
  id: string;
  rawMaterialId: string;
  quantity: number;
  compositionPct?: number; // Optional metallurgical percentage
}

interface RawMaterialTableProps {
  rawMaterials: RawMaterialItem[];
  rawMaterialsList: RawMaterial[];
  cardQuantity: number;
  onUpdate: (materials: RawMaterialItem[]) => void;
  isDirectQuantityMode?: boolean;
}

// Local Storage helpers for Recent & Frequent materials
const RECENT_KEY = "mcms_recent_material_ids";
const USAGE_KEY = "mcms_material_usage_counts";

const getRecentIds = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentId = (id: string) => {
  try {
    const stored = getRecentIds();
    const updated = [id, ...stored.filter((x) => x !== id)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
};

const getUsageCounts = (): Record<string, number> => {
  try {
    const stored = localStorage.getItem(USAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const incrementUsageCount = (id: string) => {
  try {
    const counts = getUsageCounts();
    counts[id] = (counts[id] || 0) + 1;
    localStorage.setItem(USAGE_KEY, JSON.stringify(counts));
  } catch {}
};

// ─── CUSTOM SEARCHABLE AUTOCOMPLETE ───
interface AutocompleteProps {
  value: string;
  onChange: (id: string) => void;
  rawMaterialsList: RawMaterial[];
  rowIndex: number;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isInvalid?: boolean;
  hasWarning?: boolean;
}

function MaterialSelectorAutocomplete({
  value,
  onChange,
  rawMaterialsList,
  rowIndex,
  autoFocus = false,
  onKeyDown,
  isInvalid = false,
  hasWarning = false,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedMaterial = useMemo(() => {
    return rawMaterialsList.find((rm) => rm.id === value);
  }, [value, rawMaterialsList]);

  // Sync initial input display value
  const [inputValue, setInputValue] = useState("");
  useEffect(() => {
    if (selectedMaterial) {
      setInputValue(`${selectedMaterial.name} (${selectedMaterial.code})`);
    } else {
      setInputValue("");
    }
  }, [selectedMaterial]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset to original selected value on blur
        if (selectedMaterial) {
          setInputValue(`${selectedMaterial.name} (${selectedMaterial.code})`);
        } else {
          setInputValue("");
        }
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedMaterial]);

  // Fetch recent and frequent materials
  const recentMaterials = useMemo(() => {
    const recentIds = getRecentIds();
    return recentIds
      .map((id) => rawMaterialsList.find((rm) => rm.id === id))
      .filter((rm): rm is RawMaterial => !!rm);
  }, [rawMaterialsList, isOpen]);

  const frequentMaterials = useMemo(() => {
    const counts = getUsageCounts();
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id]) => rawMaterialsList.find((rm) => rm.id === id))
      .filter((rm): rm is RawMaterial => !!rm);
  }, [rawMaterialsList, isOpen]);

  // Filter materials based on search query
  const filteredMaterials = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return rawMaterialsList;
    return rawMaterialsList.filter(
      (rm) =>
        rm.name.toLowerCase().includes(query) ||
        rm.code.toLowerCase().includes(query) ||
        (rm.category && rm.category.toLowerCase().includes(query))
    );
  }, [searchQuery, rawMaterialsList]);

  // Group materials by category
  const groupedMaterials = useMemo(() => {
    const groups: Record<string, RawMaterial[]> = {};
    filteredMaterials.forEach((rm) => {
      const cat = rm.category || "Other Additives";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(rm);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredMaterials]);

  // Flat list of filtered items for keyboard index mapping
  const flatFilteredList = useMemo(() => {
    return groupedMaterials.reduce<RawMaterial[]>((acc, [_, items]) => [...acc, ...items], []);
  }, [groupedMaterials]);

  const handleSelect = (id: string) => {
    onChange(id);
    saveRecentId(id);
    incrementUsageCount(id);
    setIsOpen(false);
    setSearchQuery("");

    // Automatically focus the quantity field of this row
    setTimeout(() => {
      const qtyInput = document.querySelector(
        `[data-row-index="${rowIndex}"][data-col-index="1"]`
      ) as HTMLInputElement | null;
      if (qtyInput) {
        qtyInput.focus();
        qtyInput.select();
      }
    }, 50);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) => 
          flatFilteredList.length > 0 ? (prev + 1) % flatFilteredList.length : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) => 
          flatFilteredList.length > 0 
            ? (prev - 1 + flatFilteredList.length) % flatFilteredList.length 
            : 0
        );
      }
    } else if (e.key === "Enter") {
      if (isOpen && flatFilteredList[highlightedIndex]) {
        e.preventDefault();
        handleSelect(flatFilteredList[highlightedIndex].id);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      if (selectedMaterial) {
        setInputValue(`${selectedMaterial.name} (${selectedMaterial.code})`);
      }
      setSearchQuery("");
      inputRef.current?.blur();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsOpen(true);
    e.target.select();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setSearchQuery(e.target.value);
            setHighlightedIndex(0);
          }}
          onFocus={handleFocus}
          onKeyDown={handleInputKeyDown}
          autoFocus={autoFocus}
          data-row-index={rowIndex}
          data-col-index={0}
          className={`h-9 w-full rounded-sm border px-3 pr-8 text-xs font-bold transition-all duration-200 outline-none focus-visible:outline-none ${
            isInvalid 
              ? "border-rose-400 bg-rose-50/20 text-rose-900 focus-visible:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1" 
              : hasWarning 
                ? "border-amber-400 bg-amber-50/20 text-amber-900 focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
                : "border-[#d6dfeb] bg-white text-[#10233d] focus-visible:border-[#1A365D] focus-visible:ring-2 focus-visible:ring-[#1A365D] focus-visible:ring-offset-1"
          }`}
          placeholder="Search ingredients by name, code or category..."
        />
        <span className="absolute right-2 text-slate-400 pointer-events-none">
          <Search className="h-3.5 w-3.5" />
        </span>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 max-h-72 w-96 bg-white border border-[#d6dfeb] rounded-sm shadow-xl z-50 overflow-hidden flex flex-col transition-all duration-200 ease-in-out">
          <div className="overflow-y-auto flex-1 scrollbar-thin text-left">
            {/* Quick selectors: Recent & Frequent */}
            {searchQuery === "" && (recentMaterials.length > 0 || frequentMaterials.length > 0) && (
              <div className="p-2.5 bg-slate-50/60 border-b border-[#d6dfeb]/60 text-[10px] text-slate-500 font-bold uppercase tracking-wider flex flex-col gap-2">
                {recentMaterials.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1 text-slate-400">
                      <History className="h-3 w-3" />
                      <span>Recent Ingredients</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {recentMaterials.map((rm) => (
                        <button
                          key={rm.id}
                          type="button"
                          onClick={() => handleSelect(rm.id)}
                          className="px-2 py-0.5 bg-white border border-[#d6dfeb] text-slate-700 font-bold uppercase font-mono rounded-sm hover:border-[#1A365D] hover:bg-[#1A365D]/5 transition-colors text-[9px]"
                        >
                          {rm.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {frequentMaterials.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1 text-slate-400">
                      <Sparkles className="h-3 w-3" />
                      <span>Frequently Configured</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {frequentMaterials.map((rm) => (
                        <button
                          key={rm.id}
                          type="button"
                          onClick={() => handleSelect(rm.id)}
                          className="px-2 py-0.5 bg-white border border-[#d6dfeb] text-slate-700 font-bold uppercase font-mono rounded-sm hover:border-[#1A365D] hover:bg-[#1A365D]/5 transition-colors text-[9px]"
                        >
                          {rm.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Flat Grouped Options List */}
            {groupedMaterials.length === 0 ? (
              <div className="p-4 text-center text-slate-400 italic text-xs">
                No materials matched "{searchQuery}"
              </div>
            ) : (
              (() => {
                let absoluteItemIdx = 0;
                return groupedMaterials.map(([category, items]) => (
                  <div key={category} className="border-b border-[#d6dfeb]/30 last:border-b-0">
                    <div className="bg-slate-100/75 text-[9px] font-black uppercase text-[#56657a] px-3 py-1 sticky top-0 border-b border-[#d6dfeb]/20 tracking-wider">
                      {category}
                    </div>
                    <div>
                      {items.map((item) => {
                        const itemIdx = absoluteItemIdx++;
                        const isHighlighted = itemIdx === highlightedIndex;
                        const isSelected = item.id === value;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelect(item.id)}
                            onMouseEnter={() => setHighlightedIndex(itemIdx)}
                            className={`px-3 py-2 flex items-center justify-between cursor-pointer border-b border-slate-50 last:border-0 transition-colors text-xs ${
                              isHighlighted 
                                ? "bg-[#1A365D]/5 text-[#1A365D] font-extrabold border-l-2 border-l-[#1A365D]" 
                                : isSelected
                                  ? "bg-slate-50 text-[#10233d] font-bold"
                                  : "text-slate-700"
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800">{item.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase mt-0.5">
                                {item.code}
                              </span>
                            </div>
                            <span className="px-1.5 py-0.5 text-[9px] font-black bg-slate-100 border border-slate-200/80 rounded-sm text-slate-500 uppercase tracking-wide">
                              {item.category || "Additives"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── IMPORT / PASTE FROM EXCEL MODAL ───
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawMaterialsList: RawMaterial[];
  isDirectQuantityMode: boolean;
  cardQuantity: number;
  onImport: (importedItems: RawMaterialItem[], isAppend: boolean) => void;
}

function ImportModal({
  isOpen,
  onClose,
  rawMaterialsList,
  isDirectQuantityMode,
  cardQuantity,
  onImport,
}: ImportModalProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "csv">("paste");
  const [pasteText, setPasteText] = useState("");
  const [importMode, setImportMode] = useState<"append" | "replace">("replace");
  const [errorMsg, setErrorMsg] = useState("");
  const [summaryReport, setSummaryReport] = useState<{
    matched: number;
    failed: number;
    details: string[];
    parsedItems: RawMaterialItem[];
  } | null>(null);

  const handleParse = () => {
    setErrorMsg("");
    setSummaryReport(null);

    const rows: string[][] = [];
    const lines = pasteText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l !== "");

    if (lines.length === 0) {
      setErrorMsg("Please paste some data or enter text first.");
      return;
    }

    for (const line of lines) {
      const cells = line.includes("\t") ? line.split("\t") : line.split(",");
      rows.push(cells.map((c) => c.trim().replace(/^["']|["']$/g, "")));
    }

    let startIndex = 0;
    let codeCol = 0;
    let valCol = 1;

    // Detect header row
    const firstRow = rows[0];
    const hasHeader = firstRow.some((cell) => {
      const c = cell.toLowerCase();
      return (
        c.includes("code") ||
        c.includes("name") ||
        c.includes("material") ||
        c.includes("comp") ||
        c.includes("qty") ||
        c.includes("quantity")
      );
    });

    if (hasHeader) {
      startIndex = 1;
      firstRow.forEach((cell, idx) => {
        const c = cell.toLowerCase();
        if (c.includes("code") || c.includes("material") || c.includes("ingredient")) {
          codeCol = idx;
        } else if (
          c.includes("comp") ||
          c.includes("qty") ||
          c.includes("quantity") ||
          c.includes("value") ||
          c.includes("percent")
        ) {
          valCol = idx;
        }
      });
    }

    let matched = 0;
    let failed = 0;
    const details: string[] = [];
    const parsedItems: RawMaterialItem[] = [];

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      const rawCodeOrName = row[codeCol] || "";
      const rawVal = row[valCol] || "";

      if (!rawCodeOrName) continue;

      const matchedMaterial = rawMaterialsList.find(
        (rm) =>
          rm.code.toLowerCase() === rawCodeOrName.toLowerCase() ||
          rm.name.toLowerCase() === rawCodeOrName.toLowerCase()
      );

      if (matchedMaterial) {
        const valNum = parseFloat(rawVal) || 0;
        matched++;
        parsedItems.push({
          id: crypto.randomUUID(),
          rawMaterialId: matchedMaterial.id,
          quantity: isDirectQuantityMode 
            ? valNum 
            : cardQuantity > 0 
              ? (valNum / 100) * cardQuantity 
              : valNum,
          compositionPct: isDirectQuantityMode ? undefined : valNum,
        });
        details.push(`✓ Matched "${rawCodeOrName}" ➔ ${matchedMaterial.name} (${valNum}${isDirectQuantityMode ? " kg" : "%"})`);
      } else {
        failed++;
        details.push(`✗ Failed to match "${rawCodeOrName}"`);
      }
    }

    setSummaryReport({
      matched,
      failed,
      details,
      parsedItems,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setPasteText(text);
      setActiveTab("paste"); // switch to paste tab to preview and parse
      toast.info("CSV file loaded. Click 'Analyze Data' to verify.");
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read CSV file.");
    };
    reader.readAsText(file);
  };

  const handleCommit = () => {
    if (!summaryReport || summaryReport.parsedItems.length === 0) return;
    onImport(summaryReport.parsedItems, importMode === "append");
    onClose();
    setPasteText("");
    setSummaryReport(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Alloy Ingredients"
      subtitle="Paste cells directly from Excel or upload a raw CSV configuration."
      className="max-w-xl"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-4 text-xs font-bold text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === "replace"}
                onChange={() => setImportMode("replace")}
                className="text-[#1A365D] focus:ring-[#1A365D]"
              />
              <span>Replace Recipe</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="append"
                checked={importMode === "append"}
                onChange={() => setImportMode("append")}
                className="text-[#1A365D] focus:ring-[#1A365D]"
              />
              <span>Append Rows</span>
            </label>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} className="h-8 text-xs font-bold uppercase">
              Cancel
            </Button>
            {summaryReport ? (
              <Button
                variant="primary"
                onClick={handleCommit}
                disabled={summaryReport.parsedItems.length === 0}
                className="h-8 bg-[#1A365D] text-xs font-bold uppercase"
              >
                Apply ({summaryReport.parsedItems.length} rows)
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleParse}
                className="h-8 bg-[#1A365D] text-xs font-bold uppercase"
              >
                Analyze Data
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-xs">
        {/* Tabs */}
        <div className="flex border-b border-[#d6dfeb] mb-2">
          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`px-4 py-2 font-bold transition-all border-b-2 text-xs -mb-px flex items-center gap-1.5 ${
              activeTab === "paste"
                ? "border-[#1A365D] text-[#1A365D]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Paste from Excel / Clipboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("csv")}
            className={`px-4 py-2 font-bold transition-all border-b-2 text-xs -mb-px flex items-center gap-1.5 ${
              activeTab === "csv"
                ? "border-[#1A365D] text-[#1A365D]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Upload className="h-4 w-4" />
            Upload CSV File
          </button>
        </div>

        {activeTab === "paste" ? (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              Copy columns directly from your costing Excel sheets (e.g., Column 1: Material Code or Name, Column 2: Value) and paste below. Data must be tab-separated or comma-separated.
            </span>
            <textarea
              className="w-full h-44 rounded-sm border border-[#d6dfeb] p-3 font-mono text-xs text-slate-800 focus-visible:border-[#1A365D] focus-visible:ring-2 focus-visible:ring-[#1A365D] focus-visible:ring-offset-1 focus-visible:outline-none"
              placeholder={`FE-MN-HC\t45.5\nSI-MN\t30.0\nLIME-CALC\t24.5`}
              value={pasteText}
              onChange={(e) => {
                setPasteText(e.target.value);
                setSummaryReport(null);
              }}
            />
          </div>
        ) : (
          <div 
            className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg p-8 flex flex-col items-center justify-center gap-3 transition-colors hover:bg-slate-100 cursor-pointer"
            onClick={() => document.getElementById("csv-file-picker")?.click()}
          >
            <Upload className="h-8 w-8 text-slate-400" />
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="font-bold text-slate-700">Drag & drop your CSV file here</span>
              <span className="text-[10px] text-slate-400">or click to browse from files</span>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-picker"
            />
            <label
              htmlFor="csv-file-picker"
              className="px-4 py-1.5 bg-white border border-[#d6dfeb] hover:bg-slate-50 rounded-sm font-bold text-[#10233d] shadow-sm cursor-pointer transition-colors"
            >
              Select CSV File
            </label>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-100 rounded text-rose-800 font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {summaryReport && (
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-left">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
              <span className="font-extrabold uppercase text-slate-700 tracking-wider">Analysis Summary</span>
              <div className="flex gap-3 font-bold">
                <span className="text-emerald-700">✓ Matched: {summaryReport.matched}</span>
                {summaryReport.failed > 0 && <span className="text-amber-700">✗ Unrecognized: {summaryReport.failed}</span>}
              </div>
            </div>
            <div className="max-h-32 overflow-y-auto scrollbar-thin flex flex-col gap-1 pr-1 font-mono text-[10px] text-slate-600">
              {summaryReport.details.map((detail, idx) => (
                <div key={idx} className={detail.startsWith("✓") ? "text-emerald-800" : "text-amber-700"}>
                  {detail}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── MAIN RAW MATERIAL TABLE COMPONENT ───
export function RawMaterialTable({
  rawMaterials,
  rawMaterialsList,
  cardQuantity,
  onUpdate,
  isDirectQuantityMode = false,
}: RawMaterialTableProps) {
  const [autofocusRowId, setAutofocusRowId] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragDirection, setDragDirection] = useState<"above" | "below" | null>(null);
  const [isDraggableMap, setIsDraggableMap] = useState<Record<string, boolean>>({});

  const addRow = () => {
    const defaultRaw = rawMaterialsList[0];
    if (!defaultRaw) return;

    const newId = crypto.randomUUID();
    const newRow: RawMaterialItem = {
      id: newId,
      rawMaterialId: defaultRaw.id,
      quantity: cardQuantity > 0 ? cardQuantity * 0.1 : 10,
      compositionPct: 10,
    };
    setAutofocusRowId(newId);
    onUpdate([...rawMaterials, newRow]);
  };

  const getItemPct = (item: RawMaterialItem) => {
    if (item.compositionPct !== undefined) return item.compositionPct;
    if (cardQuantity > 0) return (item.quantity / cardQuantity) * 100;
    return 0;
  };

  const handlePctChange = (id: string, pctVal: number) => {
    const safePct = Math.max(0, Math.min(100, pctVal));
    const calculatedQty = cardQuantity > 0 ? (safePct / 100) * cardQuantity : 0;

    const updated = rawMaterials.map((row) => {
      if (row.id === id) {
        return {
          ...row,
          compositionPct: safePct,
          quantity: calculatedQty,
        };
      }
      return row;
    });
    onUpdate(updated);
  };

  const handleQtyChange = (id: string, qtyVal: number) => {
    const safeQty = Math.max(0, qtyVal);
    const updated = rawMaterials.map((row) => {
      if (row.id === id) {
        return { ...row, quantity: safeQty };
      }
      return row;
    });
    onUpdate(updated);
  };

  const handleMaterialChange = (id: string, rawMaterialId: string) => {
    const updated = rawMaterials.map((row) => {
      if (row.id === id) {
        return { ...row, rawMaterialId };
      }
      return row;
    });
    onUpdate(updated);
  };

  const removeRow = (id: string) => {
    onUpdate(rawMaterials.filter((row) => row.id !== id));
  };

  // Import handler
  const handleImportData = (newItems: RawMaterialItem[], isAppend: boolean) => {
    if (isAppend) {
      onUpdate([...rawMaterials, ...newItems]);
    } else {
      onUpdate(newItems);
    }
  };

  // Keyboard navigation logic
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    const { key } = e;
    if (key === "ArrowDown") {
      e.preventDefault();
      const nextEl = document.querySelector(
        `[data-row-index="${rowIndex + 1}"][data-col-index="${colIndex}"]`
      ) as HTMLInputElement | null;
      if (nextEl) {
        nextEl.focus();
        nextEl.select();
      }
    } else if (key === "ArrowUp") {
      e.preventDefault();
      const prevEl = document.querySelector(
        `[data-row-index="${rowIndex - 1}"][data-col-index="${colIndex}"]`
      ) as HTMLInputElement | null;
      if (prevEl) {
        prevEl.focus();
        prevEl.select();
      }
    } else if (key === "ArrowRight" && colIndex === 0) {
      const el = e.currentTarget;
      if (el.selectionStart === el.value.length) {
        const nextEl = document.querySelector(
          `[data-row-index="${rowIndex}"][data-col-index="1"]`
        ) as HTMLInputElement | null;
        if (nextEl) {
          nextEl.focus();
          nextEl.select();
        }
      }
    } else if (key === "ArrowLeft" && colIndex === 1) {
      const el = e.currentTarget;
      if (el.selectionStart === 0) {
        const prevEl = document.querySelector(
          `[data-row-index="${rowIndex}"][data-col-index="0"]`
        ) as HTMLInputElement | null;
        if (prevEl) {
          prevEl.focus();
          prevEl.select();
        }
      }
    } else if (key === "Enter") {
      if (colIndex === 1) {
        e.preventDefault();
        // If last row, add new row. Else, focus next row first column
        if (rowIndex === rawMaterials.length - 1) {
          addRow();
        } else {
          const nextEl = document.querySelector(
            `[data-row-index="${rowIndex + 1}"][data-col-index="0"]`
          ) as HTMLInputElement | null;
          if (nextEl) {
            nextEl.focus();
            nextEl.select();
          }
        }
      }
    }
  };

  // Drag and Drop callbacks
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setDragOverIndex(index);
    // Determine drag direction relative to target row
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    if (relativeY < rect.height / 2) {
      setDragDirection("above");
    } else {
      setDragDirection("below");
    }
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...rawMaterials];
    const [removed] = updated.splice(draggedIndex, 1);
    
    // Adjust target drop index based on insertion direction
    let targetIdx = index;
    if (dragDirection === "below" && index > draggedIndex) {
      // drop below item
    } else if (dragDirection === "above" && index < draggedIndex) {
      // drop above item
    }
    
    updated.splice(targetIdx, 0, removed);
    onUpdate(updated);

    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragDirection(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragDirection(null);
  };

  // Calculate sum totals
  const totalQuantity = rawMaterials.reduce(
    (sum, item) =>
      sum +
      (isDirectQuantityMode
        ? item.quantity
        : cardQuantity > 0
          ? (getItemPct(item) / 100) * cardQuantity
          : item.quantity),
    0
  );

  const totalPct = isDirectQuantityMode
    ? rawMaterials.reduce(
        (sum, item) => sum + (totalQuantity > 0 ? (item.quantity / totalQuantity) * 100 : 0),
        0
      )
    : rawMaterials.reduce((sum, item) => sum + getItemPct(item), 0);

  const totalCost = rawMaterials.reduce((sum, item) => {
    const currentMaterial =
      rawMaterialsList.find((r) => r.id === item.rawMaterialId) || rawMaterialsList[0];
    const pricePerKg = Number(currentMaterial?.prices?.[0]?.pricePerUnit ?? 0);
    const qty = isDirectQuantityMode
      ? item.quantity
      : cardQuantity > 0
        ? (getItemPct(item) / 100) * cardQuantity
        : item.quantity;
    return sum + qty * pricePerKg;
  }, 0);

  // Duplicate materials detection map
  const duplicateMap = useMemo(() => {
    const counts: Record<string, number> = {};
    rawMaterials.forEach((rm) => {
      counts[rm.rawMaterialId] = (counts[rm.rawMaterialId] || 0) + 1;
    });
    return counts;
  }, [rawMaterials]);

  // Check balanced state (within 0.1% tolerance)
  const isRecipeBalanced = Math.abs(totalPct - 100) < 0.1;

  return (
    <div className="rounded-sm border border-[#d6dfeb] bg-[#fafcff] overflow-hidden text-left shadow-xs flex flex-col transition-all duration-200">
      {/* Scrollable Container with Sticky Table Header */}
      <div className="overflow-x-auto max-h-[380px] scrollbar-thin relative">
        <table className="w-full text-xs table-fixed">
          <thead>
            <tr className="bg-slate-100 border-b border-[#d6dfeb] select-none">
              <th className="w-10 sticky top-0 bg-slate-100 z-10 border-b border-[#d6dfeb] py-2.5"></th>
              <th className="w-10 text-center font-semibold text-slate-600 uppercase tracking-wider text-[11px] bg-slate-100 sticky top-0 z-10 border-b border-[#d6dfeb] py-2.5">
                #
              </th>
              <th className="text-left font-semibold text-slate-600 uppercase tracking-wider text-[11px] bg-slate-100 sticky top-0 z-10 border-b border-[#d6dfeb] py-2.5 px-3">
                Raw Material Ingredient
              </th>
              <th className="text-left font-semibold text-slate-600 uppercase tracking-wider text-[11px] w-28 bg-slate-100 sticky top-0 z-10 border-b border-[#d6dfeb] py-2.5 px-3">
                Category
              </th>
              <th className="text-right font-semibold text-slate-600 uppercase tracking-wider text-[11px] w-32 bg-slate-100 sticky top-0 z-10 border-b border-[#d6dfeb] py-2.5 px-3">
                {isDirectQuantityMode ? "Quantity (kg)" : "Composition %"}
              </th>
              <th className="text-right font-semibold text-slate-600 uppercase tracking-wider text-[11px] w-28 bg-slate-100 sticky top-0 z-10 border-b border-[#d6dfeb] py-2.5 px-3">
                {isDirectQuantityMode ? "Auto Comp %" : "Auto Qty (kg)"}
              </th>
              <th className="text-right font-semibold text-slate-600 uppercase tracking-wider text-[11px] w-32 bg-slate-100 sticky top-0 z-10 border-b border-[#d6dfeb] py-2.5 px-3">
                Locked Price
              </th>
              <th className="text-right font-semibold text-slate-600 uppercase tracking-wider text-[11px] w-28 bg-slate-100 sticky top-0 z-10 border-b border-[#d6dfeb] py-2.5 px-3">
                Material Cost
              </th>
              <th className="w-12 bg-slate-100 sticky top-0 z-10 border-b border-[#d6dfeb] py-2.5"></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {rawMaterials.length === 0 ? (
              <tr>
                <td colSpan={9} className="h-28 text-center text-[#56657a] font-semibold py-8 bg-slate-50/20">
                  <div className="flex flex-col items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-slate-400" />
                    <span>No raw materials configured. Click "Add Ingredient" or "Import" to build recipe.</span>
                  </div>
                </td>
              </tr>
            ) : (
              rawMaterials.map((row, index) => {
                const currentMaterial =
                  rawMaterialsList.find((r) => r.id === row.rawMaterialId) || rawMaterialsList[0];
                const pricePerKg = Number(currentMaterial?.prices?.[0]?.pricePerUnit ?? 0);

                const pct = isDirectQuantityMode
                  ? totalQuantity > 0
                    ? (row.quantity / totalQuantity) * 100
                    : 0
                  : getItemPct(row);
                const qty = isDirectQuantityMode
                  ? row.quantity
                  : cardQuantity > 0
                    ? (pct / 100) * cardQuantity
                    : row.quantity;
                const cost = qty * pricePerKg;

                // Validations
                const isDuplicate = duplicateMap[row.rawMaterialId] > 1;
                const isMissingPrice = !currentMaterial || pricePerKg === 0;
                const isInvalidMaterial = !rawMaterialsList.some((rm) => rm.id === row.rawMaterialId);

                // Row borders class for Drag-and-drop feedback
                let dropStyles = "border-b border-[#d6dfeb]/50";
                if (dragOverIndex === index && draggedIndex !== null) {
                  if (dragDirection === "above") {
                    dropStyles += " border-t-2 border-t-[#0057b8]";
                  } else {
                    dropStyles += " border-b-2 border-b-[#0057b8]";
                  }
                }

                return (
                  <tr
                    key={row.id}
                    draggable={isDraggableMap[row.id] || false}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={handleDragEnd}
                    className={`hover:bg-slate-50 transition-colors duration-150 group border-b border-slate-50 last:border-0 ${
                      draggedIndex === index ? "opacity-35 bg-slate-100/50" : ""
                    } ${dropStyles}`}
                  >
                    {/* Drag Handle Column */}
                    <td className="text-center align-middle py-1.5 px-2">
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
                        onMouseDown={() => setIsDraggableMap((p) => ({ ...p, [row.id]: true }))}
                        onMouseUp={() => setIsDraggableMap((p) => ({ ...p, [row.id]: false }))}
                      >
                        <GripVertical className="h-3.5 w-3.5" />
                      </div>
                    </td>

                    {/* Row Index */}
                    <td className="text-center font-mono text-[10px] text-slate-400 font-bold select-none">
                      {index + 1}
                    </td>

                    {/* Material Selector Autocomplete */}
                    <td className="py-1 pl-1 pr-1.5">
                      <MaterialSelectorAutocomplete
                        value={row.rawMaterialId}
                        onChange={(val) => handleMaterialChange(row.id, val)}
                        rawMaterialsList={rawMaterialsList}
                        rowIndex={index}
                        autoFocus={row.id === autofocusRowId}
                        onKeyDown={(e) => handleKeyDown(e, index, 0)}
                        isInvalid={isInvalidMaterial}
                        hasWarning={isDuplicate || isMissingPrice}
                      />
                    </td>

                    {/* Category Label */}
                    <td className="align-middle text-slate-500 font-semibold select-none text-[11px] uppercase truncate px-3">
                      {currentMaterial?.category || "Additives"}
                    </td>

                    {/* Editable Quantity or Composition Percentage */}
                    <td className="py-1">
                      <div className="relative flex items-center justify-end">
                        <Input
                          type="number"
                          step="any"
                          data-row-index={index}
                          data-col-index={1}
                          onKeyDown={(e) => handleKeyDown(e, index, 1)}
                          className={`h-9 text-right text-xs font-black pr-8 w-24 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-offset-1 ${
                            isDuplicate || isMissingPrice
                              ? "border-amber-300 focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500"
                              : "border-[#d6dfeb] focus-visible:border-[#1A365D] focus-visible:ring-2 focus-visible:ring-[#1A365D]"
                          }`}
                          value={
                            isDirectQuantityMode
                              ? row.quantity === 0
                                ? ""
                                : row.quantity
                              : pct === 0
                                ? ""
                                : Number(Number(pct ?? 0).toFixed(2))
                          }
                          onChange={(e) => {
                            if (isDirectQuantityMode) {
                              handleQtyChange(row.id, Number(e.target.value));
                            } else {
                              handlePctChange(row.id, Number(e.target.value));
                            }
                          }}
                          placeholder="0.0"
                        />
                        <span className="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none select-none">
                          {isDirectQuantityMode ? "kg" : "%"}
                        </span>
                      </div>
                    </td>

                    {/* Calculated Auto Field (Weight or Comp) */}
                    <td className="text-right align-middle pr-2">
                      <div className="h-8 flex items-center justify-end font-bold text-slate-700 pr-1">
                        <span className="font-mono text-xs">
                          {isDirectQuantityMode
                            ? pct.toLocaleString("en-IN", { maximumFractionDigits: 2 })
                            : qty.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold ml-1 select-none">
                          {isDirectQuantityMode ? "%" : "kg"}
                        </span>
                      </div>
                    </td>

                    {/* Locked Price Master with Warning Alerts */}
                    <td className="text-right align-middle px-3">
                      <div className="flex items-center justify-end gap-1 font-bold text-slate-600">
                        {isMissingPrice ? (
                          <Badge variant="danger" icon={<AlertTriangle className="h-3 w-3 animate-pulse" />}>
                            No Rate
                          </Badge>
                        ) : (
                          <>
                            <span className="font-mono text-xs">{inr(pricePerKg)} / kg</span>
                            <Lock className="h-3 w-3 text-slate-400 select-none" />
                          </>
                        )}
                      </div>
                    </td>

                    {/* Calculated ingredient cost */}
                    <td className="text-right align-middle font-mono font-black text-slate-800 pr-1">
                      {isMissingPrice ? (
                        <span className="text-slate-400 font-bold italic">-</span>
                      ) : (
                        inr(cost)
                      )}
                    </td>

                    {/* Remove Action */}
                    <td className="text-center align-middle">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 rounded-sm text-rose-600 hover:bg-rose-50 p-0 opacity-40 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeRow(row.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Warnings & Status Overlay */}
      {rawMaterials.length > 0 && (
        <div className="px-4 py-3 border-t border-[#d6dfeb] bg-slate-50/50 flex flex-col gap-2">
          {Object.entries(duplicateMap).map(([id, count]) => {
            if (count > 1) {
              const dupMat = rawMaterialsList.find((rm) => rm.id === id);
              return (
                <div key={id} className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-sm text-[11px] text-amber-800 font-semibold shadow-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Warning:</strong> Material "{dupMat?.name || "Ingredient"}" is configured {count} times in the recipe composition.
                  </span>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      {/* Table Footer Actions & Dynamic Balance Badges */}
      <div className="border-t border-[#d6dfeb] bg-white sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {/* Row 1: Action Bar & Balance Progress */}
        <div className="flex items-center justify-between p-3 gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              className="h-9 gap-1.5 rounded-sm bg-[#1A365D] hover:bg-[#122543] text-white text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
              onClick={addRow}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Ingredient
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-sm text-[#1A365D] border-[#1A365D]/30 bg-white hover:bg-slate-50 text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
              onClick={() => setIsImportOpen(true)}
              leftIcon={<FileSpreadsheet className="h-4 w-4" />}
            >
              Import / Paste
            </Button>
          </div>

          {!isDirectQuantityMode && (
            <div className="flex flex-col gap-1 w-full max-w-[200px] sm:max-w-xs text-left">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
                <span>Recipe Composition</span>
                <span
                  className={
                    isRecipeBalanced
                      ? "text-emerald-700 font-black"
                      : totalPct > 100
                        ? "text-rose-700 font-black animate-pulse"
                        : "text-amber-700 font-black"
                  }
                >
                  {Number(totalPct.toFixed(2))}% / 100%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${
                    isRecipeBalanced
                      ? "bg-emerald-500"
                      : totalPct > 100
                        ? "bg-rose-500"
                        : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, totalPct)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Cost summary strip */}
        {rawMaterials.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#d6dfeb] bg-[#1A365D]/5 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <Badge
                variant={isRecipeBalanced ? "success" : "warning"}
                icon={
                  isRecipeBalanced ? (
                    <ShieldCheck className="h-3 w-3" />
                  ) : (
                    <ShieldAlert className="h-3 w-3" />
                  )
                }
              >
                {isRecipeBalanced ? "Recipe Balanced" : "Recipe Unbalanced"}
              </Badge>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Weight:{" "}
                <span className="font-mono font-black text-slate-700">
                  {totalQuantity.toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg
                </span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-2">
                Alloy Cost subtotal:
              </span>
              <span className="text-xs font-mono font-black text-[#1A365D]">{inr(totalCost)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal component */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        rawMaterialsList={rawMaterialsList}
        isDirectQuantityMode={isDirectQuantityMode}
        cardQuantity={cardQuantity}
        onImport={handleImportData}
      />
    </div>
  );
}
