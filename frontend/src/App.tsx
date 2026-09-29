import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, PublicRoute } from "./components/routes/RouteGuards";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import IncomesPage from "./pages/IncomesPage";
import CategoriesPage from "./pages/CategoriesPage";
import TransactionsPage from "./pages/TransactionsPage";
import ProfilePage from "./pages/ProfilePage";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            borderRadius: "1rem",
            fontSize: "0.875rem",
            padding: "0.75rem 1rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#f43f5e",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Routes (redirect to /dashboard if logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Legacy redirect */}
            <Route path="/signup" element={<Navigate to="/register" replace />} />
          </Route>

          {/* Protected Routes (redirect to /login if not logged in) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/incomes" element={<IncomesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Legacy alias redirects */}
            <Route path="/expense" element={<Navigate to="/expenses" replace />} />
            <Route path="/income" element={<Navigate to="/incomes" replace />} />
            <Route path="/category" element={<Navigate to="/categories" replace />} />
            <Route path="/filter" element={<Navigate to="/transactions" replace />} />
          </Route>

          {/* Root and Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
