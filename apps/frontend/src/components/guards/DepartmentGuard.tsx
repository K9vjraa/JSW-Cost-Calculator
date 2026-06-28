import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../store/auth";

interface DepartmentGuardProps {
  allowedDepartments: string[];
  fallbackPath?: string;
}

export function DepartmentGuard({ allowedDepartments, fallbackPath = "/unauthorized" }: DepartmentGuardProps) {
  const { actor } = useAuth();

  // If there's no authenticated user, redirect to login
  if (!actor) {
    console.warn("[TRACE] Logout Trigger: DepartmentGuard null actor");
    return <Navigate to="/login" replace />;
  }

  console.log("[TRACE] Role Check: actor.department=", actor.department, "allowed=", allowedDepartments);

  const userDept = actor.department?.toUpperCase();
  if (!userDept || !allowedDepartments.includes(userDept)) {
    console.trace("RERENDER [DepartmentGuard]: Unauthorized access loop prevented");
    toast.error("Access restricted. You do not have permission to view this section.");
    return <Navigate to={fallbackPath} replace />;
  }

  // Authorized: render the nested routes
  return <Outlet />;
}
