import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "../layouts/AppShell";
import { useAuth } from "../store/auth";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { DepartmentGuard } from "../components/guards/DepartmentGuard";

// ── CODE SPLITTING / LAZY LOADED ROUTE CHUNKS ──────────────────────────────────
const ComparisonPage = lazy(() => import("../pages/ComparisonPage").then(m => ({ default: m.ComparisonPage })));
const DashboardPage = lazy(() => import("../pages/Dashboards").then(m => ({ default: m.DashboardPage })));
const LoginPage = lazy(() => import("../pages/LoginPage").then(m => ({ default: m.LoginPage })));
const AuditPage = lazy(() => import("../pages/OperationsPages").then(m => ({ default: m.AuditPage })));
const MastersPage = lazy(() => import("../pages/OperationsPages").then(m => ({ default: m.MastersPage })));
const ReportsPage = lazy(() => import("../pages/ReportsPage").then(m => ({ default: m.ReportsPage })));
const WorkspacePage = lazy(() => import("../pages/WorkspacePage").then(m => ({ default: m.WorkspacePage })));
const LandingPage = lazy(() => import("../pages/LandingPage").then(m => ({ default: m.LandingPage })));

const Page404 = lazy(() => import("../pages/ErrorPages").then(m => ({ default: m.Page404 })));
const Page403 = lazy(() => import("../pages/ErrorPages").then(m => ({ default: m.Page403 })));
const Page500 = lazy(() => import("../pages/ErrorPages").then(m => ({ default: m.Page500 })));
const PageMaintenance = lazy(() => import("../pages/ErrorPages").then(m => ({ default: m.PageMaintenance })));

// Reusable Loading Fallback
function RouteLoadingFallback() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 animate-in fade-in duration-200">
      {/* Simulated Top Progress Bar */}
      <div className="w-full h-1 bg-slate-100 overflow-hidden relative shrink-0">
        <div className="absolute top-0 bottom-0 left-0 bg-[#1A365D] animate-loading-bar" style={{ width: "30%" }} />
      </div>
      
      {/* Mock ERP Page Skeleton Layout */}
      <div className="flex-1 flex flex-col p-6 gap-6">
        {/* Top Header Mockup */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex flex-col gap-2">
            <div className="h-2.5 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-48 bg-slate-300 rounded animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Dashboard Cards Mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="border border-slate-200 bg-white p-4 rounded-sm shadow-2xs h-24 flex flex-col justify-between animate-pulse">
              <div className="h-3 w-1/3 bg-slate-200 rounded" />
              <div className="h-6 w-2/3 bg-slate-300 rounded" />
              <div className="h-2 w-1/2 bg-slate-150 rounded" />
            </div>
          ))}
        </div>

        {/* Workspace Panels Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2 border border-slate-200 bg-white p-5 rounded-sm shadow-2xs flex flex-col gap-4 animate-pulse">
            <div className="h-4 w-1/4 bg-slate-300 rounded" />
            <div className="h-32 bg-slate-100 rounded" />
            <div className="h-24 bg-slate-50 rounded" />
          </div>
          <div className="border border-slate-200 bg-white p-5 rounded-sm shadow-2xs flex flex-col gap-4 animate-pulse">
            <div className="h-4 w-1/3 bg-slate-300 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const { actor } = useAuth();
  console.log("[TRACE] Protected Route Check: actor=", actor);
  if (!actor) {
    console.warn("[TRACE] Logout Trigger: ProtectedRoute null actor");
    return <Navigate to="/login" replace />;
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function DefaultRedirect() {
  const { actor } = useAuth();
  if (!actor) return <Navigate to="/" replace />;
  return <Navigate to="/dashboard" replace />;
}

export function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedLayout />}>
            {/* Pages accessible by both COSTING and PDQC */}
            <Route element={<DepartmentGuard allowedDepartments={["COSTING", "PDQC"]} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/grade-builder" element={<MastersPage focus="grade-builder" />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/material-rates" element={<MastersPage focus="material-rates" />} />
            </Route>

            {/* Pages accessible to COSTING and PDQC */}
            <Route element={<DepartmentGuard allowedDepartments={["COSTING", "PDQC"]} fallbackPath="/dashboard" />}>
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/grade-comparison" element={<ComparisonPage />} />
            </Route>

            {/* Pages restricted to COSTING only */}
            <Route element={<DepartmentGuard allowedDepartments={["COSTING"]} fallbackPath="/unauthorized" />}>
              <Route path="/material-master" element={<MastersPage focus="material-master" />} />
              <Route path="/audit-logs" element={<AuditPage />} />
              <Route path="/user-management" element={<MastersPage focus="user-management" />} />
              <Route path="/settings" element={<MastersPage focus="settings" />} />
            </Route>

            {/* Fallback 404 route inside layout */}
            <Route path="*" element={<Page404 />} />
          </Route>
          
          {/* Public error testing routes */}
          <Route path="/unauthorized" element={<Page403 />} />
          <Route path="/403" element={<Page403 />} />
          <Route path="/500" element={<Page500 />} />
          <Route path="/maintenance" element={<PageMaintenance />} />
          
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default AppRoutes;
