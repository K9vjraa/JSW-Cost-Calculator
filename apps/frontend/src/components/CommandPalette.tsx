import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ShieldAlert, Award, FileSpreadsheet, Calculator, Users, Clock, Compass, CornerDownLeft, Sparkles } from "lucide-react";
import { useGlobalSearchQuery } from "@/services/api/search.api";
import { useDebounce, useSearchHistory, fuzzyMatchScore } from "@/hooks/useSearch";
import { cn, inr } from "@jsw-mcms/ui";
import { useAuth } from "@/store/auth";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchCategory = "all" | "metals" | "grades" | "calculations" | "reports" | "users";

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { actor } = useAuth();
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 250);
  const [category, setCategory] = React.useState<SearchCategory>("all");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();
  const { data, isLoading } = useGlobalSearchQuery(debouncedQuery, isOpen);

  // Close palette on ESC key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Compile and sort matches using sequential fuzzy score
  const searchResults = React.useMemo(() => {
    if (!data) return [];

    const list: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: Exclude<SearchCategory, "all">;
      score: number;
      onClick: () => void;
    }> = [];

    const isCosting = actor?.role === "COSTING_DEPARTMENT";

    // Metals
    if (isCosting) {
      data.metals.forEach((m) => {
        const score = Math.max(fuzzyMatchScore(m.name, debouncedQuery), fuzzyMatchScore(m.code, debouncedQuery));
        list.push({
          id: `metal-${m.id}`,
          title: m.name,
          subtitle: `Code: ${m.code} | Category: ${m.category} | ${m.status}`,
          category: "metals",
          score,
          onClick: () => {
            addSearch(debouncedQuery || m.name);
            navigate("/material-master");
            onClose();
          }
        });
      });
    }

    // Grades
    data.grades.forEach((g) => {
      const score = Math.max(fuzzyMatchScore(g.name, debouncedQuery), fuzzyMatchScore(g.subGrade || "", debouncedQuery));
      list.push({
        id: `grade-${g.id}`,
        title: `${g.name} ${g.subGrade ? `(${g.subGrade})` : ""}`,
        subtitle: `Multiplier: ${g.status}`,
        category: "grades",
        score,
        onClick: () => {
          addSearch(debouncedQuery || g.name);
          navigate("/grade-builder");
          onClose();
        }
      });
    });

    // Calculations
    data.calculations.forEach((c) => {
      const score = Math.max(fuzzyMatchScore(c.name, debouncedQuery), fuzzyMatchScore(c.batchId, debouncedQuery));
      list.push({
        id: `calc-${c.id}`,
        title: c.name,
        subtitle: `Batch: ${c.batchId} | Final Cost: ${inr(c.finalCost)} | ${c.status}`,
        category: "calculations",
        score,
        onClick: () => {
          addSearch(debouncedQuery || c.name);
          navigate(`/calculations?batchId=${c.batchId}`);
          onClose();
        }
      });
    });

    // Reports
    data.reports.forEach((r) => {
      const score = fuzzyMatchScore(r.name, debouncedQuery);
      list.push({
        id: `report-${r.id}`,
        title: r.name,
        subtitle: `Type: ${r.type} | Created: ${new Date(r.createdAt).toLocaleDateString()}`,
        category: "reports",
        score,
        onClick: () => {
          addSearch(debouncedQuery || r.name);
          navigate("/reports");
          onClose();
        }
      });
    });

    // Users
    if (isCosting) {
      data.users.forEach((u) => {
        const score = Math.max(fuzzyMatchScore(u.name, debouncedQuery), fuzzyMatchScore(u.email, debouncedQuery));
        list.push({
          id: `user-${u.id}`,
          title: u.name,
          subtitle: `Email: ${u.email} | Dept: ${u.department || "N/A"} | ${u.status}`,
          category: "users",
          score,
          onClick: () => {
            addSearch(debouncedQuery || u.name);
            navigate("/user-management"); // Admin user management setting panel
            onClose();
          }
        });
      });
    }

    // Filter by selected category tab
    const filtered = category === "all" ? list : list.filter((item) => item.category === category);

    // Sort by sequential fuzzy scoring matching rank
    return filtered.sort((a, b) => b.score - a.score);
  }, [data, debouncedQuery, category, navigate, onClose, addSearch]);

  // Handle arrow navigation keys
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query, category]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleNav = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(searchResults.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + Math.max(searchResults.length, 1)) % Math.max(searchResults.length, 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          searchResults[selectedIndex].onClick();
        }
      }
    };

    window.addEventListener("keydown", handleNav);
    return () => window.removeEventListener("keydown", handleNav);
  }, [isOpen, searchResults, selectedIndex]);

  const getIcon = (cat: Exclude<SearchCategory, "all">) => {
    switch (cat) {
      case "metals":
        return <ShieldAlert className="size-4 text-[#0057b8]" />;
      case "grades":
        return <Award className="size-4 text-[#8b5cf6]" />;
      case "calculations":
        return <Calculator className="size-4 text-[#f2994a]" />;
      case "reports":
        return <FileSpreadsheet className="size-4 text-success-fg" />;
      case "users":
        return <Users className="size-4 text-[#032f67]" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-28">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#10233d]/60 backdrop-blur-xs"
          />

          {/* Palette Box container */}
          <motion.div
            initial={{ y: -15, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -15, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl bg-white border border-[#d6dfeb] rounded-sm shadow-sm overflow-hidden flex flex-col z-10 text-left"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#d6dfeb]/50 bg-slate-50/50">
              <Search className="size-4.5 text-[#56657a] shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search metals, calculations, reports, configurations..."
                className="w-full bg-transparent text-xs font-bold text-[#10233d] placeholder:text-slate-400 placeholder:font-normal focus:outline-none h-6"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-slate-400 hover:text-[#10233d] p-0.5 rounded cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 overflow-x-auto shrink-0 select-none">
              {(["all", "metals", "grades", "calculations", "reports", "users"] as SearchCategory[])
                .filter((tab) => {
                  if (actor?.role !== "COSTING_DEPARTMENT") {
                    return tab !== "metals" && tab !== "users";
                  }
                  return true;
                })
                .map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCategory(tab)}
                  className={cn(
                    "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-sm border cursor-pointer transition-all",
                    category === tab
                      ? "bg-[#edf5ff] border-[#bfd6f5] text-[#0057b8]"
                      : "bg-white border-[#d6dfeb] text-[#56657a] hover:bg-slate-50"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Results Area */}
            <div className="max-h-[360px] overflow-y-auto p-2 flex flex-col gap-0.5 scrollbar-thin select-none min-h-[160px]">
              {isLoading && (
                <div className="p-2 space-y-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded border border-slate-100 bg-white animate-pulse">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="size-6 bg-slate-200 rounded" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 w-1/3 bg-slate-200 rounded" />
                          <div className="h-2 w-1/2 bg-slate-150 rounded" />
                        </div>
                      </div>
                      <div className="h-4 w-12 bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && !query && (
                // Show Search History & Recents
                <div className="p-2 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#56657a] flex items-center gap-1">
                      <Clock className="size-3 text-[#0057b8]" />
                      Recent Searches
                    </span>
                    {history.length > 0 && (
                      <button
                        type="button"
                        onClick={clearHistory}
                        className="text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:text-[#d63031] transition-colors cursor-pointer"
                      >
                        Clear History
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider py-4 text-center">
                      No recent searches saved.
                    </span>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {history.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => setQuery(item)}
                          className="flex items-center justify-between p-2 rounded-sm hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-[#d6dfeb]/60"
                        >
                          <span className="text-xs font-semibold text-[#10233d]">{item}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSearch(item);
                            }}
                            className="text-slate-300 hover:text-[#d63031] p-0.5 rounded cursor-pointer"
                            aria-label="Remove search history item"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!isLoading && query && searchResults.length === 0 && (
                // Zero results empty state
                <div className="flex flex-col items-center justify-center p-8 gap-2 text-slate-400 font-bold uppercase text-[9px] tracking-wider py-12">
                  <ShieldAlert className="size-8 text-[#56657a] mb-1" />
                  <span>No results matching "{query}"</span>
                </div>
              )}

              {!isLoading && query && searchResults.length > 0 && (
                // List search results
                searchResults.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={item.onClick}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-sm border cursor-pointer transition-all gap-4 text-left",
                        isSelected
                          ? "bg-[#edf5ff]/55 border-[#0057b8] shadow-xs"
                          : "bg-white border-transparent hover:bg-slate-50/70"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-8 bg-slate-50 border border-slate-100 flex items-center justify-center rounded-sm shrink-0">
                          {getIcon(item.category)}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-black text-[#10233d] tracking-tight">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-[#56657a] font-medium leading-none">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-[#0057b8] border border-[#bfd6f5] bg-[#edf5ff] px-1.5 py-0.5 rounded shrink-0">
                          <span>Open</span>
                          <CornerDownLeft className="size-2.5" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer help shortcuts bar */}
            <div className="p-3 border-t border-[#d6dfeb]/50 bg-slate-50 flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-[#56657a] select-none shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="bg-white border border-[#d6dfeb] px-1 py-0.5 rounded shadow-2xs text-[9px]">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white border border-[#d6dfeb] px-1 py-0.5 rounded shadow-2xs text-[9px]">Enter</kbd> Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white border border-[#d6dfeb] px-1 py-0.5 rounded shadow-2xs text-[9px]">Esc</kbd> Close
                </span>
              </div>
              <span className="flex items-center gap-0.5 text-[#0057b8]">
                <Sparkles className="size-3 animate-pulse" />
                JSW Global Search Engine
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default CommandPalette;
