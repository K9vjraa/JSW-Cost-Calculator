import React from "react";
import { Card, CardContent, Badge } from "@jsw-mcms/ui";
import type { RecommendationCard as RecommendationCardType } from "@jsw-mcms/types";

interface RecommendationCardProps {
  recommendation: RecommendationCardType;
}

export function RecommendationCard({ recommendation: rec }: RecommendationCardProps) {
  const badgeColor = 
    rec.badgeType === 'success' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
    rec.badgeType === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-200' :
    rec.badgeType === 'danger' ? 'bg-rose-100 text-rose-800 border-rose-200' :
    'bg-blue-100 text-blue-800 border-blue-200';

  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{rec.title}</span>
          <Badge variant="outline" className={`px-2 py-0.5 rounded text-[10px] font-medium ${badgeColor}`}>
            {rec.metricValue}
          </Badge>
        </div>
        <span className="text-lg font-black text-slate-800 mb-1">{rec.gradeName}</span>
        <p className="text-xs text-slate-600 leading-relaxed flex-1 mt-1">
          {rec.description}
        </p>
      </CardContent>
    </Card>
  );
}
