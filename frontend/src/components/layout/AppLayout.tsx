import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingDown,
  TrendingUp,
  Tags,
  User,
  LogOut,
  Menu,
  X,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface AppLayoutProps {
  children?: React.ReactNode;
  pageTitle?: string;
}

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { label: "Expenses", path: "/expenses", icon: TrendingDown },
  { label: "Income", path: "/incomes", icon: TrendingUp },
  { label: "Categories", path: "/categories", icon: Tags },
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children, pageTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdownOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Determine title from route if not explicitly passed
  const getComputedTitle = () => {
    if (pageTitle) return pageTitle;
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/transactions")) return "Transactions Explorer";
    if (path.startsWith("/expenses")) return "Expenses";
    if (path.startsWith("/incomes")) return "Income Records";
    if (path.startsWith("/categories")) return "Categories";
    if (path.startsWith("/profile")) return "User Profile";
    return "Expense Manager";
  };

  const getInitials = (name?: string) => {
    if (!name) return "EM";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800 antialiased">
      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex-shrink-0 min-h-screen sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight tracking-tight">
              Expense Manager
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Personal Finance</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Profile / Logout */}
        <div className="p-4 border-t border-slate-800/80 space-y-1.5">
          <NavLink
            to="/profile"
            className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              location.pathname === "/profile"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </NavLink>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE DRAWER (OVERLAY) */}
      {/* ============================================================ */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 z-50 transform lg:hidden transition-transform duration-300 ease-in-out flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-base">Expense Manager</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-1">
          <NavLink
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <User className="w-4 h-4" />
            Profile
          </NavLink>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 text-left"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN CONTAINER */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {getComputedTitle()}
              </h2>
            </div>
          </div>

          {/* User profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 p-1.5 pl-3 rounded-full hover:bg-slate-100/80 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {user?.fullName || "Account"}
                </p>
                <p className="text-xs text-slate-500 leading-tight truncate max-w-[150px]">
                  {user?.email || "Personal"}
                </p>
              </div>

              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-semibold text-xs flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0 ring-2 ring-indigo-50">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.fullName || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to text initials if image fails to load
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span>{getInitials(user?.fullName)}</span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-1.5 z-50 animate-in fade-in duration-100">
                <div className="px-4 py-3 border-b border-slate-100 sm:hidden">
                  <p className="text-sm font-semibold text-slate-900">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  View Profile
                </Link>

                <div className="h-px bg-slate-100 my-1" />

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
