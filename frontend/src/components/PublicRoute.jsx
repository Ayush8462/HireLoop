import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PublicRoute prevents authenticated users from accessing guest-only pages
 * like LandingPage, Login, and Signup.
 * If user is authenticated, redirect to /dashboard.
 */
export default function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}
