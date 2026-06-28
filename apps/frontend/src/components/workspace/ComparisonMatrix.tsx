import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef, ExpandedState, Updater } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge, inr } from "@jsw-mcms/ui";
import type { ComparisonResultDTO, GradeVarianceDTO } from "@jsw-mcms/types";

interface ComparisonMatrixProps {
  result: ComparisonResultDTO;
  orderQuantity: number;
  highlightDiffs: boolean;
  isFullScreen: boolean;
  collapsedGroups: Record<string, boolean>;
  setCollapsedGroups: (val: Record<string, boolean>) => void;
}

export function ComparisonMatrix({
  result,
  orderQuantity,
  highlightDiffs,
  isFullScreen,
  collapsedGroups,
  setCollapsedGroups,
}: ComparisonMatrixProps) {
  const grades = result.grades;
  const lowestCostGrade = grades.reduce((min: GradeVarianceDTO, g: GradeVarianceDTO) => (g.rawValues.cost < min.rawValues.cost ? g : min), grades[0]);
  const lowestCostId = lowestCostGrade?.gradeId;

  // 1. DATA PREPARATION
  const data = useMemo(() => {
    if (grades.length === 0) return [];

    return [
      {
        id: "cost",
        isGroup: true,
        groupLabel: "Cost & Commercial Matrix",
        subRows: [
          {
            id: "baseRate",
            groupId: "cost",
            propertyLabel: "Metal Base Rate",
            values: grades.reduce((acc: Record<string, string>, g: GradeVarianceDTO) => ({ ...acc, [g.gradeId]: `${inr(g.rawValues.price)} / kg` }), {}),
          },
          {
            id: "multiplier",
            groupId: "cost",
            propertyLabel: "Grade Surcharge Multiplier",
            values: grades.reduce((acc: Record<string, string>, g: GradeVarianceDTO) => ({ ...acc, [g.gradeId]: `${g.rawValues.multiplier}x` }), {}),
          },
          {
            id: "unitCost",
            groupId: "cost",
            propertyLabel: "Calculated Unit Cost / kg",
            differs: grades.some((g: GradeVarianceDTO) => g.differences.cost !== 0),
            values: grades.reduce((acc: Record<string, string>, g: GradeVarianceDTO) => ({ ...acc, [g.gradeId]: `${inr(g.rawValues.cost)} / kg` }), {}),
          },
          {
            id: "orderCost",
            groupId: "cost",
            propertyLabel: `Simulated Order Cost (${orderQuantity.toLocaleString()} kg)`,
            values: grades.reduce((acc: Record<string, string>, g: GradeVarianceDTO) => ({ ...acc, [g.gradeId]: inr(g.rawValues.cost * orderQuantity) }), {}),
          },
        ]
      },
      // Simulated other properties based on diffs payload
    ];
  }, [grades, orderQuantity]);

  const expandedState = useMemo(() => ({
    cost: !collapsedGroups.cost,
    mechanical: !collapsedGroups.mechanical,
    chemical: !collapsedGroups.chemical,
    tolerances: !collapsedGroups.tolerances,
    bend: !collapsedGroups.bend,
  }), [collapsedGroups]);

  const onExpandedChange = (updater: Updater<ExpandedState>) => {
    const nextState = (typeof updater === "function" ? updater(expandedState) : updater) as Record<string, boolean>;
    setCollapsedGroups({
      cost: !nextState.cost,
      mechanical: !nextState.mechanical,
      chemical: !nextState.chemical,
      tolerances: !nextState.tolerances,
      bend: !nextState.bend,
    });
  };

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    return [
      {
        id: "property",
        header: "Properties & Specifications",
        accessorKey: "propertyLabel",
        size: 300,
        enablePinning: true,
        cell: ({ row, getValue }) => {
          if (row.original.isGroup) {
            return (
              <div 
                className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 py-1"
                onClick={row.getToggleExpandedHandler()}
              >
                {row.getIsExpanded() ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                {row.original.groupLabel as string}
              </div>
            );
          }
          return (
            <div className="flex items-center gap-2 pl-6 text-xs font-medium text-slate-700">
              <span>{String(getValue())}</span>
              {Boolean(row.original.differs) && highlightDiffs && (
                <Badge variant="outline" className="px-1 py-0 text-[9px] bg-amber-50 text-amber-700 border-amber-200 shadow-sm leading-none h-4 flex items-center">differs</Badge>
              )}
            </div>
          );
        },
      },
      ...grades.map((g: GradeVarianceDTO) => ({
        id: g.gradeId,
        header: () => (
          <div className="flex flex-col items-center gap-1 min-w-[150px]">
            <span className={`block text-xs font-bold ${g.isReference ? "text-blue-700" : "text-slate-800"}`}>{g.gradeName}</span>
            <div className="flex gap-1 h-3 mt-0.5">
              {g.isReference && <Badge variant="outline" className="px-1 py-0 text-[9px] bg-blue-50 text-blue-700 leading-none h-4 flex items-center border-blue-200 shadow-sm">Baseline</Badge>}
              {g.gradeId === lowestCostId && !g.isReference && <Badge variant="outline" className="px-1 py-0 text-[9px] bg-emerald-50 text-emerald-700 leading-none h-4 flex items-center border-emerald-200 shadow-sm">Best Value</Badge>}
            </div>
          </div>
        ),
        accessorFn: (row: Record<string, unknown>) => (row.values as Record<string, string | number>)?.[g.gradeId] || "-",
        size: 200,
        cell: ({ getValue, row }: { getValue: () => unknown; row: import("@tanstack/react-table").Row<Record<string, unknown>> }) => {
          if (row.original.isGroup) return null;
          return <div className="w-full flex justify-center text-xs text-slate-600 font-medium">{String(getValue())}</div>;
        }
      }))
    ] as ColumnDef<Record<string, unknown>>[];
  }, [grades, lowestCostId, highlightDiffs]);

  // eslint-disable-next-line react-compiler/react-compiler
  const table = useReactTable({
    data,
    columns,
    state: { expanded: expandedState, columnPinning: { left: ["property"] } },
    getRowId: (row) => row.id as string,
    onExpandedChange,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.subRows as Record<string, unknown>[],
  });

  if (grades.length === 0) return null;

  return (
    <div className={`w-full overflow-auto bg-white ${isFullScreen ? 'h-full' : 'h-full'}`}>
      <table className="w-full text-xs text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-20 shadow-sm">
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(h => {
                const isPropertyCol = h.column.id === "property";
                return (
                  <th 
                    key={h.id} 
                    className={`px-3 py-2 border-r border-slate-200 font-bold text-slate-700 text-center shadow-[inset_0_-1px_0_0_#e2e8f0] ${
                      isPropertyCol 
                        ? "sticky left-0 bg-slate-50 z-30 shadow-[2px_0_2px_0_rgba(0,0,0,0.08)]" 
                        : ""
                    }`}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(r => (
            <tr key={r.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${r.original.isGroup ? 'bg-slate-100/50' : ''}`}>
              {r.getVisibleCells().map(c => {
                const isPropertyCol = c.column.id === "property";
                return (
                  <td 
                    key={c.id} 
                    className={`px-3 py-1.5 border-r border-slate-100 whitespace-nowrap ${
                      isPropertyCol 
                        ? "sticky left-0 bg-white z-10 shadow-[2px_0_2px_0_rgba(0,0,0,0.08)] font-bold" 
                        : ""
                    }`}
                  >
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
