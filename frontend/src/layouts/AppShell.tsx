import { Bell, Boxes, Calculator, ClipboardList, FileBarChart2, GitCompareArrows, LogOut, Menu, Settings, ShieldCheck, Truck, Users, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { notices as fixtureNotices } from "@/data/fixtures";
import { getOrFixture } from "@/services/api";
import type { Notice, RoleName } from "@/types";
import { useAuth } from "@/store/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: FileBarChart2, roles: ["ADMIN", "EMPLOYEE", "USER"] },
  { to: "/workspace", label: "Calculation Workspace", icon: Calculator, roles: ["ADMIN", "EMPLOYEE", "USER"] },
  { to: "/comparison", label: "Comparison", icon: GitCompareArrows, roles: ["ADMIN", "EMPLOYEE", "USER"] },
  { to: "/masters", label: "Masters & Pricing", icon: Boxes, roles: ["ADMIN", "EMPLOYEE"] },
  { to: "/suppliers", label: "Suppliers", icon: Truck, roles: ["ADMIN", "EMPLOYEE"] },
  { to: "/reports", label: "Reports", icon: ClipboardList, roles: ["ADMIN", "EMPLOYEE", "USER"] },
  { to: "/audit", label: "Audit & Alerts", icon: ShieldCheck, roles: ["ADMIN", "EMPLOYEE"] },
  { to: "/users", label: "Users & Roles", icon: Users, roles: ["ADMIN"] },
  { to: "/settings", label: "Cost Settings", icon: Settings, roles: ["ADMIN"] }
] satisfies Array<{ to: string; label: string; icon: typeof Bell; roles: RoleName[] }>;

export function AppShell({ children }: { children: ReactNode }) {
  const { actor, logout } = useAuth();
  const [drawer, setDrawer] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [notices, setNotices] = useState(fixtureNotices);
  const location = useLocation();

  useEffect(() => {
    getOrFixture<{ data: Notice[] }>("/notifications?limit=6", { data: fixtureNotices }).then((result) => setNotices(result.data));
    const interval = setInterval(() => getOrFixture<{ data: Notice[] }>("/notifications?limit=6", { data: fixtureNotices }).then((result) => setNotices(result.data)), 15000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => setDrawer(false), [location.pathname]);

  const visible = nav.filter((item) => actor && item.roles.includes(actor.role));
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className={cn("fixed inset-y-0 left-0 z-30 flex w-[260px] -translate-x-full flex-col border-r bg-[#032f67] text-white transition lg:sticky lg:top-0 lg:h-screen lg:translate-x-0", drawer && "translate-x-0")}>
        <div className="flex h-20 items-center justify-between border-b border-white/15 px-5">
          <div>
            <div className="text-2xl font-black italic">JSW</div>
            <div className="text-xs text-white/75">Metal Cost Management System</div>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 lg:hidden" onClick={() => setDrawer(false)} aria-label="Close navigation"><X /></Button>
        </div>
        <nav className="scrollbar-thin flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {visible.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => cn("flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-white/85 hover:bg-white/10", isActive && "bg-[#0b63c8] text-white shadow") }><Icon className="size-4" />{label}</NavLink>)}
        </nav>
        <div className="border-t border-white/15 p-4 text-sm">
          <p className="font-semibold">{actor?.name}</p>
          <p className="text-xs text-white/70">{actor?.role} Workspace</p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b bg-white/95 px-4 backdrop-blur lg:px-6">
          <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setDrawer(true)} aria-label="Open navigation"><Menu /></Button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase text-[var(--primary)]">JSW Steel</p>
            <h1 className="truncate text-lg font-bold">Alloy Cost Calculation Engine</h1>
          </div>
          <Input className="hidden max-w-xs md:block" placeholder="Search calculations, alloys..." />
          <div className="relative">
            <Button variant="outline" size="icon" onClick={() => setNoticeOpen((open) => !open)} aria-label="Open notifications"><Bell /><span className="absolute -right-1 -top-1 rounded-full bg-[#d63031] px-1 text-[10px] text-white">{notices.length}</span></Button>
            {noticeOpen ? <div className="absolute right-0 top-12 w-[min(360px,calc(100vw-2rem))] rounded-lg border bg-white p-3 shadow-xl">
              <div className="mb-2 flex items-center justify-between"><strong className="text-sm">Live notifications</strong><Badge>15s refresh</Badge></div>
              <div className="flex flex-col gap-2">{notices.map((notice) => <button key={notice.id} className="rounded-md border p-2 text-left hover:bg-[var(--muted)]" onClick={() => toast(notice.message)}><span className="block text-sm font-semibold">{notice.title}</span><span className="block text-xs text-[var(--muted-foreground)]">{notice.category}</span></button>)}</div>
            </div> : null}
          </div>
          <Badge className="hidden border-[#bfd6f5] bg-[#edf5ff] text-[#063d83] sm:inline-flex">{actor?.role}</Badge>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out"><LogOut /></Button>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
