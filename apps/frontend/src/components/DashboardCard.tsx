import { type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardCardProps {
  title: string;
  description?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  loading?: boolean;
  className?: string;
}

export function DashboardCard({
  title,
  description,
  headerAction,
  children,
  loading = false,
  className = "",
}: DashboardCardProps) {
  return (
    <Card className={`border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full ${className}`}>
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-5 flex flex-row items-center justify-between gap-4">
        <div className="space-y-0.5">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-[10px] font-semibold text-slate-400">
              {description}
            </CardDescription>
          )}
        </div>
        {headerAction && <div className="flex items-center">{headerAction}</div>}
      </CardHeader>
      
      <CardContent className="p-5 flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col gap-3 py-2">
            <Skeleton className="h-4 w-2/3 rounded-lg" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
