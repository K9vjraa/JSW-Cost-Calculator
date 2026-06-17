import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  EyeOff,
  Search,
  SlidersHorizontal,
  Database,
  AlertCircle
} from "lucide-react";
import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { cn } from "@/utils";
import { logger } from "../utils/logger";
import type { TableQueryState } from "@/hooks/useTableQuery";

export type EnterpriseColumnDef<TData> = ColumnDef<TData, unknown> & {
  meta?: {
    label?: string;
    className?: string;
    mobileHidden?: boolean;
  };
};

interface EnterpriseDataTableProps<TData> {
  tableId: string;
  data: TData[];
  columns: EnterpriseColumnDef<TData>[];
  query: TableQueryState;
  onQueryChange: Dispatch<SetStateAction<TableQueryState>>;
  totalRows: number;
  getRowId: (row: TData) => string;
  isLoading?: boolean;
  error?: unknown;
  searchPlaceholder?: string;
  filters?: ReactNode;
  exportResource?: "metals" | "grades" | "calculations" | "reports" | "users" | "audit-logs";
  exportParams?: Record<string, string | number | undefined>;
  onRowClick?: (row: TData) => void;
  className?: string;
}

const pageSizes = [10, 25, 50, 100];

export function EnterpriseDataTable<TData>({
  tableId,
  data,
  columns,
  query,
  onQueryChange,
  totalRows,
  getRowId,
  isLoading,
  error,
  searchPlaceholder = "Search records...",
  filters,
  exportResource,
  exportParams,
  onRowClick,
  className
}: EnterpriseDataTableProps<TData>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(`mcms-table-columns:${tableId}`) || "{}") as Record<string, boolean>;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(`mcms-table-columns:${tableId}`, JSON.stringify(columnVisibility));
  }, [columnVisibility, tableId]);

  const sorting = useMemo<SortingState>(() => {
    return query.sortBy ? [{ id: query.sortBy, desc: query.sortDir === "desc" }] : [];
  }, [query.sortBy, query.sortDir]);

  // Data Validation & De-duplication
  const validatedData = useMemo(() => {
    if (!Array.isArray(data)) {
      logger.error(`Table [${tableId}] data validation error: expected an array but received`, { data });
      return [];
    }
    const seen = new Set<string>();
    return data.filter((row) => {
      if (!row) return false;
      const key = getRowId(row);
      if (key === undefined || key === null || key === "") {
        logger.warn(`Table [${tableId}] row validation error: missing row ID key`, { row });
        return false;
      }
      const stringKey = String(key);
      if (seen.has(stringKey)) {
        logger.warn(`Table [${tableId}] deduplication: duplicate row ID key "${stringKey}" filtered out`, { row });
        return false;
      }
      seen.add(stringKey);
      return true;
    });
  }, [data, getRowId, tableId]);

  // Log table data count whenever it changes
  useEffect(() => {
    logger.info(`Table [${tableId}] rendered with ${validatedData.length} records.`, { totalRows });
  }, [tableId, validatedData.length, totalRows]);

  const table = useReactTable({
    data: validatedData,
    columns,
    getRowId,
    state: { sorting, columnVisibility },
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const first = next[0];
      onQueryChange((current) => ({
        ...current,
        page: 1,
        sortBy: first?.id,
        sortDir: first ? (first.desc ? "desc" : "asc") : undefined
      }));
    },
    getCoreRowModel: getCoreRowModel()
  });

  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const totalPages = Math.max(Math.ceil(totalRows / query.limit), 1);
  const allPageIds = rows.map((row) => row.id);
  const allPageSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id));
  const hasFilters = Boolean(query.search.trim()) || Object.values(query.filters).some(Boolean);

  const updateQuery = (patch: Partial<TableQueryState>) => {
    onQueryChange((current) => ({ ...current, ...patch }));
  };

  const togglePageSelection = (checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      allPageIds.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const exportTable = async (format: "csv" | "xlsx", selectedOnly = false) => {
    if (!exportResource) return;
    try {
      const ids = selectedOnly ? Array.from(selectedIds).join(",") : undefined;
      const { data: blob } = await api.get(`/exports/table/${exportResource}`, {
        params: { ...exportParams, format, ids },
        responseType: "blob"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mcms-${exportResource}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(selectedOnly ? "Selected rows exported." : "Filtered dataset exported.");
    } catch (err) {
      logger.error(`Table [${tableId}] export failed`, { error: err });
      toast.error("Export failed. Please check your permissions and filters.");
    }
  };

  // Safe null-value cell renderer
  const renderCellContent = (cell: any) => {
    const content = flexRender(cell.column.columnDef.cell, cell.getContext());
    if (content === null || content === undefined || content === "") {
      return <span className="text-slate-400 font-normal">-</span>;
    }
    return content;
  };

  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white shadow-xs", className)}>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-3.5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query.search}
              onChange={(event) => updateQuery({ search: event.target.value, page: 1 })}
              placeholder={searchPlaceholder}
              className="h-9 rounded-lg border-slate-200 bg-white pl-9 text-xs font-semibold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {selectedIds.size} selected
            </span>

            <details className="relative">
              <summary className="flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">
                <EyeOff className="size-3.5" /> Columns <ChevronDown className="size-3" />
              </summary>
              <div className="absolute right-0 z-30 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                {table.getAllLeafColumns().map((column) => (
                  <label key={column.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="size-3.5 accent-[#0057b8]"
                    />
                    {String((column.columnDef.meta as { label?: string } | undefined)?.label ?? column.id)}
                  </label>
                ))}
              </div>
            </details>

            {exportResource && (
              <details className="relative">
                <summary className="flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Download className="size-3.5" /> Export <ChevronDown className="size-3" />
                </summary>
                <div className="absolute right-0 z-30 mt-2 grid w-52 gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                  <button className="rounded-md px-2 py-1.5 text-left text-xs font-bold text-slate-600 hover:bg-slate-50" onClick={() => exportTable("csv")}>
                    Filtered CSV
                  </button>
                  <button className="rounded-md px-2 py-1.5 text-left text-xs font-bold text-slate-600 hover:bg-slate-50" onClick={() => exportTable("xlsx")}>
                    Filtered Excel
                  </button>
                  <button
                    className="rounded-md px-2 py-1.5 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:text-slate-300"
                    disabled={selectedIds.size === 0}
                    onClick={() => exportTable("csv", true)}
                  >
                    Selected CSV
                  </button>
                </div>
              </details>
            )}

            <span className="hidden items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:flex">
              <SlidersHorizontal className="size-3" /> {totalRows.toLocaleString("en-IN")} rows
            </span>
          </div>
        </div>

        {filters && <div className="grid gap-2 md:grid-cols-4">{filters}</div>}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="max-h-[560px] overflow-y-auto overflow-x-auto border-b border-slate-100">
          <table className="w-full min-w-[820px] border-collapse text-left text-xs">
            <thead className="sticky top-0 z-20 bg-slate-50 shadow-[inset_0_-1px_0_#d6dfeb]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  <th className="w-11 px-4 py-3 text-center">
                    <input
                      aria-label="Select visible rows"
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={(event) => togglePageSelection(event.target.checked)}
                      className="size-4 accent-[#0057b8] cursor-pointer"
                    />
                  </th>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 font-bold"
                    >
                      <button
                        type="button"
                        disabled={!header.column.getCanSort()}
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 text-left disabled:cursor-default cursor-pointer font-bold"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <ChevronDown className={cn("size-3 text-[#0057b8]", header.column.getIsSorted() === "asc" && "rotate-180")} />
                        )}
                      </button>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="h-12 border-b border-slate-100 animate-pulse">
                    <td className="w-11 px-4 py-3 text-center align-middle">
                      <div className="size-4 bg-slate-200 rounded mx-auto" />
                    </td>
                    {visibleColumns.map((_, cIdx) => (
                      <td key={cIdx} className="px-4 py-3 align-middle">
                        <div className="h-4 bg-slate-200 rounded w-2/3" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr className="h-32">
                  <td colSpan={visibleColumns.length + 1} className="text-center align-middle text-red-500">
                    <div className="flex flex-col items-center justify-center p-6 gap-2">
                      <AlertCircle className="size-8 text-red-400" />
                      <span className="text-sm font-semibold text-red-600">Failed to load table records</span>
                      <span className="text-xs text-slate-400">Please check your network connection and try again.</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr className="h-48">
                  <td colSpan={visibleColumns.length + 1} className="text-center align-middle text-slate-400">
                    <div className="flex flex-col items-center justify-center p-6 gap-2">
                      <Database className="size-8 text-slate-300" />
                      <span className="text-sm font-semibold text-slate-600">No Records Found</span>
                      <span className="text-xs text-slate-400 font-normal">
                        {hasFilters ? "No master data matches your search or filters." : "No records available."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={selectedIds.has(row.id) ? "selected" : undefined}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      "hover:bg-slate-50/70 transition-colors data-[state=selected]:bg-[#edf5ff] h-12",
                      onRowClick && "cursor-pointer"
                    )}
                    style={{ height: "48px" }}
                  >
                    <td className="w-11 px-4 py-3 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                      <input
                        aria-label="Select row"
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={(event) => {
                          setSelectedIds((current) => {
                            const next = new Set(current);
                            if (event.target.checked) next.add(row.id);
                            else next.delete(row.id);
                            return next;
                          });
                        }}
                        className="size-4 accent-[#0057b8] cursor-pointer"
                      />
                    </td>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-4 py-3 font-semibold text-slate-700 align-middle max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap",
                          (cell.column.columnDef.meta as { className?: string } | undefined)?.className
                        )}
                        title={typeof cell.getValue() === "string" ? String(cell.getValue()) : undefined}
                      >
                        {renderCellContent(cell)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="grid gap-2 p-3 md:hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs animate-pulse flex flex-col gap-2">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-6 text-center text-red-500">
            <AlertCircle className="size-8 text-red-400 mx-auto mb-2" />
            <span className="text-xs font-semibold block">Failed to load records</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-8 text-center text-slate-400">
            <Database className="size-8 text-slate-300 mx-auto mb-2" />
            <span className="text-xs font-semibold block">No Records Found</span>
          </div>
        ) : (
          rows.map((row) => (
            <button
              type="button"
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className="rounded-lg border border-slate-200 bg-white p-3 text-left shadow-xs cursor-pointer hover:bg-slate-50/50 transition-colors"
            >
              <div className="mb-2 flex items-center justify-between">
                <input
                  aria-label="Select row"
                  type="checkbox"
                  checked={selectedIds.has(row.id)}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => {
                    setSelectedIds((current) => {
                      const next = new Set(current);
                      if (event.target.checked) next.add(row.id);
                      else next.delete(row.id);
                      return next;
                    });
                  }}
                  className="size-4 accent-[#0057b8] cursor-pointer"
                />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Record</span>
              </div>
              <dl className="grid gap-2">
                {row.getVisibleCells().filter((cell) => !(cell.column.columnDef.meta as { mobileHidden?: boolean } | undefined)?.mobileHidden).map((cell) => (
                  <div key={cell.id} className="grid grid-cols-[112px_1fr] gap-2 text-xs">
                    <dt className="font-black uppercase tracking-wider text-slate-400">
                      {(cell.column.columnDef.meta as { label?: string } | undefined)?.label ?? cell.column.id}
                    </dt>
                    <dd className="min-w-0 font-semibold text-slate-700 truncate">
                      {renderCellContent(cell)}
                    </dd>
                  </div>
                ))}
              </dl>
            </button>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 p-3 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Page <strong className="text-slate-800">{query.page}</strong> of <strong className="text-slate-800">{totalPages}</strong>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={query.limit}
            onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 cursor-pointer"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
          <Button variant="outline" size="sm" className="size-8 p-0 cursor-pointer" disabled={query.page <= 1 || isLoading} onClick={() => updateQuery({ page: 1 })} aria-label="First page">
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="size-8 p-0 cursor-pointer" disabled={query.page <= 1 || isLoading} onClick={() => updateQuery({ page: Math.max(1, query.page - 1) })} aria-label="Previous page">
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="size-8 p-0 cursor-pointer" disabled={query.page >= totalPages || isLoading} onClick={() => updateQuery({ page: Math.min(totalPages, query.page + 1) })} aria-label="Next page">
            <ChevronRight className="size-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="size-8 p-0 cursor-pointer" disabled={query.page >= totalPages || isLoading} onClick={() => updateQuery({ page: totalPages })} aria-label="Last page">
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
