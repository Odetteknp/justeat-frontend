import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function ProtectedRoute({
  allow,
  children,
  redirect = "/login",
}: {
  allow: boolean;
  children: ReactNode;
  redirect?: string;
}) {
  return allow ? <>{children}</> : <Navigate to={redirect} replace />;
}
