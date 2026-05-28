import * as React from "react";
import { cn } from "../utils";

/* ----------------------------------------------------
   SIDEBAR COMPONENTS
   ---------------------------------------------------- */
export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  brandTitle?: string;
  brandSubtitle?: string;
  isOpen?: boolean;
  onClose?: () => void;
  userPanel?: React.ReactNode;
}

export function Sidebar({
  brandTitle = "JSW",
  brandSubtitle = "Metal Cost Management System",
  isOpen = false,
  onClose,
  userPanel,
  children,
  className,
  ...props
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-white/10 bg-[#032f67] text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
      {...props}
    >
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-between border-b border-white/15 px-5">
        <div className="text-left">
          <div className="text-2xl font-black italic tracking-wide text-white">{brandTitle}</div>
          <div className="text-[10px] text-white/75 uppercase tracking-wider font-bold mt-0.5">{brandSubtitle}</div>
        </div>
        
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded p-1.5 lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 scrollbar-thin">
        {children}
      </nav>

      {/* Bottom User profile */}
      {userPanel && (
        <div className="border-t border-white/15 p-4 text-left">
          {userPanel}
        </div>
      )}
    </aside>
  );
}

export interface SidebarItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
  icon?: React.ReactNode;
}

export function SidebarItem({
  isActive = false,
  icon,
  children,
  className,
  ...props
}: SidebarItemProps) {
  return (
    <a
      className={cn(
        "flex h-11 items-center gap-3 rounded-lg px-3 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer decoration-none",
        isActive ? "bg-[#0b63c8] text-white shadow-md border-l-4 border-white" : "",
        className
      )}
      {...props}
    >
      {icon && <span className="flex items-center justify-center size-4 text-current shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </a>
  );
}

export interface SidebarUserPanelProps {
  name: string;
  role: string;
}

export function SidebarUserPanel({ name, role }: SidebarUserPanelProps) {
  return (
    <div className="flex flex-col gap-0.5 text-left">
      <p className="font-extrabold text-xs text-white truncate m-0">{name}</p>
      <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider m-0">{role} Workspace</p>
    </div>
  );
}

/* ----------------------------------------------------
   TOP NAVIGATION NAVBAR COMPONENTS
   ---------------------------------------------------- */
export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  onMenuClick?: () => void;
  brandText?: string;
  subText?: string;
  actions?: React.ReactNode;
}

export function Navbar({
  onMenuClick,
  brandText = "JSW Steel",
  subText = "Alloy Cost Calculation Engine",
  actions,
  children,
  className,
  ...props
}: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-[#d6dfeb] bg-white/95 px-4 backdrop-blur-md lg:px-6 justify-between",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden border border-slate-200 rounded-lg p-2 hover:bg-slate-50 cursor-pointer"
            aria-label="Open sidebar"
          >
            <svg className="h-5 w-5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        <div className="min-w-0 text-left">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#0057b8] m-0">{brandText}</p>
          <h1 className="truncate text-sm font-black text-[#10233d] uppercase tracking-wide m-0 mt-0.5">{subText}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {children}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
