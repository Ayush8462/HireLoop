import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Signup from "./pages/auth/signup";
import Login from "./pages/auth/login";
import Dashboard from "./pages/dashboard/dashboard";
import SeniorDashboard from "./pages/dashboard/senior-dashboard";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes (accessible only when NOT logged in) */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected routes (accessible only when logged in) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/senior-dashboard"
        element={
          <ProtectedRoute>
            <SeniorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
