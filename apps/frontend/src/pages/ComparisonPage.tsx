import { 
  Badge, 
  Button, 
  Card, 
  CardContent, 
  Input, 
  Select, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  inr 
} from "@jsw-mcms/ui";
import { 
  ChevronDown, 
  ChevronUp, 
  GitCompare, 
  HelpCircle, 
  Info, 
  Scale, 
  Search, 
  ShieldAlert, 
  TrendingUp, 
  Zap 
} from "lucide-react";
import { useMemo, useState } from "react";
import { grades as staticGrades } from "@/data/fixtures";
import type { Grade } from "@/types";

// Property rows definitions for mechanical, tolerances, bend and chemical groups
interface SpecRow {
  label: string;
  key: string;
  group: "mechanical" | "tolerances" | "bend" | "chemical";
  getValue: (g: Grade) => string;
}

const specSchema: SpecRow[] = [
  // Mechanical specs
  { label: "Ultimate Tensile Strength (UTS)", key: "UTS", group: "mechanical", getValue: (g) => g.mechanicalProperties?.["UTS"] || "N/A" },
  { label: "Yield Strength", key: "Yield strength", group: "mechanical", getValue: (g) => g.mechanicalProperties?.["Yield strength"] || "N/A" },
  { label: "Elongation %", key: "Elongation", group: "mechanical", getValue: (g) => g.mechanicalProperties?.["Elongation"] || "N/A" },
  // Chemical specs
  { label: "Carbon (C) %", key: "C", group: "chemical", getValue: (g) => g.chemicalComposition?.["C"] || "0.00%" },
  { label: "Chromium (Cr) %", key: "Cr", group: "chemical", getValue: (g) => g.chemicalComposition?.["Cr"] || "0.00%" },
  { label: "Nickel (Ni) %", key: "Ni", group: "chemical", getValue: (g) => g.chemicalComposition?.["Ni"] || "0.00%" },
  { label: "Molybdenum (Mo) %", key: "Mo", group: "chemical", getValue: (g) => g.chemicalComposition?.["Mo"] || "0.00%" },
  { label: "Manganese (Mn) %", key: "Mn", group: "chemical", getValue: (g) => g.chemicalComposition?.["Mn"] || "0.00%" },
  // Tolerance specs
  { label: "Thickness Tolerance", key: "Thickness", group: "tolerances", getValue: (g) => g.toleranceProperties?.["Thickness"] || "N/A" },
  { label: "Flatness Profile", key: "Flatness", group: "tolerances", getValue: (g) => g.toleranceProperties?.["Flatness"] || "N/A" },
  // Bending specs
  { label: "Minimum Radius Limit", key: "Minimum radius", group: "bend", getValue: (g) => g.bendProperties?.["Minimum radius"] || "N/A" },
  { label: "Bending Rating", key: "Rating", group: "bend", getValue: (g) => g.bendProperties?.["Rating"] || "N/A" }
];

export function ComparisonPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(staticGrades.map((g) => g.id));
  const [searchQuery, setSearchQuery] = useState("");
  const [orderQuantity, setOrderQuantity] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<string>("default");
  
  // Highlighting settings
  const [highlightDiffs, setHighlightDiffs] = useState(true);
  const [showDiffsOnly, setShowDiffsOnly] = useState(false);

  // Accordion collapsed state for property grouping
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    cost: false,
    mechanical: false,
    chemical: false,
    tolerances: false,
    bend: false
  });

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  // Helper mapping alloy category prices from fixtures
  const getBasePrice = (grade: Grade) => {
    if (grade.metalId === "metal-ss" || grade.name.includes("SS")) return 62.50;
    if (grade.metalId === "metal-as" || grade.name.includes("Alloy")) return 72.00;
    return 80.00; // fallback default
  };

  const calculateUnitPrice = (grade: Grade) => {
    const base = getBasePrice(grade);
    const mult = Number(grade.multiplier || 1);
    const extra = Number(grade.extraPrice || 0);
    return base * mult + extra;
  };

  // Filters catalog list of grades
  const filteredGrades = useMemo(() => {
    return staticGrades.filter((g) => 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.metal?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Dynamic horizontal columns selection
  const chosenGrades = useMemo(() => {
    return staticGrades.filter((g) => selectedIds.includes(g.id));
  }, [selectedIds]);

  // Horizontal column sorting
  const sortedGrades = useMemo(() => {
    const list = [...chosenGrades];
    if (sortBy === "name-asc") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "cost-asc") {
      return list.sort((a, b) => calculateUnitPrice(a) - calculateUnitPrice(b));
    }
    if (sortBy === "cost-desc") {
      return list.sort((a, b) => calculateUnitPrice(b) - calculateUnitPrice(a));
    }
    return list; // default selection order
  }, [chosenGrades, sortBy]);

  const toggleGradeSelection = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(staticGrades.map((g) => g.id));
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  // Determines if values inside a spec row differ across all compared grades
  const checkRowDiffers = (row: SpecRow) => {
    if (sortedGrades.length <= 1) return false;
    const firstVal = row.getValue(sortedGrades[0]);
    return sortedGrades.some((g) => row.getValue(g) !== firstVal);
  };

  // Check if cost differs
  const isCostDiffering = useMemo(() => {
    if (sortedGrades.length <= 1) return false;
    const firstCost = calculateUnitPrice(sortedGrades[0]);
    return sortedGrades.some((g) => calculateUnitPrice(g) !== firstCost);
  }, [sortedGrades]);

  // Filter rows based on "Show Differences Only" toggle
  const visibleSpecSchema = useMemo(() => {
    if (!showDiffsOnly) return specSchema;
    return specSchema.filter((row) => checkRowDiffers(row));
  }, [showDiffsOnly, sortedGrades]);

  // Identify the lowest cost grade
  const lowestCostId = useMemo(() => {
    if (sortedGrades.length <= 1) return null;
    let minCost = Infinity;
    let minId = null;
    sortedGrades.forEach((g) => {
      const cost = calculateUnitPrice(g);
      if (cost < minCost) {
        minCost = cost;
        minId = g.id;
      }
    });
    return minId;
  }, [sortedGrades]);

  // Helper to draw horizontal bar graphs for chemical percentages
  const renderChemicalBar = (valStr: string) => {
    const val = parseFloat(valStr || "0");
    if (isNaN(val) || val === 0) return null;
    return (
      <div className="mt-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, val * 5)}%` }} />
      </div>
    );
  };

  const sortOptions = [
    { value: "default", label: "Default Selection Order" },
    { value: "name-asc", label: "Grade Name (A - Z)" },
    { value: "cost-asc", label: "Estimated Cost (Lowest First)" },
    { value: "cost-desc", label: "Estimated Cost (Highest First)" }
  ];

  return (
    <div className="flex flex-col gap-6 relative pb-12 text-left">
      
      {/* Redesigned Workspace Banner Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-blue-600" />
        
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            JSW Cost Allocation Workspace
          </p>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5 flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-blue-600 animate-pulse" />
            <span>Multi-Alloy Comparison Engine</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge className="border-info-border bg-info-bg text-info-fg flex items-center gap-1 font-bold px-3 py-1 text-xs rounded-full">
            <Scale className="h-3.5 w-3.5" />
            <span>JSW Specifications Matrix</span>
          </Badge>
          
          <Button
            size="sm"
            onClick={handleSelectAll}
            variant="outline"
            className="border-slate-200 text-slate-700 font-bold h-9 rounded-xl shadow-sm text-xs"
          >
            Select All Alloys
          </Button>
        </div>
      </header>

      {/* 1️⃣ ALLOY CATALOG SELECTOR SECTION */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Available Grade Catalog Selector ({filteredGrades.length})
          </span>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              className="pl-8 h-8.5 rounded-lg text-xs"
              placeholder="Search available grades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGrades.map((grade) => {
            const isSelected = selectedIds.includes(grade.id);
            const unitPrice = calculateUnitPrice(grade);
            return (
              <Card 
                key={grade.id} 
                className={`cursor-pointer border-slate-200 bg-white transition-all duration-300 relative group overflow-hidden ${
                  isSelected 
                    ? "ring-2 ring-blue-500 border-blue-400 shadow-md" 
                    : "hover:border-slate-350 hover:shadow-xs"
                }`}
                onClick={() => toggleGradeSelection(grade.id)}
              >
                {/* Decorative border strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                  isSelected ? "bg-blue-500" : "bg-slate-100 group-hover:bg-slate-200"
                }`} />

                <CardContent className="p-4 pt-5 flex items-start justify-between gap-3 text-left">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between w-full">
                      <strong className="text-sm font-extrabold text-[#10233d]">{grade.name}</strong>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{grade.metal?.category}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-semibold block mt-1.5">
                      Base Metal: <strong className="text-slate-600">{grade.metal?.name}</strong>
                    </p>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Base Rate</span>
                        <strong className="text-[#0057b8] font-black text-xs">{inr(unitPrice)} / kg</strong>
                      </div>
                      <Badge variant={isSelected ? "info" : "outline"} className="px-2 py-0 rounded text-[9px] font-bold uppercase">
                        {isSelected ? "Compared" : "Exclude"}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Plain Custom Checkbox */}
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => {}} // Swallowed: parent div click handles state
                    className="h-4 w-4 accent-blue-500 rounded border-slate-200 mt-0.5 cursor-pointer"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 2️⃣ ANALYTICAL ACTION CONTROLS PANEL */}
      <Card className="border-slate-200 bg-slate-50/50 p-4 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-5">
          
          {/* Simulation Quantity Calculator */}
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <div className="flex flex-col gap-0.5 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Simulate Order Volume (kg)
              </span>
              <Input
                type="number"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Math.max(0, Number(e.target.value)))}
                className="w-36 h-8 rounded-lg text-xs font-bold text-[#10233d] border-slate-200 bg-white"
                placeholder="Batch size kg"
                rightIcon={<span className="text-[9px] font-bold text-slate-400">kg</span>}
              />
            </div>
          </div>

          {/* Table difference highlights controls */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#56657a]">
            
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={highlightDiffs}
                onChange={(e) => setHighlightDiffs(e.target.checked)}
                className="h-3.5 w-3.5 accent-blue-500 rounded cursor-pointer"
              />
              <span>Highlight Differences</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={showDiffsOnly}
                onChange={(e) => setShowDiffsOnly(e.target.checked)}
                className="h-3.5 w-3.5 accent-blue-500 rounded cursor-pointer"
              />
              <span>Show Differences Only</span>
            </label>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-7 text-xs font-bold text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 p-1"
            >
              Clear Comparison
            </Button>
          </div>

          {/* Horizontal sort selector */}
          <Select
            label="Sort Alloy Columns"
            value={sortBy}
            options={sortOptions}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-52 h-8.5 rounded-lg text-xs"
          />

        </div>
      </Card>

      {/* 3️⃣ COMPARATIVE SPECS TABLE SHEET */}
      <Card className="border-slate-200 bg-white shadow-md overflow-hidden text-left">
        {sortedGrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center gap-3">
            <GitCompare className="h-12 w-12 text-slate-350 animate-pulse" />
            <strong className="text-slate-800 text-sm font-bold block">No Alloys Selected</strong>
            <p className="text-xs text-slate-400 font-semibold max-w-[280px]">
              Choose steel grades from the selectors catalog above to populate the dynamic analytical matrix.
            </p>
            <Button onClick={handleSelectAll} className="bg-blue-600 text-white font-bold h-9.5 px-4 rounded-xl mt-2 text-xs">
              Load Standard Grades
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse text-left min-w-[760px]">
              
              {/* Sticky Alloy columns header */}
              <TableHeader className="bg-slate-100/80 backdrop-blur-xs sticky top-0 z-20 border-b border-[#d6dfeb]">
                <TableRow>
                  <TableHead className="py-3 px-4 font-black text-[#56657a] uppercase text-[10px] tracking-wider w-64 border-r border-[#d6dfeb]">
                    Properties & Specifications
                  </TableHead>
                  
                  {sortedGrades.map((grade) => {
                    const isLowest = grade.id === lowestCostId;
                    return (
                      <TableHead 
                        key={grade.id} 
                        className={`py-3 px-4 text-center font-extrabold text-[#10233d] text-xs border-r border-[#d6dfeb]/50 w-56 relative ${
                          isLowest ? "bg-emerald-50/50" : ""
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <strong className="block text-slate-800 font-extrabold text-sm">{grade.name}</strong>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">({grade.metal?.name})</span>
                          {isLowest && (
                            <Badge variant="success" className="px-1.5 py-0 rounded text-[8px] font-bold block mt-1">
                              ✓ Best Value option
                            </Badge>
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>

              <TableBody className="bg-white">
                
                {/* ==================== GROUP 1: COST & COMMERCIALS ==================== */}
                <TableRow 
                  className="bg-slate-50 hover:bg-slate-100/80 cursor-pointer font-bold select-none border-b border-[#d6dfeb]/70 transition-colors"
                  onClick={() => toggleGroup("cost")}
                >
                  <TableCell colSpan={sortedGrades.length + 1} className="py-2.5 px-4 text-xs font-black text-[#10233d] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-blue-600" />
                      <span>1. Cost & Commercial Matrix</span>
                    </span>
                    {collapsedGroups.cost ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </TableCell>
                </TableRow>

                {!collapsedGroups.cost && (
                  <>
                    {/* Row: Metal Base price */}
                    <TableRow className={`border-b border-[#d6dfeb]/30 text-xs transition-colors hover:bg-slate-50/50`}>
                      <TableCell className="py-2.5 px-4 font-bold text-slate-500 border-r border-[#d6dfeb]/50 pl-6 flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-slate-350" />
                        <span>Metal Base Rate (Price master)</span>
                      </TableCell>
                      {sortedGrades.map((grade) => (
                        <TableCell key={grade.id} className="py-2.5 px-4 text-center font-bold text-slate-700 border-r border-[#d6dfeb]/30">
                          {inr(getBasePrice(grade))} / kg
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Row: Grade multiplier */}
                    <TableRow className={`border-b border-[#d6dfeb]/30 text-xs transition-colors hover:bg-slate-50/50`}>
                      <TableCell className="py-2.5 px-4 font-bold text-slate-500 border-r border-[#d6dfeb]/50 pl-6 flex items-center gap-1.5">
                        <HelpCircle className="h-3.5 w-3.5 text-slate-350" />
                        <span>Grade Surcharge Multiplier</span>
                      </TableCell>
                      {sortedGrades.map((grade) => (
                        <TableCell key={grade.id} className="py-2.5 px-4 text-center font-bold text-slate-700 border-r border-[#d6dfeb]/30">
                          {grade.multiplier}x
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Row: Grade Extra Surcharge */}
                    <TableRow className={`border-b border-[#d6dfeb]/30 text-xs transition-colors hover:bg-slate-50/50`}>
                      <TableCell className="py-2.5 px-4 font-bold text-slate-500 border-r border-[#d6dfeb]/50 pl-6 flex items-center gap-1.5">
                        <span>Extra Surcharge Price/kg</span>
                      </TableCell>
                      {sortedGrades.map((grade) => (
                        <TableCell key={grade.id} className="py-2.5 px-4 text-center font-bold text-slate-700 border-r border-[#d6dfeb]/30">
                          {inr(Number(grade.extraPrice))} / kg
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Row: Unit Cost */}
                    <TableRow className={`border-b border-[#d6dfeb]/40 text-xs font-black transition-colors ${
                      highlightDiffs && isCostDiffering ? "bg-[#fff8ee] hover:bg-[#fff0db]" : "hover:bg-slate-50/50"
                    }`}>
                      <TableCell className="py-2.5 px-4 font-extrabold text-[#10233d] border-r border-[#d6dfeb]/50 pl-6 flex items-center gap-1.5">
                        <span>Calculated Unit Cost / kg</span>
                        {highlightDiffs && isCostDiffering && (
                          <Badge variant="warning" className="px-1 py-0 rounded text-[7px]">differs</Badge>
                        )}
                      </TableCell>
                      {sortedGrades.map((grade) => {
                        const unitCost = calculateUnitPrice(grade);
                        const isLowest = grade.id === lowestCostId;
                        return (
                          <TableCell key={grade.id} className={`py-2.5 px-4 text-center border-r border-[#d6dfeb]/30 font-black text-sm text-[#0057b8] ${
                            isLowest ? "text-emerald-700 font-extrabold" : ""
                          }`}>
                            {inr(unitCost)} / kg
                          </TableCell>
                        );
                      })}
                    </TableRow>

                    {/* Row: Order Simulated Cost */}
                    <TableRow className={`border-b border-[#d6dfeb]/70 text-xs font-black bg-blue-50/20 transition-colors`}>
                      <TableCell className="py-3 px-4 font-black text-blue-900 border-r border-[#d6dfeb]/50 pl-6 flex items-center gap-1.5">
                        <span>Simulated Order Cost ({orderQuantity.toLocaleString()} kg)</span>
                      </TableCell>
                      {sortedGrades.map((grade) => {
                        const estCost = calculateUnitPrice(grade) * orderQuantity;
                        const isLowest = grade.id === lowestCostId;
                        return (
                          <TableCell key={grade.id} className={`py-3 px-4 text-center border-r border-[#d6dfeb]/30 font-black text-sm ${
                            isLowest ? "bg-emerald-100/60 text-emerald-800" : "text-slate-800"
                          }`}>
                            {inr(estCost)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </>
                )}

                {/* ==================== GROUP 2: MECHANICAL PROPERTIES ==================== */}
                <TableRow 
                  className="bg-slate-50 hover:bg-slate-100/80 cursor-pointer font-bold select-none border-b border-[#d6dfeb]/70 transition-colors"
                  onClick={() => toggleGroup("mechanical")}
                >
                  <TableCell colSpan={sortedGrades.length + 1} className="py-2.5 px-4 text-xs font-black text-[#10233d] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span>2. Mechanical Properties Spec Matrix</span>
                    </span>
                    {collapsedGroups.mechanical ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </TableCell>
                </TableRow>

                {!collapsedGroups.mechanical && (
                  visibleSpecSchema
                    .filter((row) => row.group === "mechanical")
                    .map((row) => {
                      const differs = checkRowDiffers(row);
                      return (
                        <TableRow 
                          key={row.label} 
                          className={`border-b border-[#d6dfeb]/30 text-xs transition-colors ${
                            differs && highlightDiffs ? "bg-[#fff8ee] hover:bg-[#fff0db]" : "hover:bg-slate-50/50"
                          }`}
                        >
                          <TableCell className="py-2.5 px-4 font-bold text-slate-500 border-r border-[#d6dfeb]/50 pl-6 flex items-center gap-1.5">
                            <span>{row.label}</span>
                            {differs && highlightDiffs && (
                              <Badge variant="warning" className="px-1 py-0 rounded text-[7px]">differs</Badge>
                            )}
                          </TableCell>
                          
                          {sortedGrades.map((grade) => (
                            <TableCell key={grade.id} className="py-2.5 px-4 text-center font-bold text-slate-700 border-r border-[#d6dfeb]/30">
                              {row.getValue(grade)}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                )}

                {/* ==================== GROUP 3: CHEMICAL COMPOSITION ==================== */}
                <TableRow 
                  className="bg-slate-50 hover:bg-slate-100/80 cursor-pointer font-bold select-none border-b border-[#d6dfeb]/70 transition-colors"
                  onClick={() => toggleGroup("chemical")}
                >
                  <TableCell colSpan={sortedGrades.length + 1} className="py-2.5 px-4 text-xs font-black text-[#10233d] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <GitCompare className="h-4 w-4 text-blue-500" />
                      <span>3. Chemical Elements & Compositions</span>
                    </span>
                    {collapsedGroups.chemical ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </TableCell>
                </TableRow>

                {!collapsedGroups.chemical && (
                  visibleSpecSchema
                    .filter((row) => row.group === "chemical")
                    .map((row) => {
                      const differs = checkRowDiffers(row);
                      return (
                        <TableRow 
                          key={row.label} 
                          className={`border-b border-[#d6dfeb]/30 text-xs transition-colors ${
                            differs && highlightDiffs ? "bg-[#fff8ee] hover:bg-[#fff0db]" : "hover:bg-slate-50/50"
                          }`}
                        >
                          <TableCell className="py-2.5 px-4 font-bold text-slate-500 border-r border-[#d6dfeb]/50 pl-6 flex items-center gap-1.5">
                            <span>{row.label}</span>
                            {differs && highlightDiffs && (
                              <Badge variant="warning" className="px-1 py-0 rounded text-[7px]">differs</Badge>
                            )}
                          </TableCell>
                          
                          {sortedGrades.map((grade) => {
                            const val = row.getValue(grade);
                            return (
                              <TableCell key={grade.id} className="py-2.5 px-4 border-r border-[#d6dfeb]/30 text-center font-extrabold text-slate-700">
                                <div className="flex flex-col items-center">
                                  <span>{val}</span>
                                  <div className="w-24 mt-1 hidden sm:block">
                                    {renderChemicalBar(val)}
                                  </div>
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })
                )}

                {/* ==================== GROUP 4: TOLERANCE PROPERTIES ==================== */}
                <TableRow 
                  className="bg-slate-50 hover:bg-slate-100/80 cursor-pointer font-bold select-none border-b border-[#d6dfeb]/70 transition-colors"
                  onClick={() => toggleGroup("tolerances")}
                >
                  <TableCell colSpan={sortedGrades.length + 1} className="py-2.5 px-4 text-xs font-black text-[#10233d] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-emerald-500" />
                      <span>4. Dimension Tolerance specs</span>
                    </span>
                    {collapsedGroups.tolerances ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </TableCell>
                </TableRow>

                {!collapsedGroups.tolerances && (
                  visibleSpecSchema
                    .filter((row) => row.group === "tolerances")
                    .map((row) => {
                      const differs = checkRowDiffers(row);
                      return (
                        <TableRow 
                          key={row.label} 
                          className={`border-b border-[#d6dfeb]/30 text-xs transition-colors ${
                            differs && highlightDiffs ? "bg-[#fff8ee] hover:bg-[#fff0db]" : "hover:bg-slate-50/50"
                          }`}
                        >
                          <TableCell className="py-2.5 px-4 font-bold text-slate-500 border-r border-[#d6dfeb]/50 pl-6 flex items-center gap-1.5">
                            <span>{row.label}</span>
                            {differs && highlightDiffs && (
                              <Badge variant="warning" className="px-1 py-0 rounded text-[7px]">differs</Badge>
                            )}
                          </TableCell>
                          
                          {sortedGrades.map((grade) => (
                            <TableCell key={grade.id} className="py-2.5 px-4 text-center font-bold text-slate-700 border-r border-[#d6dfeb]/30">
                              {row.getValue(grade)}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                )}

                {/* ==================== GROUP 5: BENDING PROPERTIES ==================== */}
                <TableRow 
                  className="bg-slate-50 hover:bg-slate-100/80 cursor-pointer font-bold select-none border-b border-[#d6dfeb]/70 transition-colors"
                  onClick={() => toggleGroup("bend")}
                >
                  <TableCell colSpan={sortedGrades.length + 1} className="py-2.5 px-4 text-xs font-black text-[#10233d] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-indigo-500" />
                      <span>5. Bend & Formability Specs</span>
                    </span>
                    {collapsedGroups.bend ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </TableCell>
                </TableRow>

                {!collapsedGroups.bend && (
                  visibleSpecSchema
                    .filter((row) => row.group === "bend")
                    .map((row) => {
                      const differs = checkRowDiffers(row);
                      return (
                        <TableRow 
                          key={row.label} 
                          className={`border-b border-[#d6dfeb]/30 text-xs transition-colors ${
                            differs && highlightDiffs ? "bg-[#fff8ee] hover:bg-[#fff0db]" : "hover:bg-slate-50/50"
                          }`}
                        >
                          <TableCell className="py-2.5 px-4 font-bold text-slate-500 border-r border-[#d6dfeb]/50 pl-6 flex items-center gap-1.5">
                            <span>{row.label}</span>
                            {differs && highlightDiffs && (
                              <Badge variant="warning" className="px-1 py-0 rounded text-[7px]">differs</Badge>
                            )}
                          </TableCell>
                          
                          {sortedGrades.map((grade) => {
                            const val = row.getValue(grade);
                            return (
                              <TableCell key={grade.id} className="py-2.5 px-4 text-center border-r border-[#d6dfeb]/30 font-bold">
                                <Badge 
                                  variant={val === "Excellent" || val.includes("2.0T") ? "success" : "default"}
                                  className="px-2 py-0.5 rounded text-[10px]"
                                >
                                  {val}
                                </Badge>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })
                )}

              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* 4️⃣ ANALYTICAL COMPARISON INFO FOOTER NOTES */}
      <div className="grid gap-4 md:grid-cols-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/20 p-4 text-xs font-bold text-slate-500">
        <div className="flex flex-col gap-1 p-3 rounded-lg border border-slate-100 bg-white">
          <span className="text-[10px] text-blue-500 uppercase tracking-wider block font-bold">Step 1</span>
          <span className="text-[#10233d]">Select alloys from the selectors strip above.</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-lg border border-slate-100 bg-white">
          <span className="text-[10px] text-blue-500 uppercase tracking-wider block font-bold">Step 2</span>
          <span className="text-[#10233d]">Compare chemical compositions and mechanical limits.</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-lg border border-slate-100 bg-white">
          <span className="text-[10px] text-blue-500 uppercase tracking-wider block font-bold">Step 3</span>
          <span className="text-[#10233d]">Simulate batch sizes to check purchase totals in INR.</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-lg border border-slate-100 bg-white">
          <span className="text-[10px] text-blue-500 uppercase tracking-wider block font-bold">Step 4</span>
          <span className="text-[#10233d]">Confirm the optimal grade value match.</span>
        </div>
      </div>

    </div>
  );
}
