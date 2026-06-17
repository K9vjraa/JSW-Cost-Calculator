import { useEffect, useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Bell, 
  Boxes, 
  Calculator, 
  ClipboardList, 
  FileBarChart2, 
  GitCompareArrows, 
  LogOut, 
  Menu, 
  Settings, 
  ShieldCheck, 
  Users, 
  X, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  User,
  Layers,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { 
  SidebarUserPanel, 
  Button 
} from "@jsw-mcms/ui";

import { useAuth } from "../store/auth";
import { CommandPalette } from "../components/CommandPalette";
import { useNotificationStore } from "../store/notificationStore";
import { useLiveNotifications } from "../hooks/useLiveNotifications";
import { ToastContainer } from "../components/ToastContainer";
import { NotificationPanel } from "../components/NotificationPanel";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: FileBarChart2, roles: ["COSTING_DEPARTMENT", "PDQC"] },
  { to: "/workspace", label: "Calculation Workspace", icon: Calculator, roles: ["COSTING_DEPARTMENT", "PDQC"] },
  { to: "/material-master", label: "Material Master", icon: Boxes, roles: ["COSTING_DEPARTMENT"] },
  { to: "/material-rates", label: "Material Rates", icon: DollarSign, roles: ["COSTING_DEPARTMENT"] },
  { to: "/grade-builder", label: "Grade Builder", icon: Layers, roles: ["COSTING_DEPARTMENT", "PDQC"] },
  { to: "/grade-comparison", label: "Grade Comparison", icon: GitCompareArrows, roles: ["COSTING_DEPARTMENT", "PDQC"] },
  { to: "/reports", label: "Reports", icon: ClipboardList, roles: ["COSTING_DEPARTMENT", "PDQC"] },
  { to: "/audit-logs", label: "Audit Logs", icon: ShieldCheck, roles: ["COSTING_DEPARTMENT"] },
  { to: "/user-management", label: "User Management", icon: Users, roles: ["COSTING_DEPARTMENT"] },
  { to: "/settings", label: "Settings", icon: Settings, roles: ["COSTING_DEPARTMENT"] }
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { actor, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const prefetchRoute = (to: string) => {
    if (to === "/dashboard") import("../pages/Dashboards");
    else if (to === "/workspace") import("../pages/WorkspacePage");
    else if (to === "/grade-comparison") import("../pages/ComparisonPage");
    else if (
      to === "/material-master" ||
      to === "/material-rates" ||
      to === "/grade-builder" ||
      to === "/user-management" ||
      to === "/settings" ||
      to === "/reports"
    ) {
      import("../pages/OperationsPages");
    }
  };

  const handleLogout = () => {
    logout().catch(() => {
      // Swallow logout errors — local state is always cleared
    });
  };
  
  // Custom dropdown / overlays states
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Real-time EventSource Stream & State Store Integration
  useLiveNotifications();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  
  const location = useLocation();

  // Auto-collapse sidebar on tablet breakpoint (lg but narrower than xl)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (max-width: 1280px)");
    if (mq.matches) setIsSidebarCollapsed(true);
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsSidebarCollapsed(true);
      } else if (window.innerWidth >= 1281) {
        setIsSidebarCollapsed(false);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);



  // Sync state on route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
    setNoticeOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Keyboard shortcuts: Ctrl+K for search, Escape for all overlays
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setNoticeOpen(false);
        setProfileOpen(false);
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dynamic breadcrumb generation matching route definitions
  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    const defaultHome = "/dashboard";
    const items = [{ label: "JSW MCMS", to: defaultHome }];
    
    if (path === "/dashboard") {
      items.push({ label: "Dashboard", to: "/dashboard" });
    } else if (path === "/workspace") {
      items.push({ label: "Costing Workspace", to: "/workspace" });
    } else if (path === "/grade-comparison") {
      items.push({ label: "Grade Comparison", to: "/grade-comparison" });
    } else if (path === "/material-master") {
      items.push({ label: "Operations", to: "/material-master" });
      items.push({ label: "Material Master", to: "/material-master" });
    } else if (path === "/material-rates") {
      items.push({ label: "Operations", to: "/material-rates" });
      items.push({ label: "Material Rates", to: "/material-rates" });
    } else if (path === "/grade-builder") {
      items.push({ label: "Operations", to: "/grade-builder" });
      items.push({ label: "Grade Builder", to: "/grade-builder" });
    } else if (path === "/reports") {
      items.push({ label: "Operations", to: "/reports" });
      items.push({ label: "Reports Ledger", to: "/reports" });
    } else if (path === "/audit-logs") {
      items.push({ label: "Operations", to: "/audit-logs" });
      items.push({ label: "System Audits", to: "/audit-logs" });
    } else if (path === "/user-management") {
      items.push({ label: "Management", to: "/user-management" });
      items.push({ label: "User Management", to: "/user-management" });
    } else if (path === "/settings") {
      items.push({ label: "Management", to: "/settings" });
      items.push({ label: "Cost Settings", to: "/settings" });
    }
    
    return items;
  }, [location.pathname, actor]);

  // Dynamic Role-based navigation filtering
  const visibleNavItems = useMemo(() => {
    return nav.filter((item) => actor && (item.roles as readonly string[]).includes(actor.role));
  }, [actor]);





  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* ───────── 1. DESKTOP SIDEBAR ───────── */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 76 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="hidden lg:flex flex-col bg-white text-slate-800 sticky top-0 h-screen z-40 border-r border-slate-200 shrink-0 overflow-hidden"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-4.5 shrink-0">
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="text-left overflow-hidden"
              >
                <div className="text-2xl font-black italic tracking-wide text-[#002652]">JSW</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mt-0.5 whitespace-nowrap">
                  Cost Management System
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="mx-auto text-xl font-black italic tracking-wider text-[#002652]"
              >
                JSW
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md p-1 cursor-pointer transition-colors shrink-0 ml-auto"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1" aria-label="Pages">
          {visibleNavItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                title={isSidebarCollapsed ? label : undefined}
                onMouseEnter={() => prefetchRoute(to)}
                className={`flex h-10 items-center gap-3 rounded-md transition-all decoration-none overflow-hidden ${
                  isSidebarCollapsed ? "px-0 justify-center" : "px-3"
                } ${
                  isActive 
                    ? "bg-slate-100 text-[#002652] font-semibold border border-slate-200" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={`size-4 shrink-0 ${isActive ? "text-[#002652]" : "text-slate-500"}`} />
                <AnimatePresence>
                  {!isSidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.12 }}
                      className="truncate text-left text-xs font-semibold whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        {/* User panel */}
        {actor && (
          <div className="border-t border-slate-200 p-4 flex items-center gap-2 overflow-hidden shrink-0">
            {!isSidebarCollapsed ? (
              <SidebarUserPanel name={actor.name} role={actor.role} />
            ) : (
              <div
                className="mx-auto rounded-full bg-slate-50 p-2 text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
                title={`${actor.name} (${actor.role})`}
                onClick={handleLogout}
              >
                <User className="size-4.5" />
              </div>
            )}
          </div>
        )}
      </motion.aside>

      {/* ───────── 2. MOBILE DRAWER SIDEBAR ───────── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-50 flex lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
              aria-hidden="true"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative flex w-[280px] max-w-[85vw] flex-col bg-white text-slate-800 h-full z-10 border-r border-slate-200"
            >
              {/* Drawer header */}
              <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5 shrink-0">
                <div className="text-left">
                  <div className="text-2xl font-black italic tracking-wide text-[#002652]">JSW</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mt-0.5">
                    Metal Cost System
                  </div>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="text-slate-500 hover:bg-slate-100 rounded-md p-1.5 cursor-pointer transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Drawer nav */}
              <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1" aria-label="Mobile pages">
                {visibleNavItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileSidebarOpen(false)}
                    onMouseEnter={() => prefetchRoute(to)}
                    className={({ isActive }) =>
                      `flex h-10 items-center gap-3 rounded-md px-3.5 text-xs font-semibold transition-all decoration-none ${
                        isActive 
                          ? "bg-slate-100 text-[#002652] border border-slate-200" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Drawer user panel + logout */}
              {actor && (
                <div className="border-t border-slate-200 p-4 text-left shrink-0">
                  <SidebarUserPanel name={actor.name} role={actor.role} />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleLogout}
                    leftIcon={<LogOut className="size-3.5" />}
                    className="w-full text-xs font-bold py-1.5 justify-center rounded-md mt-3"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───────── 3. MAIN LAYOUT WRAPPER ───────── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ── TOP NAVBAR ── */}
        <header
          className="sticky top-0 z-20 flex h-20 items-center border-b border-slate-200 bg-white px-4 lg:px-6 justify-between shrink-0"
          role="banner"
        >
          {/* Left: Hamburger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden border border-slate-200 rounded-md p-2 hover:bg-slate-50 cursor-pointer transition-colors shrink-0"
              aria-label="Open navigation menu"
              aria-expanded={mobileSidebarOpen}
            >
              <Menu className="size-4.5 stroke-2 text-slate-600" />
            </button>
            
            {/* Desktop breadcrumb */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-bold overflow-hidden" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, idx) => (
                <div key={crumb.to + idx} className="flex items-center gap-1.5 shrink-0">
                  {idx > 0 && <ChevronRight className="size-3.5 text-slate-300" aria-hidden="true" />}
                  <NavLink
                    to={crumb.to}
                    className={`hover:text-[#002652] transition-colors decoration-none ${
                      idx === breadcrumbs.length - 1 ? "text-slate-700 font-bold" : "font-medium"
                    }`}
                    aria-current={idx === breadcrumbs.length - 1 ? "page" : undefined}
                  >
                    {crumb.label}
                  </NavLink>
                </div>
              ))}
            </nav>
            
            {/* Mobile page title */}
            <div className="sm:hidden text-left font-bold text-xs uppercase tracking-wider text-slate-700 truncate">
              {breadcrumbs[breadcrumbs.length - 1]?.label || "JSW Steel"}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Search bar (desktop) */}
            <div 
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 border border-slate-200 hover:border-[#002652]/60 bg-slate-50 hover:bg-white transition-all rounded-md px-3 py-1.5 cursor-pointer text-slate-400 text-xs w-44 xl:w-56 select-none"
              role="button"
              aria-label="Open quick search (Ctrl+K)"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSearchOpen(true)}
            >
              <Search className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <span className="font-medium text-left flex-1 text-slate-500">Quick Search...</span>
              <kbd className="bg-white border border-slate-200 rounded px-1 text-[9px] font-mono text-slate-400">
                Ctrl+K
              </kbd>
            </div>

            {/* Search button (mobile) */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="md:hidden border border-slate-200 rounded-md p-2 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors"
              aria-label="Open search"
            >
              <Search className="size-4" />
            </button>

            {/* ── Notifications ── */}
            <div className="relative">
              <button
                onClick={() => { setNoticeOpen(true); setProfileOpen(false); }}
                className={`relative border border-slate-200 rounded-md p-2 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors ${
                  noticeOpen ? "bg-slate-100 border-[#002652]" : ""
                }`}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                aria-expanded={noticeOpen}
                aria-haspopup="true"
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 rounded-full bg-[#dc2626] text-[9px] text-white px-1.5 py-0.5 font-bold"
                    aria-hidden="true"
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* ── Profile menu ── */}
            {actor && (
              <div className="relative">
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setNoticeOpen(false); }}
                  className={`flex items-center gap-2 border border-slate-200 hover:border-[#002652] rounded-md p-1.5 pr-2.5 bg-slate-50 hover:bg-white cursor-pointer transition-all ${
                    profileOpen ? "border-[#002652]" : ""
                  }`}
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <div className="rounded-sm bg-slate-200 text-slate-800 p-1 flex items-center justify-center size-6.5 shrink-0 font-bold text-[10px]">
                    {actor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-[10px] font-bold text-slate-800 leading-none truncate max-w-20">
                      {actor.name.split(" ")[0]}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 leading-none">
                      {actor.role}
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} aria-hidden="true" />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 rounded-md border border-slate-200 bg-white p-3 z-20 text-left flex flex-col gap-2"
                        role="menu"
                        aria-label="Profile options"
                      >
                        <div className="p-1 pb-2 border-b border-slate-100">
                          <strong className="block text-xs font-bold text-slate-800">{actor.name}</strong>
                          <span className="block text-[9px] font-semibold text-[#56657a] uppercase tracking-wider mt-0.5">
                            {actor.role} Account
                          </span>
                        </div>
                        
                        <div className="py-1 flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
                          <div
                            className="px-2 py-1 flex items-center gap-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                            role="menuitem"
                            tabIndex={0}
                          >
                            <User className="size-3.5" aria-hidden="true" />
                            <span>My Profile</span>
                          </div>
                          <div
                            className="px-2 py-1 flex items-center gap-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                            role="menuitem"
                            tabIndex={0}
                          >
                            <Settings className="size-3.5" aria-hidden="true" />
                            <span>Workspace Config</span>
                          </div>
                        </div>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={handleLogout}
                          leftIcon={<LogOut className="size-3.5" />}
                          className="w-full text-xs font-bold py-1.5 justify-center rounded-md mt-1"
                        >
                          Sign Out Session
                        </Button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        {/* ── MAIN CONTENT AREA ── */}
        <main
          className="flex-1 p-4 md:p-5 lg:p-6 overflow-y-auto"
          id="main-content"
          role="main"
        >
          {children}
        </main>
      </div>

      {/* ───────── 4. GLOBAL COMMAND PALETTE SEARCH ENGINE ───────── */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* ───────── 5. ENTERPRISE REAL-TIME NOTIFICATION DRAWER & TOAST STACKS ───────── */}
      <ToastContainer />
      <NotificationPanel
        isOpen={noticeOpen}
        onClose={() => setNoticeOpen(false)}
      />
    </div>
  );
}
