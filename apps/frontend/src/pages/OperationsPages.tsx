import { 
  Download, 
  Plus,
  ShieldAlert, 
  Users,
  RefreshCw,
  Layers,
  Database,
  Check,
  AlertCircle,
  TrendingUp,
  Sliders,
  IndianRupee,
  Trash2,
  Search,
  Calendar,
  Eye, 
  Edit2, 
  Edit3,
  MoreVertical,
  Activity,
  CheckCircle,
  Clock,
  Copy,
  History,
  Send,
  ThumbsUp,
  GitMerge,
  FileBarChart2,
  BarChart3,
  PieChart,
  Filter,
  FileText,
  FileClock,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Zap,
  Table2,
  LayoutGrid,
  ListFilter,
  Timer,
  TrendingDown,
  Package,
  DollarSign,
  FileOutput,
  Hourglass,
  Calculator,
  GitBranch,
  Save,
  Share2,
  ChevronDown,
  Upload,
  
  Pause,
  Play,
  MoreHorizontal
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { jsPDF } from "jspdf";
// xlsx import removed
import { inr, shortDate } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableHead } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "../components/StatusBadge";
import { MostUsedGradesCard } from "../components/MostUsedGradesCard";
import { CostImpactAnalysisCard } from "../components/CostImpactAnalysisCard";
import { CurrentRateCard } from "@/components/CurrentRateCard";
import { api } from "@/services/api";
import { useUsers } from "@/hooks/useQuery";
import { GradeDetailsDrawer } from "../components/GradeDetailsDrawer";
import { EnterpriseDataTable, type EnterpriseColumnDef } from "../components/EnterpriseDataTable";
import { KPIWidget } from "../components/KPIWidget";
import { GradeMetricCard } from "../components/GradeMetricCard";
import { GradeDistributionChart } from "../components/GradeDistributionChart";
import { GradeManagementToolbar } from "../components/GradeManagementToolbar";
import { GradeManagementSearchFilters } from "../components/GradeManagementSearchFilters";
import { CloneGradeModal } from "../components/CloneGradeModal";
import { BulkUpdateModal } from "../components/BulkUpdateModal";
import { CompareGradesModal } from "../components/CompareGradesModal";
import { GradeImportModal } from "../components/GradeImportModal";
import * as XLSX from "xlsx";
import { GradeHierarchyTree } from "../components/GradeHierarchyTree";
import { ChemistrySummary } from "../components/ChemistrySummary";
import { PriceActivityTimeline } from "../components/PriceActivityTimeline";
import { GradeInsightsDashboard } from "../components/GradeInsightsDashboard";
import { ReportsAnalyticsDashboard } from "../components/ReportsAnalyticsDashboard";
import { useTableQuery } from "@/hooks/useTableQuery";

import { useAuth, useAuthStore } from "../store/auth";
import { useUIStore } from "../store/uiStore";
import { useSettingsStore } from "../store/settingsStore";
import { 
  useRawMaterials, 
  useCreateRawMaterial, 
  useUpdateRawMaterial, 
  usePriceHistory,
  useActiveMaterials,
  useCurrentMaterialRate,
  usePublishNewRate
} from "@/services/materialRatesApi";

// Reusable Page Header
function PageHead({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <header className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded border border-slate-200 bg-slate-50 text-slate-600">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">MCMS Core + JSW Steel ERP</p>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
      </div>
    </header>
  );
}

// Reusable Box Card
function Box({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-sm border border-[#e5e7eb] bg-white p-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{title}</p>
      <strong className="mt-1 block text-lg font-semibold text-slate-950 tracking-tight">{value}</strong>
    </Card>
  );
}

type TableApiResponse<T> = {
  data: T[];
  pagination?: { page: number; limit: number; total: number; pages: number };
};

function PriceTrendSparkline({ history }: { history: any[] }) {
  // Take last 5 updates and reverse them so they are chronological
  const points = [...history]
    .slice(0, 5)
    .reverse()
    .map(h => Number(h.newPrice || h.new_rate));

  if (points.length < 2) {
    return (
      <div className="flex h-12 w-full items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50 text-[10px] text-slate-400">
        No price trend data available (minimum 2 price history entries required)
      </div>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min;

  const width = 100;
  const height = 30;
  const padding = 2;

  const svgPoints = points.map((val, idx) => {
    const x = padding + (idx / (points.length - 1)) * (width - 2 * padding);
    const y = range === 0 
      ? height / 2 
      : height - padding - ((val - min) / range) * (height - 2 * padding);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-2.5">
      <div className="flex items-center justify-between mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        <span>5-Period Price Trend</span>
        <span className="font-mono text-slate-700">Min: {inr(min)} | Max: {inr(max)}</span>
      </div>
      <div className="relative h-10 w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#0b5cbf"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={svgPoints}
          />
          {points.map((val, idx) => {
            const x = padding + (idx / (points.length - 1)) * (width - 2 * padding);
            const y = range === 0 
              ? height / 2 
              : height - padding - ((val - min) / range) * (height - 2 * padding);
            return (
              <circle
                key={idx}
                cx={x.toFixed(1)}
                cy={y.toFixed(1)}
                r="1.5"
                className="fill-white stroke-[#0b5cbf]"
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function MastersPage({ focus = "material-master" }: { focus?: "metals" | "users" | "user-management" | "settings" | "material-master" | "material-rates" | "grade-builder" }) {
  const { actor } = useAuth();
  const queryClient = useQueryClient();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const [query, setQuery] = useState("");
  const metalTable = useTableQuery({ sortBy: "name", sortDir: "asc" });
  const gradeTable = useTableQuery({ sortBy: "name", sortDir: "asc" });
  
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [selectedGradeIds, setSelectedGradeIds] = useState<Set<string>>(new Set());
  const rawTable = useTableQuery({ sortBy: "alloyName", sortDir: "asc" });
  
  // Real-time API States
  const [metals, setMetals] = useState<any[]>([]);

  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);

  const closeGradeModal = () => {
    setActiveModal(null);
    setSelectedGrade(null);
    setGradeName("");
    setGradeSub("");
    setGradeMultiplier("1.0");
    setGradeExtraPrice("0");
    setChemCr("");
    setChemNi("");
    setChemC("");
  };

  const [isGradeDrawerOpen, setIsGradeDrawerOpen] = useState(false);
  const [drawerGrade, setDrawerGrade] = useState<any>(null);
  const openGradeDetails = (grade: any) => {
    setDrawerGrade(grade);
    setIsGradeDrawerOpen(true);
  };

  const openEditGrade = (grade: any) => {
    setSelectedGrade(grade);
    setGradeMetalId(grade.metalId);
    setGradeName(grade.name);
    setGradeSub(grade.subGrade || "");
    setGradeMultiplier(grade.multiplier?.toString() || "1.0");
    setGradeExtraPrice(grade.extraPrice?.toString() || "0");
    setChemCr(grade.chemicalComposition?.Cr || "");
    setChemNi(grade.chemicalComposition?.Ni || "");
    setChemC(grade.chemicalComposition?.C || "");
    setActiveModal("grade");
  };

  const { data: rawMaterials = [] } = useRawMaterials();
  const createRawMaterial = useCreateRawMaterial();
  const updateRawMaterial = useUpdateRawMaterial();

  const { data: priceHistory = [] } = usePriceHistory();

  const priceLatestMap = useMemo(() => {
    const map = new Map<string, any>();
    if (!priceHistory) return map;
    // assume priceHistory entries contain rawMaterialId or materialId and updatedAt
    const sorted = [...priceHistory].sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
    for (const h of sorted) {
      const id = h.rawMaterialId || h.materialId || h.material_id || h.raw_material_id || h.raw_material_id;
      if (id && !map.has(id)) map.set(id, h);
    }
    return map;
  }, [priceHistory]);
  const [alloys, setAlloys] = useState<any[]>([]);

  // Sync Status State
  const [syncStats, setSyncStats] = useState<{
    total: number;
    success: number;
    failed: number;
    timestamp: string | null;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Selected row for View/Edit/History
  const [selectedRaw, setSelectedRaw] = useState<any>(null);

  // Modal control state
  const [activeModal, setActiveModal] = useState<"metal" | "grade" | "raw" | "edit_raw" | "view_raw" | "history_raw" | "price" | "alloy" | null>(null);

  // Metal Form States
  const [metalName, setMetalName] = useState("");
  const [metalCode, setMetalCode] = useState("");
  const [metalCategory, setMetalCategory] = useState("Ferrous");
  const metalUnit = "kg";

  // Grade Form States
  const [gradeMetalId, setGradeMetalId] = useState("");
  const [gradeName, setGradeName] = useState("");
  const [gradeSub, setGradeSub] = useState("");
  const [gradeMultiplier, setGradeMultiplier] = useState("1.0");
  const [gradeExtraPrice, setGradeExtraPrice] = useState("0");
  const [chemCr, setChemCr] = useState("");
  const [chemNi, setChemNi] = useState("");
  const [chemC, setChemC] = useState("");
  const mechUTS = "500 MPa";

  // Raw Material Form States
  const [rawName, setRawName] = useState("");
  const [rawCode, setRawCode] = useState("");
  const [rawUnit, setRawUnit] = useState("kg");
  const [rawCategory, setRawCategory] = useState("Ferro Alloy");
  const [rawCurrentRate, setRawCurrentRate] = useState("");
  const [rawSupplier, setRawSupplier] = useState("");
  const [rawDescription, setRawDescription] = useState("");
  const [isMicroFlag, setIsMicroFlag] = useState(false);
  const [isAvailFlag, setIsAvailFlag] = useState(true);

  // Price Master Form States
  const [, setPriceType] = useState<"metal" | "raw">("raw");
  const [priceTargetId, setPriceTargetId] = useState("");
  const [priceValue, setPriceValue] = useState("");
  const [priceSource, setPriceSource] = useState("JSW Procurement Desk");
  const [priceReason, setPriceReason] = useState("Market Index Alignment");
  const [priceRemarks, setPriceRemarks] = useState("");
  const [showConfirmPublish, setShowConfirmPublish] = useState(false);
  const [showInlineImpact, setShowInlineImpact] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: activeMaterials = [] } = useActiveMaterials();
  const { data: currentRateInfo, isLoading: isLoadingCurrentRate } = useCurrentMaterialRate(activeModal === "price" && priceTargetId ? priceTargetId : null);
  const publishNewPrice = usePublishNewRate();
  const { data: priceTargetHistory = [] } = usePriceHistory(activeModal === "price" && priceTargetId ? priceTargetId : null);

  // Alloy Composition Structures Form States
  const [alloyName, setAlloyName] = useState("");
  const [alloyCode, setAlloyCode] = useState("");
  const [alloyType, setAlloyType] = useState("Stainless Steel");
  const [alloyComponents, setAlloyComponents] = useState<Array<{ type: "metal" | "raw"; id: string; pct: number }>>([
    { type: "metal", id: "", pct: 100 }
  ]);

  // Load and refresh master data from backend
  const refreshData = async () => {
    try {
      const [
        metalsRes,
        gradesRes,
        alloysRes
    ] = await Promise.allSettled([
        api.get('/metals', { params: { limit: 100 } }),
        api.get('/grades', { params: { limit: 100 } }),
        api.get('/alloys', { params: { limit: 100 } })
      ]);

      const metalsData = metalsRes.status === 'fulfilled' ? metalsRes.value.data?.data : null;
      const gradesData = gradesRes.status === 'fulfilled' ? gradesRes.value.data?.data : null;
      const alloysData = alloysRes.status === 'fulfilled' ? alloysRes.value.data?.data : null;

      const metalsError = metalsRes.status === 'rejected' ? metalsRes.reason : null;
      const gradesError = gradesRes.status === 'rejected' ? gradesRes.reason : null;
      const alloysError = alloysRes.status === 'rejected' ? alloysRes.reason : null;

      if (metalsError) throw metalsError;
      if (gradesError) throw gradesError;
      if (alloysError) throw alloysError;

      setMetals(metalsData || []);
      setGrades(gradesData || []);
      setAlloys(alloysData || []);

      if (metalsData && metalsData.length > 0) {
        setGradeMetalId(metalsData[0].id);
      }
      if (rawMaterials && rawMaterials.length > 0) {
        setPriceTargetId(rawMaterials[0].id);
      }
    } catch (err) {
      console.error("Failed to load ERP master data", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // KPI computations for Material Rates page


  const todaysUpdatesCount = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return 0;
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    return priceHistory.filter((p: any) => {
      const dt = new Date(p.updatedAt || p.createdAt || p.effectiveDate || p.updated_at || p.created_at);
      return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
    }).length;
  }, [priceHistory]);

  const filteredRawRates = useMemo(() => {
    return rawMaterials.filter((r: any) => {
      // Global search by Material Code, Alloy Name, and Description
      const code = (r.materialCode || r.rawMatId || "").toString().toLowerCase();
      const alloyName = (r.materialName || r.name || "").toLowerCase();
      const desc = (r.description || r.description || "").toLowerCase();
      
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch = 
        code.includes(searchLower) || 
        alloyName.includes(searchLower) || 
        desc.includes(searchLower);

      let matchesFilter = true;
      if (categoryFilter === "available") {
        matchesFilter = r.availability === true && r.status === "ACTIVE";
      } else if (categoryFilter === "micro") {
        matchesFilter = r.isMicro === true && r.status === "ACTIVE";
      } else if (categoryFilter === "inactive") {
        matchesFilter = r.status === "INACTIVE";
      } else {
        matchesFilter = true;
      }

      return matchesSearch && matchesFilter;
    });
  }, [rawMaterials, debouncedSearch, categoryFilter]);

  const paginatedRawRates = useMemo(() => {
    let result = [...filteredRawRates];
    if (rawTable.query.sortBy) {
      result.sort((a, b) => {
        const aVal = a[rawTable.query.sortBy as keyof typeof a];
        const bVal = b[rawTable.query.sortBy as keyof typeof b];
        if (aVal < bVal) return rawTable.query.sortDir === "desc" ? 1 : -1;
        if (aVal > bVal) return rawTable.query.sortDir === "desc" ? -1 : 1;
        return 0;
      });
    }
    const start = (rawTable.query.page - 1) * rawTable.query.limit;
    return result.slice(start, start + rawTable.query.limit);
  }, [filteredRawRates, rawTable.query]);

  const { data: rawPriceHistory = [], isLoading: isLoadingHistory } = usePriceHistory(selectedRaw ? selectedRaw.id : null);



  const metalsTableQuery = useQuery({
    queryKey: ["enterprise-table", "metals", metalTable.queryKey],
    queryFn: async () => {
      try {
        const { data } = await api.get<TableApiResponse<any>>("/metals", { params: metalTable.params });
        return data;
      } catch {
        return { data: [], pagination: { page: 1, limit: 25, total: 0, pages: 1 } };
      }
    },
    placeholderData: (previous) => previous
  });
  const gradesTableQuery = useQuery({
    queryKey: ["enterprise-table", "grades", gradeTable.queryKey],
    queryFn: async () => {
      try {
        const rawRes = await api.get<TableApiResponse<any>>("/grades", { params: gradeTable.params });
        console.log("Grade API Raw Response:", rawRes);
        console.log("Grade API Transformed Response:", rawRes.data);
        return rawRes.data;
      } catch (err) {
        console.error("grades API failed:", err);
        return { data: [], pagination: { page: 1, limit: 25, total: 0, pages: 1 } };
      }
    },
    placeholderData: (previous) => previous
  });

  const metalColumns: EnterpriseColumnDef<any>[] = [
    { accessorKey: "name", header: "Metal Name", meta: { label: "Metal" }, cell: ({ row }) => <span className="font-bold text-slate-800">{row.original.name}</span> },
    { accessorKey: "code", header: "ERP Code", meta: { label: "Code", className: "font-mono text-[11px]" } },
    { accessorKey: "category", header: "Category", meta: { label: "Category" } },
    { accessorKey: "unit", header: "Unit", enableSorting: false, meta: { label: "Unit" } },
    {
      id: "price",
      header: "Master Price",
      enableSorting: false,
      meta: { label: "Price" },
      cell: ({ row }) => row.original.prices?.[0] ? `${inr(row.original.prices[0].pricePerUnit)} / kg` : "N/A"
    },
    {
      accessorKey: "status",
      header: "Status",
      meta: { label: "Status" },
      cell: ({ row }) => (
        <Badge className={row.original.status === "ACTIVE" ? "border-success-border bg-success-bg text-success-fg" : "border-slate-200 bg-slate-100 text-slate-500"}>
          {row.original.status}
        </Badge>
      )
    }
  ];

  const gradeColumns: EnterpriseColumnDef<any>[] = [
    { accessorKey: "code", header: "Grade Code", meta: { label: "Grade Code", className: "font-mono" }, cell: ({ row }) => <span className="font-mono text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">{row.original.materialCode || row.original.name?.toUpperCase().replace(/\s+/g, '-') + "-01"}</span> },
    { accessorKey: "name", header: "Grade Name", meta: { label: "Grade" }, cell: ({ row }) => <span className="font-bold text-sm text-primary">{row.original.name}</span> },
    { id: "metal", header: "Metal Class", enableSorting: false, meta: { label: "Metal Class" }, cell: ({ row }) => <span className="text-slate-600 text-xs">{row.original.metal?.name || "Ferrous"}</span> },
    { accessorKey: "subGrade", header: "Sub Grade", meta: { label: "Sub Grade" }, cell: ({ row }) => <span className="text-slate-600 text-xs">{row.original.subGrade || "-"}</span> },
    { accessorKey: "multiplier", header: "Multiplier", meta: { label: "Multiplier", className: "font-mono" }, cell: ({ row }) => <span className="font-mono text-xs font-medium text-slate-700">{row.original.multiplier}x</span> },
    { accessorKey: "extraPrice", header: "Premium (₹/MT)", meta: { label: "Premium" }, cell: ({ row }) => <span className="font-mono text-xs font-medium text-slate-700">{Number(row.original.extraPrice ?? 0).toFixed(2)}</span> },
    {
      id: "chemistry",
      header: "Chemistry Summary",
      enableSorting: false,
      meta: { label: "Chemistry Summary", mobileHidden: true },
      cell: ({ row }) => <ChemistrySummary composition={row.original.chemicalComposition} />
    },
    {
      accessorKey: "status",
      header: "Status",
      meta: { label: "Status" },
      cell: ({ row }) => {
        let badgeColor = "border-slate-200 bg-slate-100 text-slate-500";
        let label = "Unknown";
        
        if (row.original.status === "ACTIVE") {
          badgeColor = "border-success-border bg-success-bg text-success-fg";
          label = "Active";
        } else if (row.original.status === "DRAFT") {
          badgeColor = "border-amber-200 bg-amber-50 text-amber-700";
          label = "Draft";
        } else if (row.original.status === "INACTIVE") {
          badgeColor = "border-red-200 bg-red-50 text-red-700";
          label = "Inactive";
        }

        return (
          <Badge className={`${badgeColor} shadow-sm px-2.5 py-0.5 font-medium`}>
            {label}
          </Badge>
        );
      }
    },
    { accessorKey: "updatedAt", header: "Last Updated", meta: { label: "Last Updated" }, cell: ({ row }) => <div className="flex flex-col text-xs text-slate-600"><span className="font-medium">{new Date(row.original.updatedAt || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}</span><span className="text-slate-400">{new Date(row.original.updatedAt || new Date()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div> },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="View Details" className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#0057b8] transition-all"><Eye className="size-4" /></Button>
              </TooltipTrigger>
              <TooltipContent side="top">View Details</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Edit Grade" onClick={() => openEditGrade(row.original)} className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#0057b8] transition-all"><Edit3 className="size-4" /></Button>
              </TooltipTrigger>
              <TooltipContent side="top">Edit Grade</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Clone Grade" className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#0057b8] transition-all"><Copy className="size-4" /></Button>
              </TooltipTrigger>
              <TooltipContent side="top">Clone Grade</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="View History" className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#0057b8] transition-all"><History className="size-4" /></Button>
              </TooltipTrigger>
              <TooltipContent side="top">View History</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Delete Grade" onClick={() => handleDeleteGrade(row.original.id)} className="h-7 w-7 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:scale-105 focus-visible:ring-2 focus-visible:ring-red-600 transition-all"><Trash2 className="size-4" /></Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-red-600 text-white border-red-600">Delete Grade</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )
    }
  ];

  const rawColumns: EnterpriseColumnDef<any>[] = [
    { accessorKey: "materialCode", header: "Material Code", size: 130, meta: { label: "Code", className: "font-mono text-[11px]" }, cell: ({ row }) => <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-sm">{row.original.materialCode}</span> },
    { accessorKey: "materialName", header: "Material Name", size: 200, meta: { label: "Name" }, cell: ({ row }) => <span className="text-sm font-extrabold text-primary tracking-tight">{row.original.materialName}</span> },
    { accessorKey: "category", header: "Category", size: 140, meta: { label: "Category" }, cell: ({ row }) => {
      const cat = row.original.category?.name || "Uncategorized";
      const map: Record<string, string> = {
        "Ferro Alloy": "border-sky-200 bg-sky-50 text-sky-800",
        "Aluminium": "border-indigo-200 bg-indigo-50 text-indigo-800",
        "Flux": "border-amber-200 bg-amber-50 text-amber-800",
        "Carbon Additive": "border-slate-200 bg-slate-100 text-slate-800",
        "Calcium Alloy": "border-rose-200 bg-rose-50 text-rose-800",
        "Non-Ferrous": "border-emerald-200 bg-emerald-50 text-emerald-800"
      };
      const cls = map[cat] || "border-slate-200 bg-slate-100 text-slate-600";
      return <Badge className={`${cls} text-[11px] font-bold px-2.5 py-0.5 rounded-sm shadow-sm`}>{cat}</Badge>;
    } },
    { accessorKey: "description", header: "Description", size: 220, meta: { label: "Description" }, cell: ({ row }) => <span className="text-xs font-medium text-slate-500 max-w-[200px] truncate leading-relaxed block" title={row.original.description || ""}>{row.original.description || "-"}</span> },
    { accessorKey: "availability", header: "Available", size: 110, meta: { label: "Available" }, cell: ({ row }) => <Badge className={row.original.availability ? "border-success-border bg-success-bg text-success-fg shadow-sm px-2.5 py-0.5" : "border-slate-200 bg-slate-100 text-slate-500 shadow-sm px-2.5 py-0.5"}>{row.original.availability ? "YES" : "NO"}</Badge> },
    { accessorKey: "isMicro", header: "Micro", size: 100, meta: { label: "Micro" }, cell: ({ row }) => <Badge className={row.original.isMicro ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm px-2.5 py-0.5" : "border-slate-200 bg-slate-100 text-slate-500 shadow-sm px-2.5 py-0.5"}>{row.original.isMicro ? "YES" : "NO"}</Badge> },
    { accessorKey: "currentRate", header: "Current Rate", size: 180, meta: { label: "Rate" }, cell: ({ row }) => {
      const rateInfo = currentRateInfo?.[row.original.id];
      const rate = Number(rateInfo?.rate || 0);
      const hist = priceLatestMap.get(row.original.id) || null;
      let changeEl = null;
      if (hist) {
        const oldP = Number(hist.oldPrice || hist.old_rate || 0);
        const newP = Number(hist.newPrice || hist.new_rate || rate);
        if (oldP > 0) {
          const pct = ((newP - oldP) / oldP) * 100;
          const arrow = pct > 0 ? "▲" : pct < 0 ? "▼" : "—";
          const colorClass = pct > 0 ? "text-emerald-600 bg-emerald-50 border-emerald-100" : pct < 0 ? "text-rose-600 bg-rose-50 border-rose-100" : "text-slate-500 bg-slate-50 border-slate-200";
          changeEl = <span className={`ml-2 text-[10px] font-bold ${colorClass} px-1.5 py-0.5 rounded-sm border flex items-center gap-0.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]`}>{arrow} {Math.abs(pct).toFixed(1)}%</span>;
        }
      }
      return (
        <div className="flex items-center">
          <span className="font-mono text-sm font-black tracking-tight text-slate-800">{rate > 0 ? inr(rate) : "N/A"}</span>
          {rate > 0 && <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">/ {row.original.unit || 'kg'}</span>}
          {changeEl}
        </div>
      );
    } },
    { accessorKey: "updatedBy", header: "Updated By", size: 120, meta: { label: "Updated By" }, cell: ({ row }) => <span className="text-xs font-semibold text-slate-500">{row.original.updatedBy?.name || "System"}</span> },
    { accessorKey: "updatedAt", header: "Last Updated", size: 120, meta: { label: "Last Updated" }, cell: ({ row }) => <span className="text-xs font-semibold text-slate-500">{row.original.updatedAt ? shortDate(row.original.updatedAt) : "N/A"}</span> },
    { id: "actions", header: "Actions", size: 120, enableSorting: false, meta: { label: "Actions" }, cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-sm transition-colors" onClick={() => { setSelectedRaw(row.original); setActiveModal("view_raw"); }} title="View">
          <Eye className="size-4 text-slate-500" />
        </Button>
        {actor?.role === "COSTING_DEPARTMENT" && (
          <>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 rounded-sm transition-colors" onClick={() => { setSelectedRaw(row.original); setRawName(row.original.materialName || ""); setRawCode(row.original.materialCode || ""); setRawUnit(row.original.unit || "kg"); setRawCategory(row.original.category || "Ferro Alloy"); setRawCurrentRate(row.original.currentRate?.toString() || ""); setRawSupplier(row.original.supplier || ""); setRawDescription(row.original.description || ""); setIsMicroFlag(row.original.isMicro ?? false); setIsAvailFlag(row.original.availability ?? true); setActiveModal("edit_raw"); }} title="Edit">
              <Edit2 className="size-4 text-[#0b5cbf]" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-emerald-50 rounded-sm transition-colors" onClick={() => { setSelectedRaw(row.original); setPriceTargetId(row.original.id); setPriceType("raw"); setPriceValue(""); setPriceReason("Market Index Alignment"); setActiveModal("price"); }} title="Update Price">
              <TrendingUp className="size-4 text-emerald-600" />
            </Button>
          </>
        )}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-sm transition-colors" onClick={() => { setSelectedRaw(row.original); setActiveModal("history_raw"); }} title="History">
          <MoreVertical className="size-4 text-slate-500" />
        </Button>
      </div>
    ) }
  ];

  // Form Submit Handlers
  const handleAddMetal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metalName || !metalCode) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      await api.post("/masters/metals", {
        name: metalName,
        code: metalCode,
        category: metalCategory,
        unit: metalUnit,
        status: "ACTIVE"
      });
      toast.success(`Metal Master ${metalName} created successfully.`);
      setActiveModal(null);
      setMetalName("");
      setMetalCode("");
      refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create metal master.");
    }
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeName || !gradeMultiplier) {
      toast.error("Please fill in grade name and multiplier.");
      return;
    }
    if (!gradeMetalId) {
      toast.error("Please select a Metal Master Base.");
      return;
    }
    try {
      const chem: Record<string, any> = { ...(selectedGrade?.chemicalComposition || {}) };
      if (chemCr) chem["Cr"] = chemCr;
      if (chemNi) chem["Ni"] = chemNi;
      if (chemC) chem["C"] = chemC;

      const payload = {
        metalId: gradeMetalId,
        name: gradeName,
        subGrade: gradeSub || null,
        multiplier: parseFloat(gradeMultiplier),
        extraPrice: parseFloat(gradeExtraPrice),
        status: "ACTIVE",
        mechanicalProperties: { "UTS": mechUTS },
        toleranceProperties: { "Thickness": "+/- 0.10 mm" },
        bendProperties: { "Rating": "Good" },
        chemicalComposition: chem
      };

      if (selectedGrade) {
        await api.put(`/grades/${selectedGrade.id}`, payload);
        toast.success(`Steel Grade ${gradeName} updated.`);
      } else {
        await api.post("/grades", payload);
        toast.success(`Steel Grade ${gradeName} added to Metal Master.`);
      }
      closeGradeModal();
      refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save grade.");
    }
  };

  const handleDeleteGrade = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate this grade?")) return;
    try {
      await api.delete(`/grades/${id}`);
      toast.success("Grade deactivated.");
      refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to deactivate grade.");
    }
  };

  const handleAddRaw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawName || !rawCode) {
      toast.error("Alloy name and material code are required.");
      return;
    }

    // Material Code uniqueness validation
    const codeExists = rawMaterials.some((r: any) => r.materialCode?.toLowerCase() === rawCode.toLowerCase());
    if (codeExists) {
      toast.error(`Material Code "${rawCode}" already exists. Material Code must be unique.`);
      return;
    }

    try {
      await createRawMaterial.mutateAsync({
        name: rawName,
        code: rawCode.toUpperCase(),
        category: rawCategory,
        unit: rawUnit,
        currentRate: parseFloat(rawCurrentRate) || 0,
        supplier: rawSupplier || null,
        status: "ACTIVE",
        description: rawDescription || null,
        isMicro: isMicroFlag,
        isAvail: isAvailFlag
      });
      toast.success(`Raw Material Feed ${rawName} registered successfully.`);
      setActiveModal(null);
      setRawName("");
      setRawCode("");
      setRawUnit("kg");
      setRawCategory("Ferro Alloy");
      setRawCurrentRate("");
      setRawSupplier("");
      setRawDescription("");
      setIsMicroFlag(false);
      setIsAvailFlag(true);
      refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to register raw material.");
    }
  };

  const handleEditRaw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRaw) return;
    if (!rawName || !rawCode) {
      toast.error("Alloy name and material code are required.");
      return;
    }

    // Material Code uniqueness validation (excluding current raw material)
    const codeExists = rawMaterials.some((r: any) => r.id !== selectedRaw.id && r.materialCode?.toLowerCase() === rawCode.toLowerCase());
    if (codeExists) {
      toast.error(`Material Code "${rawCode}" already exists. Material Code must be unique.`);
      return;
    }

    try {
      await updateRawMaterial.mutateAsync({
        id: selectedRaw.id,
        name: rawName,
        code: rawCode.toUpperCase(),
        category: rawCategory,
        unit: rawUnit,
        supplier: rawSupplier || null,
        description: rawDescription || null,
        isMicro: isMicroFlag,
        isAvail: isAvailFlag
      });
      toast.success(`Raw Material Feed ${rawName} updated successfully.`);
      setActiveModal(null);
      setRawName("");
      setRawCode("");
      setRawUnit("kg");
      setRawCategory("Ferro Alloy");
      setRawCurrentRate("");
      setRawSupplier("");
      setRawDescription("");
      setIsMicroFlag(false);
      setIsAvailFlag(true);
      setSelectedRaw(null);
      refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update raw material.");
    }
  };

  const handlePublishPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceTargetId) {
      toast.error("Material Required");
      return;
    }
    const val = parseFloat(priceValue);
    if (isNaN(val) || val <= 0) {
      toast.error("New Rate must be greater than 0");
      return;
    }
    if (!effectiveDate) {
      toast.error("Effective Date Required");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(effectiveDate);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error("Effective Date cannot be in the past");
      return;
    }
    if (!priceSource.trim()) {
      toast.error("Supplier Required");
      return;
    }
    if (!priceReason.trim()) {
      toast.error("Reason Required");
      return;
    }
    setShowConfirmPublish(true);
  };

  const handleConfirmPublish = async () => {
    try {
      const payload = {
        materialId: priceTargetId,
        newRate: parseFloat(priceValue),
        effectiveDate: new Date(effectiveDate).toISOString(),
        supplier: priceSource,
        reason: priceReason,
        remarks: priceRemarks || undefined
      };
      console.log("Price Update Payload:", payload);
      await publishNewPrice.mutateAsync(payload);
      toast.success("Price updated successfully and recorded in history.");
      setActiveModal(null);
      setPriceValue("");
      setPriceRemarks("");
      setPriceTargetId("");
      setShowConfirmPublish(false);
      // Note: React Query's onSuccess in usePublishNewRate invalidates queries automatically
    } catch (err: any) {
      console.error("Price Update Response Error:", err.response?.data || err);
      toast.error(err.response?.data?.message || err.message || "Failed to publish master price.");
    }
  };

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    let total = 0;
    let success = 0;
    let failed = 0;
    try {
      // Invalidate react query cache
      await queryClient.invalidateQueries({ queryKey: ['RawMaterial'] });
      await queryClient.invalidateQueries({ queryKey: ['enterprise-table'] });
      
      const [
        metalsRes,
        gradesRes,
        alloysRes
      ] = await Promise.allSettled([
        api.get('/metals', { params: { limit: 100 } }),
        api.get('/grades', { params: { limit: 100 } }),
        api.get('/alloys', { params: { limit: 100 } })
      ]);

      if (metalsRes.status === 'fulfilled') {
        const d = metalsRes.value.data?.data || [];
        setMetals(d);
        success += d.length;
      } else {
        failed += 1;
        console.error("Metals sync failed", metalsRes);
      }

      if (gradesRes.status === 'fulfilled') {
        const d = gradesRes.value.data?.data || [];
        setGrades(d);
        success += d.length;
      } else {
        failed += 1;
        console.error("Grades sync failed", gradesRes);
      }

      if (alloysRes.status === 'fulfilled') {
        const d = alloysRes.value.data?.data || [];
        setAlloys(d);
        success += d.length;
      } else {
        failed += 1;
        console.error("Aloys sync failed", alloysRes);
      }

      success += rawMaterials.length;
      total = success + failed;

      setSyncStats({
        total,
        success,
        failed,
        timestamp: new Date().toLocaleTimeString()
      });
      toast.success(`Database sync complete. Synced ${success} records from database.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to sync database.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Dynamic Alloy Composition Builder Handlers
  const addAlloyCompRow = () => {
    setAlloyComponents(curr => [...curr, { type: "metal", id: "", pct: 0 }]);
  };

  const removeAlloyCompRow = (index: number) => {
    setAlloyComponents(curr => curr.filter((_, idx) => idx !== index));
  };

  const updateAlloyCompRow = (index: number, fields: Partial<typeof alloyComponents[0]>) => {
    setAlloyComponents(curr => curr.map((row, idx) => idx === index ? { ...row, ...fields } : row));
  };

  const alloyCompSum = useMemo(() => {
    return alloyComponents.reduce((sum, row) => sum + (row.pct || 0), 0);
  }, [alloyComponents]);

  const handleAddAlloy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alloyName || !alloyCode) {
      toast.error("Alloy name and ERP code are required.");
      return;
    }
    if (alloyCompSum !== 100) {
      toast.error(`Total composition percentage must equal 100% (Current total is ${alloyCompSum}%).`);
      return;
    }

    try {
      const componentsData = alloyComponents.map(row => {
        if (row.type === "metal") {
          // Select gradeId if linked, or use metalId
          const grade = grades.find(g => g.id === row.id);
          return {
            metalId: grade ? grade.metalId : row.id,
            gradeId: grade ? grade.id : null,
            rawMaterialId: null,
            compositionPercent: row.pct
          };
        } else {
          return {
            metalId: null,
            gradeId: null,
            rawMaterialId: row.id,
            compositionPercent: row.pct
          };
        }
      });

      await api.post("/masters/alloys", {
        name: alloyName,
        code: alloyCode,
        type: alloyType,
        status: "ACTIVE",
        components: componentsData
      });

      toast.success(`JSW Composition Structure ${alloyName} successfully registered.`);
      setActiveModal(null);
      setAlloyName("");
      setAlloyCode("");
      setAlloyComponents([{ type: "metal", id: "", pct: 100 }]);
      refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Composition structure validation failed.");
    }
  };

  const gradeKpiStats = useMemo(() => {
    const validGrades = Array.isArray(grades) ? grades : [];
    if (validGrades.length === 0) {
      return {
        total: 0,
        active: 0,
        activePercent: "0.00",
        metalClasses: 0,
        draft: 0,
        inactive: 0,
        avgMultiplier: "0.00"
      };
    }

    const total = validGrades.length;
    let active = 0;
    let draft = 0;
    let inactive = 0;
    const metalClassSet = new Set();
    let totalMultiplier = 0;

    validGrades.forEach((g: any) => {
      if (g?.status === 'ACTIVE') active++;
      else if (g?.status === 'DRAFT' || g?.status === 'PENDING') draft++;
      else if (g?.status === 'INACTIVE') inactive++;
      
      // Count DISTINCT metal classes safely
      if (g?.metal?.id) {
        metalClassSet.add(g.metal.id);
      } else if (g?.metalId) {
        metalClassSet.add(g.metalId);
      } else if (g?.metal?.name) {
        metalClassSet.add(g.metal.name);
      }

      totalMultiplier += Number(g?.multiplier ?? 0) || 0;
    });

    const activePercent = total > 0 ? Number((active / total) * 100).toFixed(2) : "0.00";
    const avgMultiplierNum = total > 0 ? totalMultiplier / total : 0;
    const avgMultiplier = Number(avgMultiplierNum || 0).toFixed(2);

    return {
      total,
      active,
      activePercent,
      metalClasses: metalClassSet.size || 0,
      draft,
      inactive,
      avgMultiplier
    };
  }, [grades]);

  return (
    <div className="flex flex-col gap-4">

      {focus !== "material-rates" && focus !== "grade-builder" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PageHead 
            title={
              focus === "users" || focus === "user-management"
                ? "Users & Roles Access" 
                : focus === "settings" 
                ? "ERP Calculation Slabs" 
                : focus === "material-master"
                ? "Material Master"
                : "JSW Master Data Management"
            } 
            icon={focus === "users" || focus === "user-management" ? Users : Database} 
          />
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="mr-1 size-4" /> Sync Database
            </Button>
            {actor?.role !== "PDQC" && (
              <div className="flex gap-2">
                {focus === "material-master" && (
                  <Button size="sm" onClick={() => setActiveModal("alloy")} className="bg-success hover:bg-[#065a33]">
                    <Layers className="mr-1 size-4" /> New Composition
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!["settings", "users", "user-management", "material-rates", "grade-builder"].includes(focus) && (
        <div className="flex flex-wrap items-center gap-3">
          <Input 
            className="max-w-sm" 
            value={query} 
            onChange={(event) => setQuery(event.target.value)} 
            placeholder="Filter ERP lists..." 
          />
          {actor?.role !== "PDQC" && (
            <div className="flex gap-1">
              {focus === "material-master" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => setActiveModal("metal")}><Plus className="size-3" /> Add Metal</Button>
                  <Button size="sm" variant="outline" onClick={() => setActiveModal("raw")}><Plus className="size-3" /> Add Raw Feed</Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {focus === "users" || focus === "user-management" ? (
        <UsersPanel />
      ) : focus === "settings" ? (
        <SettingsPanel />
      ) : focus === "grade-builder" ? (
        <div className="flex flex-col gap-5 w-full">
          {/* 1. Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 border border-slate-200 rounded-sm shadow-sm">
            <div className="flex flex-col gap-3">
              <div>
                <h1 className="text-xl font-extrabold text-primary tracking-tight flex items-center gap-2"><Layers className="size-5 text-[#0b5cbf]" /> Grade Management</h1>
                <p className="text-xs font-medium text-slate-500 mt-1">Enterprise Grade Configuration & Multiplier Settings</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={refreshData} disabled={isSyncing} className={`h-9 text-xs font-bold shadow-none active:scale-[0.98] transition-all ${isSyncing ? "btn-loading-stripes-dark" : ""}`}>
                {!isSyncing && <RefreshCw className="mr-2 size-4" />} 
                {isSyncing ? "Syncing..." : "Sync Database"}
              </Button>
              {actor?.role !== "PDQC" && (
                <Button size="sm" onClick={() => setActiveModal("grade")} className="bg-[#0b5cbf] hover:bg-[#094c9e] h-9 px-4 text-xs font-bold text-white shadow-sm transition-all rounded-sm active:scale-[0.98]">
                  <Plus className="mr-2 size-4" /> Add Grade
                </Button>
              )}
            </div>
          </div>

          {/* 2. KPI Cards Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <GradeMetricCard 
              title="Total Grades" 
              value={gradeKpiStats.total} 
              subtitle="All registered grades" 
              icon={Layers} 
              colorTheme="blue" 
              isLoading={grades.length === 0}
            />
            <GradeMetricCard 
              title="Active Grades" 
              value={gradeKpiStats.active} 
              trend={`${gradeKpiStats.activePercent}% of total`} 
              icon={CheckCircle} 
              colorTheme="green" 
              isLoading={grades.length === 0}
            />
            <GradeMetricCard 
              title="Metal Classes" 
              value={gradeKpiStats.metalClasses} 
              subtitle="Across all categories" 
              icon={Database} 
              colorTheme="blue" 
              isLoading={grades.length === 0}
            />
            <GradeMetricCard 
              title="Draft Grades" 
              value={gradeKpiStats.draft} 
              subtitle="Awaiting activation" 
              icon={Edit3} 
              colorTheme="amber" 
              isLoading={grades.length === 0}
            />
            <GradeMetricCard 
              title="Inactive Grades" 
              value={gradeKpiStats.inactive} 
              subtitle="Temporarily disabled" 
              icon={History} 
              colorTheme="red" 
              isLoading={grades.length === 0}
            />
            <GradeMetricCard 
              title="Avg Multiplier" 
              value={`${gradeKpiStats.avgMultiplier}x`} 
              subtitle="Across all grades" 
              icon={TrendingUp} 
              colorTheme="purple" 
              isLoading={grades.length === 0}
            />
          </div>

          {/* 3. Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <MostUsedGradesCard grades={grades} isLoading={grades.length === 0} />
            <GradeDistributionChart grades={grades} isLoading={grades.length === 0} />
            <CostImpactAnalysisCard grades={grades} isLoading={grades.length === 0} />
          </div>

          {/* 4/5/6. Toolbar, Filters Row, Main Table Area */}
          <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 bg-white p-3 rounded-sm border border-slate-200 shadow-sm mt-1">
            <GradeManagementToolbar 
              selectedIds={selectedGradeIds}
              onImport={() => setIsImportModalOpen(true)}
              onDownloadTemplate={() => {
                toast.success("Downloading Grade Import Template...");
                // Note: in reality, generate a workbook with headers.
              }}
              onExport={(format, scope) => {
                if (grades.length === 0) {
                  toast.error("No data to export.");
                  return;
                }
                if (format === "pdf") {
                  toast("PDF export is not fully implemented yet.", { icon: "🚧" });
                  return;
                }
                
                let dataToExport = grades;
                if (scope === "selected") {
                  dataToExport = grades.filter((g: any) => selectedGradeIds.has(g.id));
                } else if (scope === "all") {
                  toast.info("Exporting all records... (Simulated)");
                  // Mock fetching all records
                }
                
                const exportData = dataToExport.map((g: any) => ({
                  Code: g.code,
                  Name: g.name,
                  MetalClass: g.metal?.name || "-",
                  Multiplier: Number(g.multiplier || 0).toFixed(3),
                  Premium: Number(g.premium || 0).toFixed(2),
                  Status: g.status,
                  LastUpdated: shortDate(g.updatedAt)
                }));

                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Grades");
                XLSX.writeFile(wb, `JSW_Grades_Export_${scope}.xlsx`);
                toast.success(`Exported ${dataToExport.length} grades successfully.`);
              }}
              onClone={() => setIsCloneModalOpen(true)}
              onBulkUpdate={() => setIsBulkUpdateModalOpen(true)}
              onCompare={() => setIsCompareModalOpen(true)}
              onRefresh={() => { queryClient.invalidateQueries({ queryKey: ["grades"] }); toast.success("Data refreshed successfully."); }}
              onPrint={() => window.print()}
            />
            <GradeManagementSearchFilters 
              query={gradeTable.query}
              setQuery={gradeTable.setQuery}
              metals={metals}
              onReset={() => {
                setSelectedGradeIds(new Set());
                toast.success("Filters reset successfully.");
              }}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
            <div className="w-full lg:w-1/4">
              <GradeHierarchyTree grades={grades} isLoading={grades.length === 0} />
            </div>
            
            <div className="w-full lg:w-3/4">
                <EnterpriseDataTable
                  tableId="grades"
                  data={(() => {
                    const ds = gradesTableQuery.data?.data ?? [];
                    console.log("Grade Table DataSource:", ds);
                    return ds;
                  })()}
                  columns={gradeColumns}
                  query={gradeTable.query}
                  onQueryChange={gradeTable.setQuery}
                  totalRows={gradesTableQuery.data?.pagination?.total ?? 0}
                  getRowId={(row) => row.id}
                  isLoading={gradesTableQuery.isLoading}
                  error={gradesTableQuery.error}
                  exportResource="grades"
                  exportParams={gradeTable.params}
                  onRowClick={openGradeDetails}
                />
            </div>
          </div>
          
          <GradeInsightsDashboard grades={grades} isLoading={grades.length === 0 && isSyncing} />
        </div>
      ) : focus === "material-rates" ? (
        <div className="flex flex-col xl:flex-row gap-5 items-start w-full">
          {/* Main Content Area */}
          <main className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Enterprise Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 border border-slate-200 rounded-sm shadow-sm">
              <div className="flex flex-col gap-3">
                <div>
                  <h1 className="text-xl font-extrabold text-primary tracking-tight flex items-center gap-2"><Database className="size-5 text-[#0b5cbf]" /> Material Rates Command Center</h1>
                  <p className="text-xs font-medium text-slate-500 mt-1">Centralized Material Pricing, Cost Control & ERP Synchronization</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSyncDatabase} disabled={isSyncing} className={`h-8 text-xs font-bold shadow-none transition-all ${isSyncing ? "btn-loading-stripes-dark" : ""}`}>
                    {!isSyncing && <RefreshCw className="mr-1 size-3.5" />} 
                    {isSyncing ? "Syncing..." : "Manual Sync"}
                  </Button>
                </div>
              </div>
              
              {/* Right Side Cards */}
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-sm border border-slate-100">
                <div className="flex flex-col px-3 border-r border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">ERP Sync Status</span>
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><Check className="size-3.5" /> {syncStats ? "Active" : "Pending"}</span>
                </div>
                <div className="flex flex-col px-3 border-r border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Last Sync</span>
                  <span className="text-sm font-bold text-slate-700">{syncStats?.timestamp || "Unknown"}</span>
                </div>
                <div className="flex flex-col pl-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Current User</span>
                  <span className="text-sm font-bold text-[#0b5cbf] flex items-center gap-1"><Users className="size-3.5" /> {actor?.name || actor?.email?.split('@')[0] || "Operator"}</span>
                </div>
              </div>
            </div>

            {/* KPI Cards Row - compact and responsive */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPIWidget 
                label="Active Materials" 
                value={activeMaterials?.length || 0} 
                icon={Database} 
                trend="+2.4% vs last week" 
                trendType="up"
                color="blue" 
                sparklineData={[12, 14, 13, 16, 15, 18, 20]}
              />
              <KPIWidget 
                label="Pending Approvals" 
                value="3 Pending" 
                icon={AlertCircle} 
                trend="Requires action" 
                trendType="neutral"
                color="amber" 
                sparklineData={[1, 0, 2, 1, 4, 2, 3]}
              />
              <KPIWidget 
                label="Today's Updates" 
                value={todaysUpdatesCount} 
                icon={TrendingUp} 
                trend="+12% activity" 
                trendType="up"
                color="indigo" 
                sparklineData={[5, 8, 4, 10, 15, 12, todaysUpdatesCount || 0]}
              />
              <KPIWidget 
                label="ERP Sync Health" 
                value={syncStats ? `${Math.round((syncStats.success / (syncStats.total || 1)) * 100)}%` : "N/A"} 
                icon={RefreshCw} 
                trend={syncStats?.failed ? `${syncStats.failed} Failed` : "Optimal"} 
                trendType={syncStats?.failed ? "down" : "up"}
                color={syncStats?.failed ? "rose" : "emerald"} 
                sparklineData={[98, 99, 100, 95, 99, 100, syncStats?.failed ? 90 : 100]}
              />
            </div>

            <EnterpriseDataTable
              tableId="raw-rates"
              data={paginatedRawRates}
              columns={rawColumns}
              query={rawTable.query}
              onQueryChange={rawTable.setQuery}
              totalRows={filteredRawRates.length}
              getRowId={(row) => row.id}
              onRowClick={(row) => setSelectedRaw(row)}
              searchPlaceholder={undefined}
              hideSearch={true}
              exportResource="raw-materials"
              exportParams={{}}
              filters={
                <div className="col-span-full flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#f8fafc] p-4 rounded-sm border border-slate-200 mt-2 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
                  {/* Left Side: Search & Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Unified Search Bar */}
                    <div className="relative min-w-[320px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search code, name, description..."
                        className="pl-9 h-10 w-full rounded-sm border-slate-300 bg-white shadow-sm focus:border-[#0b5cbf] focus:ring-1 focus:ring-[#0b5cbf] text-sm"
                      />
                    </div>
                    
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                      <Sliders className="size-4 text-slate-400" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => {
                          setCategoryFilter(e.target.value);
                          rawTable.setQuery((current) => ({ ...current, page: 1 }));
                        }}
                        className="h-10 min-w-[150px] rounded-sm border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-[#0b5cbf] focus:ring-1 focus:ring-[#0b5cbf]"
                      >
                        <option value="all">All Categories</option>
                        <option value="available">Available</option>
                        <option value="micro">Micro Alloys</option>
                        <option value="inactive">Inactive</option>
                      </select>

                      {/* Supplier Filter */}
                      <select
                        value={rawTable.query.filters.supplier ?? ""}
                        onChange={(e) => rawTable.setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, supplier: e.target.value || undefined } }))}
                        className="h-10 min-w-[150px] rounded-sm border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-[#0b5cbf] focus:ring-1 focus:ring-[#0b5cbf]"
                      >
                        <option value="">All Suppliers</option>
                        <option value="jsw">JSW Steel</option>
                        <option value="external">External Vendors</option>
                      </select>

                      {/* Status Filter */}
                      <select
                        value={rawTable.query.filters.status ?? ""}
                        onChange={(e) => rawTable.setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, status: e.target.value || undefined } }))}
                        className="h-10 min-w-[140px] rounded-sm border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-[#0b5cbf] focus:ring-1 focus:ring-[#0b5cbf]"
                      >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Side: Primary Actions */}
                  <div className="flex items-center gap-3">
                    {actor?.role !== "PDQC" && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => { setSelectedRaw(null); setPriceType("raw"); setPriceTargetId(rawMaterials[0]?.id || ""); setPriceValue(""); setPriceReason("Market Index Alignment"); setActiveModal("price"); }} 
                          className="bg-[#0b5cbf] hover:bg-[#094c9e] h-10 px-5 text-sm font-bold text-white shadow-sm transition-all rounded-sm"
                        >
                          <TrendingUp className="mr-2 size-4" /> Price Adjuster
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-10 px-5 text-sm font-bold border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all rounded-sm" 
                          onClick={() => { setRawName(""); setRawCode(""); setRawUnit("kg"); setRawCategory("Ferro Alloy"); setRawCurrentRate(""); setRawSupplier(""); setRawDescription(""); setIsMicroFlag(false); setIsAvailFlag(true); setActiveModal("raw"); }}
                        >
                          <Plus className="mr-2 size-4" /> Add Material
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              }
            />

            {/* Bottom Analytics Section */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Card 1: Price Activity Timeline */}
              <Card className="flex flex-col h-full shadow-sm border-slate-200">
                <CardHeader className="bg-[#fafbfd] border-b border-slate-100 py-3 px-4 shrink-0">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                    <Clock className="size-4 text-[#0b5cbf]" /> 
                    Price Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex-1">
                  <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                    <div className="relative pl-6">
                      <div className="absolute left-[-9px] top-1 bg-emerald-500 rounded-full size-4 border-4 border-white shadow-sm ring-1 ring-emerald-100"></div>
                      <h5 className="text-xs font-bold text-slate-800">Published</h5>
                      <p className="text-[10px] text-slate-500 font-medium">Live on production systems</p>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-[-9px] top-1 bg-[#0b5cbf] rounded-full size-4 border-4 border-white shadow-sm ring-1 ring-blue-100"></div>
                      <h5 className="text-xs font-bold text-slate-800">Approved</h5>
                      <p className="text-[10px] text-slate-500 font-medium">Pending final synchronization</p>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-[-9px] top-1 bg-amber-400 rounded-full size-4 border-4 border-white shadow-sm ring-1 ring-amber-100"></div>
                      <h5 className="text-xs font-bold text-slate-800">Submitted</h5>
                      <p className="text-[10px] text-slate-500 font-medium">Awaiting departmental approval</p>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-[-9px] top-1 bg-slate-300 rounded-full size-4 border-4 border-white shadow-sm ring-1 ring-slate-100"></div>
                      <h5 className="text-xs font-bold text-slate-800">Draft Created</h5>
                      <p className="text-[10px] text-slate-500 font-medium">Initial staging</p>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-[-9px] top-1 bg-slate-200 rounded-full size-4 border-4 border-white shadow-sm ring-1 ring-slate-100"></div>
                      <h5 className="text-xs font-bold text-slate-800 opacity-60">Price Updated</h5>
                      <p className="text-[10px] text-slate-500 font-medium opacity-60">Previous cycle</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: ERP Intelligence Summary */}
              <Card className="flex flex-col h-full shadow-sm border-slate-200 col-span-1 lg:col-span-2">
                <CardHeader className="bg-linear-to-r from-slate-50 to-white border-b border-slate-100 py-4 px-5 shrink-0 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-black flex items-center gap-2 text-slate-800 uppercase tracking-widest">
                    <Database className="size-4 text-[#0b5cbf]" /> 
                    ERP Intelligence Summary
                  </CardTitle>
                  <Badge className="bg-success-bg text-success-fg border-success-border shadow-none text-[10px] uppercase font-bold tracking-widest px-2.5 py-1">
                    System Healthy
                  </Badge>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col md:flex-row">
                  {/* Left: Donut Chart & Legends */}
                  <div className="flex-1 p-6 flex flex-col xl:flex-row items-center justify-center gap-8 border-b md:border-b-0 md:border-r border-slate-100 bg-white">
                    <div className="relative size-44 shrink-0">
                      <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full drop-shadow-sm">
                        {/* Background track */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                        {/* Synced slice (Emerald) - 85% */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#059669" strokeWidth="12" strokeDasharray="238.76" strokeDashoffset={238.76 * 0.15} strokeLinecap="round" />
                        {/* Pending slice (Amber) - 12% */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray="238.76" strokeDashoffset={238.76 * 0.88} strokeLinecap="round" style={{ transformOrigin: 'center', transform: 'rotate(306deg)' }} />
                        {/* Failed slice (Red) - 3% */}
                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#e11d48" strokeWidth="12" strokeDasharray="238.76" strokeDashoffset={238.76 * 0.97} strokeLinecap="round" style={{ transformOrigin: 'center', transform: 'rotate(349deg)' }} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-800 tracking-tight leading-none mt-2">8.4k</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Records</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 w-full sm:w-auto min-w-[200px]">
                      <div className="flex items-center justify-between gap-6 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="size-3.5 rounded-sm bg-[#059669] shadow-sm"></div>
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Synced</span>
                        </div>
                        <span className="text-sm font-black text-slate-800">85%</span>
                      </div>
                      <div className="flex items-center justify-between gap-6 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="size-3.5 rounded-sm bg-[#f59e0b] shadow-sm"></div>
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pending</span>
                        </div>
                        <span className="text-sm font-black text-slate-800">12%</span>
                      </div>
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-2.5">
                          <div className="size-3.5 rounded-sm bg-[#e11d48] shadow-sm"></div>
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Failed</span>
                        </div>
                        <span className="text-sm font-black text-slate-800">3%</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Sync Statistics */}
                  <div className="w-full md:w-64 bg-slate-50/80 p-6 flex flex-col justify-center gap-6">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Last Successful Sync</span>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-[#059669]" />
                        <span className="text-sm font-black text-slate-800">{shortDate(new Date().toISOString())}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Next Scheduled Sync</span>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="size-4 text-[#0b5cbf]" />
                        <span className="text-sm font-black text-slate-800">In 4 hours</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sync Health Score</span>
                      <div className="flex items-center gap-3">
                        <Activity className="size-4 text-emerald-500" />
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[95%]"></div>
                          </div>
                          <span className="text-xs font-black text-emerald-600">95%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>

          {/* Right Material Details Panel */}
          <aside className="hidden xl:flex w-[380px] shrink-0 border border-slate-200 bg-white rounded-sm overflow-hidden shadow-sm flex-col h-[calc(100vh-140px)] sticky top-6">
            <div className="bg-[#f8fafc] border-b border-slate-200 p-4 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Material Details</h3>
              {selectedRaw && (
                <Badge className="text-[10px] font-bold uppercase tracking-wider bg-white">
                  {selectedRaw.materialCode || selectedRaw.rawMatId || "MAT"}
                </Badge>
              )}
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col">
              {!selectedRaw ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60 p-5">
                  <div className="p-4 bg-slate-50 rounded-full border border-slate-100">
                    <Database className="size-8 text-slate-300" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-500">No Material Selected</span>
                    <span className="block text-xs text-slate-400 mt-1 max-w-[200px]">Click on any row in the table to view material properties and configuration.</span>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                  <div className="px-6 pt-4 border-b border-slate-200 shrink-0 bg-white">
                    <TabsList className="bg-transparent p-0 flex gap-6 h-auto w-full justify-start">
                      <TabsTrigger value="overview" className="data-[state=active]:border-b-[3px] data-[state=active]:border-[#0b5cbf] data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none px-1 pb-3 h-auto text-xs uppercase tracking-wider bg-transparent border-transparent text-slate-500 font-extrabold data-[state=active]:bg-transparent transition-all">Overview</TabsTrigger>
                      <TabsTrigger value="history" className="data-[state=active]:border-b-[3px] data-[state=active]:border-[#0b5cbf] data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none px-1 pb-3 h-auto text-xs uppercase tracking-wider bg-transparent border-transparent text-slate-500 font-extrabold data-[state=active]:bg-transparent transition-all">Price History</TabsTrigger>
                      <TabsTrigger value="grades" className="data-[state=active]:border-b-[3px] data-[state=active]:border-[#0b5cbf] data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none px-1 pb-3 h-auto text-xs uppercase tracking-wider bg-transparent border-transparent text-slate-500 font-extrabold data-[state=active]:bg-transparent transition-all">Grade Usage</TabsTrigger>
                      <TabsTrigger value="audit" className="data-[state=active]:border-b-[3px] data-[state=active]:border-[#0b5cbf] data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none px-1 pb-3 h-auto text-xs uppercase tracking-wider bg-transparent border-transparent text-slate-500 font-extrabold data-[state=active]:bg-transparent transition-all">Audit Logs</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-slate-50/30">
                    <TabsContent value="overview" className="p-6 m-0 space-y-8">
                      {/* 1. Material Overview Section */}
                      <section>
                        <div className="mb-4">
                          <h2 className="text-2xl font-black text-primary tracking-tight leading-tight">{selectedRaw.materialName || selectedRaw.name}</h2>
                          <p className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-2">
                            <span className="uppercase tracking-wider text-[#0b5cbf]">{selectedRaw.category || "Ferro Alloy"}</span>
                            <span className="text-slate-300">&bull;</span>
                            <span>{selectedRaw.supplier || "Internal Supplier"}</span>
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Base Unit</span>
                            <span className="text-sm font-extrabold text-slate-800">{selectedRaw.unit || "kg"}</span>
                          </div>
                          <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Micro Alloy</span>
                            <Badge className={selectedRaw.isMicro ? "bg-blue-50 text-blue-700 border-blue-200 shadow-none px-2 py-0.5" : "bg-slate-100 text-slate-600 border-slate-200 shadow-none px-2 py-0.5"}>
                              {selectedRaw.isMicro ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="col-span-2 bg-white p-4 rounded-sm border border-slate-200 shadow-sm">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</span>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed">
                              {selectedRaw.description || selectedRaw.description || "No description provided."}
                            </p>
                          </div>
                        </div>
                      </section>

                      {/* 2. Financial Valuation Section */}
                      <section className="border-b pb-4 mt-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                          Financial Valuation
                        </h4>
                        <CurrentRateCard 
                          rate={selectedRaw.currentRate}
                          unit={selectedRaw.unit}
                          isActive={selectedRaw.availability}
                          effectiveDate={selectedRaw.effectiveDate}
                          updatedAt={selectedRaw.updatedAt}
                          updatedBy={selectedRaw.updatedBy?.name}
                        />
                      </section>

                      {/* Price Adjuster Section */}
                      {actor?.role !== "PDQC" && (
                        <section className="border-b pb-6 mt-4">
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <TrendingUp className="size-4 text-[#0b5cbf]" /> Price Adjuster
                          </h4>
                          <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Current Rate</label>
                                <div className="h-9 px-3 rounded-sm border border-slate-200 bg-slate-50 flex items-center">
                                  <span className="text-sm font-mono font-semibold text-slate-500">{selectedRaw.currentRate ? inr(selectedRaw.currentRate) : "N/A"}</span>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-[#0b5cbf] uppercase tracking-wider mb-1.5">New Rate *</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">₹</span>
                                  <input 
                                    type="number"
                                    className="w-full h-9 pl-7 pr-3 rounded-sm border border-[#0b5cbf]/30 bg-blue-50/20 font-mono text-sm font-bold text-[#0b5cbf] focus:outline-none focus:ring-1 focus:ring-[#0b5cbf]"
                                    placeholder="0.00"
                                    value={priceValue}
                                    onChange={(e) => {
                                      setPriceValue(e.target.value);
                                      setShowInlineImpact(false);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {(() => {
                              const current = selectedRaw?.currentRate || 0;
                              const newRate = parseFloat(priceValue) || 0;
                              const diff = newRate - current;
                              const pct = current > 0 ? (diff / current) * 100 : 0;
                              const hasNewRate = newRate > 0 && current > 0;
                              
                              return (
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Difference</label>
                                    <div className={`h-9 px-3 rounded-sm border flex items-center ${hasNewRate ? (diff > 0 ? 'bg-rose-50 border-rose-200 text-rose-700' : diff < 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-700') : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                      <span className="text-sm font-mono font-bold">{hasNewRate ? `${diff > 0 ? '+' : ''}${inr(diff)}` : "-"}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Change %</label>
                                    <div className={`h-9 px-3 rounded-sm border flex items-center ${hasNewRate ? (diff > 0 ? 'bg-rose-50 border-rose-200 text-rose-700' : diff < 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-700') : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                      <span className="text-sm font-mono font-bold">{hasNewRate ? `${diff > 0 ? '+' : ''}${Number(pct ?? 0).toFixed(2)}%` : "-"}</span>
                                    </div>
                                  </div>
                                  
                                  {showInlineImpact && hasNewRate && Math.abs(diff) > 0 && (
                                    <div className="col-span-2 mt-2 border border-slate-200 bg-slate-50/80 rounded-sm p-4 animate-in fade-in duration-200">
                                      <div className="flex items-center gap-1.5 mb-3">
                                        <Activity className="size-4 text-[#0b5cbf]" />
                                        <h5 className="text-[11px] uppercase font-black text-slate-700 tracking-widest">Impact Analysis</h5>
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-white border border-slate-200 rounded-sm p-3 text-center shadow-sm flex flex-col justify-center min-h-[70px]">
                                          <span className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5">Affected Grades</span>
                                          <span className="block text-xs font-bold text-slate-400 italic">Data Unavailable</span>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-sm p-3 text-center shadow-sm flex flex-col justify-center min-h-[70px]">
                                          <span className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5">Cost Impact / Mo</span>
                                          <span className="block text-xs font-bold text-slate-400 italic">Data Unavailable</span>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-sm p-3 text-center shadow-sm flex flex-col justify-center min-h-[70px]">
                                          <span className="block text-[9px] uppercase font-bold text-slate-400 mb-1.5">Price Impact Level</span>
                                          <span className="block text-xs font-bold text-slate-400 italic">Data Unavailable</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Reason *</label>
                                <input 
                                  type="text"
                                  className="w-full h-9 px-3 rounded-sm border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0b5cbf]"
                                  placeholder="e.g. Market Index Alignment"
                                  value={priceReason}
                                  onChange={(e) => setPriceReason(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Effective Date *</label>
                                <input 
                                  type="date"
                                  className="w-full h-9 px-3 rounded-sm border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0b5cbf]"
                                  value={effectiveDate}
                                  onChange={(e) => setEffectiveDate(e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
                              <Button 
                                variant="outline" 
                                className="flex-1 h-9 text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none"
                                onClick={() => {
                                  const val = parseFloat(priceValue);
                                  if (isNaN(val) || val <= 0) {
                                    toast.error("Enter a valid New Rate to preview impact.");
                                    return;
                                  }
                                  setShowInlineImpact(true);
                                }}
                              >
                                Preview Impact
                              </Button>
                              <Button 
                                className="flex-1 h-9 text-xs font-bold bg-[#0b5cbf] hover:bg-[#094c9e] shadow-none text-white"
                                disabled={publishNewPrice.isPending}
                                onClick={() => {
                                  if (!priceValue || parseFloat(priceValue) <= 0) {
                                    toast.error("New Rate must be greater than 0");
                                    return;
                                  }
                                  if (!priceReason) {
                                    toast.error("Reason is required");
                                    return;
                                  }
                                  setPriceTargetId(selectedRaw.id);
                                  handleConfirmPublish();
                                  setShowInlineImpact(false);
                                }}
                              >
                                {publishNewPrice.isPending ? "Submitting..." : "Submit Update"}
                              </Button>
                            </div>
                          </div>
                        </section>
                      )}

                      {/* 3. Approval Workflow Section */}
                      {(() => {
                        const currentStatus = selectedRaw.status || (selectedRaw.availability ? "Published" : "Draft");
                        
                        const stages = [
                          { id: "Draft", label: "Draft", icon: Edit3 },
                          { id: "Submitted", label: "Submitted", icon: Send },
                          { id: "Approved", label: "Approved", icon: ThumbsUp },
                          { id: "Published", label: "Published", icon: CheckCircle }
                        ];
                        
                        // Find current active index (Default to published if active, draft if not)
                        const activeIndex = stages.findIndex(s => s.id.toLowerCase() === currentStatus.toLowerCase());
                        const currentIndex = activeIndex === -1 ? (selectedRaw.availability ? 3 : 0) : activeIndex;
                        
                        return (
                          <section className="mt-2 border-b pb-6">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <GitMerge className="size-4 text-[#0b5cbf]" /> Approval Workflow
                            </h3>
                            <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                              <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Pipeline Status</span>
                                <Badge className={`${
                                  currentIndex === 3 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                  currentIndex === 2 ? "bg-blue-50 text-blue-700 border-blue-200" :
                                  currentIndex === 1 ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  "bg-slate-100 text-slate-600 border-slate-200"
                                } shadow-none px-3 py-1 text-[10px] uppercase font-black tracking-widest`}>
                                  {stages[currentIndex].label}
                                </Badge>
                              </div>
                              
                              <div className="p-8">
                                <div className="relative flex justify-between items-center px-4 md:px-8">
                                  {/* Background Line */}
                                  <div className="absolute left-[10%] right-[10%] top-5 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>
                                  
                                  {/* Active Progress Line */}
                                  <div 
                                    className="absolute left-[10%] top-5 h-1 bg-[#0b5cbf] -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-in-out shadow-[0_0_8px_rgba(11,92,191,0.5)]"
                                    style={{ width: `${(currentIndex / (stages.length - 1)) * 80}%` }}
                                  ></div>
                                  
                                  {stages.map((stage, idx) => {
                                    const isCompleted = idx < currentIndex;
                                    const isActive = idx === currentIndex;
                                    
                                    const Icon = stage.icon;
                                    
                                    return (
                                      <div key={stage.id} className="relative z-10 flex flex-col items-center gap-3">
                                        <div className={`size-10 rounded-full flex items-center justify-center ring-4 ring-white transition-all duration-300 ${
                                          isCompleted ? "bg-[#0b5cbf] text-white shadow-sm" :
                                          isActive ? "bg-[#0b5cbf] text-white shadow-[0_0_15px_rgba(11,92,191,0.4)] ring-blue-50 scale-110" :
                                          "bg-slate-100 text-slate-300"
                                        }`}>
                                          <Icon className={`size-4 ${isActive ? "animate-pulse" : ""}`} />
                                        </div>
                                        <div className="flex flex-col items-center gap-1 mt-1">
                                          <span className={`text-[11px] font-extrabold uppercase tracking-wider ${
                                            isCompleted ? "text-[#0b5cbf]" :
                                            isActive ? "text-[#0b5cbf]" :
                                            "text-slate-400"
                                          }`}>
                                            {stage.label}
                                          </span>
                                          <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? "text-slate-500" : "text-slate-300"}`}>
                                            {isCompleted ? "Done" : isActive ? "Active" : "Pending"}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </section>
                        );
                      })()}

                      {/* 4. Metadata Section */}
                      <section>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Layers className="size-4 text-slate-400" /> System Metadata
                        </h3>
                        <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                              <span className="text-xs font-bold text-slate-500">HSN Code</span>
                              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{selectedRaw.hsnCode || "-"}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                              <span className="text-xs font-bold text-slate-500">Record Created</span>
                              <span className="text-xs font-bold text-slate-800">{selectedRaw.createdAt ? shortDate(selectedRaw.createdAt) : "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-500">Last Modified</span>
                              <span className="text-xs font-bold text-slate-800">{selectedRaw.updatedAt ? shortDate(selectedRaw.updatedAt) : "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </section>
                    </TabsContent>

                    <TabsContent value="history" className="p-0 m-0">
                      <div className="p-4">
                        <PriceActivityTimeline 
                          history={rawPriceHistory} 
                          materialName={selectedRaw?.alloyName || selectedRaw?.name}
                          materialCode={selectedRaw?.code}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="grades" className="p-5 m-0">
                      <div className="h-40 flex flex-col items-center justify-center text-center opacity-60 border border-dashed border-slate-200 rounded-sm bg-slate-50/50">
                        <span className="block text-xs font-bold text-slate-500">No Grade Usage Data</span>
                        <span className="block text-[10px] text-slate-400 mt-1">This material is not mapped to any active grades.</span>
                      </div>
                    </TabsContent>

                    <TabsContent value="audit" className="p-5 m-0 space-y-4">
                      <div className="border-l-2 border-[#0b5cbf] pl-3 py-1">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Last Updated</span>
                        <span className="block text-xs font-semibold text-slate-800">{selectedRaw.updatedAt ? shortDate(selectedRaw.updatedAt) : "N/A"}</span>
                      </div>
                      <div className="border-l-2 border-slate-200 pl-3 py-1">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Updated By</span>
                        <span className="block text-xs font-semibold text-slate-800">{selectedRaw.updatedBy?.name || "System"}</span>
                      </div>
                      <div className="border-l-2 border-slate-200 pl-3 py-1">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Created At</span>
                        <span className="block text-xs font-semibold text-slate-800">{selectedRaw.createdAt ? shortDate(selectedRaw.createdAt) : "N/A"}</span>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              )}
            </div>

            {/* Panel Actions */}
            {selectedRaw && (
              <div className="p-4 border-t border-slate-200 bg-[#f8fafc] flex gap-2 shrink-0">
                {actor?.role !== "PDQC" && (
                  <>
                    <Button variant="outline" className="flex-1 h-9 text-xs font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-none" onClick={() => {
                      setRawName(selectedRaw.materialName || selectedRaw.name);
                      setRawCode(selectedRaw.materialCode || selectedRaw.rawMatId);
                      setRawUnit(selectedRaw.unit || "kg");
                      setRawCategory(selectedRaw.category || "Ferro Alloy");
                      setRawCurrentRate(selectedRaw.currentRate || "");
                      setRawSupplier(selectedRaw.supplier || "");
                      setRawDescription(selectedRaw.description || selectedRaw.description || "");
                      setIsMicroFlag(selectedRaw.isMicro || false);
                      setIsAvailFlag(selectedRaw.availability || false);
                      setActiveModal("edit_raw");
                    }}>
                      Edit Material
                    </Button>
                    <Button variant="default" className="flex-1 h-9 text-xs font-bold bg-[#0b5cbf] hover:bg-[#094c9e] shadow-none" onClick={() => setActiveModal("history_raw")}>
                      View History
                    </Button>
                  </>
                )}
                {actor?.role === "PDQC" && (
                  <Button variant="default" className="w-full h-9 text-xs font-bold bg-[#0b5cbf] hover:bg-[#094c9e] shadow-none" onClick={() => setActiveModal("history_raw")}>
                    View Price History
                  </Button>
                )}
              </div>
            )}
          </aside>
        </div>
      ) : (
        <Tabs defaultValue="metals">
          <TabsList className="bg-[#eef2f6]">
            <TabsTrigger value="metals" className="data-[state=active]:bg-[#032f67] data-[state=active]:text-white">Metals Master</TabsTrigger>
            <TabsTrigger value="alloys" className="data-[state=active]:bg-[#032f67] data-[state=active]:text-white">Product Compositions</TabsTrigger>
          </TabsList>

          <TabsContent value="metals" className="mt-2">
            <EnterpriseDataTable
              tableId="metals"
              data={metalsTableQuery.data?.data ?? []}
              columns={metalColumns}
              query={metalTable.query}
              onQueryChange={metalTable.setQuery}
              totalRows={metalsTableQuery.data?.pagination?.total ?? 0}
              getRowId={(row) => row.id}
              isLoading={metalsTableQuery.isLoading}
              error={metalsTableQuery.error}
              searchPlaceholder="Search metal name or ERP code..."
              exportResource="metals"
              exportParams={metalTable.params}
              filters={
                <>
                  <select
                    value={metalTable.query.filters.category ?? ""}
                    onChange={(event) => metalTable.setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, category: event.target.value || undefined } }))}
                    className="h-9 rounded-sm border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600"
                  >
                    <option value="">All Categories</option>
                    <option value="Ferrous">Ferrous</option>
                    <option value="Alloy">Alloy Base</option>
                    <option value="Non-Ferrous">Non-Ferrous</option>
                  </select>
                  <select
                    value={metalTable.query.filters.status ?? ""}
                    onChange={(event) => metalTable.setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, status: event.target.value || undefined } }))}
                    className="h-9 rounded-sm border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600"
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </>
              }
            />
          </TabsContent>

          <TabsContent value="alloys" className="mt-2">
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <thead>
                    <tr className="bg-[#f8fafc] border-b">
                      <TableHead>Composition Structure Name</TableHead>
                      <TableHead>ERP Code</TableHead>
                      <TableHead>Steel Workflow Type</TableHead>
                      <TableHead>Chemical & Raw Mineral Components Breakdown</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Status</TableHead>
                    </tr>
                  </thead>
                  <tbody>
                    {alloys.map((alloy) => (
                      <tr key={alloy.id} className="border-b hover:bg-slate-50/50">
                        <TableCell className="font-bold text-slate-800">{alloy.name}</TableCell>
                        <TableCell className="font-mono text-xs">{alloy.code}</TableCell>
                        <TableCell>{alloy.type}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5 py-1">
                             {alloy.components?.map((c: any, index: number) => (
                              <Badge key={index} className="bg-blue-50/40 text-blue-900 border-blue-200 text-[10px]">
                                {c.grade?.name || c.metal?.name || c.rawMaterial?.name}: {Number(c.compositionPercent)}%
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{alloy.createdBy?.name || "JSW Desk"}</TableCell>
                        <TableCell className="text-xs text-slate-500">{shortDate(alloy.updatedAt)}</TableCell>
                        <TableCell>
                          <Badge className="border-success-border bg-success-bg text-success-fg">Active</Badge>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* MODALS / DRAWERS */}
      {/* 1. Metal Master Drawer */}
      {activeModal === "metal" && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25">
          <div className="absolute inset-0" onClick={() => setActiveModal(null)} />
          <div className="relative w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-sm animate-in slide-in-from-right duration-150">
            <header className="flex items-center justify-between border-b border-slate-200 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#111827] flex items-center gap-2">
                <Database className="size-4" /> Add Metal Master
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </header>
            <form onSubmit={handleAddMetal} className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Metal Name
                <Input required value={metalName} onChange={e => setMetalName(e.target.value)} placeholder="e.g. Copper Feed" />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">ERP Unique Code
                <Input required value={metalCode} onChange={e => setMetalCode(e.target.value.toUpperCase())} placeholder="e.g. MTL-CU" />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Category
                <select className="h-10 rounded border bg-white px-2.5 text-xs text-slate-700 font-medium" value={metalCategory} onChange={e => setMetalCategory(e.target.value)}>
                  <option value="Ferrous">Ferrous</option>
                  <option value="Non-Ferrous">Non-Ferrous</option>
                  <option value="Alloy">Alloy Base</option>
                  <option value="Noble">Noble Metal</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 border-t pt-4 mt-auto">
                <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button type="submit" className="bg-primary">Save Record</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Grade Drawer */}
      {activeModal === "grade" && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25">
          <div className="absolute inset-0" onClick={() => setActiveModal(null)} />
          <div className="relative w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-sm animate-in slide-in-from-right duration-150">
            <header className="flex items-center justify-between border-b border-slate-200 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#111827] flex items-center gap-2">
                <Layers className="size-4" /> Add Steel Grade & Subgrade
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </header>
            <form onSubmit={handleAddGrade} className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Metal Master Base
                <select className="h-10 rounded border bg-white px-2.5 text-xs text-slate-700 font-medium" value={gradeMetalId} onChange={e => setGradeMetalId(e.target.value)}>
                  {metals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold text-slate-600">Grade Name
                  <Input required value={gradeName} onChange={e => setGradeName(e.target.value)} placeholder="e.g. SS309" />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-slate-600">Subgrade (Optional)
                  <Input value={gradeSub} onChange={e => setGradeSub(e.target.value)} placeholder="e.g. L" />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold text-slate-600">Price Multiplier
                  <Input required type="number" step="0.001" value={gradeMultiplier} onChange={e => setGradeMultiplier(e.target.value)} />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-slate-600">Extra Process Cost (INR/kg)
                  <Input required type="number" step="0.01" value={gradeExtraPrice} onChange={e => setGradeExtraPrice(e.target.value)} />
                </label>
              </div>
              <div className="border-t pt-3 mt-1">
                <h4 className="text-xs font-semibold text-slate-800 mb-2">Chemical Composition Profile (%)</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="grid gap-1 text-[10px] font-medium text-slate-500">Chromium (Cr)
                    <Input value={chemCr} onChange={e => setChemCr(e.target.value)} placeholder="e.g. 19.5%" className="h-8.5" />
                  </label>
                  <label className="grid gap-1 text-[10px] font-medium text-slate-500">Nickel (Ni)
                    <Input value={chemNi} onChange={e => setChemNi(e.target.value)} placeholder="e.g. 9.0%" className="h-8.5" />
                  </label>
                  <label className="grid gap-1 text-[10px] font-medium text-slate-500">Carbon (C)
                    <Input value={chemC} onChange={e => setChemC(e.target.value)} placeholder="e.g. 0.05%" className="h-8.5" />
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-4 mt-auto">
                <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button type="submit" className="bg-primary">Add Grade</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Raw Material Feed Drawer */}
      {activeModal === "raw" && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25">
          <div className="absolute inset-0" onClick={() => setActiveModal(null)} />
          <div className="relative w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-sm animate-in slide-in-from-right duration-150">
            <header className="flex items-center justify-between border-b border-slate-200 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#111827] flex items-center gap-2">
                <Database className="size-4" /> Add Raw Mineral Feed
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </header>
            <form onSubmit={handleAddRaw} className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Raw Material Name
                <Input required value={rawName} onChange={e => setRawName(e.target.value)} placeholder="e.g. Manganese Ore" />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">ERP Unique Code
                <Input required value={rawCode} onChange={e => setRawCode(e.target.value.toUpperCase())} placeholder="e.g. RM-MN" />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Base Unit
                <Input required value={rawUnit} onChange={e => setRawUnit(e.target.value)} />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Category
                <select className="h-10 rounded border bg-white px-2.5 text-xs text-slate-700 font-medium" value={rawCategory} onChange={e => setRawCategory(e.target.value)}>
                  <option value="Ferro Alloy">Ferro Alloy</option>
                  <option value="Aluminium">Aluminium</option>
                  <option value="Calcium Alloy">Calcium Alloy</option>
                  <option value="Carbon Additive">Carbon Additive</option>
                  <option value="Flux">Flux</option>
                  <option value="Non-Ferrous">Non-Ferrous</option>
                  <option value="Additive">Additive</option>
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold text-slate-600">Initial Rate (INR)
                  <Input type="number" step="0.0001" value={rawCurrentRate} onChange={e => setRawCurrentRate(e.target.value)} placeholder="e.g. 150.50" />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-slate-600">Approved Supplier
                  <Input value={rawSupplier} onChange={e => setRawSupplier(e.target.value)} placeholder="e.g. JSW Mines" />
                </label>
              </div>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Description
                <textarea 
                  className="flex min-h-[60px] w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                  value={rawDescription} 
                  onChange={e => setRawDescription(e.target.value)} 
                  placeholder="e.g. High purity manganese ore"
                />
              </label>
              <div className="flex gap-4 items-center p-2 border border-slate-200 bg-slate-50 rounded">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={isMicroFlag} 
                    onChange={e => setIsMicroFlag(e.target.checked)} 
                    className="size-4 rounded border-slate-300 text-[#0b5cbf] focus:ring-[#0b5cbf]"
                  />
                  Micro Alloy Flag
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={isAvailFlag} 
                    onChange={e => setIsAvailFlag(e.target.checked)} 
                    className="size-4 rounded border-slate-300 text-[#0b5cbf] focus:ring-[#0b5cbf]"
                  />
                  Available Status
                </label>
              </div>
              <div className="flex justify-end gap-2 border-t pt-4 mt-auto">
                <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button type="submit" className="bg-primary">Save Material</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Raw Material Feed Drawer */}
      {activeModal === "edit_raw" && selectedRaw && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25">
          <div className="absolute inset-0" onClick={() => setActiveModal(null)} />
          <div className="relative w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-sm animate-in slide-in-from-right duration-150">
            <header className="flex items-center justify-between border-b border-slate-200 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#111827] flex items-center gap-2">
                <Database className="size-4" /> Edit Raw Mineral Feed
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </header>
            <form onSubmit={handleEditRaw} className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Raw Material Name
                <Input required value={rawName} onChange={e => setRawName(e.target.value)} placeholder="e.g. Manganese Ore" />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">ERP Unique Code
                <Input required value={rawCode} onChange={e => setRawCode(e.target.value.toUpperCase())} placeholder="e.g. RM-MN" />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Base Unit
                <Input required value={rawUnit} onChange={e => setRawUnit(e.target.value)} />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Category
                <select className="h-10 rounded border bg-white px-2.5 text-xs text-slate-700 font-medium" value={rawCategory} onChange={e => setRawCategory(e.target.value)}>
                  <option value="Ferro Alloy">Ferro Alloy</option>
                  <option value="Aluminium">Aluminium</option>
                  <option value="Calcium Alloy">Calcium Alloy</option>
                  <option value="Carbon Additive">Carbon Additive</option>
                  <option value="Flux">Flux</option>
                  <option value="Non-Ferrous">Non-Ferrous</option>
                  <option value="Additive">Additive</option>
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold text-slate-600">Current Rate (INR)
                  <Input disabled value={selectedRaw.currentRate ? inr(selectedRaw.currentRate) : "N/A"} className="bg-slate-50 cursor-not-allowed font-mono font-semibold" />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-slate-600">Approved Supplier
                  <Input value={rawSupplier} onChange={e => setRawSupplier(e.target.value)} placeholder="e.g. JSW Mines" />
                </label>
              </div>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Description
                <textarea 
                  className="flex min-h-[60px] w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                  value={rawDescription} 
                  onChange={e => setRawDescription(e.target.value)} 
                  placeholder="e.g. High purity manganese ore"
                />
              </label>
              <div className="flex gap-4 items-center p-2 border border-slate-200 bg-slate-50 rounded">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={isMicroFlag} 
                    onChange={e => setIsMicroFlag(e.target.checked)} 
                    className="size-4 rounded border-slate-300 text-[#0b5cbf] focus:ring-[#0b5cbf]"
                  />
                  Micro Alloy Flag
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={isAvailFlag} 
                    onChange={e => setIsAvailFlag(e.target.checked)} 
                    className="size-4 rounded border-slate-300 text-[#0b5cbf] focus:ring-[#0b5cbf]"
                  />
                  Available Status
                </label>
              </div>
              <div className="flex justify-end gap-2 border-t pt-4 mt-auto">
                <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button type="submit" className="bg-primary">Update Material</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Raw Material Details Modal */}
      {activeModal === "view_raw" && selectedRaw && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25">
          <div className="absolute inset-0" onClick={() => setActiveModal(null)} />
          <div className="relative w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-sm animate-in slide-in-from-right duration-150">
            <header className="flex items-center justify-between border-b border-slate-200 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#111827] flex items-center gap-2">
                <Database className="size-4" /> View Raw Mineral details
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </header>
            <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Material Code</p>
                  <p className="text-xs font-mono font-bold text-slate-800">{selectedRaw.materialCode || selectedRaw.rawMatId}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Alloy Name</p>
                  <p className="text-xs font-bold text-slate-800">{selectedRaw.materialName || selectedRaw.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Category</p>
                  <p className="text-xs font-semibold text-slate-700">{selectedRaw.category || "Ferro Alloy"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Base Unit</p>
                  <p className="text-xs font-semibold text-slate-700">{selectedRaw.unit || "kg"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Micro Alloy Flag</p>
                  <Badge className={selectedRaw.isMicro ? "border-blue-200 bg-blue-50 text-blue-700 mt-1" : "border-slate-200 bg-slate-100 text-slate-500 mt-1"}>
                    {selectedRaw.isMicro ? "YES" : "NO"}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Availability Status</p>
                  <Badge className={selectedRaw.availability ? "border-success-border bg-success-bg text-success-fg mt-1" : "border-slate-200 bg-slate-100 text-slate-500 mt-1"}>
                    {selectedRaw.availability ? "YES" : "NO"}
                  </Badge>
                </div>
              </div>
              
              <div className="border-b pb-4 mt-4">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                  Financial Valuation
                </h4>
                <CurrentRateCard 
                  rate={selectedRaw.currentRate}
                  unit={selectedRaw.unit}
                  isActive={selectedRaw.availability}
                  effectiveDate={selectedRaw.effectiveDate}
                  updatedAt={selectedRaw.updatedAt}
                  updatedBy={selectedRaw.updatedBy?.name}
                />
              </div>

              <div className="border-b pb-4 mt-4">
                <p className="text-[10px] uppercase font-bold text-slate-400">Description</p>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">{selectedRaw.description || selectedRaw.description || "No description provided."}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Audit Info</p>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs text-slate-600 mt-1 space-y-1">
                  <p>Last Updated: <span className="font-semibold text-slate-800">{selectedRaw.updatedAt ? shortDate(selectedRaw.updatedAt) : "N/A"}</span></p>
                  <p>Updated By: <span className="font-semibold text-slate-800">{selectedRaw.updatedBy?.name || "System"}</span></p>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-4 mt-auto">
                <Button type="button" onClick={() => setActiveModal(null)} className="bg-primary text-xs">Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price History Drawer */}
      {activeModal === "history_raw" && selectedRaw && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25">
          <div className="absolute inset-0" onClick={() => setActiveModal(null)} />
          <div className="relative w-full max-w-lg bg-white border-l border-slate-200 h-full flex flex-col shadow-sm animate-in slide-in-from-right duration-150">
            <header className="flex items-center justify-between border-b border-slate-200 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#111827] flex items-center gap-2">
                <TrendingUp className="size-4" /> Price History: {selectedRaw.materialName || selectedRaw.name}
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </header>
            <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto bg-slate-50/50">
              {isLoadingHistory ? (
                <div className="flex-1 flex flex-col gap-6 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="size-4 rounded-full bg-slate-200 shrink-0 mt-1"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                        <div className="h-20 bg-slate-100 rounded-sm w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <PriceActivityTimeline 
                  history={rawPriceHistory} 
                  materialName={selectedRaw?.alloyName || selectedRaw?.name}
                  materialCode={selectedRaw?.code}
                />
              )}
              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 mt-auto">
                <Button type="button" onClick={() => setActiveModal(null)} className="bg-primary text-xs">Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Price Master Publish Drawer */}
      {activeModal === "price" && (() => {
        const currentRateVal = currentRateInfo ? Number(currentRateInfo.currentRate) : 0;
        const newRateVal = parseFloat(priceValue) || 0;
        const difference = newRateVal - currentRateVal;
        const percentage = currentRateVal > 0 ? (difference / currentRateVal) * 100 : 0;
        const isReadOnly = actor?.role === "PDQC";
        const materialsList = activeMaterials.length > 0 ? activeMaterials : rawMaterials;

        return (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/25">
            <div className="absolute inset-0" onClick={() => { if (!showConfirmPublish) setActiveModal(null); }} />
            <div className="relative w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-sm animate-in slide-in-from-right duration-150">
              <header className="flex items-center justify-between border-b border-slate-200 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#111827] flex items-center gap-2">
                  <IndianRupee className="size-4" /> Price Adjuster Panel
                </h3>
                <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
              </header>
              <form onSubmit={handlePublishPrice} className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
                <label className="grid gap-1 text-xs font-semibold text-slate-600">Material *
                  <select 
                    className="h-10 rounded border bg-white px-2.5 text-xs text-slate-700 font-medium disabled:bg-slate-50 disabled:cursor-not-allowed" 
                    value={priceTargetId} 
                    onChange={e => setPriceTargetId(e.target.value)}
                    disabled={!!selectedRaw}
                    required
                  >
                    <option value="" disabled>Select Material...</option>
                    {materialsList.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.code} - {m.name || m.materialName}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Read Only Current Price Information */}
                <div className="rounded border border-slate-200 bg-slate-50 p-3 flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Price Information</h4>
                  {isLoadingCurrentRate ? (
                    <div className="space-y-2 py-1.5 animate-pulse w-full">
                      <div className="h-3 w-1/4 bg-slate-200 rounded animate-pulse" />
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex flex-col gap-1">
                          <div className="h-2 w-16 bg-slate-150 rounded" />
                          <div className="h-4 w-24 bg-slate-200 rounded" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="h-2 w-16 bg-slate-150 rounded" />
                          <div className="h-4 w-24 bg-slate-200 rounded" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Current Active Rate</span>
                        <strong className="text-slate-900 font-mono text-sm">{currentRateInfo ? inr(currentRateInfo.currentRate) : "N/A"}/KG</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Current Supplier</span>
                        <span className="text-slate-900 font-semibold truncate block" title={currentRateInfo?.supplier || "N/A"}>
                          {currentRateInfo?.supplier || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Last Updated Date</span>
                        <span className="text-slate-800 block">
                          {currentRateInfo?.lastUpdatedDate ? shortDate(currentRateInfo.lastUpdatedDate) : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Last Updated By</span>
                        <span className="text-slate-800 block truncate" title={currentRateInfo?.lastUpdatedBy || "System"}>
                          {currentRateInfo?.lastUpdatedBy || "System"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Trend Mini Chart */}
                {priceTargetId && (
                  <PriceTrendSparkline history={priceTargetHistory} />
                )}

                {/* New Price Information Fields */}
                <div className="border-t border-slate-100 pt-3 flex flex-col gap-3">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Price Information</h4>
                  
                  {isReadOnly ? (
                    <div className="p-3 border border-amber-200 bg-amber-50 rounded text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      <span>You are logged in with read-only access (PDQC). You can select materials and view active rates/history trends, but price publication is restricted.</span>
                    </div>
                  ) : (
                    <>
                      <label className="grid gap-1 text-xs font-semibold text-slate-600">New Rate (₹/KG) *
                        <Input 
                          required 
                          type="number" 
                          step="0.01" 
                          min="0.01"
                          value={priceValue} 
                          onChange={e => setPriceValue(e.target.value)} 
                          placeholder="e.g. 150.00" 
                          className="rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0 text-xs font-mono"
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-semibold text-slate-600">Effective Date *
                        <Input 
                          required 
                          type="date" 
                          value={effectiveDate} 
                          onChange={e => setEffectiveDate(e.target.value)}
                          className="rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0 text-xs"
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-semibold text-slate-600">Supplier *
                        <Input 
                          required 
                          value={priceSource} 
                          onChange={e => setPriceSource(e.target.value)}
                          placeholder="e.g. JSW Procurement Desk"
                          className="rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0 text-xs"
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-semibold text-slate-600">Reason *
                        <Input 
                          required 
                          value={priceReason} 
                          onChange={e => setPriceReason(e.target.value)}
                          placeholder="e.g. Market Index Revision"
                          className="rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0 text-xs"
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-semibold text-slate-600">Remarks
                        <Input 
                          value={priceRemarks} 
                          onChange={e => setPriceRemarks(e.target.value)}
                          placeholder="Optional comments"
                          className="rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0 text-xs"
                        />
                      </label>

                      {/* Price Change Preview Card */}
                      {parseFloat(priceValue) > 0 && (
                        <div className={`p-3 rounded border text-xs flex flex-col gap-1.5 ${
                          currentRateVal === 0
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : difference > 0 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                            : difference < 0 
                            ? "bg-rose-50 text-rose-800 border-rose-200" 
                            : "bg-slate-50 text-slate-800 border-slate-200"
                        }`}>
                          <h5 className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Price Change Preview</h5>
                          <div className="grid grid-cols-2 gap-y-2 font-medium">
                            <div>Current Rate: <span className="font-mono">{currentRateVal > 0 ? inr(currentRateVal) : "N/A"}</span></div>
                            <div>New Rate: <span className="font-mono">{inr(newRateVal)}</span></div>
                            {currentRateVal > 0 ? (
                              <>
                                <div>Difference: <span className="font-mono font-bold">{difference > 0 ? "+" : ""}{inr(difference)}</span></div>
                                <div>Change %: <span className="font-mono font-bold">{percentage > 0 ? "+" : ""}{Number(percentage ?? 0).toFixed(2)}%</span></div>
                              </>
                            ) : (
                              <div className="col-span-2 text-blue-600 font-semibold">Initial Rate Publication</div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-2 border-t pt-4 mt-auto">
                  <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                  {!isReadOnly && (
                    <Button type="submit" className="bg-[#0b5cbf] hover:bg-[#094c9e]">Publish Price Update</Button>
                  )}
                </div>
              </form>

              {/* Confirmation Dialog Overlay */}
              {showConfirmPublish && (
                <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
                  <div className="w-full max-w-sm bg-white border border-slate-200 rounded-sm shadow-sm p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-100">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <AlertCircle className="size-4.5 text-amber-500" />
                        Confirm Price Publication
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Are you sure you want to publish this price update? This will deactivate the current active rate and propagate the new rate across all systems immediately.
                      </p>
                    </div>

                    <div className="border border-slate-100 rounded bg-slate-50 p-3 flex flex-col gap-2 text-xs">
                      <div className="flex justify-between border-b pb-1.5 border-slate-100">
                        <span className="text-slate-500">Material</span>
                        <strong className="text-slate-800">
                          {materialsList.find((m: any) => m.id === priceTargetId)?.code || selectedRaw?.code || "Material"}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current Rate</span>
                        <span className="font-mono font-semibold text-slate-700">{currentRateVal > 0 ? `${inr(currentRateVal)}/KG` : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">New Rate</span>
                        <span className="font-mono font-bold text-slate-900">{inr(newRateVal)}/KG</span>
                      </div>
                      {currentRateVal > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Difference</span>
                          <span className={`font-mono font-bold ${difference > 0 ? "text-emerald-600" : difference < 0 ? "text-rose-600" : "text-slate-600"}`}>
                            {difference > 0 ? "+" : ""}{inr(difference)} ({difference > 0 ? "+" : ""}{Number(percentage ?? 0).toFixed(2)}%)
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Effective Date</span>
                        <span className="font-semibold text-slate-800">{shortDate(effectiveDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Supplier</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[150px]" title={priceSource}>{priceSource}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 mt-1">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowConfirmPublish(false)}
                        disabled={publishNewPrice.isPending}
                        className="text-xs h-8"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleConfirmPublish}
                        disabled={publishNewPrice.isPending}
                        className={`bg-[#0b5cbf] hover:bg-[#094c9e] text-xs h-8 min-w-[100px] flex items-center justify-center gap-1 transition-all ${publishNewPrice.isPending ? "btn-loading-stripes" : ""}`}
                      >
                        {publishNewPrice.isPending ? "Publishing..." : "Confirm & Publish"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 5. JSW Steel Alloy Composition Drawer */}
      {activeModal === "alloy" && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25">
          <div className="absolute inset-0" onClick={() => setActiveModal(null)} />
          <div className="relative w-full max-w-lg bg-white border-l border-slate-200 h-full flex flex-col shadow-sm animate-in slide-in-from-right duration-150">
            <header className="flex items-center justify-between border-b border-slate-200 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#111827] flex items-center gap-2">
                <Layers className="size-4" /> JSW Steel Composition Structure
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </header>
            <form onSubmit={handleAddAlloy} className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold text-slate-600">Composition Name
                  <Input required value={alloyName} onChange={e => setAlloyName(e.target.value)} placeholder="e.g. SS304 Batch Alloy" />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-slate-600">ERP Unique Code
                  <Input required value={alloyCode} onChange={e => setAlloyCode(e.target.value.toUpperCase())} placeholder="e.g. ALY-SS304-JSW" />
                </label>
              </div>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Steel Type
                <Input value={alloyType} onChange={e => setAlloyType(e.target.value)} placeholder="e.g. Stainless Steel" />
              </label>

              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center mb-2.5">
                  <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Sliders className="size-4 text-slate-500" /> Component Breakdown
                  </h4>
                  <Button type="button" variant="outline" size="sm" onClick={addAlloyCompRow} className="h-7 text-[10px] font-semibold">
                    <Plus className="mr-1 size-3" /> Add Component
                  </Button>
                </div>

                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto border border-slate-200 rounded p-2 bg-slate-50/50">
                  {alloyComponents.map((row, index) => (
                    <div key={index} className="flex gap-2 items-center bg-white p-2 border border-slate-200 rounded">
                      <select 
                        className="h-8 rounded border text-xs px-1 bg-slate-50 w-24" 
                        value={row.type} 
                        onChange={e => updateAlloyCompRow(index, { type: e.target.value as "metal" | "raw", id: "" })}
                      >
                        <option value="metal">Metal/Grade</option>
                        <option value="raw">Raw Mineral</option>
                      </select>

                      <select 
                        className="h-8 rounded border text-xs px-2 flex-1 w-0 min-w-0"
                        required
                        value={row.id}
                        onChange={e => updateAlloyCompRow(index, { id: e.target.value })}
                      >
                        <option value="" disabled>Select Feed...</option>
                        {row.type === "metal" 
                          ? grades.map(g => <option key={g.id} value={g.id}>{g.name} ({g.subGrade || "Standard"})</option>)
                          : rawMaterials.map((r: any) => <option key={r.id} value={r.id}>{r.name} ({r.materialCode})</option>)
                        }
                      </select>

                      <div className="flex items-center gap-1 w-16 shrink-0">
                        <Input 
                          type="number" 
                          required 
                          className="h-8 text-xs px-1.5" 
                          placeholder="%" 
                          value={row.pct || ""} 
                          onChange={e => updateAlloyCompRow(index, { pct: parseFloat(e.target.value) || 0 })} 
                        />
                        <span className="text-[10px] text-slate-500 font-semibold">%</span>
                      </div>

                      {alloyComponents.length > 1 && (
                        <button type="button" onClick={() => removeAlloyCompRow(index)} className="text-slate-400 hover:text-red-500 p-1 shrink-0">
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* COMPOSITION SUM VALIDATOR */}
                <div className="mt-3 flex items-center justify-between p-2.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-700">
                  <span>Total Composition Sum:</span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                    alloyCompSum === 100 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {alloyCompSum === 100 ? <Check className="size-3.5" /> : <AlertCircle className="size-3.5" />}
                    {alloyCompSum}% {alloyCompSum === 100 ? "(Valid)" : "(Invalid)"}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-auto">
                <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button type="submit" className="bg-primary" disabled={alloyCompSum !== 100}>
                  Save Structure
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CloneGradeModal 
        isOpen={isCloneModalOpen} 
        onClose={() => setIsCloneModalOpen(false)} 
        sourceGrade={grades.find((g: any) => selectedGradeIds.has(g.id)) ?? null}
        existingGrades={grades}
        onSuccess={() => {
          setIsCloneModalOpen(false);
          setSelectedGradeIds(new Set());
          queryClient.invalidateQueries({ queryKey: ["enterprise-table"] });
        }}
      />
      
      <BulkUpdateModal 
        isOpen={isBulkUpdateModalOpen} 
        onClose={() => setIsBulkUpdateModalOpen(false)} 
        selectedGrades={grades.filter((g: any) => selectedGradeIds.has(g.id))}
        metals={metals}
        onSuccess={() => {
          setIsBulkUpdateModalOpen(false);
          setSelectedGradeIds(new Set());
          queryClient.invalidateQueries({ queryKey: ["enterprise-table"] });
        }}
      />
      
      <CompareGradesModal 
        isOpen={isCompareModalOpen} 
        onClose={() => setIsCompareModalOpen(false)} 
        selectedGrades={grades.filter((g: any) => selectedGradeIds.has(g.id))}
      />

      <GradeImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setIsImportModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["grades"] });
        }}
      />

      {/* Grade Details Drawer */}
      <GradeDetailsDrawer 
        open={isGradeDrawerOpen} 
        onOpenChange={setIsGradeDrawerOpen} 
        grade={drawerGrade} 
        metals={metals} 
      />
    </div>
  );
}

function UsersPanel() {
  const { actor } = useAuth();
  const isCostingDept = actor?.role === "COSTING_DEPARTMENT";
  const usersTable = useTableQuery({ sortBy: "createdAt", sortDir: "desc" });
  const usersQuery = useQuery({
    queryKey: ["enterprise-table", "users", usersTable.queryKey],
    queryFn: async () => {
      const { data } = await api.get<any>("/users", { params: usersTable.params });
      return data;
    },
    placeholderData: (previous) => previous
  });

  const [activeUserModal, setActiveUserModal] = useState<"create" | "edit" | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // User form states
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userDept, setUserDept] = useState("");
  const [userRoleId, setUserRoleId] = useState("");
  const [userStatus, setUserStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  // Populate form states when drawer opens
  useEffect(() => {
    if (activeUserModal === "edit" && selectedUser) {
      setUserName(selectedUser.name || "");
      setUserEmail(selectedUser.email || "");
      setUserPassword(""); // Clear password field
      setUserDept(selectedUser.department || "");
      setUserRoleId(selectedUser.roleId || selectedUser.role?.id || "");
      setUserStatus(selectedUser.status || "ACTIVE");
    } else if (activeUserModal === "create") {
      setUserName("");
      setUserEmail("");
      setUserPassword("");
      setUserDept("");
      setUserStatus("ACTIVE");
      const defaultRole = usersQuery.data?.roles?.[0]?.id || "";
      setUserRoleId(defaultRole);
    }
  }, [activeUserModal, selectedUser, usersQuery.data?.roles]);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || (activeUserModal === "create" && !userPassword) || !userRoleId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      if (activeUserModal === "create") {
        await api.post("/users", {
          name: userName,
          email: userEmail,
          password: userPassword,
          department: userDept || undefined,
          roleId: userRoleId,
          status: userStatus
        });
        toast.success(`User ${userName} created successfully.`);
      } else {
        const payload: any = {
          name: userName,
          email: userEmail,
          department: userDept || undefined,
          roleId: userRoleId,
          status: userStatus
        };
        if (userPassword) {
          payload.password = userPassword;
        }
        await api.put(`/users/${selectedUser.id}`, payload);
        toast.success(`User ${userName} updated successfully.`);
      }
      setActiveUserModal(null);
      usersQuery.refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${activeUserModal} user.`);
    }
  };

  const handleDeactivateUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate user ${name}?`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success(`User ${name} deactivated successfully.`);
      setActiveUserModal(null);
      usersQuery.refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to deactivate user.");
    }
  };

  const handleReactivateUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to reactivate user ${name}?`)) return;
    try {
      await api.put(`/users/${id}/reactivate`);
      toast.success(`User ${name} reactivated successfully.`);
      usersQuery.refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reactivate user.");
    }
  };

  const handleSuspendUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to suspend user ${name}?`)) return;
    try {
      await api.put(`/users/${id}/suspend`);
      toast.success(`User ${name} suspended successfully.`);
      usersQuery.refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to suspend user.");
    }
  };

  const userColumns: EnterpriseColumnDef<any>[] = [
    { accessorKey: "name", header: "User", meta: { label: "User" }, cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.name}</span> },
    { accessorKey: "email", header: "Email", meta: { label: "Email", className: "font-mono text-[11px]" } },
    { accessorKey: "department", header: "Department", meta: { label: "Department" }, cell: ({ row }) => row.original.department || "Operations" },
    { id: "role", header: "Role", enableSorting: false, meta: { label: "Role" }, cell: ({ row }) => row.original.role?.name || row.original.role || "PDQC" },
    {
      accessorKey: "status",
      header: "Status",
      meta: { label: "Status" },
      cell: ({ row }) => (
        <Badge className={
          row.original.status === "ACTIVE" ? "border-success-border bg-success-bg text-success-fg" : 
          row.original.status === "SUSPENDED" ? "border-amber-200 bg-amber-50 text-amber-700" :
          "border-slate-200 bg-slate-100 text-slate-500"
        }>
          {row.original.status}
        </Badge>
      )
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      meta: { label: "Actions" },
      cell: ({ row }) => {
        const isSelf = actor?.id === row.original.id;
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setSelectedUser(row.original); setActiveUserModal("edit"); }} title="Edit User">
              <Edit2 className="size-4 text-blue-600" />
            </Button>
            {actor?.role === "COSTING_DEPARTMENT" && !isSelf && (
              <>
                {row.original.status === "ACTIVE" && (
                  <>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleSuspendUser(row.original.id, row.original.name); }} title="Suspend">
                      <AlertCircle className="size-4 text-amber-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleDeactivateUser(row.original.id, row.original.name); }} title="Deactivate">
                      <Trash2 className="size-4 text-rose-600" />
                    </Button>
                  </>
                )}
                {["INACTIVE", "SUSPENDED"].includes(row.original.status) && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleReactivateUser(row.original.id, row.original.name); }} title="Reactivate">
                    <Check className="size-4 text-emerald-600" />
                  </Button>
                )}
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]">
      <EnterpriseDataTable
        tableId="users"
        data={usersQuery.data?.data ?? []}
        columns={userColumns}
        query={usersTable.query}
        onQueryChange={usersTable.setQuery}
        totalRows={usersQuery.data?.pagination?.total ?? 0}
        getRowId={(row) => row.id}
        isLoading={usersQuery.isLoading}
        error={usersQuery.error}
        searchPlaceholder="Search users, email, or department..."
        exportResource="users"
        exportParams={usersTable.params}
        onRowClick={(user) => {
          if (isCostingDept) {
            setSelectedUser(user);
            setActiveUserModal("edit");
          }
        }}
        filters={
          <div className="flex gap-2 w-full justify-between items-center">
            <select
              value={usersTable.query.filters.status ?? ""}
              onChange={(event) => usersTable.setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, status: event.target.value || undefined } }))}
              className="h-9 rounded-sm border border-[#E5E7EB] bg-white px-2.5 text-xs font-semibold text-slate-600 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            {isCostingDept && (
              <Button size="sm" onClick={() => setActiveUserModal("create")} className="bg-primary hover:bg-[#001b3a] text-xs h-9">
                <Plus className="mr-1 size-4" /> Add User
              </Button>
            )}
          </div>
        }
      />
      <Card className="rounded-sm border border-[#E5E7EB] bg-white shadow-none">
        <CardHeader className="p-4 border-b border-[#E5E7EB]"><CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800">Role Access Levels</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 p-4">
          {[
            { role: "COSTING_DEPARTMENT", desc: "Full read-write access to dashboard, master data, price adjusting, grade builder, comparison, reports, user management, audit logs, settings, and costing workspace." },
            { role: "PDQC", desc: "Limited access to dashboard, costing workspace, and read-only view of steel grade parameters." }
          ].map((item) => (
            <div key={item.role} className="rounded-sm border border-[#E5E7EB] p-3 text-xs bg-slate-50/50">
              <strong className="text-primary font-semibold">{item.role}</strong>
              <p className="text-slate-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* User Edit/Create Drawer */}
      {activeUserModal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25">
          <div className="absolute inset-0" onClick={() => setActiveUserModal(null)} />
          <div className="relative w-full max-w-md bg-white border-l border-[#E5E7EB] h-full flex flex-col shadow-sm animate-in slide-in-from-right duration-150">
            <header className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827] flex items-center gap-2">
                <Users className="size-4" /> {activeUserModal === "create" ? "Add User Account" : "Edit User Account"}
              </h3>
              <button type="button" onClick={() => setActiveUserModal(null)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </header>
            <form onSubmit={handleUserSubmit} className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Full Name
                <Input required value={userName} onChange={e => setUserName(e.target.value)} placeholder="e.g. Rahul Sharma" className="rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0 text-xs" />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Email Address
                <Input required type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="e.g. rahul.s@jsw.in" className="rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0 text-xs" />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">
                Password {activeUserModal === "edit" && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
                <Input required={activeUserModal === "create"} type="password" value={userPassword} onChange={e => setUserPassword(e.target.value)} placeholder={activeUserModal === "create" ? "At least 8 characters" : "Change user password"} className="rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0 text-xs" />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Department (Optional)
                <Input value={userDept} onChange={e => setUserDept(e.target.value)} placeholder="e.g. Finance, Procurement" className="rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0 text-xs" />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">System Role
                <select 
                  className="h-10 rounded-sm border border-[#E5E7EB] bg-white px-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-slate-400" 
                  value={userRoleId} 
                  onChange={e => setUserRoleId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select role...</option>
                  {usersQuery.data?.roles?.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">Status
                <select 
                  className="h-10 rounded-sm border border-[#E5E7EB] bg-white px-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-slate-400" 
                  value={userStatus} 
                  onChange={e => setUserStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
              <div className="flex justify-between items-center border-t border-[#E5E7EB] pt-4 mt-auto">
                {activeUserModal === "edit" ? (
                  <Button type="button" variant="outline" onClick={() => handleDeactivateUser(selectedUser.id, userName)} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs">
                    Deactivate User
                  </Button>
                ) : <div />}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setActiveUserModal(null)} className="text-xs">Cancel</Button>
                  <Button type="submit" className="bg-primary hover:bg-[#001b3a] text-xs">Save Account</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsPanel() {
  const { actor } = useAuth();
  const { erpTheme, setErpTheme } = useUIStore();
  const settings = useSettingsStore((state) => state.settings);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const updateBulkSettings = useSettingsStore((state) => state.updateBulkSettings);
  const updateProfile = useSettingsStore((state) => state.updateProfile);
  const isLoading = useSettingsStore((state) => state.isLoading);

  const isAdmin = actor?.role === "COSTING_DEPARTMENT";

  // Active sub-tab state
  const [activeTab, setActiveTab] = useState<"profile" | "theme" | "system">("profile");

  // Profile Form States
  const [profileName, setProfileName] = useState(actor?.name || "");
  const [profileDept, setProfileDept] = useState(actor?.department || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  // System settings maps matching category
  const [systemFields, setSystemFields] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Populate form states from preloaded DB settings
    const fields: Record<string, string> = {};
    settings.forEach((s) => {
      fields[s.key] = s.value;
    });
    setSystemFields(fields);
  }, [settings]);

  // Sync profile details if auth actor changes
  useEffect(() => {
    if (actor) {
      setProfileName(actor.name);
      setProfileDept(actor.department || "");
    }
  }, [actor]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName) {
      toast.error("Profile name is required.");
      return;
    }
    if (newPassword && newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const payload: any = { name: profileName, department: profileDept };
      if (newPassword) payload.password = newPassword;
      const updatedUser = await updateProfile(payload);
      useAuthStore.setState({
        actor: {
          ...actor!,
          name: updatedUser.name,
          department: updatedUser.department
        }
      });
      toast.success("Profile credentials updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleSystemSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    // Validate precision and component count limits locally
    const maxComp = parseInt(systemFields["max_alloy_components"] || "10");
    const prec = parseInt(systemFields["calculation_decimal_places"] || "4");
    const timeout = parseInt(systemFields["session_timeout_minutes"] || "60");
    const attempts = parseInt(systemFields["max_login_attempts"] || "5");

    if (isNaN(maxComp) || maxComp <= 0 || maxComp > 30) {
      toast.error("Max alloy components must be between 1 and 30.");
      return;
    }
    if (isNaN(prec) || prec < 0 || prec > 8) {
      toast.error("Precision decimal places must be between 0 and 8.");
      return;
    }
    if (isNaN(timeout) || timeout < 5 || timeout > 1440) {
      toast.error("Session timeout must be between 5 and 1440 minutes.");
      return;
    }
    if (isNaN(attempts) || attempts < 3 || attempts > 20) {
      toast.error("Max login attempts must be between 3 and 20.");
      return;
    }

    try {
      await updateBulkSettings(systemFields);
      toast.success("System configurations successfully committed to master database.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save system preferences.");
    }
  };


  const handleResetSystemSettings = () => {
    if (!window.confirm("Reset all settings to default values?")) return;
    const defaults: Record<string, string> = {
      price_validity_days: "30",
      currency: "INR",
      weight_unit: "kg",
      max_alloy_components: "10",
      calculation_decimal_places: "4",
      session_timeout_minutes: "60",
      max_login_attempts: "5"
    };
    setSystemFields(defaults);
    toast.info("Form reset to system defaults. Click Save to commit changes.");
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[0.25fr_1fr] text-left">
      {/* Side Tabs Selector */}
      <Card className="rounded-sm border border-[#E5E7EB] bg-white p-3 flex flex-col gap-1 h-fit shadow-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">Settings Module</span>
        {[
          { id: "profile" as const, label: "Profile Credentials" },
          { id: "theme" as const, label: "Currency & Themes" },
          { id: "system" as const, label: "System Preferences" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full py-2 px-3.5 text-left text-xs font-bold rounded-sm transition-all ${
              activeTab === tab.id
                ? "bg-[#F3F4F6] text-primary border-l-2 border-jsw-corp"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </Card>

      {/* Main Form Tab Panels */}
      <Card className="rounded-sm border border-[#E5E7EB] bg-white p-6 shadow-none min-h-[500px]">
        {/* Tab 1: Profile Credentials */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSave} className="flex flex-col gap-4 max-w-lg">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Profile Settings</h3>
              <p className="text-xs text-slate-500 mt-1">Update your personal account information and secure credentials.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 mt-2">
              <label className="grid gap-1 text-xs font-semibold text-slate-600">
                Full Name
                <Input required value={profileName} onChange={e => setProfileName(e.target.value)} className="h-9.5 text-xs rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0" />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">
                Department
                <Input value={profileDept} onChange={e => setProfileDept(e.target.value)} className="h-9.5 text-xs rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0" />
              </label>
            </div>
            <label className="grid gap-1 text-xs font-semibold text-slate-600">
              Email Address (Read-only)
              <Input disabled value={actor?.email || ""} className="h-9.5 text-xs bg-slate-50 text-slate-400 rounded-sm border-[#E5E7EB] shadow-none" />
            </label>
            <div className="border-t border-slate-100 pt-4 mt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Change Security Password</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold text-slate-600">
                  New Password
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" className="h-9.5 text-xs rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0" />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-slate-600">
                  Confirm Password
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm credentials" className="h-9.5 text-xs rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0" />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-4">
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-[#001b3a] h-9 text-xs rounded-sm">
                {isLoading ? "Saving changes..." : "Save Credentials"}
              </Button>
            </div>
          </form>
        )}


        {/* Tab 3: Currency & Theme Preferences */}
        {activeTab === "theme" && (
          <div className="flex flex-col gap-5 max-w-xl">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Currency & Theme Preferences</h3>
              <p className="text-xs text-slate-500 mt-1">Manage base operational currency and customize user interface density themes.</p>
            </div>

            {/* Currency settings card */}
            <Card className="border-[#E5E7EB] p-4 shadow-none rounded-sm bg-white">
              <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <IndianRupee className="size-4 text-primary" /> Operational Currency
              </CardTitle>
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold text-slate-500 flex flex-col gap-1.5">
                  Select Base Currency (Admin only)
                  <select
                    disabled={!isAdmin}
                    value={systemFields["currency"] || "INR"}
                    onChange={(e) => setSystemFields(curr => ({ ...curr, currency: e.target.value }))}
                    className="h-9.5 rounded-sm border border-[#E5E7EB] bg-white px-2.5 text-xs text-slate-700 font-bold max-w-xs disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none"
                  >
                    <option value="INR">INR (₹) - Indian Rupee (Default)</option>
                    <option value="USD">USD ($) - United States Dollar</option>
                    <option value="EUR">EUR (€) - European Euro</option>
                  </select>
                </label>
                {isAdmin && (
                  <Button onClick={handleSystemSettingsSave} className="bg-primary hover:bg-[#001b3a] h-8.5 max-w-xs text-xs mt-1 rounded-sm">
                    Save Currency Preset
                  </Button>
                )}
              </div>
            </Card>

            {/* Theme Settings card */}
            <Card className="border-[#E5E7EB] p-4 shadow-none rounded-sm bg-white">
              <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sliders className="size-4 text-[#D97706]" /> Interface Theme Density
              </CardTitle>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { id: "jsw-classic" as const, name: "JSW Classic Blue", desc: "Corporate branding styling colors layout." },
                  { id: "high-density-gray" as const, name: "High Density Gray", desc: "Ultra-compact spreadsheets style workspace." },
                  { id: "oracle-dark" as const, name: "Oracle Dark Mode", desc: "Deep charcoal colors layout reducing eye strain." }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setErpTheme(t.id);
                      toast.success(`Theme preference changed to ${t.name}`);
                    }}
                    className={`flex flex-col gap-1 p-3 text-left border rounded-sm transition-all cursor-pointer ${
                      erpTheme === t.id
                        ? "border-jsw-corp bg-slate-50 ring-0"
                        : "border-[#E5E7EB] hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-850">{t.name}</span>
                    <span className="text-[10px] text-slate-500 leading-normal mt-0.5">{t.desc}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Tab 4: System Preferences & Calculation Defaults */}
        {activeTab === "system" && (
          <form onSubmit={handleSystemSettingsSave} className="flex flex-col gap-4 max-w-xl">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">System Preferences & Defaults</h3>
              <p className="text-xs text-slate-500 mt-1">Configure platform security parameter limits and default calculation policies.</p>
            </div>

            {!isAdmin && (
              <div className="bg-amber-50 text-amber-700 border border-amber-200 rounded-sm p-3.5 text-xs font-semibold flex items-center gap-2 mt-1">
                <ShieldAlert className="size-4.5 shrink-0 text-amber-500" />
                <span>You are in view-only mode. System settings can only be altered by authorized system administrators.</span>
              </div>
            )}

            {/* Calculations Default parameters */}
            <div className="grid gap-3.5 sm:grid-cols-2 mt-2">
              <label className="grid gap-1 text-xs font-semibold text-slate-600">
                Decimal Place Precision
                <Input
                  type="number"
                  disabled={!isAdmin}
                  value={systemFields["calculation_decimal_places"] || "4"}
                  onChange={e => setSystemFields(curr => ({ ...curr, calculation_decimal_places: e.target.value }))}
                  className="h-9.5 text-xs disabled:bg-slate-50 rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">
                Max Components Per Alloy
                <Input
                  type="number"
                  disabled={!isAdmin}
                  value={systemFields["max_alloy_components"] || "10"}
                  onChange={e => setSystemFields(curr => ({ ...curr, max_alloy_components: e.target.value }))}
                  className="h-9.5 text-xs disabled:bg-slate-50 rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0"
                />
              </label>
            </div>

            {/* Platform security parameters */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-semibold text-slate-600">
                Session Idle Timeout (Minutes)
                <Input
                  type="number"
                  disabled={!isAdmin}
                  value={systemFields["session_timeout_minutes"] || "60"}
                  onChange={e => setSystemFields(curr => ({ ...curr, session_timeout_minutes: e.target.value }))}
                  className="h-9.5 text-xs disabled:bg-slate-50 rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">
                Max Login Failed Lockout Attempts
                <Input
                  type="number"
                  disabled={!isAdmin}
                  value={systemFields["max_login_attempts"] || "5"}
                  onChange={e => setSystemFields(curr => ({ ...curr, max_login_attempts: e.target.value }))}
                  className="h-9.5 text-xs disabled:bg-slate-50 rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0"
                />
              </label>
            </div>

            {/* Master pricing settings */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-semibold text-slate-600">
                Default Weight unit
                <Input
                  disabled
                  value={systemFields["weight_unit"] || "kg"}
                  className="h-9.5 text-xs bg-slate-50 text-slate-400 rounded-sm border-[#E5E7EB] shadow-none"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">
                Price validity duration (Days)
                <Input
                  type="number"
                  disabled={!isAdmin}
                  value={systemFields["price_validity_days"] || "30"}
                  onChange={e => setSystemFields(curr => ({ ...curr, price_validity_days: e.target.value }))}
                  className="h-9.5 text-xs disabled:bg-slate-50 rounded-sm border-[#E5E7EB] shadow-none focus-visible:ring-0"
                />
              </label>
            </div>

            {isAdmin && (
              <div className="flex justify-between items-center gap-2 border-t border-slate-100 pt-4 mt-4">
                <Button type="button" variant="outline" onClick={handleResetSystemSettings} className="h-9 text-xs border-[#E5E7EB] hover:bg-slate-50 text-slate-600 rounded-sm">
                  Reset Defaults
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-[#001b3a] h-9 text-xs rounded-sm">
                  {isLoading ? "Saving Settings..." : "Save System Configs"}
                </Button>
              </div>
            )}
          </form>
        )}
      </Card>

      
    </div>
  );
}

function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!text) return null;
  if (!highlight || !highlight.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5 font-semibold">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function CalculationsEnterpriseTable() {
  const tableQuery = useTableQuery({ sortBy: "updatedAt", sortDir: "desc" });
  const calculationsQuery = useQuery({
    queryKey: ["enterprise-table", "calculations", tableQuery.queryKey],
    queryFn: async () => {
      const { data } = await api.get<TableApiResponse<any>>("/calculations", { params: tableQuery.params });
      return data;
    },
    placeholderData: (previous) => previous
  });

  const searchMatch = tableQuery.query.search || "";

  const columns: EnterpriseColumnDef<any>[] = [
    { 
      accessorKey: "batchId", 
      header: "Batch ID", 
      meta: { label: "Batch", className: "font-mono text-[11px]" },
      cell: ({ row }) => <HighlightText text={row.original.batchId} highlight={searchMatch} />
    },
    { 
      accessorKey: "name", 
      header: "Calculation Run", 
      meta: { label: "Run" }, 
      cell: ({ row }) => (
        <span className="font-bold text-slate-800">
          <HighlightText text={row.original.name} highlight={searchMatch} />
        </span>
      ) 
    },
    { 
      id: "grade", 
      header: "Grade", 
      meta: { label: "Grade" }, 
      cell: ({ row }) => (
        <span className="text-slate-600">
          <HighlightText text={row.original.alloy?.name || "N/A"} highlight={searchMatch} />
        </span>
      ) 
    },
    { 
      id: "user", 
      header: "Created By", 
      meta: { label: "User" }, 
      cell: ({ row }) => (
        <span className="text-slate-600">
          <HighlightText text={row.original.user?.name || "System"} highlight={searchMatch} />
        </span>
      ) 
    },
    { accessorKey: "mode", header: "Mode", meta: { label: "Mode" }, cell: ({ row }) => String(row.original.mode).toUpperCase() },
    { accessorKey: "totalQuantity", header: "Volume", meta: { label: "Volume" }, cell: ({ row }) => `${Number(row.original.totalQuantity).toLocaleString("en-IN")} kg` },
    { accessorKey: "finalCost", header: "Final Cost", meta: { label: "Final Cost" }, cell: ({ row }) => <span className="font-black text-blue-600">{inr(row.original.finalCost)}</span> },
    {
      accessorKey: "status",
      header: "Status",
      meta: { label: "Status" },
      cell: ({ row }) => {
        const dbStatus = row.original.status;
        const mappedStatus = dbStatus === "COMPLETED" ? "Submitted" : (dbStatus === "DRAFT" ? "Draft" : "Warning");
        return <StatusBadge status={mappedStatus} tooltipText={`Report status: ${dbStatus}`} />;
      }
    },
    { accessorKey: "updatedAt", header: "Updated", meta: { label: "Updated", mobileHidden: true }, cell: ({ row }) => shortDate(row.original.updatedAt) }
  ];

  return (
    <EnterpriseDataTable
      tableId="calculations"
      data={calculationsQuery.data?.data ?? []}
      columns={columns}
      query={tableQuery.query}
      onQueryChange={tableQuery.setQuery}
      totalRows={calculationsQuery.data?.pagination?.total ?? 0}
      getRowId={(row) => row.id}
      isLoading={calculationsQuery.isLoading}
      error={calculationsQuery.error}
      searchPlaceholder="Search batch or calculation name..."
      exportResource="calculations"
      exportParams={tableQuery.params}
      filters={
        <>
          <select
            value={tableQuery.query.filters.status ?? ""}
            onChange={(event) => tableQuery.setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, status: event.target.value || undefined } }))}
            className="h-9 rounded-sm border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={tableQuery.query.filters.mode ?? ""}
            onChange={(event) => tableQuery.setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, mode: event.target.value || undefined } }))}
            className="h-9 rounded-sm border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600"
          >
            <option value="">All Modes</option>
            <option value="metal">Metal</option>
            <option value="alloy">Alloy</option>
            <option value="raw-material">Raw Material</option>
          </select>
        </>
      }
    />
  );
}

function ReportActionMenu({ report }: { report: any }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none flex items-center justify-center">
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" className="w-36 bg-white border border-slate-200 shadow-sm rounded-sm py-1 z-50 text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95 duration-100">
          <DropdownMenu.Item className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 hover:text-[#005BAC] cursor-pointer outline-none transition-colors" onSelect={() => toast.info(`Viewing ${report.name}`)}>
            <Eye className="size-3.5 text-slate-400 group-hover:text-[#005BAC]" /> View
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 hover:text-[#005BAC] cursor-pointer outline-none transition-colors" onSelect={() => toast.info(`Previewing ${report.name}`)}>
            <FileText className="size-3.5 text-slate-400 group-hover:text-[#005BAC]" /> Preview
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 hover:text-[#005BAC] cursor-pointer outline-none transition-colors" onSelect={() => toast.success(`Downloading ${report.name}`)}>
            <Download className="size-3.5 text-slate-400 group-hover:text-[#005BAC]" /> Download
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 hover:text-[#005BAC] cursor-pointer outline-none transition-colors" onSelect={() => toast.success(`Duplicating ${report.name}`)}>
            <Copy className="size-3.5 text-slate-400 group-hover:text-[#005BAC]" /> Duplicate
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 hover:text-[#005BAC] cursor-pointer outline-none transition-colors" onSelect={() => toast.success(`Share link copied`)}>
            <Share2 className="size-3.5 text-slate-400 group-hover:text-[#005BAC]" /> Share
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
          <DropdownMenu.Item className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 hover:text-red-600 text-red-600 cursor-pointer outline-none transition-colors" onSelect={() => toast.error(`Deleted ${report.name}`)}>
            <Trash2 className="size-3.5" /> Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function SavedReportsEnterpriseTable() {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const tableQuery = useTableQuery({ sortBy: "createdAt", sortDir: "desc" });
  const reportsQuery = useQuery({
    queryKey: ["enterprise-table", "reports", tableQuery.queryKey],
    queryFn: async () => {
      const { data } = await api.get<TableApiResponse<any>>("/reports", { params: tableQuery.params });
      return data;
    },
    placeholderData: (previous) => previous
  });
  const columns: EnterpriseColumnDef<any>[] = [
    { 
      accessorKey: "name", 
      header: "Report Name", 
      meta: { label: "Report", sticky: "left" }, 
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="size-3.5 text-[#005BAC]" />
          <span className="font-bold text-slate-800 hover:text-[#005BAC] cursor-pointer hover:underline">{row.original.name}</span>
        </div>
      ) 
    },
    { 
      accessorKey: "type", 
      header: "Type", 
      meta: { label: "Type" }, 
      cell: ({ row }) => (
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-widest whitespace-nowrap">
          {String(row.original.type).replace("-", " ")}
        </span>
      ) 
    },
    { 
      id: "generatedBy", 
      header: "Owner", 
      enableSorting: false, 
      meta: { label: "Owner" }, 
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <div className="size-5 rounded-full bg-[#EBF3FF] flex items-center justify-center text-[8px] font-bold text-[#005BAC]">
            {(row.original.generatedBy?.name ?? "SYS").substring(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{row.original.generatedBy?.name ?? "System"}</span>
        </div>
      ) 
    },
    { 
      accessorKey: "createdAt", 
      header: "Created", 
      meta: { label: "Created" }, 
      cell: ({ row }) => <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{shortDate(row.original.createdAt)}</span> 
    },
    { 
      id: "lastRun", 
      header: "Last Run", 
      enableSorting: false, 
      meta: { label: "Last Run" }, 
      cell: () => <span className="text-xs font-medium text-slate-500 whitespace-nowrap flex items-center gap-1"><History className="size-3" /> 2 hours ago</span> 
    },
    { 
      id: "lastExport", 
      header: "Last Export", 
      enableSorting: false, 
      meta: { label: "Last Export" }, 
      cell: () => <span className="text-xs font-medium text-slate-400 whitespace-nowrap">Never</span> 
    },
    { 
      id: "status", 
      header: "Status", 
      enableSorting: false, 
      meta: { label: "Status" }, 
      cell: ({ row }) => {
        const isAudit = row.original.type === "audit";
        return (
          <Badge className={`uppercase tracking-widest text-[9px] font-bold ${isAudit ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
            {isAudit ? "Scheduled" : "Completed"}
          </Badge>
        );
      }
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      meta: { label: "Actions", sticky: "right" },
      cell: ({ row }) => <ReportActionMenu report={row.original} />
    }
  ];

  return (
    <>
      <EnterpriseDataTable
        tableId="reports"
        data={reportsQuery.data?.data ?? []}
        columns={columns}
        query={tableQuery.query}
        onQueryChange={tableQuery.setQuery}
        totalRows={reportsQuery.data?.pagination?.total ?? 0}
        getRowId={(row) => row.id}
        isLoading={reportsQuery.isLoading}
        error={reportsQuery.error}
        searchPlaceholder="Search saved reports..."
        exportResource="reports"
        exportParams={tableQuery.params}
        onRowClick={(row) => setSelectedReport(row)}
        filters={
          <select
            value={tableQuery.query.filters.type ?? ""}
            onChange={(event) => tableQuery.setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, type: event.target.value || undefined } }))}
            className="h-9 rounded-sm border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600"
          >
            <option value="">All Report Types</option>
            <option value="cost-summary">Cost Summary</option>
            <option value="trend">Trend</option>
            <option value="comparison">Comparison</option>
            <option value="audit">Audit</option>
            <option value="custom">Custom</option>
          </select>
        }
      />
      <Sheet open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] border-l border-slate-200 shadow-sm p-0 flex flex-col">
          <SheetHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex-none space-y-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SheetTitle className="text-lg font-bold text-[#005BAC]">{selectedReport?.name}</SheetTitle>
                <SheetDescription className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-1">
                  {selectedReport?.type?.replace("-", " ")} Report
                </SheetDescription>
              </div>
              <Badge className={`uppercase tracking-widest text-[9px] font-bold ${selectedReport?.type === 'audit' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                {selectedReport?.type === 'audit' ? 'Scheduled' : 'Completed'}
              </Badge>
            </div>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
            {/* Summary */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Executive Summary</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                This report provides a comprehensive cost analysis of <strong className="text-slate-800">{selectedReport?.name}</strong>. It highlights key material usage trends and recent price variations across operations.
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Generated By</span>
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <div className="size-4 rounded-full bg-[#005BAC] text-white flex items-center justify-center text-[8px]">
                    {(selectedReport?.generatedBy?.name ?? "SYS").substring(0, 2).toUpperCase()}
                  </div>
                  {selectedReport?.generatedBy?.name ?? "System"}
                </span>
              </div>
              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Created At</span>
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-slate-400" />
                  {selectedReport ? shortDate(selectedReport.createdAt) : ""}
                </span>
              </div>
              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Last Export</span>
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Download className="size-3.5 text-slate-400" />
                  Never
                </span>
              </div>
              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Access Level</span>
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5 text-slate-400" />
                  Internal Only
                </span>
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cost Distribution Snapshot</h4>
              <div className="h-48 w-full rounded-sm border border-slate-200 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-slate-400 to-transparent" />
                <BarChart3 className="size-8 text-slate-300 mb-2 transition-transform group-hover:scale-110" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Interactive Preview Disabled</span>
              </div>
            </div>
          </div>

          <div className="flex-none p-4 border-t border-slate-100 bg-[#fafafa] flex items-center justify-between gap-3">
            <Button variant="outline" className="flex-1 shadow-none border-slate-200 text-slate-700 font-bold bg-white" onClick={() => setSelectedReport(null)}>
              Close
            </Button>
            <div className="flex gap-2 flex-1">
              <Button variant="outline" className="flex-1 shadow-none border-[#005BAC]/20 text-[#005BAC] hover:text-[#004a8c] hover:bg-[#EBF3FF] bg-[#EBF3FF] font-bold transition-colors">
                <Share2 className="size-3.5 mr-1.5" /> Share
              </Button>
              <Button className="flex-1 shadow-none bg-[#005BAC] hover:bg-[#004a8c] font-bold text-white transition-colors">
                <Download className="size-3.5 mr-1.5" /> Export
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}


export function AuditPage() {
  const auditTable = useTableQuery({ sortBy: "createdAt", sortDir: "desc" });
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const auditQuery = useQuery({
    queryKey: ["enterprise-table", "audit-logs", auditTable.queryKey],
    queryFn: async () => {
      const { data } = await api.get<TableApiResponse<any>>("/audit-logs", { params: auditTable.params });
      return data;
    },
    placeholderData: (previous) => previous
  });

  const { data: usersData } = useUsers();
  const operators = (usersData?.data || []) as any[];

  // Common Action Badges Styling - Flat minimalist style
  const getActionBadge = (act: string) => {
    const actUpper = act.toUpperCase();
    if (actUpper.includes("LOGIN_FAILED")) {
      return <Badge className="bg-[#FEE2E2] text-[#991B1B] border-none uppercase text-[10px] font-bold shadow-none rounded-sm">Failed Login</Badge>;
    }
    if (actUpper.includes("LOGIN")) {
      return <Badge className="bg-[#D1FAE5] text-[#065F46] border-none uppercase text-[10px] font-bold shadow-none rounded-sm">Login</Badge>;
    }
    if (actUpper.includes("CREATE")) {
      return <Badge className="bg-[#DBEAFE] text-[#1E40AF] border-none uppercase text-[10px] font-bold shadow-none rounded-sm">Create</Badge>;
    }
    if (actUpper.includes("UPDATE")) {
      return <Badge className="bg-[#FEF3C7] text-[#92400E] border-none uppercase text-[10px] font-bold shadow-none rounded-sm">Update</Badge>;
    }
    if (actUpper.includes("PRICE_UPDATE")) {
      return <Badge className="bg-[#F3E8FF] text-[#6B21A8] border-none uppercase text-[10px] font-bold shadow-none rounded-sm">Price Adjust</Badge>;
    }
    if (actUpper.includes("DEACTIVATE") || actUpper.includes("DELETE")) {
      return <Badge className="bg-[#F3F4F6] text-[#374151] border-none uppercase text-[10px] font-bold shadow-none rounded-sm">Deactivate</Badge>;
    }
    return <Badge className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold shadow-none rounded-sm">{act}</Badge>;
  };

  const auditColumns: EnterpriseColumnDef<any>[] = [
    {
      id: "user",
      header: "Operator User",
      enableSorting: false,
      meta: { label: "Operator" },
      cell: ({ row }) => row.original.user ? (
        <div>
          <p className="font-semibold text-slate-850">{row.original.user.name}</p>
          <p className="text-[10px] text-slate-400 font-medium font-mono">{row.original.user.email}</p>
        </div>
      ) : <span className="text-slate-450 italic">System Auto</span>
    },
    { accessorKey: "action", header: "Action Trigger", meta: { label: "Action" }, cell: ({ row }) => getActionBadge(row.original.action) },
    { accessorKey: "entity", header: "Target Entity", meta: { label: "Entity" }, cell: ({ row }) => <span className="font-semibold uppercase text-slate-500">{row.original.entity}</span> },
    { accessorKey: "entityId", header: "Entity ID / Key", enableSorting: false, meta: { label: "Entity ID", className: "font-mono text-[11px]" }, cell: ({ row }) => row.original.entityId || "N/A" },
    { accessorKey: "ipAddress", header: "Client IP", meta: { label: "IP", className: "font-mono" }, cell: ({ row }) => row.original.ipAddress || "Internal" },
    { accessorKey: "createdAt", header: "Timestamp", meta: { label: "Timestamp" }, cell: ({ row }) => <span className="font-mono text-slate-600">{new Date(row.original.createdAt).toLocaleString("en-IN", { hour12: true })}</span> }
  ];

  return (
    <div className="flex flex-col gap-5 text-left">
      <PageHead title="Enterprise Security Audit Logs" icon={ShieldAlert} />

      {/* KPI statistics cards block */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Box title="Total Audits Logged" value={auditQuery.data?.pagination ? `${auditQuery.data.pagination.total} Records` : "Loading..."} />
        <Box title="Active Operators" value={`${operators.length || 4} Profiles`} />
        <Box title="System Status" value="100% Audited" />
        <Box title="Mutations Logged" value="Auto & Manual" />
      </div>

      <div className="grid gap-5">
        <Card className="rounded-sm border border-[#E5E7EB] bg-white shadow-none p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="font-bold text-slate-900 tracking-tight text-sm uppercase">Audit Log Stream</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Real-time transaction tracking, user access audits, and metadata capture.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => auditQuery.refetch()} className="h-8.5 text-xs font-bold border-[#E5E7EB] hover:bg-slate-50 text-slate-700 rounded-sm shadow-none">
              <RefreshCw className="mr-1 size-3.5" /> Reload Stream
            </Button>
          </div>

          <EnterpriseDataTable
            tableId="audit-logs"
            data={auditQuery.data?.data ?? []}
            columns={auditColumns}
            query={auditTable.query}
            onQueryChange={auditTable.setQuery}
            totalRows={auditQuery.data?.pagination?.total ?? 0}
            getRowId={(row) => row.id}
            isLoading={auditQuery.isLoading}
            error={auditQuery.error}
            searchPlaceholder="Search action, IP, entity ID, or operator..."
            exportResource="audit-logs"
            exportParams={auditTable.params}
            onRowClick={setSelectedLog}
            filters={
              <>
                <select
                  className="h-9 rounded-sm border border-[#E5E7EB] bg-white px-2.5 text-xs font-semibold text-slate-650 focus:outline-none"
                  value={auditTable.query.filters.userId ?? ""}
                  onChange={(event) => auditTable.setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, userId: event.target.value || undefined } }))}
                >
                  <option value="">All Operators</option>
                  {operators.map((op: any) => (
                    <option key={op.id} value={op.id}>{op.name} ({op.email})</option>
                  ))}
                </select>
                <select
                  className="h-9 rounded-sm border border-[#E5E7EB] bg-white px-2.5 text-xs font-semibold text-slate-650 focus:outline-none"
                  value={auditTable.query.filters.action ?? ""}
                  onChange={(event) => auditTable.setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, action: event.target.value || undefined } }))}
                >
                  <option value="">All Actions</option>
                  <option value="LOGIN">LOGIN</option>
                  <option value="LOGIN_FAILED">LOGIN_FAILED</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DEACTIVATE">DEACTIVATE</option>
                  <option value="PRICE_UPDATE">PRICE_UPDATE</option>
                  <option value="EXPORT_CSV">EXPORT_CSV</option>
                </select>
                <select
                  className="h-9 rounded-sm border border-[#E5E7EB] bg-white px-2.5 text-xs font-semibold text-slate-650 focus:outline-none"
                  value={auditTable.query.filters.entity ?? ""}
                  onChange={(event) => auditTable.setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, entity: event.target.value || undefined } }))}
                >
                  <option value="">All Entities</option>
                  <option value="Authentication">Authentication</option>
                  <option value="Metal">Metal</option>
                  <option value="Grade">Grade</option>
                  <option value="Calculation">Calculation</option>
                  <option value="User">User</option>
                  <option value="Report">Report</option>
                </select>
                <Input
                  type="date"
                  value={auditTable.query.filters.from ?? ""}
                  onChange={(event) => auditTable.setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, from: event.target.value || undefined } }))}
                  className="h-9 text-xs bg-white border border-[#E5E7EB] rounded-sm shadow-none focus-visible:ring-0"
                />
                <Input
                  type="date"
                  value={auditTable.query.filters.to ?? ""}
                  onChange={(event) => auditTable.setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, to: event.target.value || undefined } }))}
                  className="h-9 text-xs bg-white border border-[#E5E7EB] rounded-sm shadow-none focus-visible:ring-0"
                />
              </>
            }
          />
        </Card>
      </div>

      {/* RAW JSON DETAILS INSPECTOR DRAWER */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25">
          <div className="absolute inset-0" onClick={() => setSelectedLog(null)} />
          <div className="relative w-full max-w-xl bg-white border-l border-[#E5E7EB] h-full flex flex-col shadow-sm animate-in slide-in-from-right duration-150">
            <header className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827] flex items-center gap-2">
                <ShieldAlert className="size-4" /> Audit Metadata Inspector
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600 font-semibold text-sm">✕</button>
            </header>
            <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto text-xs text-left">
              <div className="grid gap-3 sm:grid-cols-2 bg-[#FAFAFA] p-3 rounded-sm border border-[#E5E7EB]">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[9px]">Triggered Path</p>
                  <p className="font-mono text-slate-800 mt-0.5">[{selectedLog.details?.method || "WRITE"}] {selectedLog.details?.path || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[9px]">HTTP Status Code</p>
                  <p className="font-bold text-emerald-600 mt-0.5">{selectedLog.details?.statusCode || "200 SUCCESS"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[9px]">Target Resource Entity</p>
                  <p className="font-bold text-slate-700 mt-0.5">{selectedLog.entity} (ID: {selectedLog.entityId || "N/A"})</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[9px]">Network IP Address</p>
                  <p className="font-mono text-slate-700 mt-0.5">{selectedLog.ipAddress || "Internal Loop"}</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <p className="text-slate-400 font-bold uppercase text-[9px] mb-1.5">Action JSON Payload details</p>
                <pre className="flex-1 bg-slate-950 text-emerald-400 rounded-sm p-4 overflow-auto text-[11px] font-mono border border-slate-800 leading-relaxed shadow-none">
                  {JSON.stringify(selectedLog.details?.payload || selectedLog.details || {}, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#E5E7EB] pt-4 mt-auto">
                <Button type="button" onClick={() => setSelectedLog(null)} className="bg-primary hover:bg-[#001b3a] text-xs">Close Details</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
