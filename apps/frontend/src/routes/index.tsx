import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "../layouts/AppShell";
import { useAuth } from "../store/auth";
import { ComparisonPage } from "../pages/ComparisonPage";
import { DashboardPage } from "../pages/Dashboards";
import { LoginPage } from "../pages/LoginPage";
import { AuditPage, MastersPage, ReportsPage } from "../pages/OperationsPages";
import { WorkspacePage } from "../pages/WorkspacePage";
import { ErrorBoundary } from "../components/ErrorBoundary";
import type { RoleName } from "@jsw-mcms/types";

function ProtectedLayout() {
  const { actor } = useAuth();
  if (!actor) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

interface RoleGuardProps {
  allowedRoles: RoleName[];
}

function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { actor } = useAuth();
  if (!actor) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(actor.role)) {
    return <Navigate to={actor.role === "USER" ? "/workspace" : "/dashboard"} replace />;
  }
  return <Outlet />;
}

function DefaultRedirect() {
  const { actor } = useAuth();
  if (!actor) return <Navigate to="/login" replace />;
  return <Navigate to={actor.role === "USER" ? "/workspace" : "/dashboard"} replace />;
}

export function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedLayout />}>
          {/* Dashboard - Employee & Admin only */}
          <Route element={<RoleGuard allowedRoles={["ADMIN", "EMPLOYEE"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Calculator base & reports - Publicly accessible protected pages */}
          <Route element={<RoleGuard allowedRoles={["ADMIN", "EMPLOYEE", "USER"]} />}>
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Employee & Admin only pages */}
          <Route element={<RoleGuard allowedRoles={["ADMIN", "EMPLOYEE"]} />}>
            <Route path="/masters" element={<MastersPage />} />
            <Route path="/suppliers" element={<MastersPage focus="suppliers" />} />
            <Route path="/audit" element={<AuditPage />} />
          </Route>

          {/* Admin only pages */}
          <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
            <Route path="/users" element={<MastersPage focus="users" />} />
            <Route path="/settings" element={<MastersPage focus="settings" />} />
          </Route>
        </Route>
        
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </ErrorBoundary>
  );
}
export default AppRoutes;
