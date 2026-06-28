import { useState, useMemo, useRef } from "react";
import { Activity, Plus, Search, Filter, Star, Clock, FileDown, Copy, BookTemplate, CheckCircle2, Circle, MoreVertical } from "lucide-react";
import { Card, Input, Button, Badge } from "@jsw-mcms/ui";
import { useGrades } from "../../services/gradeMasterApi";
import { useGradeBuilderStore } from "../../store/gradeBuilderStore";
import type { GradeMaster } from "../../types";
import { useVirtualizer } from '@tanstack/react-virtual';

const WORKFLOW_STEPS = [
  { id: 1, label: "Create Grade" },
  { id: 2, label: "Configure Materials" },
  { id: 3, label: "Validate" },
  { id: 4, label: "Review" },
  { id: 5, label: "Submit" }
];

export function GradeLibrarySidebar() {
  const { data: grades = [], isLoading } = useGrades();
  const { selectedGradeId, setSelectedGradeId, setTargetQuantity, reset, materials, draftGrade } = useGradeBuilderStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "recent" | "favorites">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filteredGrades = useMemo(() => {
    return grades.filter((g: GradeMaster) => {
      const matchesSearch = g.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            g.code?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "ALL" || g.category === categoryFilter;
      const matchesStatus = statusFilter === "ALL" || g.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [grades, searchQuery, categoryFilter, statusFilter]);

  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: filteredGrades.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 84, // estimated height of the card including padding
    overscan: 10,
  });

  const handleSelectGrade = (grade: GradeMaster) => {
    setSelectedGradeId(grade.id);
    setTargetQuantity(grade.targetBatchQty ? Number(grade.targetBatchQty) : 1000);
  };

  const handleNewGrade = () => {
    reset();
  };

  // Determine Active Workflow Step
  const getActiveStep = () => {
    if (!selectedGradeId) return 0;
    
    const activeGrade = grades.find((g: any) => g.id === selectedGradeId);
    if (activeGrade?.status === 'SUBMITTED' || activeGrade?.status === 'ACTIVE') return 5;
    
    const hasName = draftGrade.name.trim() !== "";
    const hasMaterials = materials.length > 0;
    const totalPct = materials.reduce((sum, m) => sum + (Number(m.compositionPercent) || 0), 0);
    const isBalanced = Math.abs(totalPct - 100) < 0.01;
    const allPriced = materials.every(m => m.rate > 0);
    
    if (!hasName) return 1;
    if (!hasMaterials) return 2;
    if (!isBalanced || !allPriced) return 3;
    return 4;
  };

  const activeStep = getActiveStep();

  return (
    <div className="flex flex-col min-w-0 h-full bg-white">
      {/* Header Actions */}
      <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0 z-10">
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center gap-1.5 relative">
            <Button size="sm" onClick={handleNewGrade} className="h-7 bg-jsw-blue hover:bg-primary text-[11px] font-bold shadow-sm px-2.5">
              <Plus className="h-3.5 w-3.5 mr-1" /> New
            </Button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <Button size="sm" variant="outline" onClick={() => setIsMenuOpen(!isMenuOpen)} className="h-7 w-7 p-0 text-slate-500 bg-white" title="More Actions">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
            
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-sm shadow-lg py-1 z-50">
                  <button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Copy className="h-3.5 w-3.5 text-slate-400" /> Clone Existing
                  </button>
                  <button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <FileDown className="h-3.5 w-3.5 text-slate-400" /> Import from Excel
                  </button>
                  <button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <BookTemplate className="h-3.5 w-3.5 text-slate-400" /> Use Template
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search grades..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm font-medium bg-white" 
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 mb-3">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 h-8 text-xs font-semibold bg-white border border-slate-200 rounded-sm px-2 text-slate-700 focus:outline-none focus:border-primary min-w-0"
          >
            <option value="ALL">All Category</option>
            <option value="MS Hot Rolled">MS Hot Rolled</option>
            <option value="MS Cold Rolled">MS Cold Rolled</option>
            <option value="CRCA">CRCA</option>
            <option value="Galvanized">Galvanized</option>
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 h-8 text-xs font-semibold bg-white border border-slate-200 rounded-sm px-2 text-slate-700 focus:outline-none focus:border-primary min-w-0"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Drafts</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="ACTIVE">Published</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5">
          <button 
            onClick={() => setActiveTab("all")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-sm transition-colors ${activeTab === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200'}`}
          >
            <Filter className="h-3.5 w-3.5" /> All
          </button>
          <button 
            onClick={() => setActiveTab("recent")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-sm transition-colors ${activeTab === 'recent' ? 'bg-primary text-white shadow-sm' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200'}`}
          >
            <Clock className="h-3.5 w-3.5" /> Recent
          </button>
          <button 
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-sm transition-colors ${activeTab === 'favorites' ? 'bg-primary text-white shadow-sm' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200'}`}
          >
            <Star className="h-3.5 w-3.5" /> Star
          </button>
        </div>
      </div>

      {/* Grade List - Virtualized */}
      <div 
        ref={parentRef}
        className="flex-1 overflow-y-auto p-2 scrollbar-thin bg-slate-50/50 min-h-0 relative"
      >
        {isLoading ? (
          <div className="flex flex-col gap-2 p-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-[76px] bg-slate-100 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : filteredGrades.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center p-4 text-center">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-slate-100">
              <BookTemplate className="h-8 w-8 text-slate-300" />
            </div>
            <h4 className="font-bold text-slate-700 text-sm mb-2">No Grades Found</h4>
            <p className="text-xs text-slate-500 mb-6 px-4 leading-relaxed">Adjust your search or create a new grade.</p>
          </div>
        ) : (
          <div 
            style={{ 
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative'
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const g = filteredGrades[virtualRow.index];
              const isSelected = selectedGradeId === g.id;
              
              const dateStr = g.updatedAt 
                ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(g.updatedAt)) 
                : '';

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    paddingBottom: '8px',
                  }}
                >
                  <button
                    onClick={() => handleSelectGrade(g)}
                    className={`w-full h-full text-left p-3 rounded-sm transition-all border group relative overflow-hidden flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-blue-50/50 border-blue-300 shadow-sm border-l-[3px] border-l-primary' 
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 border-l-[3px] border-l-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full gap-2">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className={`text-xs font-bold leading-tight truncate ${isSelected ? 'text-primary' : 'text-slate-800'}`}>
                          {g.name || g.code}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 truncate mt-0.5">
                          {g.code} • {g.category}
                        </span>
                      </div>
                      <Badge variant="outline" className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shrink-0 ${
                        g.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        g.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-slate-100 text-slate-600 border-slate-300'
                      }`}>
                        {g.status === 'ACTIVE' ? 'PUBLISHED' : g.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between w-full mt-2 text-[9px] font-bold uppercase tracking-wide">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>{dateStr || 'Unsaved'}</span>
                      </div>
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm border border-slate-200">
                        v{g.version || 1}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workflow Stepper */}
      {(selectedGradeId) && (
        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
           <h4 className="text-xs font-bold text-slate-700 mb-3">Progress</h4>
           <div className="flex flex-col gap-2.5">
             {WORKFLOW_STEPS.map((step, index) => {
               const isCompleted = step.id < activeStep;
               const isActive = step.id === activeStep;
               
               return (
                 <div key={step.id} className="flex items-center gap-2.5 relative">
                   {index !== WORKFLOW_STEPS.length - 1 && (
                     <div className={`absolute left-[9px] top-4 bottom-[-10px] w-0.5 z-0 ${isCompleted ? 'bg-primary' : 'bg-slate-200'}`}></div>
                   )}
                   <div className="relative z-10 bg-slate-50">
                     {isCompleted ? (
                       <CheckCircle2 className="h-5 w-5 text-primary bg-white rounded-full" />
                     ) : isActive ? (
                       <Circle className="h-5 w-5 text-primary fill-blue-50 border-primary border bg-white rounded-full" strokeWidth={3} />
                     ) : (
                       <Circle className="h-5 w-5 text-slate-300 bg-white rounded-full" />
                     )}
                   </div>
                   <span className={`text-xs font-semibold ${
                     isActive ? 'text-primary' : 
                     isCompleted ? 'text-slate-700' : 'text-slate-400'
                   }`}>
                     {step.label}
                   </span>
                 </div>
               );
             })}
           </div>
        </div>
      )}
    </div>
  );
}
