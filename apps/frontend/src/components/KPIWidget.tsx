import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPIWidgetProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  color?: "blue" | "emerald" | "amber" | "indigo" | "rose" | "violet" | "sky" | "slate";
  sparklineData?: number[];
  onClick?: () => void;
}

export function KPIWidget({
  label,
  value,
  icon: Icon,
  trend,
  trendType = "neutral",
  color = "blue",
  sparklineData,
  onClick,
}: KPIWidgetProps) {
  const colorMap: Record<string, { bg: string; iconBg: string; accentStyle: string; shadow: string; sparkColor: string }> = {
    blue: {
      bg: "bg-white hover:bg-[#f8fbff]",
      iconBg: "bg-[#e6f0fb] text-[#005BAC]",
      accentStyle: "linear-gradient(to bottom, #005BAC, #003d7a)",
      shadow: "hover:shadow-[0_8px_24px_rgba(0,91,172,0.12)]",
      sparkColor: "#005BAC",
    },
    emerald: {
      bg: "bg-white hover:bg-emerald-50/60",
      iconBg: "bg-emerald-100 text-emerald-700",
      accentStyle: "linear-gradient(to bottom, #059669, #047857)",
      shadow: "hover:shadow-[0_8px_24px_rgba(5,150,105,0.12)]",
      sparkColor: "#059669",
    },
    amber: {
      bg: "bg-white hover:bg-amber-50/60",
      iconBg: "bg-amber-100 text-amber-700",
      accentStyle: "linear-gradient(to bottom, #d97706, #b45309)",
      shadow: "hover:shadow-[0_8px_24px_rgba(217,119,6,0.12)]",
      sparkColor: "#d97706",
    },
    indigo: {
      bg: "bg-white hover:bg-indigo-50/60",
      iconBg: "bg-indigo-100 text-indigo-700",
      accentStyle: "linear-gradient(to bottom, #4f46e5, #4338ca)",
      shadow: "hover:shadow-[0_8px_24px_rgba(79,70,229,0.12)]",
      sparkColor: "#4f46e5",
    },
    rose: {
      bg: "bg-white hover:bg-rose-50/60",
      iconBg: "bg-rose-100 text-rose-700",
      accentStyle: "linear-gradient(to bottom, #e11d48, #be123c)",
      shadow: "hover:shadow-[0_8px_24px_rgba(225,29,72,0.12)]",
      sparkColor: "#e11d48",
    },
    violet: {
      bg: "bg-white hover:bg-violet-50/60",
      iconBg: "bg-violet-100 text-violet-700",
      accentStyle: "linear-gradient(to bottom, #7c3aed, #6d28d9)",
      shadow: "hover:shadow-[0_8px_24px_rgba(124,58,237,0.12)]",
      sparkColor: "#7c3aed",
    },
    sky: {
      bg: "bg-white hover:bg-sky-50/60",
      iconBg: "bg-sky-100 text-sky-700",
      accentStyle: "linear-gradient(to bottom, #0284c7, #0369a1)",
      shadow: "hover:shadow-[0_8px_24px_rgba(2,132,199,0.12)]",
      sparkColor: "#0284c7",
    },
    slate: {
      bg: "bg-white hover:bg-slate-50/80",
      iconBg: "bg-slate-100 text-slate-600",
      accentStyle: "linear-gradient(to bottom, #475569, #334155)",
      shadow: "hover:shadow-[0_8px_24px_rgba(71,85,105,0.10)]",
      sparkColor: "#475569",
    },
  };

  const c = colorMap[color] ?? colorMap.blue;
  const TrendIcon = trendType === "up" ? TrendingUp : trendType === "down" ? TrendingDown : Minus;
  const trendStyle =
    trendType === "up"
      ? { bg: "bg-emerald-50", text: "text-emerald-700" }
      : trendType === "down"
      ? { bg: "bg-rose-50", text: "text-rose-600" }
      : { bg: "bg-slate-100", text: "text-slate-500" };

  const isClickable = typeof onClick === "function";

  return (
    <Card
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") onClick!(); } : undefined}
      className={[
        "relative overflow-hidden border border-[#e5e7eb] h-[134px] flex flex-col",
        "transition-all duration-200",
        c.bg, c.shadow,
        "hover:-translate-y-0.5 hover:border-slate-300",
        isClickable ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005BAC] focus-visible:ring-offset-1" : "",
      ].join(" ")}
    >
      <div className="absolute top-0 bottom-0 left-0 w-[3px]" style={{ background: c.accentStyle }} />
      <CardContent className="p-4 pl-5 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between w-full">
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-0.5 leading-tight pr-2">
            {label}
          </span>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${c.iconBg}`}>
            <Icon style={{ width: "18px", height: "18px" }} />
          </div>
        </div>
        <div className="flex items-end justify-between w-full mt-auto">
          <div className="flex flex-col gap-1.5">
            <strong className="block text-2xl font-black text-slate-900 tracking-tighter leading-none">
              {value}
            </strong>
            {trend && (
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded w-fit ${trendStyle.bg}`}>
                <TrendIcon style={{ width: "10px", height: "10px" }} className={trendStyle.text} />
                <span className={`text-[9px] font-bold ${trendStyle.text}`}>{trend}</span>
              </div>
            )}
          </div>
          {sparklineData && sparklineData.length > 1 && (
            <div className="h-9 w-24 opacity-75 mb-0.5">
              <svg viewBox="0 0 100 24" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <path
                  d={(() => {
                    const min = Math.min(...sparklineData);
                    const max = Math.max(...sparklineData);
                    const range = max - min || 1;
                    return sparklineData
                      .map((val, idx) => {
                        const x = (idx / (sparklineData.length - 1)) * 100;
                        const y = 22 - ((val - min) / range) * 22;
                        return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(" ");
                  })()}
                  fill="none"
                  stroke={c.sparkColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}