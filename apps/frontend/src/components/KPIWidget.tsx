import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KPIWidgetProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  color?: "blue" | "emerald" | "amber" | "indigo" | "rose";
}

export function KPIWidget({
  label,
  value,
  icon: Icon,
  trend,
  trendType = "neutral",
  color = "blue",
}: KPIWidgetProps) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50/50 hover:bg-blue-50/80",
      iconBg: "bg-blue-100 text-blue-600",
      accent: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-100",
    },
    emerald: {
      bg: "bg-emerald-50/50 hover:bg-emerald-50/80",
      iconBg: "bg-emerald-100 text-emerald-600",
      accent: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-100",
    },
    amber: {
      bg: "bg-amber-50/50 hover:bg-amber-50/80",
      iconBg: "bg-amber-100 text-amber-600",
      accent: "from-amber-500 to-amber-600",
      shadow: "shadow-amber-100",
    },
    indigo: {
      bg: "bg-indigo-50/50 hover:bg-indigo-50/80",
      iconBg: "bg-indigo-100 text-indigo-600",
      accent: "from-indigo-500 to-indigo-600",
      shadow: "shadow-indigo-100",
    },
    rose: {
      bg: "bg-rose-50/50 hover:bg-rose-50/80",
      iconBg: "bg-rose-100 text-rose-600",
      accent: "from-rose-500 to-rose-600",
      shadow: "shadow-rose-100",
    },
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <Card className={`relative overflow-hidden border-slate-200 bg-white transition-all duration-300 hover:shadow-md hover:border-slate-300 ${selectedColor.shadow}`}>
      {/* Sleek Gradient Side Tag */}
      <div className={`absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b ${selectedColor.accent}`} />
      
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
          </span>
          <strong className="block text-2xl font-black text-slate-800 tracking-tight">
            {value}
          </strong>
          
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <Badge
                className={`text-[9px] font-bold border-none px-1.5 py-0.5 rounded ${
                  trendType === "up"
                    ? "bg-emerald-50 text-emerald-700"
                    : trendType === "down"
                    ? "bg-rose-50 text-rose-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {trend}
              </Badge>
            </div>
          )}
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${selectedColor.iconBg} shadow-inner`}>
          <Icon className="h-5.5 w-5.5" />
        </div>
      </CardContent>
    </Card>
  );
}
