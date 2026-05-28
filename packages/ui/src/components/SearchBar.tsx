import * as React from "react";
import { cn } from "../utils";
import { Search, X } from "lucide-react";

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  showShortcut?: boolean;
  shortcutKey?: string; // e.g. "K" for Ctrl+K
  placeholder?: string;
  wrapperClassName?: string;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onChange,
      onClear,
      showShortcut = true,
      shortcutKey = "k",
      placeholder = "Search logs, materials or reports...",
      wrapperClassName,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    // Combine local ref with forwardRef
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    // Keyboard shortcut handler
    React.useEffect(() => {
      if (!showShortcut) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === shortcutKey.toLowerCase()) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showShortcut, shortcutKey]);

    const handleClear = () => {
      onChange("");
      onClear?.();
      inputRef.current?.focus();
    };

    return (
      <div className={cn("relative flex items-center w-full", wrapperClassName)}>
        <span className="absolute left-3 flex items-center justify-center text-[#56657a] pointer-events-none">
          <Search className="size-4" />
        </span>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Search"
          className={cn(
            "h-9.5 w-full rounded-lg border border-[#d6dfeb] bg-white pl-9.5 pr-14 text-xs font-bold text-[#10233d] transition-all placeholder:text-slate-400 placeholder:font-normal focus:border-[#0057b8] focus:ring-1 focus:ring-[#0057b8] focus:outline-none disabled:bg-slate-50 disabled:opacity-60",
            value ? "pr-9" : "",
            className
          )}
          {...props}
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 flex items-center justify-center p-1 rounded-full text-[#56657a] hover:bg-slate-100 hover:text-[#10233d] cursor-pointer transition-colors"
            aria-label="Clear search"
          >
            <X className="size-3" />
          </button>
        )}

        {!value && showShortcut && !disabled && (
          <div className="absolute right-3 hidden sm:flex items-center gap-0.5 pointer-events-none select-none bg-slate-100 border border-[#d6dfeb]/60 rounded px-1.5 py-0.5 text-[8px] font-black uppercase text-[#56657a]">
            <span>Ctrl</span>
            <span>+</span>
            <span>{shortcutKey.toUpperCase()}</span>
          </div>
        )}
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
