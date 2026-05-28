export * from "@jsw-mcms/utils";

export function shortDate(value: string | Date) {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
