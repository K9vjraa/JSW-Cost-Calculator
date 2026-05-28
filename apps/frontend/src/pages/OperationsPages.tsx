import { 
  Download, 
  FileBarChart2, 
  LockKeyhole, 
  Plus, 
  ShieldAlert, 
  Truck, 
  Users,
  RefreshCw,
  Layers,
  Database,
  Check,
  AlertCircle,
  TrendingUp,
  Sliders,
  DollarSign,
  Trash2,
  Search,
  Calendar
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableHead } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  calculations, 
  grades as gradesFixture, 
  metals as metalsFixture, 
  rawMaterials as rawMaterialsFixture 
} from "@/data/fixtures";
import { shortDate, inr } from "@/utils";
import { api, getOrFixture } from "@/services/api";
import { useAuditLogs, useUsers } from "@/hooks/useQuery";

// Reusable Page Header
function PageHead({ title, icon: Icon }: { title: string; icon: typeof LockKeyhole }) {
  return <header className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-lg bg-[#e8f0fb] text-[var(--primary)]"><Icon /></span><div><p className="text-sm font-semibold text-[var(--primary)]">MCMS Core + JSW Steel ERP</p><h2 className="text-2xl font-bold">{title}</h2></div></header>;
}

// Reusable Box Card
function Box({ title, value }: { title: string; value: string }) {
  return <Card><CardContent className="p-4"><p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{title}</p><strong className="mt-2 block text-xl">{value}</strong></CardContent></Card>;
}

export function MastersPage({ focus = "metals" }: { focus?: "metals" | "suppliers" | "users" | "settings" }) {
  const [query, setQuery] = useState("");
  
  // Real-time API States
  const [metals, setMetals] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [alloys, setAlloys] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Modal control state
  const [activeModal, setActiveModal] = useState<"metal" | "grade" | "raw" | "price" | "alloy" | null>(null);

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

  // Price Master Form States
  const [priceType, setPriceType] = useState<"metal" | "raw">("metal");
  const [priceTargetId, setPriceTargetId] = useState("");
  const [priceSupplierId, setPriceSupplierId] = useState("");
  const [priceValue, setPriceValue] = useState("");
  const [priceSource, setPriceSource] = useState("JSW Procurement Desk");
  const [priceReason, setPriceReason] = useState("Market Index Alignment");

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
      const metalsRes = await getOrFixture<{ data: any[] }>("/masters/metals?limit=100", { data: metalsFixture });
      const gradesRes = await getOrFixture<{ data: any[] }>("/masters/grades?limit=100", { data: gradesFixture });
      const rawRes = await getOrFixture<{ data: any[] }>("/masters/raw-materials?limit=100", { data: rawMaterialsFixture });
      const historyRes = await getOrFixture<{ data: any[] }>("/masters/price-history?limit=100", { data: [] });
      const alloysRes = await getOrFixture<{ data: any[] }>("/masters/alloys?limit=100", { data: [] });
      const suppliersRes = await getOrFixture<{ data: any[] }>("/masters/suppliers?limit=100", { data: [] });

      setMetals(metalsRes.data || []);
      setGrades(gradesRes.data || []);
      setRawMaterials(rawRes.data || []);
      setPriceHistory(historyRes.data || []);
      setAlloys(alloysRes.data || []);
      setSuppliers(suppliersRes.data || []);

      if (metalsRes.data && metalsRes.data.length > 0) {
        setGradeMetalId(metalsRes.data[0].id);
        setPriceTargetId(metalsRes.data[0].id);
      }
      if (suppliersRes.data && suppliersRes.data.length > 0) {
        setPriceSupplierId(suppliersRes.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load ERP master data", err);
      toast.error("Offline mode active: Using fixture fallback data.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Filter lists based on query
  const filteredMetals = useMemo(() => {
    return metals.filter(m => `${m.name} ${m.code}`.toLowerCase().includes(query.toLowerCase()));
  }, [metals, query]);

  const filteredGrades = useMemo(() => {
    return grades.filter(g => `${g.name} ${g.subGrade || ""}`.toLowerCase().includes(query.toLowerCase()));
  }, [grades, query]);

  const filteredRaw = useMemo(() => {
    return rawMaterials.filter(r => `${r.name} ${r.code}`.toLowerCase().includes(query.toLowerCase()));
  }, [rawMaterials, query]);

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
    try {
      const chem: Record<string, string> = {};
      if (chemCr) chem["Cr"] = chemCr;
      if (chemNi) chem["Ni"] = chemNi;
      if (chemC) chem["C"] = chemC;

      await api.post("/masters/grades", {
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
      });
      toast.success(`Steel Grade ${gradeName} added to Metal Master.`);
      setActiveModal(null);
      setGradeName("");
      setGradeSub("");
      setGradeMultiplier("1.0");
      setGradeExtraPrice("0");
      setChemCr("");
      setChemNi("");
      setChemC("");
      refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create grade.");
    }
  };

  const handleAddRaw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawName || !rawCode) {
      toast.error("Raw feed name and code are required.");
      return;
    }
    try {
      await api.post("/masters/raw-materials", {
        name: rawName,
        code: rawCode,
        unit: rawUnit,
        status: "ACTIVE"
      });
      toast.success(`Raw Material Feed ${rawName} registered successfully.`);
      setActiveModal(null);
      setRawName("");
      setRawCode("");
      refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to register raw material.");
    }
  };

  const handlePublishPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceTargetId || !priceValue) {
      toast.error("Please select a target feed and price rate.");
      return;
    }
    try {
      await api.post("/masters/prices", {
        metalId: priceType === "metal" ? priceTargetId : null,
        rawMaterialId: priceType === "raw" ? priceTargetId : null,
        supplierId: priceSupplierId || null,
        pricePerUnit: parseFloat(priceValue),
        currency: "INR",
        unit: "kg",
        source: priceSource,
        location: "India",
        effectiveFrom: new Date(),
        reason: priceReason,
        active: true
      });
      toast.success("Master-locked price published and archived in history log.");
      setActiveModal(null);
      setPriceValue("");
      setPriceReason("Market Index Alignment");
      refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish master price.");
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHead 
          title={focus === "suppliers" ? "Supplier Price Sheets" : focus === "users" ? "Users & Roles Access" : focus === "settings" ? "ERP Calculation Slabs" : "JSW Master Data Management"} 
          icon={focus === "suppliers" ? Truck : focus === "users" ? Users : Database} 
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="mr-1 size-4" /> Sync Database
          </Button>
          {!["suppliers", "users", "settings"].includes(focus) && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => {
                // Determine which modal to trigger first
                setActiveModal("price");
              }} className="bg-[#0b5cbf]">
                <TrendingUp className="mr-1 size-4" /> Price Adjuster
              </Button>
              <Button size="sm" onClick={() => {
                setActiveModal("alloy");
              }} className="bg-[#087443] hover:bg-[#065a33]">
                <Layers className="mr-1 size-4" /> New Composition
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input 
          className="max-w-sm" 
          value={query} 
          onChange={(event) => setQuery(event.target.value)} 
          placeholder="Filter ERP lists..." 
        />
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => setActiveModal("metal")}><Plus className="size-3" /> Add Metal</Button>
          <Button size="sm" variant="outline" onClick={() => setActiveModal("grade")}><Plus className="size-3" /> Add Grade</Button>
          <Button size="sm" variant="outline" onClick={() => setActiveModal("raw")}><Plus className="size-3" /> Add Raw Feed</Button>
        </div>
      </div>

      {focus === "users" ? (
        <UsersPanel />
      ) : focus === "settings" ? (
        <SettingsPanel />
      ) : focus === "suppliers" ? (
        <SuppliersPanel />
      ) : (
        <Tabs defaultValue="metals">
          <TabsList className="bg-[#eef2f6]">
            <TabsTrigger value="metals" className="data-[state=active]:bg-[#032f67] data-[state=active]:text-white">Metals Master</TabsTrigger>
            <TabsTrigger value="grades" className="data-[state=active]:bg-[#032f67] data-[state=active]:text-white">Steel Grades & Subgrades</TabsTrigger>
            <TabsTrigger value="raw" className="data-[state=active]:bg-[#032f67] data-[state=active]:text-white">Raw Materials Feed</TabsTrigger>
            <TabsTrigger value="prices" className="data-[state=active]:bg-[#032f67] data-[state=active]:text-white">Price History Logs</TabsTrigger>
            <TabsTrigger value="alloys" className="data-[state=active]:bg-[#032f67] data-[state=active]:text-white">Product Compositions</TabsTrigger>
          </TabsList>

          <TabsContent value="metals" className="mt-2">
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <thead>
                    <tr className="bg-[#f8fafc] border-b">
                      <TableHead>Metal Name</TableHead>
                      <TableHead>ERP Code</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Master Price</TableHead>
                      <TableHead>Status</TableHead>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMetals.map((m) => (
                      <tr key={m.id} className="border-b hover:bg-slate-50/50">
                        <TableCell className="font-semibold text-slate-800">{m.name}</TableCell>
                        <TableCell className="font-mono text-xs">{m.code}</TableCell>
                        <TableCell>{m.category}</TableCell>
                        <TableCell>{m.unit}</TableCell>
                        <TableCell className="font-medium text-slate-700">
                          {m.prices && m.prices[0] ? `${inr(m.prices[0].pricePerUnit)} / kg` : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge className={m.status === "ACTIVE" ? "border-[#bde4cf] bg-[#e8fbf0] text-[#087443]" : "border-slate-200 bg-slate-100 text-slate-500"}>
                            {m.status}
                          </Badge>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="mt-2">
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <thead>
                    <tr className="bg-[#f8fafc] border-b">
                      <TableHead>Grade Name</TableHead>
                      <TableHead>Subgrade</TableHead>
                      <TableHead>Metal Class</TableHead>
                      <TableHead>Multiplier</TableHead>
                      <TableHead>Extra Charge</TableHead>
                      <TableHead>Chemistry Profile (Cr / Ni / C)</TableHead>
                      <TableHead>Mechanical (UTS)</TableHead>
                      <TableHead>Status</TableHead>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrades.map((g) => (
                      <tr key={g.id} className="border-b hover:bg-slate-50/50 text-sm">
                        <TableCell className="font-semibold text-slate-800">{g.name}</TableCell>
                        <TableCell className="font-semibold text-slate-500">{g.subGrade || "-"}</TableCell>
                        <TableCell>{g.metal?.name || "Ferrous"}</TableCell>
                        <TableCell className="font-mono">{g.multiplier}x</TableCell>
                        <TableCell>{inr(g.extraPrice)}</TableCell>
                        <TableCell className="text-xs">
                          {g.chemicalComposition && typeof g.chemicalComposition === "object" ? (
                            <div className="flex gap-2">
                              {Object.entries(g.chemicalComposition).map(([el, val]) => (
                                <Badge key={el} className="bg-slate-50 text-[10px] py-0">{el}: {val as string}</Badge>
                              ))}
                            </div>
                          ) : "Standard"}
                        </TableCell>
                        <TableCell className="text-xs font-mono">{g.mechanicalProperties?.UTS || g.mechanicalProperties?.uts || "Standard"}</TableCell>
                        <TableCell>
                          <Badge className={g.status === "ACTIVE" ? "border-[#bde4cf] bg-[#e8fbf0] text-[#087443]" : "border-slate-200 bg-slate-100 text-slate-500"}>
                            {g.status}
                          </Badge>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="raw" className="mt-2">
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <thead>
                    <tr className="bg-[#f8fafc] border-b">
                      <TableHead>Raw Feed Name</TableHead>
                      <TableHead>ERP Code</TableHead>
                      <TableHead>Base Unit</TableHead>
                      <TableHead>Locked Price</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRaw.map((r) => (
                      <tr key={r.id} className="border-b hover:bg-slate-50/50">
                        <TableCell className="font-semibold text-slate-800">{r.name}</TableCell>
                        <TableCell className="font-mono text-xs">{r.code}</TableCell>
                        <TableCell>{r.unit}</TableCell>
                        <TableCell className="font-medium text-slate-700">
                          {r.prices && r.prices[0] ? `${inr(r.prices[0].pricePerUnit)} / kg` : "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500 max-w-xs truncate">{r.description || "Industrial raw mineral feed"}</TableCell>
                        <TableCell>
                          <Badge className={r.status === "ACTIVE" ? "border-[#bde4cf] bg-[#e8fbf0] text-[#087443]" : "border-slate-200 bg-slate-100 text-slate-500"}>
                            {r.status}
                          </Badge>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prices" className="mt-2">
            <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
              <Card>
                <CardHeader className="bg-[#fafbfd] border-b py-3 px-4">
                  <CardTitle className="text-base flex items-center gap-2"><DollarSign className="size-4 text-[#0b5cbf]" /> Active Locked Prices</CardTitle>
                </CardHeader>
                <CardContent className="overflow-y-auto max-h-[400px] p-0">
                  <Table>
                    <thead>
                      <tr className="bg-[#f8fafc] border-b text-xs">
                        <TableHead>Feed Material</TableHead>
                        <TableHead>Current Master Price</TableHead>
                        <TableHead>Source Desk</TableHead>
                        <TableHead>Effective Date</TableHead>
                      </tr>
                    </thead>
                    <tbody>
                      {[...metals, ...rawMaterials].map((item, index) => {
                        const priceRow = item.prices && item.prices[0];
                        if (!priceRow) return null;
                        return (
                          <tr key={`${item.id}-${index}`} className="border-b text-sm">
                            <TableCell className="font-semibold">{item.name}</TableCell>
                            <TableCell className="font-mono text-[#087443] font-semibold">{inr(priceRow.pricePerUnit)} / kg</TableCell>
                            <TableCell className="text-xs">{priceRow.source}</TableCell>
                            <TableCell className="text-xs">{shortDate(priceRow.effectiveFrom)}</TableCell>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-[#fafbfd] border-b py-3 px-4">
                  <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="size-4 text-[#087443]" /> ERP Master Price History Logs</CardTitle>
                </CardHeader>
                <CardContent className="overflow-y-auto max-h-[400px] p-0">
                  <Table>
                    <thead>
                      <tr className="bg-[#f8fafc] border-b text-xs">
                        <TableHead>Material</TableHead>
                        <TableHead>Old Rate</TableHead>
                        <TableHead>New Rate</TableHead>
                        <TableHead>Adjuster</TableHead>
                        <TableHead>Reason / Event</TableHead>
                        <TableHead>Time</TableHead>
                      </tr>
                    </thead>
                    <tbody>
                      {priceHistory.length > 0 ? (
                        priceHistory.map((hist) => (
                          <tr key={hist.id} className="border-b text-xs">
                            <TableCell className="font-semibold">{hist.metal?.name || hist.rawMaterial?.name}</TableCell>
                            <TableCell className="font-mono text-slate-400">{hist.oldPrice ? `${inr(hist.oldPrice)}` : "None"}</TableCell>
                            <TableCell className="font-mono text-[#0b5cbf] font-semibold">{inr(hist.newPrice)}</TableCell>
                            <TableCell>{hist.updatedBy?.name || "System"}</TableCell>
                            <TableCell className="text-slate-500 max-w-[150px] truncate" title={hist.reason || ""}>{hist.reason || "Periodic Lock"}</TableCell>
                            <TableCell className="text-slate-400">{shortDate(hist.updatedAt)}</TableCell>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                            No price update logs found. Use the Price Adjuster to publish a price.
                          </TableCell>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </CardContent>
              </Card>
            </div>
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
                          <Badge className="border-[#bde4cf] bg-[#e8fbf0] text-[#087443]">Active</Badge>
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

      {/* MODALS */}
      {/* 1. Metal Master Modal */}
      {activeModal === "metal" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-xl bg-white border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <header className="bg-[#032f67] p-4 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2"><Database className="size-5" /> Add Metal Master Line</h3>
            </header>
            <form onSubmit={handleAddMetal} className="p-5 flex flex-col gap-4">
              <label className="grid gap-1 text-sm font-semibold">Metal Name
                <Input required value={metalName} onChange={e => setMetalName(e.target.value)} placeholder="e.g. Copper Feed" />
              </label>
              <label className="grid gap-1 text-sm font-semibold">ERP Unique Code
                <Input required value={metalCode} onChange={e => setMetalCode(e.target.value.toUpperCase())} placeholder="e.g. MTL-CU" />
              </label>
              <label className="grid gap-1 text-sm font-semibold">Category
                <select className="h-10 rounded-md border bg-white px-2 text-sm" value={metalCategory} onChange={e => setMetalCategory(e.target.value)}>
                  <option value="Ferrous">Ferrous</option>
                  <option value="Non-Ferrous">Non-Ferrous</option>
                  <option value="Alloy">Alloy Base</option>
                  <option value="Noble">Noble Metal</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button type="submit" className="bg-[#032f67]">Save Record</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Grade Modal */}
      {activeModal === "grade" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-lg rounded-xl bg-white border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <header className="bg-[#032f67] p-4 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2"><Layers className="size-5" /> Add Steel Grade & Subgrade</h3>
            </header>
            <form onSubmit={handleAddGrade} className="p-5 flex flex-col gap-3.5 text-sm max-h-[85vh] overflow-y-auto">
              <label className="grid gap-1 font-semibold">Metal Master Base
                <select className="h-10 rounded-md border bg-white px-2" value={gradeMetalId} onChange={e => setGradeMetalId(e.target.value)}>
                  {metals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 font-semibold">Grade Name
                  <Input required value={gradeName} onChange={e => setGradeName(e.target.value)} placeholder="e.g. SS309" />
                </label>
                <label className="grid gap-1 font-semibold">Subgrade (Optional)
                  <Input value={gradeSub} onChange={e => setGradeSub(e.target.value)} placeholder="e.g. L" />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 font-semibold">Price Multiplier
                  <Input required type="number" step="0.001" value={gradeMultiplier} onChange={e => setGradeMultiplier(e.target.value)} />
                </label>
                <label className="grid gap-1 font-semibold">Extra Process Cost (INR/kg)
                  <Input required type="number" step="0.01" value={gradeExtraPrice} onChange={e => setGradeExtraPrice(e.target.value)} />
                </label>
              </div>
              <div className="border-t pt-3 mt-1">
                <h4 className="font-bold text-slate-800 mb-2">Chemical Composition Profile (%)</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="grid gap-1 font-medium text-xs">Chromium (Cr)
                    <Input value={chemCr} onChange={e => setChemCr(e.target.value)} placeholder="e.g. 19.5%" />
                  </label>
                  <label className="grid gap-1 font-medium text-xs">Nickel (Ni)
                    <Input value={chemNi} onChange={e => setChemNi(e.target.value)} placeholder="e.g. 9.0%" />
                  </label>
                  <label className="grid gap-1 font-medium text-xs">Carbon (C)
                    <Input value={chemC} onChange={e => setChemC(e.target.value)} placeholder="e.g. 0.05%" />
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button type="submit" className="bg-[#032f67]">Add Grade</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Raw Material Feed Modal */}
      {activeModal === "raw" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-xl bg-white border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <header className="bg-[#032f67] p-4 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2"><Database className="size-5" /> Add Raw Mineral Feed</h3>
            </header>
            <form onSubmit={handleAddRaw} className="p-5 flex flex-col gap-4">
              <label className="grid gap-1 text-sm font-semibold">Raw Material Name
                <Input required value={rawName} onChange={e => setRawName(e.target.value)} placeholder="e.g. Manganese Ore" />
              </label>
              <label className="grid gap-1 text-sm font-semibold">ERP Unique Code
                <Input required value={rawCode} onChange={e => setRawCode(e.target.value.toUpperCase())} placeholder="e.g. RM-MN" />
              </label>
              <label className="grid gap-1 text-sm font-semibold">Base Unit
                <Input required value={rawUnit} onChange={e => setRawUnit(e.target.value)} />
              </label>
              <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button type="submit" className="bg-[#032f67]">Save Material</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Price Master Publish Modal */}
      {activeModal === "price" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-xl bg-white border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <header className="bg-[#032f67] p-4 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2"><DollarSign className="size-5" /> Publish Master Price</h3>
            </header>
            <form onSubmit={handlePublishPrice} className="p-5 flex flex-col gap-3.5 text-sm">
              <div className="grid grid-cols-2 gap-2 p-1 border rounded-lg bg-slate-50">
                <button type="button" onClick={() => { setPriceType("metal"); setPriceTargetId(metals[0]?.id || ""); }} className={`py-1.5 rounded-md font-semibold text-center text-xs ${priceType === "metal" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-500"}`}>Metals</button>
                <button type="button" onClick={() => { setPriceType("raw"); setPriceTargetId(rawMaterials[0]?.id || ""); }} className={`py-1.5 rounded-md font-semibold text-center text-xs ${priceType === "raw" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-500"}`}>Raw Mineral Feeds</button>
              </div>
              <label className="grid gap-1 font-semibold">Target Feed Material
                <select className="h-10 rounded-md border bg-white px-2" value={priceTargetId} onChange={e => setPriceTargetId(e.target.value)}>
                  {priceType === "metal" 
                    ? metals.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)
                    : rawMaterials.map(r => <option key={r.id} value={r.id}>{r.name} ({r.code})</option>)
                  }
                </select>
              </label>
              <label className="grid gap-1 font-semibold">Linked Supplier Desk
                <select className="h-10 rounded-md border bg-white px-2" value={priceSupplierId} onChange={e => setPriceSupplierId(e.target.value)}>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  <option value="">JSW Approved Supplier Desk</option>
                </select>
              </label>
              <label className="grid gap-1 font-semibold">New Locked Price (INR/kg)
                <Input required type="number" step="0.0001" value={priceValue} onChange={e => setPriceValue(e.target.value)} placeholder="e.g. 78.50" />
              </label>
              <label className="grid gap-1 font-semibold">Price Source Desk
                <Input value={priceSource} onChange={e => setPriceSource(e.target.value)} />
              </label>
              <label className="grid gap-1 font-semibold">Reason for price update
                <Input value={priceReason} onChange={e => setPriceReason(e.target.value)} placeholder="e.g. Quarterly Contract Update" />
              </label>
              <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button type="submit" className="bg-[#0b5cbf]">Publish Lock</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. JSW Steel Alloy Composition Modal */}
      {activeModal === "alloy" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-2xl rounded-xl bg-white border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <header className="bg-[#087443] p-4 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2"><Layers className="size-5" /> JSW Steel Composition Structure</h3>
            </header>
            <form onSubmit={handleAddAlloy} className="p-5 flex flex-col gap-4 text-sm max-h-[85vh] overflow-y-auto">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 font-semibold">Composition Name
                  <Input required value={alloyName} onChange={e => setAlloyName(e.target.value)} placeholder="e.g. SS304 Batch Alloy" />
                </label>
                <label className="grid gap-1 font-semibold">ERP Unique Code
                  <Input required value={alloyCode} onChange={e => setAlloyCode(e.target.value.toUpperCase())} placeholder="e.g. ALY-SS304-JSW" />
                </label>
              </div>
              <label className="grid gap-1 font-semibold">Steel Type
                <Input value={alloyType} onChange={e => setAlloyType(e.target.value)} placeholder="e.g. Stainless Steel" />
              </label>

              <div className="border-t pt-3 mt-2">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="size-4 text-[#087443]" /> Raw Mineral & Composition Feeds
                  </h4>
                  <Button type="button" variant="outline" size="sm" onClick={addAlloyCompRow}>
                    <Plus className="mr-1 size-3.5" /> Add Component
                  </Button>
                </div>

                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto border rounded-lg p-2.5 bg-slate-50/50">
                  {alloyComponents.map((row, index) => (
                    <div key={index} className="flex gap-2 items-center bg-white p-2 border rounded-md shadow-sm">
                      <select 
                        className="h-9 rounded border text-xs px-1 bg-slate-50 w-28" 
                        value={row.type} 
                        onChange={e => updateAlloyCompRow(index, { type: e.target.value as "metal" | "raw", id: "" })}
                      >
                        <option value="metal">Metal / Grade</option>
                        <option value="raw">Raw Mineral</option>
                      </select>

                      <select 
                        className="h-9 rounded border text-xs px-2 flex-1"
                        required
                        value={row.id}
                        onChange={e => updateAlloyCompRow(index, { id: e.target.value })}
                      >
                        <option value="" disabled>Select Feed...</option>
                        {row.type === "metal" 
                          ? grades.map(g => <option key={g.id} value={g.id}>{g.name} ({g.subGrade || "Standard"})</option>)
                          : rawMaterials.map(r => <option key={r.id} value={r.id}>{r.name} ({r.code})</option>)
                        }
                      </select>

                      <div className="flex items-center gap-1 w-20">
                        <Input 
                          type="number" 
                          required 
                          className="h-9 text-xs" 
                          placeholder="%" 
                          value={row.pct || ""} 
                          onChange={e => updateAlloyCompRow(index, { pct: parseFloat(e.target.value) || 0 })} 
                        />
                        <span className="text-xs text-slate-500">%</span>
                      </div>

                      {alloyComponents.length > 1 && (
                        <button type="button" onClick={() => removeAlloyCompRow(index)} className="text-slate-400 hover:text-red-500 p-1">
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* COMPOSITION SUM VALIDATOR */}
                <div className="mt-3 flex items-center justify-between p-3 rounded-lg border bg-slate-50 text-xs">
                  <span className="font-semibold text-slate-700">Total Composition Structure Percentage:</span>
                  <Badge className={`font-mono font-bold py-1 px-2.5 text-xs flex items-center gap-1 border ${
                    alloyCompSum === 100 
                      ? "bg-[#e8fbf0] text-[#087443] border-[#bde4cf]" 
                      : alloyCompSum > 100 
                        ? "bg-red-50 text-red-700 border-red-200 animate-pulse" 
                        : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {alloyCompSum === 100 ? <Check className="size-3.5" /> : <AlertCircle className="size-3.5" />}
                    {alloyCompSum}% {alloyCompSum === 100 ? "(Valid JSW Structure)" : alloyCompSum > 100 ? "(Exceeds 100%)" : "(Incomplete)"}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button type="submit" className="bg-[#087443] text-white hover:bg-[#065a33]" disabled={alloyCompSum !== 100}>
                  Validate & Save Structure
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Existing fallback subpanels
function SuppliersPanel() {
  return <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]"><GridTable columns={["Supplier", "Code", "Linked Price Sheet", "Status"]} rows={[{ name: "JSW Approved Supply Desk", source: "SUP-JSW-01", value: "7 price lines", extra: "Active" }, { name: "Tata Alloy Quotes", source: "SUP-TA-04", value: "CSV ready", extra: "Review" }]} /><Card><CardHeader><CardTitle>Supplier Price Sheets</CardTitle></CardHeader><CardContent className="flex flex-col gap-2 text-sm"><p>Contact details and linked metal prices stay separate from current master prices until Admin activates a price row.</p><Button variant="outline"><Download />CSV Import / Export</Button></CardContent></Card></div>;
}
function UsersPanel() {
  return <div className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]"><GridTable columns={["User", "Email", "Role", "Status"]} rows={[{ name: "Admin User", source: "admin@jsw-mcms.local", value: "Admin", extra: "Active" }, { name: "Rahul Sharma", source: "procurement@jsw-mcms.local", value: "Procurement", extra: "Active" }, { name: "Meera Iyer", source: "finance@jsw-mcms.local", value: "Finance", extra: "Active" }, { name: "Neha Verma", source: "production@jsw-mcms.local", value: "Production", extra: "Active" }]} /><Card><CardHeader><CardTitle>Role Access</CardTitle></CardHeader><CardContent className="flex flex-col gap-2">{["Admin: all modules", "Procurement: costing + supplier visibility", "Finance: review + reports + audit", "Production: costing + comparison"].map((line) => <div key={line} className="rounded-md border p-2 text-sm">{line}</div>)}</CardContent></Card></div>;
}
function SettingsPanel() {
  return <div className="grid gap-4"><Card><CardHeader><CardTitle>Security Settings</CardTitle></CardHeader><CardContent className="grid gap-2 text-sm sm:grid-cols-2"><Box title="JWT Sessions" value="Access + refresh" /><Box title="Password Policy" value="bcrypt + lockout" /><Box title="Helmet" value="Security headers" /><Box title="Rate Limit" value="Login protected" /></CardContent></Card></div>;
}
function GridTable({ rows, columns }: { rows: Array<{ name?: string; source?: string; value?: string; extra?: string }>; columns: string[] }) {
  return <Card><CardContent className="overflow-x-auto p-0"><Table><thead><tr>{columns.map((column) => <TableHead key={column}>{column}</TableHead>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.name}-${index}`}><TableCell className="font-semibold">{row.name}</TableCell><TableCell>{row.source}</TableCell><TableCell>{row.value}</TableCell><TableCell>{row.extra}</TableCell></tr>)}</tbody></Table></CardContent></Card>;
}

interface CalculationReportRow {
  batchId: string;
  name: string;
  mode: string;
  totalQuantity: number;
  finalCost: number;
  status: string;
}

interface DailyReportRow {
  date: string;
  count: number;
  qty: number;
  value: number;
  gst: number;
  total: number;
}

interface MonthlyReportRow {
  month: string;
  count: number;
  qty: number;
  avg: number;
  gross: number;
  total: number;
}

interface ActivityReportRow {
  operator: string;
  action: string;
  entity: string;
  id: string;
  time: string;
}

export function ReportsPage() {
  const [reportType, setReportType] = useState<"calculations" | "daily" | "monthly" | "activity">("calculations");
  const [search, setSearch] = useState("");
  const [timeframe, setTimeframe] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Simulated high-fidelity daily cost runs dataset
  const dailyData = useMemo(() => {
    return [
      { date: "2026-05-27", count: 2, qty: 1500, value: 95000, gst: 17100, total: 112100 },
      { date: "2026-05-26", count: 1, qty: 2000, value: 97200, gst: 17496, total: 114696 },
      { date: "2026-05-25", count: 3, qty: 2250, value: 162110, gst: 29180, total: 191290 },
      { date: "2026-05-24", count: 1, qty: 500, value: 42560, gst: 7661, total: 50221 },
      { date: "2026-05-23", count: 2, qty: 1000, value: 63750, gst: 11475, total: 75225 }
    ];
  }, []);

  // Simulated high-fidelity monthly costing trend report dataset
  const monthlyData = useMemo(() => {
    return [
      { month: "May 2026", count: 9, qty: 7250, avg: 63.5, gross: 460620, total: 543532 },
      { month: "April 2026", count: 6, qty: 5500, avg: 61.2, gross: 336600, total: 397188 },
      { month: "March 2026", count: 8, qty: 6200, avg: 62.8, gross: 389360, total: 459445 }
    ];
  }, []);

  // Simulated high-fidelity operator activity report dataset
  const activityData = useMemo(() => {
    return [
      { operator: "admin@jsw-mcms.local", action: "PRICE_UPDATE", entity: "PriceList", id: "LME-NI-52", time: "2026-05-27 10:15" },
      { operator: "Rahul Sharma", action: "COMPLETE", entity: "Calculation", id: "BATCH-1023", time: "2026-05-27 09:20" },
      { operator: "Meera Iyer", action: "EXPORT_PDF", entity: "Report", id: "monthly-may-26", time: "2026-05-26 16:45" },
      { operator: "Neha Verma", action: "SAVE_DRAFT", entity: "Calculation", id: "BATCH-1027", time: "2026-05-26 14:10" },
      { operator: "Rahul Sharma", action: "COMPLETE", entity: "Calculation", id: "BATCH-1024", time: "2026-05-25 11:30" }
    ];
  }, []);

  // Complex multi-tier search and timeframe filter resolver
  const filteredData = useMemo(() => {
    const searchLower = search.toLowerCase();
    
    if (reportType === "calculations") {
      return calculations.filter((row) => {
        const matchesSearch = row.name.toLowerCase().includes(searchLower) || row.batchId.toLowerCase().includes(searchLower);
        const matchesTime = timeframe === "all" || 
          (timeframe === "today" && row.createdAt?.includes("2026-05-27")) ||
          (timeframe === "7d" && !row.createdAt?.includes("2026-05-23"));
        return matchesSearch && matchesTime;
      });
    } else if (reportType === "daily") {
      return dailyData.filter((row) => {
        const matchesSearch = row.date.includes(searchLower);
        const matchesTime = timeframe === "all" || (timeframe === "today" && row.date === "2026-05-27");
        return matchesSearch && matchesTime;
      });
    } else if (reportType === "monthly") {
      return monthlyData.filter((row) => row.month.toLowerCase().includes(searchLower));
    } else {
      return activityData.filter((row) => {
        const matchesSearch = row.operator.toLowerCase().includes(searchLower) || row.action.toLowerCase().includes(searchLower) || row.entity.toLowerCase().includes(searchLower);
        const matchesTime = timeframe === "all" || 
          (timeframe === "today" && row.time.startsWith("2026-05-27"));
        return matchesSearch && matchesTime;
      });
    }
  }, [reportType, search, timeframe, dailyData, monthlyData, activityData]);

  // Pagination grid indices calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, page, itemsPerPage]);

  // Export handlers
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Enterprise Branding Ribbon
    doc.setFillColor(0, 87, 184); // JSW Corporate Blue
    doc.rect(0, 0, 210, 24, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("JSW METAL COST MANAGEMENT SYSTEM", 14, 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    let titleStr: string;
    let columns: string[];
    let rows: (string | number)[][];
    
    if (reportType === "calculations") {
      titleStr = "Calculation Cost Reports";
      columns = ["Batch", "Calculation Run", "Pivot Mode", "Volume (kg)", "Final Value (INR)", "Status"];
      rows = (filteredData as unknown as CalculationReportRow[]).map(r => [r.batchId, r.name, r.mode.toUpperCase(), `${r.totalQuantity} kg`, inr(r.finalCost), r.status]);
    } else if (reportType === "daily") {
      titleStr = "Daily Calculations Cost Runs Audit";
      columns = ["Date", "Runs", "Volume (kg)", "Gross Value (INR)", "GST (INR)", "Cumulative Value (INR)"];
      rows = (filteredData as unknown as DailyReportRow[]).map(r => [r.date, r.count, `${r.qty} kg`, inr(r.value), inr(r.gst), inr(r.total)]);
    } else if (reportType === "monthly") {
      titleStr = "Monthly Calculations Report Summary";
      columns = ["Month", "Runs", "Volume (kg)", "Avg Rate (INR/kg)", "Gross Value (INR)", "Invoiced Value (INR)"];
      rows = (filteredData as unknown as MonthlyReportRow[]).map(r => [r.month, r.count, `${r.qty} kg`, `${r.avg} INR/kg`, inr(r.gross), inr(r.total)]);
    } else {
      titleStr = "User Operator Activity Audit Report";
      columns = ["Operator", "Action", "Entity", "Affected ID", "Timestamp"];
      rows = (filteredData as unknown as ActivityReportRow[]).map(r => [r.operator, r.action, r.entity, r.id, r.time]);
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    doc.text(titleStr, 14, 38);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated At: ${new Date().toLocaleString()}`, 14, 45);
    doc.text(`Filter Timeframe: ${timeframe.toUpperCase()}`, 14, 50);
    doc.line(14, 54, 196, 54);
    
    // Draw high-density headers
    doc.setFillColor(240, 244, 250);
    doc.rect(14, 60, 182, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    
    const colWidth = 182 / columns.length;
    let xOffset = 16;
    columns.forEach(col => {
      doc.text(col, xOffset, 66.5);
      xOffset += colWidth;
    });
    
    // Draw grid rows
    doc.setFont("helvetica", "normal");
    let yOffset = 78;
    rows.forEach((row, rowIndex) => {
      if (rowIndex % 2 === 1) {
        doc.setFillColor(248, 250, 253);
        doc.rect(14, yOffset - 5, 182, 8, "F");
      }
      
      xOffset = 16;
      columns.forEach((_, colIndex) => {
        const text = String(row[colIndex] ?? "");
        doc.text(text, xOffset, yOffset);
        xOffset += colWidth;
      });
      yOffset += 9;
      
      if (yOffset > 275) {
        doc.addPage();
        yOffset = 25;
      }
    });
    
    doc.save(`jsw_mcms_${reportType}_report.pdf`);
    toast.success("PDF report downloaded successfully!");
  };

  const handleExportExcel = () => {
    let wsData: (string | number)[][];
    let title: string;
    
    if (reportType === "calculations") {
      title = "Calculations_Report";
      wsData = [
        ["Batch ID", "Calculation Run", "Pivot Mode", "Total Qty (kg)", "Final Cost (INR)", "Status"],
        ...(filteredData as unknown as CalculationReportRow[]).map(r => [r.batchId, r.name, r.mode, r.totalQuantity, r.finalCost, r.status])
      ];
    } else if (reportType === "daily") {
      title = "Daily_Report";
      wsData = [
        ["Date", "Runs", "Volume (kg)", "Standard Value (INR)", "GST (INR)", "Total Value (INR)"],
        ...(filteredData as unknown as DailyReportRow[]).map(r => [r.date, r.count, r.qty, r.value, r.gst, r.total])
      ];
    } else if (reportType === "monthly") {
      title = "Monthly_Report";
      wsData = [
        ["Month", "Runs", "Volume (kg)", "Avg Rate (INR/kg)", "Gross Value (INR)", "Invoiced Value (INR)"],
        ...(filteredData as unknown as MonthlyReportRow[]).map(r => [r.month, r.count, r.qty, r.avg, r.gross, r.total])
      ];
    } else {
      title = "User_Activity_Report";
      wsData = [
        ["Operator", "Action", "Entity", "Affected ID", "Timestamp"],
        ...(filteredData as unknown as ActivityReportRow[]).map(r => [r.operator, r.action, r.entity, r.id, r.time])
      ];
    }
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `jsw_mcms_${title.toLowerCase()}.xlsx`);
    toast.success("Excel report downloaded successfully!");
  };

  const handleExportCSV = () => {
    let wsData: (string | number)[][];
    let title: string;
    
    if (reportType === "calculations") {
      title = "Calculations_Report";
      wsData = [
        ["Batch ID", "Calculation Run", "Pivot Mode", "Total Qty (kg)", "Final Cost (INR)", "Status"],
        ...(filteredData as unknown as CalculationReportRow[]).map(r => [r.batchId, r.name, r.mode, r.totalQuantity, r.finalCost, r.status])
      ];
    } else if (reportType === "daily") {
      title = "Daily_Report";
      wsData = [
        ["Date", "Runs", "Volume (kg)", "Standard Value (INR)", "GST (INR)", "Total Value (INR)"],
        ...(filteredData as unknown as DailyReportRow[]).map(r => [r.date, r.count, r.qty, r.value, r.gst, r.total])
      ];
    } else if (reportType === "monthly") {
      title = "Monthly_Report";
      wsData = [
        ["Month", "Runs", "Volume (kg)", "Avg Rate (INR/kg)", "Gross Value (INR)", "Invoiced Value (INR)"],
        ...(filteredData as unknown as MonthlyReportRow[]).map(r => [r.month, r.count, r.qty, r.avg, r.gross, r.total])
      ];
    } else {
      title = "User_Activity_Report";
      wsData = [
        ["Operator", "Action", "Entity", "Affected ID", "Timestamp"],
        ...(filteredData as unknown as ActivityReportRow[]).map(r => [r.operator, r.action, r.entity, r.id, r.time])
      ];
    }
    
    const csvContent = wsData.map((e: (string | number)[]) => e.map((val: string | number) => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `jsw_mcms_${title.toLowerCase()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded successfully!");
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      <PageHead title="Reporting & Analytics" icon={FileBarChart2} />

      {/* KPI stats display */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Box title="Total Calculations" value={`${calculations.length} Cost Runs`} />
        <Box title="Daily Active Runs" value={`${dailyData[0]?.count || 0} Runs Today`} />
        <Box title="Estimated Volume" value="7,250 kg (May)" />
        <Box title="Exports Active" value="PDF, Excel, CSV" />
      </div>

      {/* Primary reporting content grid */}
      <div className="grid gap-5 xl:grid-cols-[0.25fr_1fr]">
        
        {/* Tab options sidepanel selector */}
        <Card className="border-slate-200 bg-white shadow-xs p-3 flex flex-col gap-2 h-fit">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-1">Report Slices</span>
          {[
            { id: "calculations" as const, label: "Calculation Runs" },
            { id: "daily" as const, label: "Daily Cost Runs" },
            { id: "monthly" as const, label: "Monthly Summaries" },
            { id: "activity" as const, label: "User Activity Logs" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setReportType(tab.id);
                setPage(1);
              }}
              className={`w-full py-2.5 px-3.5 text-left text-xs font-bold rounded-xl transition-all ${
                reportType === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </Card>

        {/* Dynamic visual grid actions wrapper */}
        <Card className="border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-800 tracking-tight text-sm uppercase">
                {reportType === "calculations"
                  ? "Costing Calculation Reports"
                  : reportType === "daily"
                  ? "Daily Calculations Audit"
                  : reportType === "monthly"
                  ? "Monthly Calculations Summary"
                  : "Operator Activity Logs"}
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                Generate, search, filter, and export formal reports in PDF or Spreadsheet formats.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                onClick={handleExportPDF}
                disabled={filteredData.length === 0}
              >
                <Download className="h-3.5 w-3.5" /> PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                onClick={handleExportExcel}
                disabled={filteredData.length === 0}
              >
                <Download className="h-3.5 w-3.5" /> Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                onClick={handleExportCSV}
                disabled={filteredData.length === 0}
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
            </div>
          </div>

          {/* Search bar and parameter filters */}
          <div className="grid gap-3 md:grid-cols-3 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Search className="h-3 w-3" /> Search
              </label>
              <Input
                type="text"
                placeholder={
                  reportType === "calculations"
                    ? "Search name or batch..."
                    : reportType === "daily"
                    ? "Search date..."
                    : reportType === "monthly"
                    ? "Search month..."
                    : "Search operator or action..."
                }
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>

            {reportType !== "monthly" && (
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Timeframe
                </label>
                <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200 h-9">
                  {[
                    { id: "all", label: "All Time" },
                    { id: "today", label: "Today" },
                    { id: "7d", label: "Last 7D" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTimeframe(t.id);
                        setPage(1);
                      }}
                      className={`flex-1 text-[9px] font-extrabold rounded-md uppercase tracking-wide transition-all ${
                        timeframe === t.id
                          ? "bg-slate-100 text-blue-600 font-extrabold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Unified Enterprise Table Layout */}
          <div className="overflow-x-auto border border-slate-150 rounded-xl">
            <Table>
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider border-b border-slate-150 text-slate-500">
                  {reportType === "calculations" ? (
                    <>
                      <TableHead className="w-[120px] font-bold text-left">Batch ID</TableHead>
                      <TableHead className="font-bold text-left">Calculation Run</TableHead>
                      <TableHead className="w-[100px] font-bold text-left">Pivot Mode</TableHead>
                      <TableHead className="w-[120px] font-bold text-left">Volume</TableHead>
                      <TableHead className="w-[150px] font-bold text-left">Est Value (INR)</TableHead>
                      <TableHead className="w-[100px] font-bold text-left">Status</TableHead>
                    </>
                  ) : reportType === "daily" ? (
                    <>
                      <TableHead className="font-bold text-left">Date</TableHead>
                      <TableHead className="font-bold text-left">Runs Recorded</TableHead>
                      <TableHead className="font-bold text-left">Volume (kg)</TableHead>
                      <TableHead className="font-bold text-left">Gross Cost (INR)</TableHead>
                      <TableHead className="font-bold text-left">GST Generated</TableHead>
                      <TableHead className="font-bold text-left">Final Cost (INR)</TableHead>
                    </>
                  ) : reportType === "monthly" ? (
                    <>
                      <TableHead className="font-bold text-left">Month</TableHead>
                      <TableHead className="font-bold text-left">Calculations Run</TableHead>
                      <TableHead className="font-bold text-left">Cumulative Volume</TableHead>
                      <TableHead className="font-bold text-left">Avg Rate (INR/kg)</TableHead>
                      <TableHead className="font-bold text-left">Gross Cost (INR)</TableHead>
                      <TableHead className="font-bold text-left">Cumulative Value (INR)</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="font-bold text-left">Operator</TableHead>
                      <TableHead className="font-bold text-left">Action</TableHead>
                      <TableHead className="font-bold text-left">Entity Type</TableHead>
                      <TableHead className="font-bold text-left">Entity Key</TableHead>
                      <TableHead className="font-bold text-left">Timestamp</TableHead>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-400 font-semibold text-xs bg-slate-50/50"
                    >
                      <FileBarChart2 className="h-8 w-8 text-slate-350 mb-2.5 mx-auto animate-pulse" />
                      No matching costing records found inside this timeframe.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, idx) => (
                    <tr
                      key={idx}
                      className="text-xs hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      {reportType === "calculations" ? (
                        (() => {
                          const r = row as unknown as CalculationReportRow;
                          return (
                            <>
                              <TableCell className="font-bold text-slate-700">{r.batchId}</TableCell>
                              <TableCell className="font-extrabold text-slate-800">{r.name}</TableCell>
                              <TableCell className="font-bold text-slate-500 uppercase">{r.mode}</TableCell>
                              <TableCell className="font-bold text-slate-600">{r.totalQuantity} kg</TableCell>
                              <TableCell className="font-black text-blue-600">{inr(r.finalCost)}</TableCell>
                              <TableCell>
                                <Badge
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    r.status === "COMPLETED"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  }`}
                                >
                                  {r.status}
                                </Badge>
                              </TableCell>
                            </>
                          );
                        })()
                      ) : reportType === "daily" ? (
                        (() => {
                          const r = row as unknown as DailyReportRow;
                          return (
                            <>
                              <TableCell className="font-bold text-slate-700">{r.date}</TableCell>
                              <TableCell className="font-bold text-slate-650">{r.count} runs</TableCell>
                              <TableCell className="font-bold text-slate-600">{r.qty.toLocaleString()} kg</TableCell>
                              <TableCell className="font-bold text-slate-700">{inr(r.value)}</TableCell>
                              <TableCell className="font-bold text-slate-700">{inr(r.gst)}</TableCell>
                              <TableCell className="font-black text-blue-600">{inr(r.total)}</TableCell>
                            </>
                          );
                        })()
                      ) : reportType === "monthly" ? (
                        (() => {
                          const r = row as unknown as MonthlyReportRow;
                          return (
                            <>
                              <TableCell className="font-bold text-slate-800">{r.month}</TableCell>
                              <TableCell className="font-bold text-slate-650">{r.count} runs</TableCell>
                              <TableCell className="font-bold text-slate-600">{r.qty.toLocaleString()} kg</TableCell>
                              <TableCell className="font-bold text-slate-700">{r.avg} /kg</TableCell>
                              <TableCell className="font-bold text-slate-700">{inr(r.gross)}</TableCell>
                              <TableCell className="font-black text-[#0057b8]">{inr(r.total)}</TableCell>
                            </>
                          );
                        })()
                      ) : (
                        (() => {
                          const r = row as unknown as ActivityReportRow;
                          return (
                            <>
                              <TableCell className="font-bold text-slate-850 truncate max-w-[150px]">
                                {r.operator}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-slate-100 text-slate-700 border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                  {r.action}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold text-slate-500">{r.entity}</TableCell>
                              <TableCell className="font-bold text-slate-650">{r.id}</TableCell>
                              <TableCell className="font-medium text-slate-400">{r.time}</TableCell>
                            </>
                          );
                        })()
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* Table pagination control row */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500 text-left">
              <span>
                Showing page <strong className="text-slate-800 font-extrabold">{page}</strong> of{" "}
                <strong className="text-slate-800 font-extrabold">{totalPages}</strong> (
                {filteredData.length} records total)
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export function AuditPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // 1. Fetch Audit Logs with filter parameters
  const { data: auditData, isLoading, refetch } = useAuditLogs(page, 10, {
    search: search.trim() || undefined,
    action: action || undefined,
    entity: entity || undefined,
    userId: userId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  });

  // 2. Fetch Users to populate operators select list
  const { data: usersData } = useUsers();
  const operators = (usersData?.data || []) as any[];

  const auditLogsList = (auditData?.data || []) as any[];
  const pagination = auditData?.pagination as { page: number; limit: number; total: number; pages: number } | undefined;
  const totalPages = pagination?.pages || 1;

  // Handle resetting pagination when filters pivot
  const resetPage = () => setPage(1);

  // Common Action Badges Styling
  const getActionBadge = (act: string) => {
    const actUpper = act.toUpperCase();
    if (actUpper.includes("LOGIN_FAILED")) {
      return <Badge className="bg-red-50 text-red-700 border border-red-200 uppercase text-[10px] font-bold">Failed Login</Badge>;
    }
    if (actUpper.includes("LOGIN")) {
      return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase text-[10px] font-bold">Login</Badge>;
    }
    if (actUpper.includes("CREATE")) {
      return <Badge className="bg-blue-50 text-blue-700 border border-blue-200 uppercase text-[10px] font-bold">Create</Badge>;
    }
    if (actUpper.includes("UPDATE")) {
      return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 uppercase text-[10px] font-bold">Update</Badge>;
    }
    if (actUpper.includes("PRICE_UPDATE")) {
      return <Badge className="bg-purple-50 text-purple-700 border border-purple-200 uppercase text-[10px] font-bold">Price Adjust</Badge>;
    }
    if (actUpper.includes("DEACTIVATE") || actUpper.includes("DELETE")) {
      return <Badge className="bg-slate-50 text-slate-700 border border-slate-200 uppercase text-[10px] font-bold">Deactivate</Badge>;
    }
    return <Badge className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold">{act}</Badge>;
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      <PageHead title="Enterprise Security Audit Logs" icon={ShieldAlert} />

      {/* KPI statistics cards block */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Box title="Total Audits Logged" value={pagination ? `${pagination.total} Records` : "Loading..."} />
        <Box title="Active Operators" value={`${operators.length || 4} Profiles`} />
        <Box title="System Status" value="100% Audited" />
        <Box title="Mutations Logged" value="Auto & Manual" />
      </div>

      <div className="grid gap-5">
        <Card className="border-slate-200 bg-white shadow-xs p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="font-extrabold text-slate-800 tracking-tight text-sm uppercase">Audit Log Stream</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                Real-time transaction tracking, user access audits, and metadata capture.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="h-8.5 text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-700">
              <RefreshCw className="mr-1 size-3.5" /> Reload Stream
            </Button>
          </div>

          {/* Search, Date, Filters Block */}
          <div className="grid gap-3 md:grid-cols-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Search */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Search className="h-3 w-3" /> Full Text Search
              </label>
              <Input
                type="text"
                placeholder="Search action, IP, entity ID..."
                value={search}
                onChange={e => { setSearch(e.target.value); resetPage(); }}
                className="h-9 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>

            {/* Operator Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operator User</label>
              <select
                className="h-9 rounded-lg border bg-white px-2.5 text-xs text-slate-700"
                value={userId}
                onChange={e => { setUserId(e.target.value); resetPage(); }}
              >
                <option value="">All Operators</option>
                {operators.map((op: any) => (
                  <option key={op.id} value={op.id}>{op.name} ({op.email})</option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Action Class</label>
              <select
                className="h-9 rounded-lg border bg-white px-2.5 text-xs text-slate-700"
                value={action}
                onChange={e => { setAction(e.target.value); resetPage(); }}
              >
                <option value="">All Actions</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGIN_FAILED">LOGIN_FAILED</option>
                <option value="CREATE_AUTO">CREATE_AUTO</option>
                <option value="UPDATE_AUTO">UPDATE_AUTO</option>
                <option value="DEACTIVATE_AUTO">DEACTIVATE_AUTO</option>
                <option value="PRICE_UPDATE_AUTO">PRICE_UPDATE_AUTO</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DEACTIVATE">DEACTIVATE</option>
                <option value="PRICE_UPDATE">PRICE_UPDATE</option>
                <option value="EXPORT_PDF">EXPORT_PDF</option>
                <option value="EXPORT_EXCEL">EXPORT_EXCEL</option>
                <option value="EXPORT_CSV">EXPORT_CSV</option>
              </select>
            </div>

            {/* Entity Type Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Entity Scope</label>
              <select
                className="h-9 rounded-lg border bg-white px-2.5 text-xs text-slate-700"
                value={entity}
                onChange={e => { setEntity(e.target.value); resetPage(); }}
              >
                <option value="">All Entities</option>
                <option value="Authentication">Authentication</option>
                <option value="Metal">Metal</option>
                <option value="Grade">Grade</option>
                <option value="Alloy">Alloy</option>
                <option value="Calculation">Calculation</option>
                <option value="PriceList">PriceList</option>
                <option value="GstSlab">GstSlab</option>
                <option value="SystemSetting">SystemSetting</option>
                <option value="User">User</option>
                <option value="Report">Report</option>
              </select>
            </div>

            {/* Timeframe Calendars */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Timeframe Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={e => { setStartDate(e.target.value); resetPage(); }}
                className="h-9 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Timeframe End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={e => { setEndDate(e.target.value); resetPage(); }}
                className="h-9 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto border border-slate-150 rounded-xl">
            <Table>
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider border-b border-slate-150 text-slate-500">
                  <TableHead className="font-bold text-left">Operator User</TableHead>
                  <TableHead className="font-bold text-left">Action Trigger</TableHead>
                  <TableHead className="font-bold text-left">Target Entity</TableHead>
                  <TableHead className="font-bold text-left">Entity ID / Key</TableHead>
                  <TableHead className="font-bold text-left">Client IP</TableHead>
                  <TableHead className="font-bold text-left">Timestamp</TableHead>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs bg-slate-50/50">
                      <RefreshCw className="h-7 w-7 text-slate-350 mb-2 mx-auto animate-spin" />
                      Streaming audit logs from database...
                    </td>
                  </tr>
                ) : auditLogsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs bg-slate-50/50">
                      <ShieldAlert className="h-8 w-8 text-slate-300 mb-2.5 mx-auto animate-pulse" />
                      No matching audit log records found inside this timeframe.
                    </td>
                  </tr>
                ) : (
                  auditLogsList.map((log, idx) => (
                    <tr
                      key={log.id || idx}
                      onClick={() => setSelectedLog(log)}
                      className="text-xs hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer"
                    >
                      <TableCell className="font-bold text-slate-800">
                        {log.user ? (
                          <div>
                            <p className="font-bold text-slate-800">{log.user.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{log.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">System Auto</span>
                        )}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="font-semibold text-slate-500 uppercase">{log.entity}</TableCell>
                      <TableCell className="font-mono text-[11px] text-slate-600 max-w-[120px] truncate" title={log.entityId || "N/A"}>
                        {log.entityId || "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-slate-500">{log.ipAddress || "Internal"}</TableCell>
                      <TableCell className="font-medium text-slate-400">
                        {new Date(log.createdAt).toLocaleString("en-IN", { hour12: true })}
                      </TableCell>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
              <span>
                Showing page <strong className="text-slate-800 font-extrabold">{page}</strong> of{" "}
                <strong className="text-slate-800 font-extrabold">{totalPages}</strong> (
                {pagination?.total || 0} records total)
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* RAW JSON DETAILS INSPECTOR MODAL POPUP */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-2xl rounded-xl bg-white border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <header className="bg-[#032f67] p-4 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase flex items-center gap-2"><ShieldAlert className="size-4" /> Audit Metadata Inspector</h3>
              <button onClick={() => setSelectedLog(null)} className="text-white hover:text-slate-200 font-extrabold text-sm px-2 py-1">✕</button>
            </header>
            <div className="p-5 flex flex-col gap-4 text-xs text-left max-h-[80vh] overflow-y-auto">
              <div className="grid gap-3 sm:grid-cols-2 bg-slate-50 p-3 rounded-lg border">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[9px]">Triggered Path</p>
                  <p className="font-mono text-slate-800 mt-0.5">[{selectedLog.details?.method || "WRITE"}] {selectedLog.details?.path || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[9px]">HTTP Status Code</p>
                  <p className="font-bold text-emerald-600 mt-0.5">{selectedLog.details?.statusCode || "200 SUCCESS"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[9px]">Target Resource Entity</p>
                  <p className="font-bold text-slate-700 mt-0.5">{selectedLog.entity} (ID: {selectedLog.entityId || "N/A"})</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[9px]">Network IP Address</p>
                  <p className="font-mono text-slate-700 mt-0.5">{selectedLog.ipAddress || "Internal Loop"}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-400 font-semibold uppercase text-[9px] mb-1.5">Action JSON Payload details</p>
                <pre className="bg-slate-900 text-emerald-400 rounded-xl p-4 overflow-auto max-h-[300px] text-xs font-mono border shadow-inner leading-relaxed">
                  {JSON.stringify(selectedLog.details?.payload || selectedLog.details || {}, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-1">
                <Button type="button" onClick={() => setSelectedLog(null)} className="bg-[#032f67] text-white">Close Details</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
