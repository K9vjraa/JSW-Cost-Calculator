export * from "./comparison.js";
export type RoleName = "COSTING_DEPARTMENT" | "PDQC";

export type Actor = {
  id: string;
  email: string;
  name: string;
  role: RoleName;
  department?: "COSTING" | "PDQC";
};

export type Price = { 
  id: string; 
  pricePerUnit: string; 
  source: string; 
  effectiveFrom: string; 
};

export type Metal = { 
  id: string; 
  name: string; 
  code: string; 
  category: string; 
  unit: string; 
  prices: Price[]; 
  grades: Grade[]; 
};

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

export type GradeMaster = {
  id: string;
  code: string | null;
  metalId: string;
  name: string;
  category: string | null;
  steelType: string | null;
  subGrade: string | null;
  targetBatchQty: number | null;
  description: string | null;
  multiplier: number;
  extraPrice: number;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "ACTIVE" | "INACTIVE";
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type GradeMaterial = {
  id: string;
  gradeId: string;
  materialId: string;
  compositionPercent: number;
  autoQuantity: number | null;
  sortOrder: number;
  material?: RawMaterial;
};

export type RawMaterial = { 
  id: string; 
  rawMatId: number;
  name: string;
  code: string;
  category: string;
  unit: string;
  supplier: string | null;
  alloyName: string;
  alloyDescription: string | null;
  isAvail: boolean;
  isMicro: boolean;
  currentRate: number;
  prices?: Price[];
  updatedBy?: { name: string };
  updatedById?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type Alloy = { 
  id: string; 
  name: string; 
  code: string; 
  type: string; 
  updatedAt: string; 
  components?: unknown[]; 
};

export type Notice = { 
  id: string; 
  title: string; 
  message: string; 
  category: string; 
  priority?: string; 
  createdAt: string; 
  readAt?: string | null; 
};

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
  snapshot?: any;
};

export type SeriesPoint = { 
  label: string; 
  count: number; 
  cost: number; 
};

export type AdminDashboardData = {
  kpis: { 
    calculations: number; 
    alloys: number; 
    rawMaterials: number; 
    activeUsers: number; 
    metals: number; 
    estimatedValue: number; 
  };
  series: SeriesPoint[];
  topAlloys: { name: string; value: number }[];
  statuses: { name: string; value: number }[];
  recent: Calculation[];
  activity: { 
    id: string; 
    action: string; 
    entity: string; 
    createdAt: string; 
    user?: { name: string }; 
  }[];
  notices: Notice[];
  systemSummary: { 
    roles: number; 
    gstSlabs: number; 
    priceLists: number; 
    reports: number; 
  };
};

export type UserDashboardData = {
  kpis: { 
    calculations: number; 
    savedAlloys: number; 
    estimatedValue: number; 
    recentActivity: number; 
  };
  series: SeriesPoint[];
  recent: Calculation[];
  notices: Notice[];
  saved: Alloy[];
};

export type Breakdown = {
  items: Array<{ 
    id: string; 
    name: string; 
    quantity: string; 
    unitPrice: string; 
    gradeMultiplier: string; 
    extraPrice: string; 
    baseCost: string; 
    gradeName?: string; 
  }>;
  totalQuantity: string;
  baseCost: string;
  finalCost: string;
};
