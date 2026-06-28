import {
  Boxes,
  Calculator,
  ClipboardList,
  FileBarChart2,
  GitCompareArrows,
  Settings,
  ShieldCheck,
  Users,
  Layers,
  IndianRupee,
  FileSpreadsheet,
  GitCompare,
  Zap,
  Activity,
  Layers3,
  PackagePlus,
  type LucideIcon
} from "lucide-react";

export type DepartmentName = "COSTING" | "PDQC";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const navigationConfig: Record<DepartmentName, NavItem[]> = {
  COSTING: [
    { to: "/dashboard", label: "Dashboard", icon: FileBarChart2 },
    { to: "/material-rates", label: "Material Rates", icon: IndianRupee },
    { to: "/grade-builder", label: "Grade Management", icon: Layers },
    { to: "/material-master", label: "Price Master", icon: Boxes },
    { to: "/reports", label: "Reports", icon: ClipboardList },
    { to: "/user-management", label: "User Management", icon: Users },
    { to: "/audit-logs", label: "Audit Logs", icon: ShieldCheck },
    { to: "/settings", label: "System Settings", icon: Settings },
  ],
  PDQC: [
    { to: "/dashboard", label: "Dashboard", icon: FileBarChart2 },
    { to: "/workspace", label: "Calculation Workspace", icon: Calculator },
    { to: "/grade-builder", label: "Grade Builder", icon: Layers },
    { to: "/grade-comparison", label: "Comparison Module", icon: GitCompareArrows },
    { to: "/material-rates", label: "Material Rates", icon: IndianRupee },
    { to: "/reports", label: "Reports", icon: ClipboardList },
    { to: "/reports?tab=exports", label: "Exports", icon: FileSpreadsheet },
    { to: "/grade-comparison?tab=analysis", label: "Material Analysis", icon: Activity },
  ]
};

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  to: string;
  variant?: "default" | "secondary" | "outline";
}

export const quickActionsConfig: Record<DepartmentName, QuickAction[]> = {
  COSTING: [
    { label: "Add User", icon: Users, to: "/user-management", variant: "default" },
    { label: "Add Material", icon: PackagePlus, to: "/material-master", variant: "secondary" },
    { label: "Update Price", icon: Zap, to: "/material-rates", variant: "outline" },
    { label: "Generate Report", icon: FileSpreadsheet, to: "/reports", variant: "outline" },
  ],
  PDQC: [
    { label: "New Calculation", icon: Calculator, to: "/workspace", variant: "default" },
    { label: "Create Grade", icon: Layers3, to: "/grade-builder", variant: "secondary" },
    { label: "Compare Grades", icon: GitCompare, to: "/grade-comparison", variant: "outline" },
    { label: "Export Report", icon: FileSpreadsheet, to: "/reports", variant: "outline" },
  ]
};
