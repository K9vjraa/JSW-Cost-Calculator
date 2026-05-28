import { useEffect, useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  Truck, 
  Users, 
  X, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Command, 
  User, 
  ArrowRight,
  ShieldAlert,
  Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Core design system imports
import { 
  SidebarUserPanel, 
  Input, 
  Badge, 
  Button, 
  Modal 
} from "@jsw-mcms/ui";

import { notices as fixtureNotices } from "../data/fixtures";
import { getOrFixture } from "../services/api";
import type { Notice } from "../types";
import { useAuth } from "../store/auth";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: FileBarChart2, roles: ["ADMIN", "EMPLOYEE"] },
  { to: "/workspace", label: "Calculation Workspace", icon: Calculator, roles: ["ADMIN", "EMPLOYEE", "USER"] },
  { to: "/comparison", label: "Comparison", icon: GitCompareArrows, roles: ["ADMIN", "EMPLOYEE", "USER"] },
  { to: "/masters", label: "Masters & Pricing", icon: Boxes, roles: ["ADMIN", "EMPLOYEE"] },
  { to: "/suppliers", label: "Suppliers", icon: Truck, roles: ["ADMIN", "EMPLOYEE"] },
  { to: "/reports", label: "Reports", icon: ClipboardList, roles: ["ADMIN", "EMPLOYEE", "USER"] },
  { to: "/audit", label: "Audit & Alerts", icon: ShieldCheck, roles: ["ADMIN", "EMPLOYEE"] },
  { to: "/users", label: "Users & Roles", icon: Users, roles: ["ADMIN"] },
  { to: "/settings", label: "Cost Settings", icon: Settings, roles: ["ADMIN"] }
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { actor, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const handleLogout = () => {
    logout().catch(() => {
      // Swallow logout errors — local state is always cleared
    });
  };
  
  // Custom dropdown / overlays states
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [notices, setNotices] = useState<Notice[]>(fixtureNotices);
  
  const location = useLocation();
  const navigate = useNavigate();

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

  // Notices API background stream simulation
  useEffect(() => {
    getOrFixture<{ data: Notice[] }>("/notifications?limit=6", { data: fixtureNotices })
      .then((result) => setNotices(result.data || []));
      
    const interval = setInterval(() => {
      getOrFixture<{ data: Notice[] }>("/notifications?limit=6", { data: fixtureNotices })
        .then((result) => setNotices(result.data || []));
    }, 15000);
    
    return () => clearInterval(interval);
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
    const defaultHome = actor?.role === "USER" ? "/workspace" : "/dashboard";
    const items = [{ label: "JSW MCMS", to: defaultHome }];
    
    if (path === "/dashboard") {
      items.push({ label: "Dashboard", to: "/dashboard" });
    } else if (path === "/workspace") {
      items.push({ label: "Costing Workspace", to: "/workspace" });
    } else if (path === "/comparison") {
      items.push({ label: "Grade Comparison", to: "/comparison" });
    } else if (path === "/masters") {
      items.push({ label: "Operations", to: "/masters" });
      items.push({ label: "Masters & Pricing", to: "/masters" });
    } else if (path === "/suppliers") {
      items.push({ label: "Operations", to: "/masters" });
      items.push({ label: "Suppliers Profile", to: "/suppliers" });
    } else if (path === "/reports") {
      items.push({ label: "Operations", to: "/reports" });
      items.push({ label: "Reports Ledger", to: "/reports" });
    } else if (path === "/audit") {
      items.push({ label: "Operations", to: "/masters" });
      items.push({ label: "System Audits", to: "/audit" });
    } else if (path === "/users") {
      items.push({ label: "Management", to: "/users" });
      items.push({ label: "Users & Roles", to: "/users" });
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

  // Spotlight search query filtering
  const filteredSearchItems = useMemo(() => {
    if (!searchQuery.trim()) return visibleNavItems;
    return visibleNavItems.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, visibleNavItems]);

  const handleNoticeClick = (notice: Notice) => {
    toast.info(`${notice.title}: ${notice.message}`);
    setNoticeOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-[#10233d] flex">
      {/* ───────── 1. DESKTOP SIDEBAR ───────── */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 76 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="hidden lg:flex flex-col bg-[#032f67] text-white sticky top-0 h-screen z-40 border-r border-white/10 shrink-0 overflow-hidden"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand header */}
        <div className="flex h-20 items-center justify-between border-b border-white/15 px-4.5 shrink-0">
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
                <div className="text-2xl font-black italic tracking-wide text-white">JSW</div>
                <div className="text-[10px] text-white/70 uppercase tracking-widest font-extrabold mt-0.5 whitespace-nowrap">
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
                className="mx-auto text-xl font-black italic tracking-wider text-blue-400"
              >
                JSW
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-md p-1 cursor-pointer transition-colors shrink-0 ml-auto"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 scrollbar-thin" aria-label="Pages">
          {visibleNavItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                title={isSidebarCollapsed ? label : undefined}
                className={`flex h-11 items-center gap-3 rounded-lg transition-all decoration-none overflow-hidden ${
                  isSidebarCollapsed ? "px-0 justify-center" : "px-3.5"
                } ${
                  isActive 
                    ? "bg-[#0b63c8] text-white shadow-md border-l-4 border-white" 
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={`size-4 shrink-0 text-current ${isSidebarCollapsed ? "mx-auto" : ""}`} />
                <AnimatePresence>
                  {!isSidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.12 }}
                      className="truncate text-left text-xs font-bold whitespace-nowrap"
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
          <div className="border-t border-white/15 p-4 flex items-center gap-2 overflow-hidden shrink-0">
            {!isSidebarCollapsed ? (
              <SidebarUserPanel name={actor.name} role={actor.role} />
            ) : (
              <div
                className="mx-auto rounded-full bg-white/10 p-2 text-white/80 cursor-pointer hover:bg-white/20 transition-colors"
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative flex w-[280px] max-w-[85vw] flex-col bg-[#032f67] text-white h-full shadow-2xl z-10"
            >
              {/* Drawer header */}
              <div className="flex h-20 items-center justify-between border-b border-white/15 px-5 shrink-0">
                <div className="text-left">
                  <div className="text-2xl font-black italic tracking-wide text-white">JSW</div>
                  <div className="text-[10px] text-white/70 uppercase tracking-widest font-extrabold mt-0.5">
                    Metal Cost System
                  </div>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="text-white hover:bg-white/10 rounded-md p-1.5 cursor-pointer transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Drawer nav */}
              <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 scrollbar-thin" aria-label="Mobile pages">
                {visibleNavItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex h-11 items-center gap-3 rounded-lg px-3.5 text-xs font-bold transition-all decoration-none ${
                        isActive 
                          ? "bg-[#0b63c8] text-white shadow-md border-l-4 border-white" 
                          : "text-white/80 hover:bg-white/10 hover:text-white"
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
                <div className="border-t border-white/15 p-4 text-left shrink-0">
                  <SidebarUserPanel name={actor.name} role={actor.role} />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleLogout}
                    leftIcon={<LogOut className="size-3.5" />}
                    className="w-full text-xs font-bold py-1.5 justify-center rounded-lg mt-3"
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
          className="sticky top-0 z-20 flex h-20 items-center border-b border-[#d6dfeb] navbar-glass px-4 lg:px-6 justify-between shadow-xs shrink-0"
          role="banner"
        >
          {/* Left: Hamburger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden border border-slate-200 rounded-lg p-2 hover:bg-slate-50 cursor-pointer transition-colors shrink-0"
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
                    className={`hover:text-[#0057b8] transition-colors decoration-none ${
                      idx === breadcrumbs.length - 1 ? "text-slate-700 font-black" : "font-semibold"
                    }`}
                    aria-current={idx === breadcrumbs.length - 1 ? "page" : undefined}
                  >
                    {crumb.label}
                  </NavLink>
                </div>
              ))}
            </nav>
            
            {/* Mobile page title */}
            <div className="sm:hidden text-left font-black text-xs uppercase tracking-wider text-slate-700 truncate">
              {breadcrumbs[breadcrumbs.length - 1]?.label || "JSW Steel"}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Search bar (desktop) */}
            <div 
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 border border-[#d6dfeb] hover:border-[#0057b8]/60 bg-slate-50 hover:bg-white transition-all rounded-xl px-3 py-1.5 cursor-pointer text-slate-400 text-xs w-44 xl:w-56 select-none"
              role="button"
              aria-label="Open quick search (Ctrl+K)"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSearchOpen(true)}
            >
              <Search className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <span className="font-medium text-left flex-1 text-slate-500">Quick Search...</span>
              <kbd className="bg-white border border-slate-200 shadow-xs rounded px-1 text-[9px] font-mono text-slate-400">
                Ctrl+K
              </kbd>
            </div>

            {/* Search button (mobile) */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="md:hidden border border-[#d6dfeb] rounded-lg p-2 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors"
              aria-label="Open search"
            >
              <Search className="size-4" />
            </button>

            {/* ── Notifications ── */}
            <div className="relative">
              <button
                onClick={() => { setNoticeOpen(!noticeOpen); setProfileOpen(false); }}
                className={`relative border border-[#d6dfeb] rounded-lg p-2 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors ${
                  noticeOpen ? "bg-slate-100 border-[#0057b8]" : ""
                }`}
                aria-label={`Notifications${notices.length > 0 ? `, ${notices.length} unread` : ""}`}
                aria-expanded={noticeOpen}
                aria-haspopup="true"
              >
                <Bell className="size-4" />
                {notices.length > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 rounded-full bg-[#d63031] text-[9px] text-white px-1.5 py-0.5 font-bold shadow-xs"
                    aria-hidden="true"
                  >
                    {notices.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {noticeOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setNoticeOpen(false)} aria-hidden="true" />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[#d6dfeb] bg-white p-3 shadow-xl z-20 text-left"
                      role="menu"
                      aria-label="Notifications"
                    >
                      <div className="mb-2 pb-2 border-b border-slate-100 flex items-center justify-between">
                        <strong className="text-xs uppercase font-extrabold text-[#10233d]">
                          Live Operations Alerts
                        </strong>
                        <Badge variant="info">15s Refresh</Badge>
                      </div>

                      {notices.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                          <Inbox className="size-7 text-slate-300 mb-2 animate-bounce" aria-hidden="true" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">No active alerts</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto scrollbar-thin pr-0.5">
                          {notices.map((notice) => (
                            <button
                              key={notice.id}
                              onClick={() => handleNoticeClick(notice)}
                              className="rounded-lg border border-slate-100 p-2 text-left hover:bg-slate-50 transition-colors cursor-pointer w-full"
                              role="menuitem"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="block text-xs font-black text-slate-800 leading-tight">
                                  {notice.title}
                                </span>
                                {notice.category === "CRITICAL" && (
                                  <ShieldAlert className="size-3.5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                                )}
                              </div>
                              <span className="block text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
                                {notice.category}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* ── Profile menu ── */}
            {actor && (
              <div className="relative">
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setNoticeOpen(false); }}
                  className={`flex items-center gap-2 border border-[#d6dfeb] hover:border-[#0057b8] rounded-xl p-1.5 pr-2.5 bg-slate-50 hover:bg-white cursor-pointer transition-all ${
                    profileOpen ? "border-[#0057b8]" : ""
                  }`}
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <div className="rounded-lg bg-[#e8f0fb] text-[#0057b8] p-1 flex items-center justify-center size-6.5 shrink-0 font-extrabold text-[10px]">
                    {actor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-[10px] font-black text-slate-800 leading-none truncate max-w-20">
                      {actor.name.split(" ")[0]}
                    </span>
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5 leading-none">
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
                        className="absolute right-0 mt-3 w-56 rounded-xl border border-[#d6dfeb] bg-white p-3 shadow-xl z-20 text-left flex flex-col gap-2"
                        role="menu"
                        aria-label="Profile options"
                      >
                        <div className="p-1 pb-2 border-b border-slate-100">
                          <strong className="block text-xs font-black text-slate-800">{actor.name}</strong>
                          <span className="block text-[9px] font-extrabold text-[#56657a] uppercase tracking-wider mt-0.5">
                            {actor.role} Account
                          </span>
                        </div>
                        
                        <div className="py-1 flex flex-col gap-1 text-[10px] font-bold text-slate-500">
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
                          className="w-full text-xs font-bold py-1.5 justify-center rounded-lg mt-1"
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

      {/* ───────── 4. GLOBAL SEARCH SPOTLIGHT ───────── */}
      <Modal
        isOpen={searchOpen}
        onClose={() => { setSearchOpen(false); setSearchQuery(""); }}
        title="Spotlight Module Finder"
        subtitle="Quickly transition across MCMS calculations and masters"
      >
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Type search terms (e.g. calculation workspace, reports, suppliers)..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="size-4 text-slate-400" />}
            autoFocus
            className="w-full"
          />

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left block">
              Workspace Shortcuts
            </span>

            {filteredSearchItems.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No matching active modules found.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {filteredSearchItems.map((item) => (
                  <button
                    key={item.to}
                    onClick={() => {
                      navigate(item.to);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center justify-between p-2.5 border border-slate-100 rounded-xl hover:bg-slate-50/80 hover:border-[#0057b8]/30 transition-all text-left cursor-pointer w-full group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 p-1.5 bg-slate-100 group-hover:bg-[#e8f0fb] group-hover:text-[#0057b8] rounded-lg transition-colors">
                        <item.icon className="size-4" aria-hidden="true" />
                      </span>
                      <strong className="text-xs font-black text-slate-800">
                        {item.label}
                      </strong>
                    </div>
                    <span className="text-slate-400 group-hover:text-[#0057b8] flex items-center justify-center transition-colors">
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-[9px] font-semibold text-slate-400 border-t border-slate-100 pt-3 flex items-center gap-1.5 justify-center">
            <Command className="size-3 text-slate-400" aria-hidden="true" />
            <span>Use ↑↓ arrows to select and Enter to open. Escape to exit.</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
