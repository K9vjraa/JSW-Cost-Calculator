// ... (imports remain the same)
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type Cell,
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
  AlertCircle,
  X
} from "lucide-react";
import { useEffect, useMemo, useState, memo, type Dispatch, type ReactNode, type SetStateAction } from "react";
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
    sticky?: "left" | "right";
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
  emptyStateMessage?: string;
  onClearFilters?: () => void;
  selectedIds?: Set<string>;
  onSelectedIdsChange?: (ids: Set<string>) => void;
  hideSearch?: boolean;
  filters?: ReactNode;
  exportResource?: "metals" | "grades" | "calculations" | "reports" | "users" | "audit-logs" | "raw-materials";
  exportParams?: Record<string, string | number | undefined>;
  onRowClick?: (row: TData) => void;
  className?: string;
}

const pageSizes = [10, 25, 50, 100];

export const EnterpriseDataTable = memo(function EnterpriseDataTable<TData>({
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
  emptyStateMessage = "No records found.",
  onClearFilters,
  selectedIds: externalSelectedIds,
  onSelectedIdsChange,
  hideSearch,
  filters,
  exportResource,
  exportParams,
  onRowClick,
  className
}: EnterpriseDataTableProps<TData>) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const selectedIds = externalSelectedIds ?? internalSelectedIds;

  const setSelectedIds = (value: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    if (typeof value === "function") {
      const nextValue = value(selectedIds);
      setInternalSelectedIds(nextValue);
      if (onSelectedIdsChange) onSelectedIdsChange(nextValue);
    } else {
      setInternalSelectedIds(value);
      if (onSelectedIdsChange) onSelectedIdsChange(value);
    }
  };
  
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    try {
      const stored = localStorage.getItem(`mcms-table-columns:${tableId}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {};
  });

  const [localSearch, setLocalSearch] = useState(query.search || "");

  useEffect(() => {
    setLocalSearch(query.search || "");
  }, [query.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (query.search || "")) {
        onQueryChange((current) => ({ ...current, page: 1, search: localSearch }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onQueryChange, query.search]);

  // Sync columns to localStorage
  useEffect(() => {
    localStorage.setItem(`mcms-table-columns:${tableId}`, JSON.stringify(columnVisibility));
  }, [columnVisibility, tableId]);

  const sorting = useMemo<SortingState>(() => {
    return query.sortBy ? [{ id: query.sortBy, desc: query.sortDir === "desc" }] : [];
  }, [query.sortBy, query.sortDir]);

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

  useEffect(() => {
    logger.info(`Table [${tableId}] rendered with ${validatedData.length} records.`, { totalRows });
  }, [tableId, validatedData.length, totalRows]);

  const table = useReactTable({
    data: validatedData,
    columns,
    getRowId,
    state: { sorting, columnVisibility },
    columnResizeMode: "onChange",
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

  const renderCellContent = (cell: Cell<TData, unknown>) => {
    const content = flexRender(cell.column.columnDef.cell, cell.getContext());
    if (content === null || content === undefined || content === "") {
      return <span className="text-slate-400 font-normal">-</span>;
    }
    return content;
  };

  return (
    <section className={cn("rounded-sm border border-slate-200 bg-white shadow-xs flex flex-col max-h-[800px]", className)}>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-2.5 shrink-0 bg-[#fbfcfd] rounded-t-xl z-20">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          {!hideSearch && (
            <div className="relative w-full lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={localSearch}
                onChange={(event) => setLocalSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 rounded border-slate-200 bg-white pl-8 pr-8 text-xs font-semibold shadow-sm"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-white border border-slate-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0b5cbf] shadow-sm">
              {selectedIds.size} selected
            </span>

            <details className="relative">
              <summary className="flex h-8 cursor-pointer list-none items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                <EyeOff className="size-3.5" /> Columns <ChevronDown className="size-3" />
              </summary>
              <div className="absolute right-0 z-30 mt-1.5 w-56 rounded border border-slate-200 bg-white p-2 shadow-sm">
                {table.getAllLeafColumns().map((column) => (
                  <label key={column.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="size-3 accent-[#0b5cbf]"
                    />
                    {String((column.columnDef.meta as { label?: string } | undefined)?.label ?? column.id)}
                  </label>
                ))}
              </div>
            </details>

            {exportResource && (
              <details className="relative">
                <summary className="flex h-8 cursor-pointer list-none items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                  <Download className="size-3.5" /> Export <ChevronDown className="size-3" />
                </summary>
                <div className="absolute right-0 z-30 mt-1.5 grid w-48 gap-1 rounded border border-slate-200 bg-white p-2 shadow-sm">
                  <button className="rounded px-2 py-1.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50" onClick={() => exportTable("csv")}>
                    Filtered CSV
                  </button>
                  <button className="rounded px-2 py-1.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50" onClick={() => exportTable("xlsx")}>
                    Filtered Excel
                  </button>
                  <button
                    className="rounded px-2 py-1.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:text-slate-300"
                    disabled={selectedIds.size === 0}
                    onClick={() => exportTable("csv", true)}
                  >
                    Selected CSV
                  </button>
                </div>
              </details>
            )}

            <span className="hidden items-center gap-1 rounded bg-white border border-slate-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm sm:flex">
              <SlidersHorizontal className="size-3" /> {totalRows.toLocaleString("en-IN")} records
            </span>
          </div>
        </div>

        {filters && <div className="grid gap-2 md:grid-cols-4">{filters}</div>}
      </div>

      <div className="hidden md:block flex-1 overflow-y-auto overflow-x-auto relative">
        <table className="w-full min-w-[820px] border-collapse text-left text-xs" style={{ width: table.getTotalSize() }}>
          <thead className="sticky top-0 z-20 bg-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <th className="w-8 px-1.5 py-1.5 text-center sticky left-0 z-30 bg-slate-100 border-r border-slate-200 shadow-[1px_0_0_rgba(0,0,0,0.02)]">
                  <input
                    aria-label="Select visible rows"
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={(event) => togglePageSelection(event.target.checked)}
                    className="size-3.5 accent-[#0b5cbf] cursor-pointer"
                  />
                </th>
                {headerGroup.headers.map((header) => {
                  const isActionCol = header.column.id.toLowerCase().includes("action");
                  const isStickyRight = isActionCol || (header.column.columnDef as EnterpriseColumnDef<TData>).meta?.sticky === "right";
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-600 relative group truncate",
                        isStickyRight && "sticky right-0 z-30 bg-slate-100 border-l border-slate-200 shadow-[-1px_0_0_rgba(0,0,0,0.02)]"
                      )}
                      style={{ width: header.getSize() }}
                    >
                      <button
                        type="button"
                        disabled={!header.column.getCanSort()}
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 text-left disabled:cursor-default cursor-pointer truncate w-full"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <ChevronDown className={cn("size-3 text-[#0b5cbf] shrink-0", header.column.getIsSorted() === "asc" && "rotate-180")} />
                        )}
                      </button>
                      
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            "absolute right-0 top-0 h-full w-1 cursor-col-resize user-select-none touch-none bg-slate-200 opacity-0 group-hover:opacity-100 hover:w-1.5 hover:bg-[#0b5cbf] z-40",
                            header.column.getIsResizing() ? "opacity-100 bg-[#0b5cbf] w-1.5" : ""
                          )}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white">
            {isLoading ? (
              Array.from({ length: 15 }).map((_, idx) => (
                <tr key={idx} className="h-7 border-b border-slate-100 animate-pulse even:bg-slate-50/40">
                  <td className="w-8 px-2 text-center align-middle sticky left-0 bg-inherit border-r border-slate-100">
                    <div className="size-3.5 bg-slate-200 rounded mx-auto" />
                  </td>
                  {visibleColumns.map((_, cIdx) => (
                    <td key={cIdx} className="px-2 align-middle">
                      <div className="h-3 bg-slate-200 rounded w-2/3" />
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
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr className="h-48">
                <td colSpan={visibleColumns.length + 1} className="text-center align-middle text-slate-400">
                  <div className="flex flex-col items-center justify-center p-6 gap-2">
                    <Database className="size-8 text-slate-300" />
                    <span className="text-sm font-semibold text-slate-600">
                      {emptyStateMessage || "No Records Found"}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">
                      {hasFilters ? "No master data matches your search or filters." : "No records available."}
                    </span>
                    {hasFilters && onClearFilters && (
                      <button 
                        onClick={onClearFilters}
                        className="mt-2 rounded bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                      >
                        Clear Filters
                      </button>
                    )}
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
                    "border-b border-slate-100 transition-colors h-7 even:bg-[#fafbfc] hover:bg-[#f0f4f8] data-[state=selected]:bg-[#e6f0fa]",
                    onRowClick && "cursor-pointer"
                  )}
                  style={{ height: "28px" }}
                >
                  <td 
                    className={cn(
                      "w-8 px-1.5 py-0.5 text-center align-middle sticky left-0 z-10 border-r border-slate-100",
                      selectedIds.has(row.id) ? "bg-[#e6f0fa]" : "bg-inherit"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
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
                      className="size-3.5 accent-[#0b5cbf] cursor-pointer"
                    />
                  </td>
                  {row.getVisibleCells().map((cell) => {
                    const isActionCol = cell.column.id.toLowerCase().includes("action");
                    const isStickyRight = isActionCol || (cell.column.columnDef as EnterpriseColumnDef<TData>).meta?.sticky === "right";
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-2 py-0.5 align-middle text-[11px] font-semibold text-slate-700 truncate",
                          (cell.column.columnDef.meta as { className?: string } | undefined)?.className,
                          isStickyRight && "sticky right-0 z-10 border-l border-slate-100 bg-inherit"
                        )}
                        style={{ width: cell.column.getSize(), maxWidth: cell.column.getSize() }}
                        title={typeof cell.getValue() === "string" ? String(cell.getValue()) : undefined}
                      >
                        {renderCellContent(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View remains unchanged for brevity */}
      <div className="grid gap-2 p-3 md:hidden overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded border border-slate-200 bg-white p-3 shadow-sm animate-pulse flex flex-col gap-2">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          ))
        ) : error ? (
          <div className="rounded border border-red-200 bg-red-50/50 p-6 text-center text-red-500">
            <AlertCircle className="size-8 text-red-400 mx-auto mb-2" />
            <span className="text-xs font-semibold block">Failed to load records</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded border border-slate-200 bg-slate-50/50 p-8 text-center text-slate-400">
            <Database className="size-8 text-slate-300 mx-auto mb-2" />
            <span className="text-xs font-semibold block">No Records Found</span>
            <span className="text-[10px] font-normal block mt-1">
              {hasFilters ? "No matches found." : "No records available."}
            </span>
          </div>
        ) : (
          rows.map((row) => (
            <button
              type="button"
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className="rounded border border-slate-200 bg-white p-3 text-left shadow-sm cursor-pointer hover:bg-slate-50/50 transition-colors"
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
                  className="size-4 accent-[#0b5cbf] cursor-pointer"
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

      <div className="flex flex-col gap-2 border-t border-slate-100 p-2.5 text-[11px] font-medium text-slate-500 shrink-0 sm:flex-row sm:items-center sm:justify-between bg-white rounded-b-xl z-20">
        <span>
          Showing <strong className="text-slate-800 font-bold">{totalRows === 0 ? 0 : (query.page - 1) * query.limit + 1}</strong> to <strong className="text-slate-800 font-bold">{Math.min(query.page * query.limit, totalRows)}</strong> of <strong className="text-slate-800 font-bold">{totalRows}</strong> records
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <select
            value={query.limit}
            onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })}
            className="h-7 rounded border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 cursor-pointer shadow-sm"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
          <Button variant="outline" size="sm" className="size-7 p-0 cursor-pointer shadow-sm" disabled={query.page <= 1 || isLoading} onClick={() => updateQuery({ page: 1 })} aria-label="First page">
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="size-7 p-0 cursor-pointer shadow-sm" disabled={query.page <= 1 || isLoading} onClick={() => updateQuery({ page: Math.max(1, query.page - 1) })} aria-label="Previous page">
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="size-7 p-0 cursor-pointer shadow-sm" disabled={query.page >= totalPages || isLoading} onClick={() => updateQuery({ page: Math.min(totalPages, query.page + 1) })} aria-label="Next page">
            <ChevronRight className="size-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="size-7 p-0 cursor-pointer shadow-sm" disabled={query.page >= totalPages || isLoading} onClick={() => updateQuery({ page: totalPages })} aria-label="Last page">
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}) as <TData>(props: EnterpriseDataTableProps<TData>) => import("react").ReactElement;
