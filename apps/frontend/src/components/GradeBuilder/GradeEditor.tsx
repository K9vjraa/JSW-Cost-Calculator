import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import {
  Calculator, Save, Plus, Trash2, GripVertical, Copy, Send,
  Loader2, ChevronDown, ChevronUp, Search, AlertTriangle,
  CheckCircle2, Package, X, Filter, PanelLeft, PanelLeftClose
} from "lucide-react";
import { Card, CardContent, Input, Button, inr } from "@jsw-mcms/ui";
import { toast } from "sonner";
import { useGradeBuilderStore } from "../../store/gradeBuilderStore";
import {
  useMaterials,
  useGrades,
  useGrade,
  useGradeMaterials,
  useUpdateGrade,
  useCloneGrade,
  useSubmitGrade,
  useCreateGrade,
  useDeleteGrade,
  useAddGradeMaterial,
  useUpdateGradeMaterial,
  useRemoveGradeMaterial,
  usePublishGrade
} from "../../services/gradeMasterApi";
import { useAuthStore } from "../../store/authStore";
import { createGradeSchema } from "../../validations";
import { GradeWorkflowStepper } from "./GradeWorkflowStepper";
const STEEL_CATEGORIES = ["MS Hot Rolled", "MS Cold Rolled", "CRCA", "Galvanized", "Color Coated"];
const STEEL_TYPES = ["Carbon Steel", "Alloy Steel", "Stainless Steel", "Electrical Steel"];

/* ────────────────────────────────────────────────────────────────────
   AUTOCOMPLETE COMBOBOX — dropdown with search + category filter
   ──────────────────────────────────────────────────────────────── */
function MaterialAutocomplete({
  materials,
  existingIds,
  onSelect,
  isLoading,
}: {
  materials: any[];
  existingIds: Set<string>;
  onSelect: (mat: any) => void;
  isLoading: boolean;
}) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const approved = useMemo(
    () => materials.filter((m: any) => m.status === "ACTIVE"),
    [materials]
  );

  const categories = useMemo(() => {
    const cats = new Set(approved.map((m: any) => m.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [approved]);

  const filtered = useMemo(() => {
    let list = approved;
    if (categoryFilter !== "ALL") {
      list = list.filter((m: any) => m.category === categoryFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (m: any) =>
          m.name?.toLowerCase().includes(q) ||
          m.code?.toLowerCase().includes(q) ||
          m.materialName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [approved, query, categoryFilter]);

  const handleSelect = (mat: any) => {
    if (existingIds.has(mat.id)) {
      toast.error("Material already added", { id: "dup-ac" });
      return;
    }
    onSelect(mat);
    setQuery("");
    setIsOpen(false);
    setHighlightIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key === "ArrowDown") {
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIdx((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIdx((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIdx >= 0 && highlightIdx < filtered.length) {
          handleSelect(filtered[highlightIdx]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightIdx(-1);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIdx] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx]);

  return (
    <div className="relative flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        {/* Category filter pill */}
        <div className="relative shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 text-[9px] font-bold uppercase bg-white border border-slate-200 rounded-sm pl-6 pr-2 text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary appearance-none min-w-[100px]"
          >
            <option value="ALL">All Types</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Filter className="absolute left-2 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
        </div>

        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 pointer-events-none z-10" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightIdx(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              // Delay close so click on item registers
              setTimeout(() => setIsOpen(false), 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Loading materials..." : "Search approved materials by name, code, alloy..."}
            className="w-full h-8 text-xs font-medium bg-white border border-slate-200 rounded-sm pl-8 pr-8 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white border border-slate-200 rounded-sm shadow-lg max-h-64 overflow-hidden flex flex-col">
          {/* Results count */}
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center justify-between">
            <span>{filtered.length} approved material{filtered.length !== 1 ? 's' : ''}</span>
            {categoryFilter !== "ALL" && (
              <button onClick={() => setCategoryFilter("ALL")} className="text-primary hover:underline flex items-center gap-0.5">
                <X className="h-2.5 w-2.5" /> Clear filter
              </button>
            )}
          </div>

          {/* Material list */}
          <div ref={listRef} className="overflow-y-auto flex-1 scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-400">
                No materials match "{query}"
              </div>
            ) : (
              filtered.map((mat: any, idx: number) => {
                const isDuplicate = existingIds.has(mat.id);
                const isHighlighted = idx === highlightIdx;
                return (
                  <button
                    key={mat.id}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(mat); }}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 border-b border-slate-50 transition-colors ${
                      isDuplicate
                        ? "opacity-40 cursor-not-allowed bg-slate-50"
                        : isHighlighted
                          ? "bg-blue-50"
                          : "hover:bg-slate-50"
                    }`}
                    disabled={isDuplicate}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-700 truncate">{mat.name}</span>
                        {isDuplicate && (
                          <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1 rounded-sm border border-amber-200 shrink-0">ADDED</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-slate-400 font-mono">{mat.code}</span>
                        {mat.category && (
                          <span className="text-[8px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded-sm">{mat.category}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-primary">{inr(Number(mat.currentRate))}</span>
                      <span className="text-[8px] text-slate-400 block">/kg</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Keyboard hint */}
          <div className="px-3 py-1 bg-slate-50 border-t border-slate-100 text-[8px] text-slate-400 font-medium shrink-0 flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   MAIN GRADE EDITOR
   ──────────────────────────────────────────────────────────────── */
export function GradeEditor() {
  const {
    selectedGradeId,
    targetQuantity,
    setTargetQuantity,
    materials,
    setMaterials,
    addMaterial,
    removeMaterial,
    updateComposition,
    reorderMaterials,
    draftGrade,
    updateDraftField,
    isSidebarOpen,
    toggleSidebar
  } = useGradeBuilderStore();

  const { data: gradesList = [], isLoading: isLoadingGrades } = useGrades();
  const { data: rawMaterialsList = [], isLoading: isLoadingRawMaterials } = useMaterials();

  // Load detailed grade object from backend
  const { data: activeGradeDetail, isLoading: isLoadingGradeDetail } = useGrade(
    selectedGradeId && selectedGradeId !== 'new' ? selectedGradeId : null
  );

  const activeGrade = activeGradeDetail || (selectedGradeId && selectedGradeId !== 'new' ? gradesList.find((g: any) => g.id === selectedGradeId) : null);
  const { data: backendGradeMaterials = [], isLoading: isLoadingMaterials } = useGradeMaterials(activeGrade ? activeGrade.id : null);

  const updateGrade = useUpdateGrade();
  const createGrade = useCreateGrade();
  const cloneGrade = useCloneGrade();
  const submitGrade = useSubmitGrade();
  const deleteGrade = useDeleteGrade();
  const addGradeMaterialMutation = useAddGradeMaterial();
  const updateGradeMaterialMutation = useUpdateGradeMaterial();
  const removeGradeMaterialMutation = useRemoveGradeMaterial();
  const publishGradeMutation = usePublishGrade();

  const { actor } = useAuthStore();
  const isCostingUser = actor?.role === "COSTING_DEPARTMENT" || actor?.department === "COSTING";

  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneCode, setCloneCode] = useState("");
  const [cloneName, setCloneName] = useState("");
  const [isGradeInfoExpanded, setIsGradeInfoExpanded] = useState(false);
  // Keyboard navigation: track focused cell [rowIndex, "pct"]
  const [focusedCell, setFocusedCell] = useState<[number, string] | null>(null);
  const compositionRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isNewGrade = selectedGradeId === 'new';
  const isEditable = isNewGrade || (activeGrade && activeGrade.status !== 'ACTIVE' && activeGrade.status !== 'SUBMITTED');

  // Existing material IDs for duplicate prevention
  const existingMaterialIds = useMemo(
    () => new Set(materials.map((m) => m.materialId)),
    [materials]
  );

  // Auto-expand grade info for new grades
  useEffect(() => {
    if (isNewGrade) setIsGradeInfoExpanded(true);
  }, [isNewGrade]);

  // Sync when selected grade changes
  const lastLoadedGradeIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedGradeId) {
      lastLoadedGradeIdRef.current = null;
    }
    if (activeGrade && activeGrade.id !== lastLoadedGradeIdRef.current) {
      lastLoadedGradeIdRef.current = activeGrade.id;
      setMaterials((activeGrade.gradeMaterials || backendGradeMaterials || []).map((m: any) => ({
        id: crypto.randomUUID(),
        materialId: m.materialId,
        materialName: m.material?.name || "Unknown",
        materialCode: m.material?.code || "",
        compositionPercent: Number(m.compositionPercent) || 0,
        rate: Number(m.material?.currentRate) || 0
      })));
      updateDraftField('name', activeGrade.name || '');
      updateDraftField('code', activeGrade.code || '');
      updateDraftField('category', activeGrade.category || '');
      updateDraftField('steelType', activeGrade.steelType || '');
      updateDraftField('subGrade', activeGrade.subGrade || '');
      updateDraftField('description', activeGrade.description || '');
    } else if (isNewGrade && lastLoadedGradeIdRef.current !== 'new') {
      lastLoadedGradeIdRef.current = 'new';
      setMaterials([]);
      updateDraftField('name', '');
      updateDraftField('code', `GRD-${Math.floor(1000 + Math.random() * 9000)}`);
      updateDraftField('category', '');
      updateDraftField('steelType', '');
      updateDraftField('subGrade', '');
      updateDraftField('description', '');
    }
  }, [selectedGradeId, activeGrade, backendGradeMaterials, setMaterials, updateDraftField, isNewGrade]);

  const totalPct = materials.reduce((sum, item) => sum + (Number(item.compositionPercent) || 0), 0);
  const isCompositionValid = Math.abs(totalPct - 100) < 0.01;

  const totalCost = useMemo(() => {
    return materials.reduce((sum, m) => {
      const qty = (Number(m.compositionPercent) / 100) * targetQuantity;
      return sum + qty * m.rate;
    }, 0);
  }, [materials, targetQuantity]);

  const totalQty = useMemo(() => {
    return materials.reduce((sum, m) => {
      return sum + (Number(m.compositionPercent) / 100) * targetQuantity;
    }, 0);
  }, [materials, targetQuantity]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !isEditable) return;
    reorderMaterials(result.source.index, result.destination.index);

    // If existing grade, sync sort orders to backend
    if (activeGrade) {
      try {
        const updatedMaterials = Array.from(materials);
        const [removed] = updatedMaterials.splice(result.source.index, 1);
        updatedMaterials.splice(result.destination.index, 0, removed);
        
        await updateGrade.mutateAsync({
          id: activeGrade.id,
          version: activeGrade.version,
          data: {
            gradeMaterials: updatedMaterials.map((m, i) => ({
              materialId: m.materialId,
              compositionPercent: m.compositionPercent,
              sortOrder: i
            }))
          }
        });
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to update sort order");
      }
    }
  };

  const handleAddFromAutocomplete = useCallback(async (mat: any) => {
    addMaterial({
      materialId: mat.id,
      materialName: mat.name,
      materialCode: mat.code,
      compositionPercent: 0,
      rate: Number(mat.currentRate) || 0
    });

    if (activeGrade) {
      try {
        await addGradeMaterialMutation.mutateAsync({
          gradeId: activeGrade.id,
          materialId: mat.id,
          compositionPercent: 0,
          sortOrder: materials.length
        });
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to add material to database");
      }
    }
  }, [addMaterial, activeGrade, materials.length, addGradeMaterialMutation]);

  const handleRemoveMaterial = useCallback(async (localId: string, materialId: string) => {
    removeMaterial(localId);

    if (activeGrade) {
      try {
        await removeGradeMaterialMutation.mutateAsync({
          gradeId: activeGrade.id,
          materialId
        });
        toast.success("Material removed");
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to remove material from database");
      }
    }
  }, [removeMaterial, activeGrade, removeGradeMaterialMutation]);

  const handleCompositionBlur = useCallback(async (materialId: string, percent: number, sortOrder: number) => {
    if (activeGrade) {
      try {
        await updateGradeMaterialMutation.mutateAsync({
          gradeId: activeGrade.id,
          materialId,
          compositionPercent: percent,
          sortOrder
        });
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to update composition");
      }
    }
  }, [activeGrade, updateGradeMaterialMutation]);

  // ── Keyboard navigation for composition cells ──
  const handleCellKeyDown = useCallback((e: React.KeyboardEvent, rowIndex: number) => {
    switch (e.key) {
      case "Tab": {
        e.preventDefault();
        const next = e.shiftKey ? rowIndex - 1 : rowIndex + 1;
        if (next >= 0 && next < materials.length) {
          setFocusedCell([next, "pct"]);
          compositionRefs.current[next]?.focus();
          compositionRefs.current[next]?.select();
        }
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        const next = rowIndex + 1;
        if (next < materials.length) {
          setFocusedCell([next, "pct"]);
          compositionRefs.current[next]?.focus();
          compositionRefs.current[next]?.select();
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prev = rowIndex - 1;
        if (prev >= 0) {
          setFocusedCell([prev, "pct"]);
          compositionRefs.current[prev]?.focus();
          compositionRefs.current[prev]?.select();
        }
        break;
      }
      case "Enter": {
        e.preventDefault();
        // Move to next row on Enter
        const next = rowIndex + 1;
        if (next < materials.length) {
          setFocusedCell([next, "pct"]);
          compositionRefs.current[next]?.focus();
          compositionRefs.current[next]?.select();
        } else {
          (e.target as HTMLInputElement).blur();
          setFocusedCell(null);
        }
        break;
      }
      case "Escape":
        (e.target as HTMLInputElement).blur();
        setFocusedCell(null);
        break;
      case "Delete":
        if (isEditable) {
          handleRemoveMaterial(materials[rowIndex].id, materials[rowIndex].materialId);
        }
        break;
    }
  }, [materials, isEditable, handleRemoveMaterial]);

  const handleSaveDraft = async () => {
    if (!isCompositionValid) {
      toast.error("Composition must be exactly 100%", { id: "sub-pct-err" });
      return;
    }
    
    const payload = {
      name: draftGrade.name,
      code: draftGrade.code,
      category: draftGrade.category,
      steelType: draftGrade.steelType,
      subGrade: draftGrade.subGrade,
      description: draftGrade.description,
      targetBatchQty: targetQuantity,
      status: "DRAFT" as const,
      gradeMaterials: materials.map((m, i) => ({
        materialId: m.materialId,
        compositionPercent: m.compositionPercent,
        sortOrder: i
      }))
    };

    const result = createGradeSchema.safeParse(payload);
    if (!result.success) {
      const errorMsg = result.error.errors[0]?.message || "Please fill required fields correctly.";
      toast.error(errorMsg, { id: "val-err" });
      return;
    }

    try {
      if (isNewGrade) {
        const created = await createGrade.mutateAsync(payload);
        toast.success("New grade draft created successfully!");
        if (created?.id) {
          useGradeBuilderStore.getState().setSelectedGradeId(created.id);
        }
      } else if (activeGrade) {
        await updateGrade.mutateAsync({ id: activeGrade.id, data: payload, version: activeGrade.version });
        toast.success("Grade draft saved successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save grade", { id: "save-err" });
    }
  };

  const handleSubmit = async () => {
    if (!activeGrade) return;
    if (!isCompositionValid) {
      toast.error("Composition must be exactly 100%", { id: "sub-pct-err" });
      return;
    }

    const payload = {
      name: draftGrade.name,
      code: draftGrade.code || "",
      category: draftGrade.category,
      steelType: draftGrade.steelType,
      subGrade: draftGrade.subGrade,
      description: draftGrade.description || "",
      targetBatchQty: targetQuantity,
      status: "SUBMITTED" as const,
      gradeMaterials: materials.map((m, i) => ({
        materialId: m.materialId,
        compositionPercent: m.compositionPercent,
        sortOrder: i
      }))
    };

    const result = createGradeSchema.safeParse(payload);
    if (!result.success) {
      const errorMsg = result.error.errors[0]?.message || "Please fill required fields correctly.";
      toast.error(errorMsg, { id: "val-err" });
      return;
    }

    try {
      await updateGrade.mutateAsync({
        id: activeGrade.id,
        version: activeGrade.version,
        data: payload
      });
      await submitGrade.mutateAsync(activeGrade.id);
      toast.success("Grade submitted for approval!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit grade", { id: "sub-err" });
    }
  };

  const handlePublish = async () => {
    if (!activeGrade) return;
    try {
      await publishGradeMutation.mutateAsync(activeGrade.id);
      toast.success("Grade published successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish grade");
    }
  };

  const handleDeleteGrade = async () => {
    if (!activeGrade) return;
    if (!window.confirm(`Are you sure you want to delete/deactivate the grade "${activeGrade.name || activeGrade.code}"?`)) {
      return;
    }
    try {
      await deleteGrade.mutateAsync(activeGrade.id);
      toast.success("Grade deleted successfully");
      useGradeBuilderStore.getState().setSelectedGradeId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete grade");
    }
  };

  const handleCloneClick = () => {
    if (!activeGrade) return;
    setCloneCode(`${activeGrade.code || "GRD"}-CLONE`);
    setCloneName(`${activeGrade.name} (Cloned)`);
    setIsCloneModalOpen(true);
  };

  const handleCloneSubmit = async () => {
    if (!activeGrade) return;
    if (!cloneCode.trim() || !cloneName.trim()) {
      toast.error("Please fill in new code and name.", { id: "clone-empty" });
      return;
    }
    try {
      await cloneGrade.mutateAsync({ id: activeGrade.id, code: cloneCode, name: cloneName });
      toast.success("Grade cloned successfully!");
      setIsCloneModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to clone grade", { id: "clone-err" });
    }
  };

  // ── EMPTY STATE ──
  if (!selectedGradeId) {
    return (
      <div className="flex flex-col items-center justify-center bg-white rounded-md border border-slate-200 shadow-sm min-h-0 h-full relative select-none overflow-hidden p-8">
        <div className="bg-blue-50 p-6 rounded-full border border-blue-100 mb-6">
          <Calculator className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">No Grade Selected</h2>
        <p className="text-sm text-slate-500 max-w-sm text-center leading-relaxed mb-6">
          Select a grade from the library or click the button below to start building a new composition.
        </p>
        <Button onClick={() => useGradeBuilderStore.getState().reset()} className="h-10 bg-jsw-blue hover:bg-primary text-white text-sm font-bold shadow-sm px-6 transition-all">
          <Plus className="h-4 w-4 mr-2" /> Create New Grade
        </Button>
      </div>
    );
  }

  const statusLabel = isNewGrade ? 'NEW DRAFT' : activeGrade?.status || 'DRAFT';

  return (
    <div className="flex flex-col min-h-0 h-full overflow-hidden relative gap-0">


      {/* ── COMPACT GRADE INFO HEADER ── */}
      <div className="bg-white border border-slate-200 rounded-t-md shrink-0 shadow-sm flex items-center px-3 py-2.5 gap-3 z-10 relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary rounded-t-md" />
        

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-0.5">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Grade Name <span className="text-red-500">*</span></label>
            <Input value={draftGrade.name} onChange={e => updateDraftField('name', e.target.value)} placeholder="e.g. MS CRCA" className="h-8 text-[11px] font-bold px-2.5 bg-white border-slate-200 focus:ring-1 focus:ring-primary" disabled={!isEditable} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Grade Code</label>
            <Input value={draftGrade.code} readOnly className="h-8 text-[11px] font-bold px-2.5 bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Category <span className="text-red-500">*</span></label>
            <select value={draftGrade.category} onChange={e => updateDraftField('category', e.target.value)} disabled={!isEditable} className="h-8 text-[11px] font-bold bg-white border border-slate-200 rounded-sm px-2 focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-50 disabled:text-slate-500">
              <option value="">Select</option>
              {STEEL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Steel Type <span className="text-red-500">*</span></label>
            <select value={draftGrade.steelType} onChange={e => updateDraftField('steelType', e.target.value)} disabled={!isEditable} className="h-8 text-[11px] font-bold bg-white border border-slate-200 rounded-sm px-2 focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-50 disabled:text-slate-500">
              <option value="">Select</option>
              {STEEL_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Batch Qty (kg)</label>
            <Input type="number" value={targetQuantity} onChange={e => setTargetQuantity(Number(e.target.value))} min={1} className="h-8 text-[11px] font-bold px-2.5 bg-white border-slate-200 focus:ring-1 focus:ring-primary" disabled={!isEditable} />
          </div>
          <div className="flex flex-col gap-1 relative">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
            <div className={`h-8 flex items-center justify-center text-[10px] font-bold rounded-sm border uppercase tracking-wider ${
              statusLabel === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              statusLabel === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              {statusLabel} {!isNewGrade && `(v${activeGrade?.version || '1'})`}
            </div>
          </div>
        </div>
      </div>

      {/* ── MATERIAL COMPOSITION BUILDER (Excel-like) ── */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border-x border-b border-slate-200 overflow-hidden">

        {/* Autocomplete search / add bar */}
        {isEditable && (
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60 shrink-0">
            <MaterialAutocomplete
              materials={rawMaterialsList}
              existingIds={existingMaterialIds}
              onSelect={handleAddFromAutocomplete}
              isLoading={isLoadingRawMaterials}
            />
          </div>
        )}

        {/* Spreadsheet area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
          {(isLoadingMaterials || isLoadingGradeDetail) && !isNewGrade ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-9 bg-slate-100 rounded-sm animate-pulse" />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 select-none">
              <div className="bg-slate-50 p-3 rounded-full border border-slate-100 mb-3">
                <Package className="h-6 w-6 text-slate-300" />
              </div>
              <p className="font-bold text-xs text-slate-500 mb-1">No Materials Added</p>
              {isEditable ? (
                <p className="text-[10px] text-slate-400 text-center max-w-xs leading-relaxed">
                  Search and add JSW approved raw materials above to build the grade composition. Use <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono mx-0.5">↑↓</kbd> to navigate, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono mx-0.5">Tab</kbd> to move between cells.
                </p>
              ) : (
                <p className="text-[10px] text-slate-400">This grade composition is locked.</p>
              )}
            </div>
          ) : (
            <table className="w-full text-sm border-collapse" style={{ tableLayout: "fixed" }}>
              {/* Sticky header */}
              <thead className="sticky top-0 z-10 shadow-sm">
                <tr className="bg-slate-100 text-[10px] font-bold text-slate-600 border-y border-slate-200 uppercase tracking-wider">
                  {isEditable && <th className="w-8 px-1 py-1.5 bg-slate-100"></th>}
                  <th className="w-8 px-1 py-1.5 text-center bg-slate-100">#</th>
                  <th className="px-2 py-1.5 text-left bg-slate-100">Material</th>
                  <th className="w-[90px] px-2 py-1.5 text-right bg-slate-100">Comp %</th>
                  <th className="w-[80px] px-2 py-1.5 text-right bg-slate-100">Qty (kg)</th>
                  <th className="w-[80px] px-2 py-1.5 text-right bg-slate-100">Rate</th>
                  <th className="w-[90px] px-2 py-1.5 text-right bg-slate-100">Cost</th>
                  {isEditable && <th className="w-8 px-1 py-1.5 bg-slate-100"></th>}
                </tr>
              </thead>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="materials-list" isDropDisabled={!isEditable}>
                  {(provided) => (
                    <tbody {...provided.droppableProps} ref={provided.innerRef}>
                      {materials.map((m, index) => {
                        const qty = (m.compositionPercent / 100) * targetQuantity;
                        const cost = qty * m.rate;
                        const isCellFocused = focusedCell?.[0] === index;

                        return (
                          <Draggable key={m.id} draggableId={m.id} index={index} isDragDisabled={!isEditable}>
                            {(provided, snapshot) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group transition-colors ${
                                  snapshot.isDragging
                                    ? 'bg-blue-50 shadow-lg ring-1 ring-blue-200 z-20'
                                    : isCellFocused
                                      ? 'bg-blue-50/40'
                                      : 'hover:bg-slate-50/80'
                                }`}
                                style={provided.draggableProps.style as React.CSSProperties}
                              >
                                {/* Drag handle */}
                                {isEditable && (
                                  <td className="w-8 px-0 py-0 text-center align-middle border-b border-r border-slate-100">
                                    <div {...provided.dragHandleProps} className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-0.5 inline-flex items-center justify-center">
                                      <GripVertical className="h-3 w-3" />
                                    </div>
                                  </td>
                                )}

                                {/* Row number */}
                                <td className="w-8 px-1 py-0 text-center align-middle text-[10px] font-mono text-slate-400 border-b border-r border-slate-100">
                                  {index + 1}
                                </td>

                                {/* Material name + code */}
                                <td className="px-2 py-0.5 align-middle border-b border-r border-slate-100">
                                  <div className="flex flex-col leading-tight min-w-0">
                                    <span className="text-xs font-bold text-slate-700 truncate">{m.materialName}</span>
                                    <span className="text-[8px] text-slate-400 uppercase tracking-widest font-mono">{m.materialCode}</span>
                                  </div>
                                </td>

                                {/* Composition % — editable cell */}
                                <td className={`w-[90px] px-1 py-0 align-middle border-b border-r ${
                                  isCellFocused ? 'border-primary bg-blue-50/30' : 'border-slate-100'
                                }`}>
                                  <div className="relative">
                                    <input
                                      ref={(el) => { compositionRefs.current[index] = el; }}
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.01"
                                      value={m.compositionPercent}
                                      onChange={e => updateComposition(m.id, parseFloat(e.target.value) || 0)}
                                      onFocus={() => setFocusedCell([index, "pct"])}
                                      onBlur={() => {
                                        setFocusedCell(null);
                                        handleCompositionBlur(m.materialId, m.compositionPercent, index);
                                      }}
                                      onKeyDown={e => {
                                        if (e.key === "Enter") {
                                          handleCellKeyDown(e, index);
                                          handleCompositionBlur(m.materialId, m.compositionPercent, index);
                                        } else {
                                          handleCellKeyDown(e, index);
                                        }
                                      }}
                                      disabled={!isEditable}
                                      className={`w-full text-right bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold ${
                                        isCellFocused ? 'text-primary' : 'text-slate-800'
                                      } rounded-sm px-1 py-0.5 disabled:text-slate-500`}
                                    />
                                    <span className="absolute right-2 top-1 text-xs text-slate-400 pointer-events-none select-none">%</span>
                                  </div>
                                </td>
                                <td className="px-2 py-1 border-b border-r border-slate-100 text-right text-slate-600 font-semibold text-[11px] tabular-nums">
                                  {qty.toFixed(2)}
                                </td>
                                <td className="px-2 py-1 border-b border-r border-slate-100 text-right text-slate-600 font-semibold text-[11px] tabular-nums">
                                  {inr(m.rate)}
                                </td>
                                <td className="px-2 py-1 border-b border-r border-slate-100 text-right text-emerald-700 font-bold text-[11px] tabular-nums">
                                  {inr(cost)}
                                </td>
                                {isEditable && (
                                  <td className="w-8 px-0 py-0 text-center align-middle border-b border-slate-100">
                                    <button
                                      onClick={() => handleRemoveMaterial(m.id, m.materialId)}
                                      className="h-5 w-5 p-0 inline-flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-sm md:opacity-0 group-hover:opacity-100 transition-all"
                                      title="Remove material (Delete key)"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}

                      {/* ── TOTALS ROW ── */}
                      {materials.length > 0 && (
                        <tr className="bg-slate-50 font-bold sticky bottom-0 z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                          {isEditable && <td className="border-t-2 border-slate-200"></td>}
                          <td className="border-t-2 border-slate-200"></td>
                          <td className="px-2 py-1 text-xs text-slate-600 uppercase tracking-wider border-t-2 border-r border-slate-200">
                            Total ({materials.length} material{materials.length !== 1 ? 's' : ''})
                          </td>
                          <td className={`w-[90px] px-2 py-1 text-right font-mono text-xs border-t-2 border-r border-slate-200 ${
                            isCompositionValid ? 'text-emerald-700 bg-emerald-50/50' : 'text-red-600 bg-red-50/50'
                          }`}>
                            {totalPct.toFixed(2)}%
                          </td>
                          <td className="w-[80px] px-2 py-1 text-right font-mono text-xs text-slate-600 border-t-2 border-r border-slate-200 tabular-nums">
                            {totalQty.toFixed(2)}
                          </td>
                          <td className="w-[80px] px-2 py-1 border-t-2 border-r border-slate-200"></td>
                          <td className="w-[90px] px-2 py-1 text-right font-mono text-xs text-primary border-t-2 border-r border-slate-200 tabular-nums">
                            {inr(totalCost)}
                          </td>
                          {isEditable && <td className="border-t-2 border-slate-200"></td>}
                        </tr>
                      )}
                    </tbody>
                  )}
                </Droppable>
              </DragDropContext>
            </table>
          )}
        </div>
      </div>

      {/* ── STICKY VALIDATION FOOTER ── */}
      <div className="shrink-0 bg-white border border-t-0 border-slate-200 rounded-b-md px-3 py-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: validation badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-sm text-[9px] font-bold uppercase border ${
              materials.length === 0
                ? 'bg-slate-50 text-slate-400 border-slate-200'
                : isCompositionValid
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              {isCompositionValid ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              <span className="font-mono">{totalPct.toFixed(2)}%</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-sm text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200">
              <Package className="h-3 w-3 text-slate-400" />
              {materials.length} material{materials.length !== 1 ? 's' : ''}
            </div>

            {materials.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-sm text-[9px] font-bold text-primary bg-blue-50 border border-blue-200">
                Est: {inr(totalCost)}
              </div>
            )}

            {/* Keyboard hint */}
            {isEditable && materials.length > 0 && (
              <div className="hidden md:flex items-center gap-2 text-[8px] text-slate-400 ml-1">
                <span className="flex items-center gap-0.5"><kbd className="px-1 bg-slate-100 border border-slate-200 rounded text-[8px] font-mono">Tab</kbd> next</span>
                <span className="flex items-center gap-0.5"><kbd className="px-1 bg-slate-100 border border-slate-200 rounded text-[8px] font-mono">↵</kbd> confirm</span>
                <span className="flex items-center gap-0.5"><kbd className="px-1 bg-slate-100 border border-slate-200 rounded text-[8px] font-mono">Del</kbd> remove</span>
              </div>
            )}
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2">
            {!isNewGrade && isCostingUser && (
              <Button
                onClick={handleDeleteGrade}
                variant="outline"
                className="h-7 font-bold text-[10px] bg-white text-red-600 border-red-200 hover:bg-red-50 px-2.5"
                disabled={deleteGrade.isPending}
              >
                {deleteGrade.isPending ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="h-3 w-3 mr-1 text-red-500" /> Delete</>
                )}
              </Button>
            )}
            {!isNewGrade && (
              <Button onClick={handleCloneClick} variant="outline" className="h-7 font-bold text-[10px] bg-white text-slate-600 border-slate-200 hover:bg-slate-50 px-2.5">
                <Copy className="h-3 w-3 mr-1 text-slate-400" /> Clone
              </Button>
            )}
            {isEditable && (
              <Button
                onClick={handleSaveDraft}
                variant="outline"
                className="h-7 font-bold text-[10px] bg-white text-slate-700 border-slate-200 hover:bg-slate-50 px-2.5"
                disabled={(!isCompositionValid && materials.length > 0) || createGrade.isPending || updateGrade.isPending}
              >
                {createGrade.isPending || updateGrade.isPending ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="h-3 w-3 mr-1 text-slate-500" /> Save Draft</>
                )}
              </Button>
            )}
            {!isNewGrade && isEditable && (
              <Button
                onClick={handleSubmit}
                className={`bg-primary hover:bg-primary/90 text-white h-7 font-bold text-[10px] shadow-xs px-3 ${isCompositionValid && !submitGrade.isPending ? 'animate-[pulse_2s_ease-in-out_infinite] ring-2 ring-primary/50' : ''}`}
                disabled={!isCompositionValid || submitGrade.isPending}
              >
                {submitGrade.isPending ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="h-3 w-3 mr-1" /> Submit</>
                )}
              </Button>
            )}
            {!isNewGrade && activeGrade?.status === 'SUBMITTED' && isCostingUser && (
              <Button
                onClick={handlePublish}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 font-bold text-[10px] shadow-xs px-3"
                disabled={publishGradeMutation.isPending}
              >
                {publishGradeMutation.isPending ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Publishing...</>
                ) : (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Publish</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── CLONE MODAL ── */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <Card className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-md relative animate-slide-up">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
            <CardContent className="p-6 flex flex-col gap-4">
              <div>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Copy className="h-4 w-4 text-primary" /> Clone Grade Master
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Create a new independent draft copy containing all properties and composition from the active grade.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">New Grade Code</label>
                  <Input value={cloneCode} onChange={e => setCloneCode(e.target.value)} placeholder="e.g. GRD-XYZ-01" className="h-9 text-xs font-bold bg-slate-50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">New Grade Name</label>
                  <Input value={cloneName} onChange={e => setCloneName(e.target.value)} placeholder="e.g. MS Cold Rolled Copy" className="h-9 text-xs font-bold bg-slate-50" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setIsCloneModalOpen(false)} className="h-8 font-bold text-xs bg-white text-slate-600 border-slate-200">Cancel</Button>
                <Button onClick={handleCloneSubmit} className="h-8 font-bold text-xs bg-primary hover:bg-primary/90 text-white shadow-sm" disabled={cloneGrade.isPending}>
                  {cloneGrade.isPending ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Cloning...</> : "Clone Grade"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
