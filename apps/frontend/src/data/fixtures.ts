import type { AdminDashboardData, Alloy, Calculation, Grade, Metal, Notice, RawMaterial, UserDashboardData } from "@/types";

const day = (offset: number) => new Date(Date.now() - offset * 86400000).toISOString();
const props = {
  ss304: {
    mechanicalProperties: { "UTS": "515 MPa", "Yield strength": "205 MPa", "Elongation": "45%" },
    toleranceProperties: { "Thickness": "+/- 0.10 mm", "Flatness": "Standard" },
    bendProperties: { "Minimum radius": "2.0T", "Rating": "Good" },
    chemicalComposition: { "Cr": "18.0%", "Ni": "8.0%", "C": "0.08%" }
  },
  ss316: {
    mechanicalProperties: { "UTS": "580 MPa", "Yield strength": "290 MPa", "Elongation": "40%" },
    toleranceProperties: { "Thickness": "+/- 0.08 mm", "Flatness": "Tight" },
    bendProperties: { "Minimum radius": "2.2T", "Rating": "Good" },
    chemicalComposition: { "Cr": "16.0%", "Ni": "10.0%", "Mo": "2.0%" }
  },
  alloy: {
    mechanicalProperties: { "UTS": "700 MPa", "Yield strength": "420 MPa", "Elongation": "25%" },
    toleranceProperties: { "Thickness": "+/- 0.12 mm", "Flatness": "Standard" },
    bendProperties: { "Minimum radius": "1.8T", "Rating": "Excellent" },
    chemicalComposition: { "C": "0.20%", "Mn": "1.20%", "Cr": "1.00%" }
  }
};

export const grades: Grade[] = [
  { id: "grade-304", name: "SS304", metalId: "metal-ss", multiplier: "1.02", extraPrice: "0", metal: { name: "Stainless Steel", category: "Ferrous", prices: [] }, ...props.ss304 },
  { id: "grade-316", name: "SS316", metalId: "metal-ss", multiplier: "1.08", extraPrice: "2.5", metal: { name: "Stainless Steel", category: "Ferrous", prices: [] }, ...props.ss316 },
  { id: "grade-as", name: "Alloy Steel", metalId: "metal-as", multiplier: "1.12", extraPrice: "4", metal: { name: "Alloy Steel", category: "Carbon Steel", prices: [] }, ...props.alloy }
];
export const metals: Metal[] = [
  { id: "metal-ss", name: "Stainless Steel", code: "MTL-SS", category: "Ferrous", unit: "kg", prices: [{ id: "p-ss", pricePerUnit: "62.50", source: "Price master", effectiveFrom: day(12) }], grades: grades.slice(0, 2) },
  { id: "metal-as", name: "Alloy Steel", code: "MTL-AS", category: "Alloy", unit: "kg", prices: [{ id: "p-as", pricePerUnit: "72.00", source: "Price master", effectiveFrom: day(12) }], grades: [grades[2]] },
  { id: "metal-fe", name: "Iron", code: "MTL-FE", category: "Ferrous", unit: "kg", prices: [{ id: "p-fe", pricePerUnit: "80.00", source: "Price master", effectiveFrom: day(12) }], grades: [{ ...grades[2], id: "grade-fe", name: "Fe Feed", metalId: "metal-fe" }] }
];
export const rawMaterials: RawMaterial[] = [
  { id: "rm-fe", name: "Iron Pellets", code: "RM-FE", prices: [{ id: "r-p-fe", pricePerUnit: "80", source: "Price master", effectiveFrom: day(12) }] },
  { id: "rm-ni", name: "Nickel", code: "RM-NI", prices: [{ id: "r-p-ni", pricePerUnit: "850", source: "Price master", effectiveFrom: day(12) }] },
  { id: "rm-cr", name: "Chromium", code: "RM-CR", prices: [{ id: "r-p-cr", pricePerUnit: "650", source: "Price master", effectiveFrom: day(12) }] }
];
export const alloys: Alloy[] = [
  { id: "alloy-304", name: "SS304 Batch Alloy", code: "ALY-304", type: "Stainless Steel", updatedAt: day(0) },
  { id: "alloy-316", name: "SS316 Alloy", code: "ALY-316", type: "Stainless Steel", updatedAt: day(2) },
  { id: "alloy-carbon", name: "Carbon Steel Blend", code: "ALY-CS", type: "Carbon Steel", updatedAt: day(3) },
  { id: "alloy-tool", name: "Tool Steel Mix", code: "ALY-TS", type: "Tool Steel", updatedAt: day(4) }
];
export const notices: Notice[] = [
  { id: "n1", title: "Calculation BATCH-1023 completed", message: "The latest cost report is ready.", category: "CALCULATION", priority: "MEDIUM", createdAt: day(0) },
  { id: "n2", title: "Nickel price updated", message: "Price master locked the new nickel rate.", category: "PRICE", priority: "HIGH", createdAt: day(0) },
  { id: "n3", title: "GST charges checked", message: "Default GST remains 18 percent.", category: "CHARGES", priority: "LOW", createdAt: day(1) }
];
export const calculations: Calculation[] = [
  { id: "calc-1023", batchId: "BATCH-1023", name: "SS304 Cost Run", mode: "alloy", status: "COMPLETED", totalQuantity: "1000", finalCost: "78507.96", baseCost: "63750", gstAmount: "11962.96", updatedAt: day(0), createdAt: day(0), alloy: alloys[0], user: { name: "Rahul Sharma" } },
  { id: "calc-1022", batchId: "BATCH-1022", name: "SS316 Draft", mode: "metal", status: "DRAFT", totalQuantity: "1500", finalCost: "88450", updatedAt: day(1), createdAt: day(1), alloy: alloys[1], user: { name: " नेहा Verma" } },
  { id: "calc-1021", batchId: "BATCH-1021", name: "Alloy Steel Run", mode: "raw-material", status: "COMPLETED", totalQuantity: "1200", finalCost: "74200", updatedAt: day(2), createdAt: day(2), alloy: alloys[2], user: { name: "Rahul Sharma" } },
  { id: "calc-1020", batchId: "BATCH-1020", name: "Carbon Estimate", mode: "metal", status: "COMPLETED", totalQuantity: "800", finalCost: "41860", updatedAt: day(3), createdAt: day(3), alloy: alloys[3], user: { name: "Meera Iyer" } }
];
const series = [
  { label: "Mon", count: 8, cost: 62000 }, { label: "Tue", count: 14, cost: 88450 }, { label: "Wed", count: 11, cost: 74200 },
  { label: "Thu", count: 18, cost: 102000 }, { label: "Fri", count: 24, cost: 128400 }, { label: "Sat", count: 16, cost: 76500 }, { label: "Sun", count: 12, cost: 62560 }
];
export const adminDashboard: AdminDashboardData = {
  kpis: { calculations: 1248, alloys: 156, rawMaterials: 342, activeUsers: 24, metals: 28, estimatedValue: 6256000 },
  series,
  topAlloys: [{ name: "SS304", value: 42 }, { name: "SS316", value: 28 }, { name: "Alloy Steel", value: 18 }, { name: "Carbon Steel", value: 12 }],
  statuses: [{ name: "Completed", value: 82 }, { name: "Draft", value: 12 }, { name: "Cancelled", value: 4 }, { name: "In Progress", value: 2 }],
  recent: calculations,
  activity: [{ id: "a1", action: "PRICE_UPDATE", entity: "Nickel", createdAt: day(0), user: { name: "Admin" } }, { id: "a2", action: "CREATE", entity: "Grade SS309", createdAt: day(0), user: { name: "Admin" } }],
  notices,
  systemSummary: { roles: 4, gstSlabs: 1, priceLists: 7, reports: 12 }
};
export const userDashboard: UserDashboardData = {
  kpis: { calculations: 128, savedAlloys: 45, estimatedValue: 1862560, recentActivity: 12 },
  series,
  recent: calculations.slice(0, 3),
  notices,
  saved: alloys
};
