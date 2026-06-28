import type { Grade as BaseGrade, GradeMaterial } from "@jsw-mcms/types";

export * from "@jsw-mcms/types";
export type { SummaryItem } from "../components/LiveSummaryPanel";

export interface Grade extends Omit<BaseGrade, "multiplier" | "extraPrice"> {
  code?: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "ACTIVE" | "INACTIVE";
  version: number;
  multiplier: number;
  extraPrice: number;
  gradeMaterials?: GradeMaterial[];
  createdAt?: string;
  updatedAt?: string;
}
