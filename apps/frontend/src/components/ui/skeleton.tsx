import { cn } from "@/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-sm bg-[#dce7f5]", className)} />;
}
