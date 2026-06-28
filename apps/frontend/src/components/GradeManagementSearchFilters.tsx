import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { TableQueryState } from "@/hooks/useTableQuery";

export interface GradeManagementSearchFiltersProps {
  query: TableQueryState;
  setQuery: React.Dispatch<React.SetStateAction<TableQueryState>>;
  metals: { id: string; name: string }[];
  onReset?: () => void;
}

export function GradeManagementSearchFilters({ query, setQuery, metals, onReset }: GradeManagementSearchFiltersProps) {
  const [localSearch, setLocalSearch] = useState(query.search || "");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((current) => ({ ...current, search: localSearch, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setQuery]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-[220px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search grades..."
          className="h-9 rounded-sm border-slate-200 bg-white pl-9 text-xs font-semibold shadow-sm"
        />
      </div>

      <select
        value={query.filters.metalId ?? ""}
        onChange={(event) => setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, metalId: event.target.value || undefined } }))}
        className="h-9 rounded-sm border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 shadow-sm outline-none focus:border-[#0b5cbf] focus:ring-1 focus:ring-[#0b5cbf]"
      >
        <option value="">Metal Class</option>
        {metals.map((metal) => <option key={metal.id} value={metal.id}>{metal.name}</option>)}
      </select>

      <select
        value={query.filters.status ?? ""}
        onChange={(event) => setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, status: event.target.value || undefined } }))}
        className="h-9 rounded-sm border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 shadow-sm outline-none focus:border-[#0b5cbf] focus:ring-1 focus:ring-[#0b5cbf]"
      >
        <option value="">Status</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="DRAFT">Draft</option>
      </select>

      <select
        value={query.filters.premiumRange ?? ""}
        onChange={(event) => setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, premiumRange: event.target.value || undefined } }))}
        className="h-9 rounded-sm border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 shadow-sm outline-none focus:border-[#0b5cbf] focus:ring-1 focus:ring-[#0b5cbf]"
      >
        <option value="">Premium Range</option>
        <option value="low">Low (0 - 10)</option>
        <option value="medium">Medium (10 - 25)</option>
        <option value="high">High (25+)</option>
      </select>

      <Button 
        onClick={() => {
          setLocalSearch("");
          setQuery((current) => ({ ...current, search: "", page: 1, filters: {}, sortBy: undefined, sortDir: undefined }));
          if (onReset) onReset();
        }}
        variant="ghost" 
        size="sm" 
        className="h-9 font-semibold text-slate-500 hover:text-slate-800"
      >
        Reset Filters
      </Button>

      <Button variant="outline" size="sm" className="h-9 font-semibold text-slate-700 bg-white border-slate-200 shadow-sm hover:bg-slate-50">
        <Filter className="mr-2 size-4 text-blue-600" /> Filters
      </Button>
    </div>
  );
}
