import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

/** Redirects to /login when there is no active session. */
export function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
