import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility helper merging multiple Tailwind CSS dynamic classes safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Standard utility formatting values to Indian Rupee (INR) currency style.
 */
export function inr(val: string | number) {
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "₹ 0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(num);
}
