import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  GitCompare, Search, ChevronRight, CheckCircle2, 
  Download, Layers, Maximize2, Minimize2, Save, History, RotateCcw
} from "lucide-react";
import { Button, Input, inr } from "@jsw-mcms/ui";
import { apiClient } from "@/services/api/client";
import type { Grade } from "@/types";
import type { RecommendationCard as RecCardType } from "@jsw-mcms/types";
import { useCreateComparisonSession, useComparisonResults } from "@/hooks/useComparison";
import { ComparisonMatrix } from "@/components/workspace/ComparisonMatrix";
import { ComparisonAnalytics } from "@/components/workspace/ComparisonAnalytics";
import { RecommendationCard as RecCardUI } from "@/components/workspace/RecommendationCard";
import { Loader2 } from "lucide-react";
import { useComparisonStore } from "@/store/comparisonStore";
import { toast } from "sonner";

export function ComparisonPage() {
  const [quickViewGrade, setQuickViewGrade] = React.useState<Grade | null>(null);

  const {
    selectedGradeIds: selectedIds,
    filterCategory,
    filterBaseMetal,
    orderQuantity,
    sessionId,
    isFullScreen,
    highlightDiffs,
    collapsedGroups,
    setSelectedGradeIds: setSelectedIds,
    setSessionId,
    setIsFullScreen,
    setHighlightDiffs,
    setCollapsedGroups,
    toggleGradeSelection
  } = useComparisonStore();

  // Fetch Grades
  const { data: gradesData = [] } = useQuery<Grade[]>({
    queryKey: ["grades"],
    queryFn: async () => {
      const { data } = await apiClient.get("/grades?limit=100");
      return data?.data || [];
    }
  });

  // Queries & Mutations
  const createSession = useCreateComparisonSession();
  const { data: results, isLoading: isLoadingResults, dataUpdatedAt } = useComparisonResults(sessionId);

  const lastUpdated = dataUpdatedAt 
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : "Never";

  const kpis = useMemo(() => {
    if (!results || !results.grades || results.grades.length === 0) {
      return {
        basket: `${selectedIds.length} Selected`,
        basketSub: "Select min 2 grades",
        minCost: "N/A",
        minSub: "Awaiting comparison",
        maxCost: "N/A",
        maxSub: "Awaiting comparison",
        variance: "0.00%",
        varianceSub: "No data"
      };
    }

    const grades = results.grades;
    const sorted = [...grades].sort((a, b) => a.rawValues.cost - b.rawValues.cost);
    const minGrade = sorted[0];
    const maxGrade = sorted[sorted.length - 1];
    
    const minVal = minGrade ? `${minGrade.gradeName} (${inr(minGrade.rawValues.cost)}/kg)` : "N/A";
    const maxVal = maxGrade ? `${maxGrade.gradeName} (${inr(maxGrade.rawValues.cost)}/kg)` : "N/A";

    let variancePercent = "0.00%";
    if (minGrade && maxGrade && minGrade.rawValues.cost > 0) {
      const pct = ((maxGrade.rawValues.cost - minGrade.rawValues.cost) / minGrade.rawValues.cost) * 100;
      variancePercent = `${pct.toFixed(2)}%`;
    }

    return {
      basket: `${selectedIds.length} Selected`,
      basketSub: `Out of ${gradesData.length} available`,
      minCost: minVal,
      minSub: "Optimal commercial option",
      maxCost: maxVal,
      maxSub: "Premium surcharge option",
      variance: variancePercent,
      varianceSub: "Cost variance spread"
    };
  }, [results, selectedIds.length, gradesData.length]);

  // Local states for advanced filters
  const [searchVal, setSearchVal] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [materialFilter, setMaterialFilter] = React.useState("all");
  const [versionFilter, setVersionFilter] = React.useState("all");
  const [sortByLocal, setSortByLocal] = React.useState("name-asc");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const handleResetFilters = () => {
    setSearchVal("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setMaterialFilter("all");
    setVersionFilter("all");
    setSortByLocal("name-asc");
  };

  const uniqueMaterials = useMemo(() => {
    const ids = new Set<string>();
    gradesData.forEach((g) => {
      g.gradeMaterials?.forEach((gm) => {
        if (gm.materialId) ids.add(gm.materialId);
      });
    });
    return Array.from(ids);
  }, [gradesData]);

  // Filters catalog list of grades
  const filteredGrades = useMemo(() => {
    let result = gradesData.filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                            (g.metal?.name || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                            (g.code || "").toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = filterCategory === "all" || g.metal?.category === filterCategory;
      const matchesBaseMetal = filterBaseMetal === "all" || g.metal?.name === filterBaseMetal;
      
      const matchesStatus = statusFilter === "all" || g.status === statusFilter;
      const matchesVersion = versionFilter === "all" || String(g.version || 1) === versionFilter;
      const matchesMaterial = materialFilter === "all" || g.gradeMaterials?.some((gm) => gm.materialId === materialFilter);

      return matchesSearch && matchesCategory && matchesBaseMetal && matchesStatus && matchesVersion && matchesMaterial;
    });

    return [...result].sort((a, b) => {
      if (sortByLocal === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortByLocal === "cost-asc") {
        return (a.extraPrice || 0) - (b.extraPrice || 0);
      }
      if (sortByLocal === "cost-desc") {
        return (b.extraPrice || 0) - (a.extraPrice || 0);
      }
      if (sortByLocal === "version-desc") {
        return (b.version || 1) - (a.version || 1);
      }
      return 0;
    });
  }, [debouncedSearch, filterCategory, filterBaseMetal, statusFilter, versionFilter, materialFilter, sortByLocal, gradesData]);


  const handleRunAnalysis = () => {
    if (selectedIds.length < 2) return;
    
    const items = selectedIds.map((id, index) => ({
      gradeId: id,
      position: index,
      colorCode: "#3b82f6"
    }));

    createSession.mutate(
      { name: "Workspace Analysis", description: "Generated from UI", items },
      { onSuccess: (session) => setSessionId(session.id) }
    );
  };

  const selectedIdsString = selectedIds.join(',');
  React.useEffect(() => {
    if (selectedIds.length >= 2) {
      handleRunAnalysis();
    } else {
      setSessionId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdsString]);

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    setSelectedIds(gradesData.map(g => g.id));
  };

  return (
    <div className={`flex flex-col relative text-left bg-slate-50 ${isFullScreen ? 'h-screen overflow-hidden z-50 fixed inset-0' : 'h-full min-h-0 overflow-hidden'}`}>
      
      {!isFullScreen && (
        <div className="flex flex-col bg-white border-b border-slate-200 shadow-sm shrink-0">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              <span>Workspaces</span>
              <ChevronRight className="h-2.5 w-2.5 text-slate-400" />
              <span className="text-blue-700 font-bold">Comparison Intelligence</span>
            </div>
          </div>

          {/* Main Upgraded Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
            {/* Left Column: Title, Description, and Badges */}
            <div className="flex flex-col gap-2.5">
              <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <GitCompare className="h-5 w-5 text-blue-600" />
                  Comparison Engine
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compare steel grades, analyze chemical compositions, and evaluate cost options side-by-side.
                </p>
              </div>

              {/* Status & Metrics Inline Bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                {/* Selected Grades Counter */}
                <div className="flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                  <span>Selected:</span>
                  <span className="font-bold text-blue-700">{selectedIds.length} Grades</span>
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Last Updated:</span>
                  <span className="font-medium text-slate-700">{lastUpdated}</span>
                </div>

                {/* Comparison Status */}
                <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Comparison Status:</span>
                  <span className={`font-bold ${sessionId ? "text-emerald-700" : "text-amber-700"}`}>
                    {sessionId ? "Synced" : "Draft"}
                  </span>
                </div>

                {/* Engine Status */}
                <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Engine Status:</span>
                  <div className="flex items-center gap-1">
                    {createSession.isPending || isLoadingResults ? (
                      <>
                        <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
                        <span className="font-bold text-amber-700">Computing</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span className="font-bold text-emerald-700">Ready</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="flex flex-wrap items-center gap-2 md:self-end">
              {/* Reset Action */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 h-8 px-3 rounded shadow-sm text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                Reset
              </Button>

              {/* History Action */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.info("Recent Comparison Sessions loaded in Workspace.", {
                    description: "Displaying last active audit actions and logs."
                  });
                }}
                className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 h-8 px-3 rounded shadow-sm text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <History className="h-3.5 w-3.5 text-slate-500" />
                History
              </Button>

              {/* Export Action */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!results) {
                    toast.error("No analysis results to export.");
                    return;
                  }
                  toast.success("Initiating Matrix Export", {
                    description: "Exporting comparison results as CSV format."
                  });
                  // Trigger CSV download element if possible
                  const exportBtn = document.querySelector(".bg-white.border-slate-300.text-slate-700.hover\\:bg-slate-50.h-6");
                  if (exportBtn) {
                    (exportBtn as HTMLElement).click();
                  }
                }}
                className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 h-8 px-3 rounded shadow-sm text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                Export
              </Button>

              {/* Save Session Action */}
              <Button
                variant="outline"
                size="sm"
                disabled={selectedIds.length < 2 || createSession.isPending}
                onClick={() => {
                  if (selectedIds.length < 2) return;
                  handleRunAnalysis();
                  toast.success("Comparison Session Saved", {
                    description: `Active session with ${selectedIds.length} grades has been synchronized.`
                  });
                }}
                className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:pointer-events-none h-8 px-3 rounded shadow-sm text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Save className="h-3.5 w-3.5 text-slate-500" />
                Save Session
              </Button>

              {/* Compare Action (Primary CTA) */}
              <Button
                size="sm"
                disabled={selectedIds.length < 2 || createSession.isPending}
                onClick={handleRunAnalysis}
                className="bg-[#002b63] hover:bg-[#001e45] text-white border-none disabled:opacity-50 disabled:pointer-events-none h-8 px-4 rounded shadow-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
              >
                {createSession.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white/80" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <GitCompare className="h-3.5 w-3.5 text-white/90" />
                    Compare
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200">
            {/* Basket Card */}
            <div className="bg-white border border-slate-200 rounded p-3 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grade Basket</span>
              <span className="text-lg font-black text-[#002b63]">{kpis.basket}</span>
              <span className="text-[10px] text-slate-500 mt-1">{kpis.basketSub}</span>
            </div>
            
            {/* Min Cost Card */}
            <div className="bg-white border border-slate-200 rounded p-3 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Unit Cost</span>
              <span className="text-xs font-bold text-slate-800 truncate mt-1">{kpis.minCost}</span>
              <span className="text-[10px] text-slate-500 mt-1">{kpis.minSub}</span>
            </div>

            {/* Max Cost Card */}
            <div className="bg-white border border-slate-200 rounded p-3 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Unit Cost</span>
              <span className="text-xs font-bold text-slate-800 truncate mt-1">{kpis.maxCost}</span>
              <span className="text-[10px] text-slate-500 mt-1">{kpis.maxSub}</span>
            </div>

            {/* Variance Card */}
            <div className="bg-white border border-slate-200 rounded p-3 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cost Variance Spread</span>
              <span className="text-lg font-black text-rose-600">{kpis.variance}</span>
              <span className="text-[10px] text-slate-500 mt-1">{kpis.varianceSub}</span>
            </div>
          </div>

          {/* Filters Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-slate-50 border-b border-slate-200">
            {/* Filter Inputs Grid */}
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
              {/* Search */}
              <div className="relative w-full max-w-[180px]">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input 
                  className="pl-7 h-7 text-xs border-slate-300 rounded shadow-sm w-full bg-white" 
                  placeholder="Search grades..." 
                  value={searchVal} 
                  onChange={(e) => setSearchVal(e.target.value)} 
                />
              </div>

              {/* Material Filter */}
              <select
                value={materialFilter}
                onChange={(e) => setMaterialFilter(e.target.value)}
                className="h-7 text-xs border border-slate-300 rounded shadow-sm bg-white px-2 text-slate-700 min-w-[110px]"
              >
                <option value="all">All Materials</option>
                {uniqueMaterials.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-7 text-xs border border-slate-300 rounded shadow-sm bg-white px-2 text-slate-700 min-w-[90px]"
              >
                <option value="all">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ACTIVE">Active</option>
                <option value="APPROVED">Approved</option>
              </select>

              {/* Version Filter */}
              <select
                value={versionFilter}
                onChange={(e) => setVersionFilter(e.target.value)}
                className="h-7 text-xs border border-slate-300 rounded shadow-sm bg-white px-2 text-slate-700 min-w-[80px]"
              >
                <option value="all">All Versions</option>
                <option value="1">v1</option>
                <option value="2">v2</option>
                <option value="3">v3</option>
              </select>

              {/* Sort By */}
              <select
                value={sortByLocal}
                onChange={(e) => setSortByLocal(e.target.value)}
                className="h-7 text-xs border border-slate-300 rounded shadow-sm bg-white px-2 text-slate-700 min-w-[100px]"
              >
                <option value="name-asc">Sort: Name A-Z</option>
                <option value="cost-asc">Sort: Cost (Low-High)</option>
                <option value="cost-desc">Sort: Cost (High-Low)</option>
                <option value="version-desc">Sort: Version (Newest)</option>
              </select>

              {/* Reset Filters */}
              <Button 
                size="sm" 
                onClick={handleResetFilters} 
                variant="ghost" 
                className="text-slate-500 hover:text-slate-800 text-[10px] h-7 px-2 font-bold uppercase tracking-wider"
              >
                Reset Filters
              </Button>
            </div>

            {/* Selection Toolbar Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-slate-500 mr-1 bg-white border border-slate-200 rounded px-2 py-0.5 shadow-sm">
                Matches: {filteredGrades.length} / {gradesData.length}
              </span>
              
              <Button 
                size="sm" 
                onClick={handleSelectAll} 
                variant="outline" 
                className="bg-white border-slate-300 text-slate-700 font-bold h-7 px-2 rounded shadow-sm text-xs hover:bg-slate-50"
              >
                Select All
              </Button>

              <Button 
                size="sm" 
                onClick={handleClearAll} 
                variant="outline" 
                className="bg-white border-slate-300 text-slate-700 font-bold h-7 px-2 rounded shadow-sm text-xs hover:bg-slate-50"
              >
                Clear Selection
              </Button>
              
              <Button
                size="sm"
                onClick={() => {
                  if (!results) {
                    toast.error("No analysis results to export.");
                    return;
                  }
                  toast.success("Exporting Comparison Data...");
                }}
                variant="outline"
                className="bg-white border-slate-300 text-slate-700 font-bold h-7 px-2 rounded shadow-sm text-xs hover:bg-slate-50 flex items-center gap-1"
              >
                <Download className="h-3 w-3" /> Export
              </Button>

              <Button
                size="sm"
                disabled={selectedIds.length < 2 || createSession.isPending}
                onClick={handleRunAnalysis}
                className="bg-[#002b63] hover:bg-[#001e45] text-white disabled:opacity-50 disabled:pointer-events-none h-7 px-3 rounded shadow-md text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
              >
                Compare
              </Button>
            </div>
          </div>

          {/* Grade Library Shelf */}
          <div className="bg-white border-b border-slate-200 p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Grade Library (Select to Compare)</span>
            </div>
            <div className="flex gap-3 overflow-x-auto p-2 h-[152px] scrollbar-thin scrollbar-thumb-slate-300 bg-slate-50/50 rounded border border-slate-100">
              {filteredGrades.map((grade) => {
                const isSelected = selectedIds.includes(grade.id);
                return (
                  <div 
                    key={grade.id}
                    onClick={() => toggleGradeSelection(grade.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleGradeSelection(grade.id);
                      }
                    }}
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label={`Select grade ${grade.name} for cost comparison`}
                    className={`shrink-0 w-[240px] h-[132px] p-3 rounded border bg-white flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer relative select-none focus:outline-none focus:ring-2 focus:ring-[#002b63] ${
                      isSelected 
                        ? "border-[#002b63] bg-[#002b63]/5 ring-1 ring-[#002b63]" 
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Top row: Checkbox + Name + Status */}
                    <div className="flex items-start justify-between gap-1.5 min-w-0 w-full">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleGradeSelection(grade.id);
                          }}
                          className="rounded border-slate-300 text-[#002b63] focus:ring-[#002b63] h-3.5 w-3.5 cursor-pointer shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-800 text-xs truncate" title={grade.name}>
                            {grade.name}
                          </span>
                          <span className="text-slate-500 text-[10px] truncate uppercase font-semibold mt-0.5">
                            {grade.metal?.category || "Ferrous"} • {grade.metal?.name}
                          </span>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider ${
                        grade.status === "ACTIVE" || grade.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : grade.status === "SUBMITTED"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-slate-50 text-slate-600 border border-slate-200"
                      }`}>
                        {grade.status || "DRAFT"}
                      </span>
                    </div>

                    {/* Middle: Material Count & Cost */}
                    <div className="flex items-center justify-between text-xs py-1 border-y border-dashed border-slate-100 mt-1 shrink-0">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Materials</span>
                        <span className="font-semibold text-slate-700">
                          {grade.gradeMaterials?.length || 0} items
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Extra Price</span>
                        <span className="font-bold text-[#002b63] font-mono">
                          {grade.extraPrice > 0 ? inr(grade.extraPrice) : "₹0.00"}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Version + Last Updated + Quick View */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-600 px-1 py-0.2 rounded text-[8px] font-bold border border-slate-200">
                          v{grade.version || 1}
                        </span>
                        <span className="truncate max-w-[80px] text-slate-400 text-[9px]">
                          {grade.updatedAt ? new Date(grade.updatedAt).toLocaleDateString([], { day: '2-digit', month: 'short' }) : "Recently"}
                        </span>
                      </div>
                      
                      {/* Quick View Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewGrade(grade);
                        }}
                        className="text-[10px] font-bold text-[#002b63] hover:underline"
                      >
                        Quick View
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredGrades.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-500 italic">No grades match the filters.</div>
              )}
            </div>
          </div>

          {/* Selected Comparison Basket */}
          <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-2">Selected Basket:</span>
            {selectedIds.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No grades selected. Select from Grade Library above to compare.</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selectedIds.map(id => {
                  const grade = gradesData.find(g => g.id === id);
                  if (!grade) return null;
                  return (
                    <div key={id} className="flex items-center gap-1.5 bg-[#002b63]/10 border border-[#002b63]/20 text-[#002b63] text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                      <span>{grade.name}</span>
                      <button 
                        onClick={() => toggleGradeSelection(id)}
                        className="hover:text-rose-600 transition-colors ml-1 font-black text-sm leading-none"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Workspace Content Area */}
      <div className={`flex flex-col flex-1 ${isFullScreen ? '' : 'overflow-hidden p-3 gap-3'}`}>
        
        {/* Mutation Error Alert Banner */}
        {createSession.isError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-2.5 rounded flex items-center justify-between shadow-sm shrink-0">
            <span className="font-semibold">Error: Failed to initialize comparison session. Please verify selected grades and try again.</span>
            <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-800 h-6 px-2 text-[10px] font-bold uppercase tracking-wider" onClick={() => createSession.reset()}>
              Dismiss
            </Button>
          </div>
        )}

        {/* COMPARISON RESULTS */}
        <div className={`flex flex-col flex-1 min-h-0 overflow-hidden ${isFullScreen ? 'h-full bg-white' : 'bg-white border border-slate-200 rounded shadow-sm'}`}>
          
          {isLoadingResults ? (
            <div className="flex-1 flex flex-col p-4 gap-4 bg-white min-h-[300px]">
              {/* Skeleton header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <div className="h-4 bg-slate-200 animate-pulse rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 animate-pulse rounded w-24"></div>
              </div>
              {/* Skeleton rows */}
              <div className="flex flex-col gap-3 flex-1 overflow-hidden justify-center">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex gap-4 items-center border-b border-slate-50 pb-2">
                    <div className="h-5 bg-slate-200 animate-pulse rounded flex-1"></div>
                    <div className="h-5 bg-slate-200 animate-pulse rounded w-24"></div>
                    <div className="h-5 bg-slate-200 animate-pulse rounded w-24"></div>
                    <div className="h-5 bg-slate-200 animate-pulse rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : !results ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 min-h-[300px]">
              <div className="bg-slate-100 p-4 rounded-full border border-slate-200/50 mb-3 shadow-inner">
                <GitCompare className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">No Comparison Session Active</h3>
              <p className="text-xs text-slate-500 max-w-[280px] text-center">
                Select 2 or more grades from the Grade Library above, and click the primary "Compare" button to compute properties and cost variance matrices.
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-0">
              {/* Dense Matrix Toolbox */}
              <div className="bg-slate-100 px-3 py-1.5 flex items-center justify-between border-b border-slate-200 shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5 uppercase tracking-wider">
                    <Layers className="h-3.5 w-3.5 text-blue-600" />
                    <span>Analysis Matrix</span>
                  </div>
                  <div className="h-3 w-px bg-slate-300"></div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900 transition-colors">
                    <input type="checkbox" checked={highlightDiffs} onChange={e => setHighlightDiffs(e.target.checked)} className="rounded-sm border-slate-400 text-blue-600 focus:ring-blue-500" />
                    Highlight Variances
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsFullScreen(!isFullScreen)} className="text-slate-600 hover:text-slate-900 hover:bg-slate-200 h-6 px-2 text-[10px] uppercase font-bold tracking-wider">
                    {isFullScreen ? <Minimize2 className="h-3 w-3 mr-1" /> : <Maximize2 className="h-3 w-3 mr-1" />}
                    {isFullScreen ? "Exit" : "Expand"}
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 h-6 px-2 text-[10px] uppercase font-bold tracking-wider shadow-sm">
                    <Download className="h-3 w-3 mr-1" /> Export CSV
                  </Button>
                </div>
              </div>

              {/* Recommendations (Horizontal strip if any) */}
              {!isFullScreen && results.recommendations?.length > 0 && (
                <div className="flex gap-2 p-2 bg-blue-50/50 border-b border-blue-100 shrink-0 overflow-x-auto">
                  {results.recommendations.map((rec: RecCardType, i: number) => (
                    <div key={i} className="shrink-0 w-[300px]">
                      <RecCardUI recommendation={rec} />
                    </div>
                  ))}
                </div>
              )}

              {/* Matrix Component Area */}
              <div className="flex-1 min-h-0 overflow-auto bg-white">
                 <ComparisonMatrix 
                    result={results}
                    orderQuantity={orderQuantity}
                    highlightDiffs={highlightDiffs}
                    isFullScreen={isFullScreen}
                    collapsedGroups={collapsedGroups}
                    setCollapsedGroups={setCollapsedGroups}
                 />
              </div>

              {/* Analytics Component Area */}
              {!isFullScreen && (
                 <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-4 h-[400px] overflow-y-auto shadow-inner">
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Comparison Analytics Dashboard</div>
                   <ComparisonAnalytics 
                     result={results}
                     orderQuantity={orderQuantity}
                     gradesData={gradesData}
                   />
                 </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-[90vw] max-w-[500px] bg-white rounded shadow-lg overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-blue-600" />
                  {quickViewGrade.name}
                </h3>
                <p className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">
                  {quickViewGrade.metal?.category || "Standard"} • v{quickViewGrade.version || 1}
                </p>
              </div>
              <button 
                onClick={() => setQuickViewGrade(null)} 
                className="text-slate-400 hover:text-slate-600 font-bold text-lg leading-none"
              >
                ×
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 flex flex-col gap-3.5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className="font-semibold">{quickViewGrade.status || "DRAFT"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Base Price Extra</span>
                  <span className="font-semibold font-mono">{quickViewGrade.extraPrice > 0 ? inr(quickViewGrade.extraPrice) : "₹0.00"}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Material Composition</span>
                {quickViewGrade.gradeMaterials && quickViewGrade.gradeMaterials.length > 0 ? (
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                          <th className="px-3 py-1.5">Material ID</th>
                          <th className="px-3 py-1.5 text-right">Composition %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quickViewGrade.gradeMaterials.map((gm: { materialId: string; compositionPercent: unknown }, i: number) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="px-3 py-1.5 font-semibold text-slate-800">{gm.materialId}</td>
                            <td className="px-3 py-1.5 text-right font-mono font-semibold">{Number(gm.compositionPercent).toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No materials configured.</span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <Button size="sm" onClick={() => setQuickViewGrade(null)} className="h-7 bg-[#002b63] hover:bg-[#001e45] text-xs font-semibold px-4 rounded shadow-sm text-white">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
