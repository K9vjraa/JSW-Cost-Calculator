import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, inr } from '@jsw-mcms/ui';
import type { ComparisonResultDTO, GradeVarianceDTO } from '@jsw-mcms/types';
import { extractNumber } from '@/lib/formatEvaluator';

interface ComparisonAnalyticsProps {
  result: ComparisonResultDTO;
  orderQuantity: number;
  gradesData?: {
    id: string;
    name: string;
    gradeMaterials?: {
      materialId: string;
      compositionPercent: unknown;
    }[];
  }[];
}

type ChartData = {
  name: string;
  id: string;
  cost?: number;
  totalCost?: number;
  savings?: number;
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6', '#f43f5e', '#8b5cf6'];
const REF_COLOR = '#0ea5e9'; // Special color for baseline

export function ComparisonAnalytics({ result, orderQuantity, gradesData = [] }: ComparisonAnalyticsProps) {
  const grades = result.grades;
  const referenceGradeId = result.referenceGradeId;

  // 0. Summary Metrics Calculations
  const summaryMetrics = useMemo(() => {
    if (grades.length === 0) return null;

    const sortedByCost = [...grades].sort((a, b) => a.rawValues.cost - b.rawValues.cost);
    const lowest = sortedByCost[0];
    const highest = sortedByCost[sortedByCost.length - 1];
    
    const sum = grades.reduce((acc, g) => acc + g.rawValues.cost, 0);
    const avg = sum / grades.length;

    // Best Match: non-reference grade with highest similarity, or lowest cost if no reference
    const nonRefGrades = grades.filter(g => !g.isReference);
    const sortedBySimilarity = [...nonRefGrades].sort((a, b) => b.scores.similarity - a.scores.similarity);
    const bestMatch = sortedBySimilarity[0] || lowest;

    return {
      lowest,
      highest,
      avg,
      bestMatch
    };
  }, [grades]);

  // 1. Cost Data
  const costData = useMemo(() => {
    return grades.map((g: GradeVarianceDTO) => ({
      name: g.gradeName,
      id: g.gradeId,
      cost: g.rawValues.cost,
      totalCost: g.rawValues.cost * orderQuantity
    }));
  }, [grades, orderQuantity]);

  // 2. Savings Data
  const savingsData = useMemo(() => {
    return grades.map((g: GradeVarianceDTO) => ({
      name: g.gradeName,
      id: g.gradeId,
      savings: g.scores.savings * orderQuantity
    }));
  }, [grades, orderQuantity]);

  // 3. Chemical Radar Data
  const chemicalData = useMemo(() => {
    const elements = ['C', 'Mn', 'Si', 'Cr', 'Ni', 'Mo'];
    return elements.map(el => {
      const dataPoint: Record<string, string | number> = { element: el };
      grades.forEach((g: GradeVarianceDTO) => {
        dataPoint[g.gradeName] = extractNumber(String(g.rawValues.chemical?.[el])) || 0;
      });
      return dataPoint;
    });
  }, [grades]);

  // 4. Mechanical Properties Grouped Data
  const mechanicalData = useMemo(() => {
    const properties = [
      { key: 'Yield strength', label: 'Yield Strength' },
      { key: 'UTS', label: 'Tensile Strength' },
      { key: 'Elongation', label: 'Elongation' }
    ];

    return properties.map(prop => {
      const dataPoint: Record<string, string | number> = { property: prop.label };
      grades.forEach((g: GradeVarianceDTO) => {
        dataPoint[g.gradeName] = extractNumber(String(g.rawValues.mechanical?.[prop.key])) || 0;
      });
      return dataPoint;
    });
  }, [grades]);

  // 5. Grade Similarity from Engine
  const similarityData = useMemo(() => {
    return grades.map((g: GradeVarianceDTO) => ({
      name: g.gradeName,
      id: g.gradeId,
      similarity: g.scores.similarity
    })).sort((a: { similarity: number }, b: { similarity: number }) => b.similarity - a.similarity);
  }, [grades]);

  // 6. Material Composition Stacked Data
  const materialCompositionData = useMemo(() => {
    const materialsSet = new Set<string>();
    const selectedGradesData = grades.map(g => {
      const full = gradesData?.find(x => x.id === g.gradeId);
      full?.gradeMaterials?.forEach((gm: { materialId: string }) => {
        if (gm.materialId) materialsSet.add(gm.materialId);
      });
      return {
        name: g.gradeName,
        materials: full?.gradeMaterials || []
      };
    });

    const uniqueMats = Array.from(materialsSet);

    const chartData = selectedGradesData.map(gd => {
      const dataPoint: Record<string, string | number> = { name: gd.name };
      uniqueMats.forEach(m => {
        dataPoint[m] = 0;
      });
      gd.materials.forEach((gm: { materialId: string; compositionPercent: unknown }) => {
        dataPoint[gm.materialId] = Number(gm.compositionPercent) || 0;
      });
      return dataPoint;
    });

    return { chartData, uniqueMats };
  }, [grades, gradesData]);

  if (grades.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mb-6 w-full text-left">
      {/* SUMMARY CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full shrink-0">
        {/* Lowest Cost Card */}
        <div className="bg-white border border-slate-200 rounded p-3 shadow-sm flex flex-col justify-between hover:shadow transition-all border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lowest Cost Option</span>
          <span className="text-xs font-bold text-slate-800 truncate mt-1">{summaryMetrics?.lowest?.gradeName}</span>
          <span className="text-xs font-mono font-black text-[#002b63] mt-1">{summaryMetrics?.lowest ? inr(summaryMetrics.lowest.rawValues.cost) : "N/A"}/kg</span>
          <span className="text-[9px] text-slate-500 mt-1">Most economical grade option</span>
        </div>

        {/* Highest Cost Card */}
        <div className="bg-white border border-slate-200 rounded p-3 shadow-sm flex flex-col justify-between hover:shadow transition-all border-l-4 border-l-rose-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Highest Cost Option</span>
          <span className="text-xs font-bold text-slate-800 truncate mt-1">{summaryMetrics?.highest?.gradeName}</span>
          <span className="text-xs font-mono font-black text-[#002b63] mt-1">{summaryMetrics?.highest ? inr(summaryMetrics.highest.rawValues.cost) : "N/A"}/kg</span>
          <span className="text-[9px] text-slate-500 mt-1">Premium specifications surcharge</span>
        </div>

        {/* Average Cost Card */}
        <div className="bg-white border border-slate-200 rounded p-3 shadow-sm flex flex-col justify-between hover:shadow transition-all border-l-4 border-l-blue-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Cost Spread</span>
          <span className="text-xs font-bold text-slate-800 truncate mt-1">Cohort Group Mean</span>
          <span className="text-xs font-mono font-black text-[#002b63] mt-1">{summaryMetrics ? inr(summaryMetrics.avg) : "N/A"}/kg</span>
          <span className="text-[9px] text-slate-500 mt-1">Mean value of selected cohort</span>
        </div>

        {/* Best Match Card */}
        <div className="bg-white border border-slate-200 rounded p-3 shadow-sm flex flex-col justify-between hover:shadow transition-all border-l-4 border-l-indigo-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Best Match Recommend</span>
          <span className="text-xs font-bold text-slate-800 truncate mt-1">{summaryMetrics?.bestMatch?.gradeName}</span>
          <span className="text-xs font-bold text-indigo-700 mt-1">{summaryMetrics?.bestMatch ? `${summaryMetrics.bestMatch.scores.similarity.toFixed(1)}% Match` : "N/A"}</span>
          <span className="text-[9px] text-slate-500 mt-1">Highest specification compatibility</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* COST DISTRIBUTION */}
      <Card className="border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
        <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center justify-between">
            Cost Distribution (per kg)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '500' }} />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {costData.map((entry: { id: string }, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.id === referenceGradeId ? REF_COLOR : COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* SAVINGS VS BASELINE */}
      <Card className="border border-slate-200 shadow-sm col-span-1">
        <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50">
          <CardTitle className="text-sm font-semibold text-slate-700">
            {referenceGradeId ? 'Savings vs Baseline' : 'Total Order Cost'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={(referenceGradeId ? savingsData : costData) as ChartData[]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '500' }} />
              <Bar dataKey={referenceGradeId ? "savings" : "totalCost"} radius={[4, 4, 0, 0]} maxBarSize={50}>
                {(referenceGradeId ? savingsData : costData).map((entry: ChartData, index: number) => {
                  const val = referenceGradeId ? entry.savings : entry.totalCost;
                  return <Cell key={`cell-${index}`} fill={referenceGradeId ? ((val ?? 0) >= 0 ? '#10b981' : '#f43f5e') : COLORS[index % COLORS.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* CHEMICAL DIFFERENCE RADAR */}
      <Card className="border border-slate-200 shadow-sm col-span-1 md:col-span-1 lg:col-span-1">
        <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50">
          <CardTitle className="text-sm font-semibold text-slate-700">Chemical Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[250px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={70} data={chemicalData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="element" tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '500' }} />
              {grades.map((g: GradeVarianceDTO, i: number) => (
                <Radar 
                  key={g.gradeId} 
                  name={g.gradeName} 
                  dataKey={g.gradeName} 
                  stroke={g.gradeId === referenceGradeId ? REF_COLOR : COLORS[i % COLORS.length]} 
                  fill={g.gradeId === referenceGradeId ? REF_COLOR : COLORS[i % COLORS.length]} 
                  fillOpacity={g.gradeId === referenceGradeId ? 0.5 : 0.2} 
                />
              ))}
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* MECHANICAL PROPERTIES */}
      <Card className="border border-slate-200 shadow-sm col-span-1 md:col-span-1 lg:col-span-1">
        <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50">
          <CardTitle className="text-sm font-semibold text-slate-700">Mechanical Properties</CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mechanicalData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="property" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '500' }} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
              {grades.map((g: GradeVarianceDTO, i: number) => (
                <Bar 
                  key={g.gradeId} 
                  dataKey={g.gradeName} 
                  fill={g.gradeId === referenceGradeId ? REF_COLOR : COLORS[i % COLORS.length]} 
                  radius={[2, 2, 0, 0]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRADE SIMILARITY */}
      <Card className="border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
        <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50">
          <CardTitle className="text-sm font-semibold text-slate-700">
            {referenceGradeId ? 'Similarity to Baseline' : 'Select Baseline to compare similarity'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-[250px] flex items-center justify-center">
          {referenceGradeId ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={similarityData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(val: unknown) => [`${Number(val).toFixed(1)}% Match`, 'Similarity']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '500' }} />
                <Bar dataKey="similarity" radius={[0, 4, 4, 0]} barSize={20}>
                  {similarityData.map((entry: { id: string }, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.id === referenceGradeId ? '#94a3b8' : COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-slate-400 text-center px-8">
              Pin a grade as the Baseline Reference in the toolbar to unlock the similarity matching engine.
            </div>
          )}
        </CardContent>
      </Card>

      {/* MATERIAL COMPOSITION BREAKDOWN Stacked Chart */}
      <Card className="border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
        <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Material Composition Breakdown (%)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-[250px]">
          {materialCompositionData.uniqueMats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={materialCompositionData.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '500' }} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                {materialCompositionData.uniqueMats.map((mat, idx) => (
                  <Bar key={mat} dataKey={mat} stackId="a" fill={COLORS[idx % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-slate-400 text-center flex items-center justify-center h-full">
              No material data available for selected grades.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
  );
}
