import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "../layouts/AppShell";
import { useAuth } from "../store/auth";
import { ComparisonPage } from "../pages/ComparisonPage";
import { DashboardPage } from "../pages/Dashboards";
import { LoginPage } from "../pages/LoginPage";
import { AuditPage, MastersPage, ReportsPage } from "../pages/OperationsPages";
import { WorkspacePage } from "../pages/WorkspacePage";
import { ErrorBoundary } from "../components/ErrorBoundary";

function ProtectedLayout() {
  const { actor } = useAuth();
  if (!actor) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/masters" element={<MastersPage />} />
          <Route path="/suppliers" element={<MastersPage focus="suppliers" />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/users" element={<MastersPage focus="users" />} />
          <Route path="/settings" element={<MastersPage focus="settings" />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
