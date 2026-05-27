export type RoleName = "ADMIN" | "EMPLOYEE" | "USER";

export type Actor = {
  id: string;
  email: string;
  name: string;
  role: RoleName;
  department?: string;
};

export type Price = { id: string; pricePerUnit: string; source: string; effectiveFrom: string };
export type Metal = { id: string; name: string; code: string; category: string; unit: string; prices: Price[]; grades: Grade[] };
export type Grade = {
  id: string;
  name: string;
  metalId: string;
  metal?: { name: string; category: string; prices?: Price[] };
  multiplier: string;
  extraPrice: string;
  mechanicalProperties: Record<string, string>;
  toleranceProperties: Record<string, string>;
  bendProperties: Record<string, string>;
  chemicalComposition: Record<string, string>;
};
export type RawMaterial = { id: string; name: string; code: string; prices: Price[] };
export type Alloy = { id: string; name: string; code: string; type: string; updatedAt: string; components?: unknown[] };
export type Notice = { id: string; title: string; message: string; category: string; priority?: string; createdAt: string; readAt?: string | null };
export type Calculation = {
  id: string;
  batchId: string;
  name: string;
  mode: string;
  status: string;
  totalQuantity: string;
  finalCost: string;
  baseCost?: string;
  gstAmount?: string;
  updatedAt: string;
  createdAt: string;
  alloy?: Alloy | null;
  user?: { name: string };
};
export type SeriesPoint = { label: string; count: number; cost: number };
export type AdminDashboardData = {
  kpis: { calculations: number; alloys: number; rawMaterials: number; activeUsers: number; metals: number; estimatedValue: number };
  series: SeriesPoint[];
  topAlloys: { name: string; value: number }[];
  statuses: { name: string; value: number }[];
  recent: Calculation[];
  activity: { id: string; action: string; entity: string; createdAt: string; user?: { name: string } }[];
  notices: Notice[];
  systemSummary: { roles: number; gstSlabs: number; priceLists: number; reports: number };
};
export type UserDashboardData = {
  kpis: { calculations: number; savedAlloys: number; estimatedValue: number; recentActivity: number };
  series: SeriesPoint[];
  recent: Calculation[];
  notices: Notice[];
  saved: Alloy[];
};
export type Breakdown = {
  items: Array<{ id: string; name: string; quantity: string; unitPrice: string; gradeMultiplier: string; extraPrice: string; baseCost: string; gradeName?: string }>;
  totalQuantity: string;
  baseCost: string;
  finalCost: string;
};
