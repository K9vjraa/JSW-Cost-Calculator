import { 
  Bell, 
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
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableHead } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CostBars } from "@/components/Charts";
import { 
  adminDashboard, 
  calculations, 
  grades as gradesFixture, 
  metals as metalsFixture, 
  notices, 
  rawMaterials as rawMaterialsFixture 
} from "@/data/fixtures";
import { shortDate, inr } from "@/utils";
import { api, getOrFixture } from "@/services/api";

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
    refreshData();
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

export function ReportsPage() {
  return <div className="flex flex-col gap-4"><PageHead title="Reports & Export" icon={FileBarChart2} /><div className="grid gap-3 md:grid-cols-4"><Box title="Cost Reports" value="Daily / Monthly" /><Box title="Trend Reports" value="Price + usage" /><Box title="Comparison Reports" value="Grade decisions" /><Box title="Exports" value="PDF + Excel" /></div><div className="grid gap-4 xl:grid-cols-[1fr_1fr]"><Card><CardHeader><CardTitle>Monthly Cost Trend</CardTitle></CardHeader><CardContent><CostBars points={adminDashboard.series} /></CardContent></Card><Card><CardHeader><CardTitle>Report Actions</CardTitle></CardHeader><CardContent className="flex flex-col gap-2">{["Cost Summary by Alloy", "Monthly Calculation Trend", "Comparison Report"].map((title) => <div key={title} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"><strong className="text-sm">{title}</strong><span className="flex gap-2"><a className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-semibold" href="http://localhost:4000/api/exports/calculations/calc-1023/pdf">PDF</a><Button variant="outline" size="sm" onClick={() => toast.success("Excel export uses the report API with auth.")}>Excel</Button></span></div>)}</CardContent></Card></div><ReportTable /></div>;
}
function ReportTable() {
  return <Card><CardHeader><CardTitle>Calculation Report</CardTitle></CardHeader><CardContent className="overflow-x-auto p-0"><Table><thead><tr><TableHead>Batch</TableHead><TableHead>Name</TableHead><TableHead>Qty</TableHead><TableHead>Total Cost</TableHead></tr></thead><tbody>{calculations.map((row) => <tr key={row.id}><TableCell>{row.batchId}</TableCell><TableCell className="font-semibold">{row.name}</TableCell><TableCell>{row.totalQuantity} kg</TableCell><TableCell>{inr(row.finalCost)}</TableCell></tr>)}</tbody></Table></CardContent></Card>;
}
export function AuditPage() {
  return <div className="flex flex-col gap-4"><PageHead title="Audit Logs & Live Alerts" icon={ShieldAlert} /><div className="grid gap-3 md:grid-cols-4"><Box title="Price Changes" value="100% logged" /><Box title="Login Activity" value="Lockout after 5" /><Box title="Notifications" value="In-app live" /><Box title="Exports" value="Audited" /></div><div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]"><GridTable columns={["Entity", "Action", "User", "Time"]} rows={[{ name: "Nickel price", source: "PRICE_UPDATE", value: "Admin", extra: "10:15 AM" }, { name: "BATCH-1023", source: "COMPLETE", value: "Rahul Sharma", extra: "09:20 AM" }, { name: "Cost Report", source: "EXPORT_PDF", value: "Meera Iyer", extra: "Yesterday" }]} /><Card><CardHeader><CardTitle>Notification Center</CardTitle></CardHeader><CardContent className="flex flex-col gap-2">{notices.map((notice) => <div key={notice.id} className="rounded-md border p-3"><div className="flex items-center gap-2"><Bell className="size-4 text-[var(--primary)]" /><strong className="text-sm">{notice.title}</strong></div><p className="mt-1 text-xs text-[var(--muted-foreground)]">{notice.message}</p></div>)}</CardContent></Card></div></div>;
}
