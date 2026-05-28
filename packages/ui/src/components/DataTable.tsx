import * as React from "react";
import { cn } from "../utils";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "./Button";
import { Checkbox } from "./Input";

export interface ColumnDef<TData> {
  header: string;
  accessorKey?: keyof TData | string;
  sortable?: boolean;
  render?: (row: TData) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
  // Selection
  selectedRows?: Set<string | number>;
  onSelectRow?: (row: TData, isSelected: boolean) => void;
  onSelectAll?: (isSelected: boolean) => void;
  getRowId?: (row: TData) => string | number;
  // Sorting
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string, direction: "asc" | "desc") => void;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function DataTable<TData>({
  data,
  columns,
  isLoading = false,
  selectedRows,
  onSelectRow,
  onSelectAll,
  getRowId,
  sortKey,
  sortDirection,
  onSort,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  className
}: DataTableProps<TData>) {
  const handleSort = (column: ColumnDef<TData>) => {
    if (!column.sortable || !column.accessorKey || !onSort) return;

    const key = String(column.accessorKey);
    let nextDirection: "asc" | "desc" = "asc";
    if (sortKey === key && sortDirection === "asc") {
      nextDirection = "desc";
    }

    onSort(key, nextDirection);
  };

  const isAllSelected = () => {
    if (!data.length || !selectedRows || !getRowId) return false;
    return data.every((row) => selectedRows.has(getRowId(row)));
  };

  return (
    <div className={cn("w-full flex flex-col gap-3.5 text-left", className)}>
      <div className="w-full overflow-x-auto rounded-2xl border border-[#d6dfeb] bg-white shadow-xs">
        <table className="w-full border-collapse text-xs text-[#10233d]">
          <thead className="bg-slate-50 border-b border-[#d6dfeb]/60">
            <tr>
              {onSelectAll && (
                <th className="p-3 w-10 text-center">
                  <Checkbox
                    label=""
                    checked={isAllSelected()}
                    onChange={(e) => onSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => handleSort(col)}
                  className={cn(
                    "p-3.5 font-extrabold uppercase tracking-wider text-[10px] text-[#56657a] border-b border-[#d6dfeb]/50",
                    col.sortable ? "cursor-pointer select-none hover:bg-slate-100/80 hover:text-[#10233d]" : "",
                    col.className
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable && col.accessorKey && sortKey === String(col.accessorKey) && (
                      <span className="text-[#0057b8]">
                        {sortDirection === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              // Shimmer Skeletons
              Array.from({ length: pageSize || 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/30 transition-colors">
                  {onSelectAll && (
                    <td className="p-3 text-center">
                      <div className="size-4 bg-slate-200 rounded animate-pulse mx-auto" />
                    </td>
                  )}
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="p-3.5">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onSelectAll ? 1 : 0)} className="p-8 text-center text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  No records matching requirements found.
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => {
                const id = getRowId ? getRowId(row) : rIdx;
                const isSelected = selectedRows ? selectedRows.has(id) : false;

                return (
                  <tr
                    key={id}
                    className={cn(
                      "hover:bg-slate-50/50 transition-colors",
                      isSelected ? "bg-[#edf5ff]/20" : ""
                    )}
                  >
                    {onSelectRow && getRowId && (
                      <td className="p-3 text-center w-10">
                        <Checkbox
                          label=""
                          checked={isSelected}
                          onChange={(e) => onSelectRow(row, e.target.checked)}
                        />
                      </td>
                    )}
                    {columns.map((col, cIdx) => {
                      let cellContent: React.ReactNode = null;
                      if (col.render) {
                        cellContent = col.render(row);
                      } else if (col.accessorKey) {
                        cellContent = String(row[col.accessorKey as keyof TData] ?? "");
                      }

                      return (
                        <td key={cIdx} className={cn("p-3.5 font-semibold text-[#10233d]", col.className)}>
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Actions */}
      {onPageChange && currentPage !== undefined && totalPages !== undefined && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 select-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#56657a]">
            Page <strong className="text-[#10233d]">{currentPage}</strong> of <strong className="text-[#10233d]">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(1)}
              className="size-8.5 p-0"
              aria-label="First page"
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
              className="size-8.5 p-0"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
              className="size-8.5 p-0"
              aria-label="Next page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(totalPages)}
              className="size-8.5 p-0"
              aria-label="Last page"
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
