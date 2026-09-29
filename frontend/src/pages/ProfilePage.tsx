import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Clock,
  Lock,
  LogOut,
  AlertTriangle,
  Coins,
  Globe,
  Bell,
  Activity,
  Copy,
  Check,
  CheckCircle2,
  Laptop,
  Sparkles,
  Info,
  Shield,
  KeyRound,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/layout/AppLayout";
import { authApi } from "../api/authApi";
import { ProfileDTO } from "../types";
import { formatDate } from "../util/formatters";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/errorUtil";

export const ProfilePage: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileDTO | null>(authUser);
  const [loading, setLoading] = useState(!authUser);
  const [copied, setCopied] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authApi.getProfile();
      setProfile(data);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCopyEmail = (emailText?: string) => {
    if (!emailText) return;
    navigator.clipboard.writeText(emailText);
    setCopied(true);
    toast.success("Email address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe fallback values
  const currentFullName = profile?.fullName || authUser?.fullName || "Account User";
  const currentEmail = profile?.email || authUser?.email || "No email available";
  const createdAtFormatted = profile?.createdAt ? formatDate(profile.createdAt) : "Verified Member";
  const updatedAtFormatted = profile?.updatedAt
    ? formatDate(profile.updatedAt)
    : profile?.createdAt
    ? formatDate(profile.createdAt)
    : "Standard Setup";

  return (
    <AppLayout pageTitle="User Profile">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* ============================================================ */}
        {/* 1. PROFILE HEADER */}
        {/* ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/70">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                User Profile
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Account
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your personal account, security credentials, and preferences
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="font-medium">Fintech Verified Profile</span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-200 mx-auto"></div>
                <div className="h-5 bg-slate-200 rounded-lg w-3/4 mx-auto"></div>
                <div className="h-4 bg-slate-100 rounded-lg w-1/2 mx-auto"></div>
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="h-8 bg-slate-50 rounded-xl"></div>
                  <div className="h-8 bg-slate-50 rounded-xl"></div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-10 bg-slate-50 rounded-xl"></div>
                <div className="h-10 bg-slate-50 rounded-xl"></div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
                <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-16 bg-slate-50 rounded-xl"></div>
                  <div className="h-16 bg-slate-50 rounded-xl"></div>
                  <div className="h-16 bg-slate-50 rounded-xl"></div>
                  <div className="h-16 bg-slate-50 rounded-xl"></div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                <div className="h-14 bg-slate-50 rounded-xl"></div>
                <div className="h-14 bg-slate-50 rounded-xl"></div>
              </div>
            </div>
          </div>
        ) : !profile ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Failed to load profile details</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We encountered an issue retrieving your account record from the server.
            </p>
            <button
              onClick={fetchProfile}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ============================================================ */}
            {/* LEFT COLUMN: Profile Overview & Account Activity (4 cols) */}
            {/* ============================================================ */}
            <div className="lg:col-span-4 space-y-6">
              {/* 2. PROFILE OVERVIEW CARD */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden relative group">
                {/* Compact elegant top header gradient */}
                <div className="h-20 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
                </div>

                {/* Avatar with proper spacing (no awkward overlap) */}
                <div className="px-6 pb-6 pt-0 relative">
                  <div className="flex justify-between items-end -mt-10 mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md ring-4 ring-white flex-shrink-0">
                      <div className="w-full h-full rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-inner overflow-hidden">
                        {profile.profileImageUrl ? (
                          <img
                            src={profile.profileImageUrl}
                            alt={currentFullName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span>{getInitials(currentFullName)}</span>
                        )}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Active
                    </span>
                  </div>

                  {/* Name & Contact */}
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      {currentFullName}
                    </h2>

                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-600 truncate font-medium">
                          {currentEmail}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyEmail(currentEmail)}
                        title="Copy email address"
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors flex-shrink-0 cursor-pointer"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Overview Quick Stats */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Member Since
                      </span>
                      <span className="font-semibold text-slate-800">
                        {createdAtFormatted}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Last Sync
                      </span>
                      <span className="font-semibold text-slate-800">
                        {updatedAtFormatted}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                        Account Tier
                      </span>
                      <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Personal Finance
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. ACCOUNT ACTIVITY SECTION */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      Account Activity
                    </h3>
                    <p className="text-[11px] text-slate-400">Available lifecycle records</p>
                  </div>
                </div>

                <div className="space-y-3.5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {/* Event 1: Registration */}
                  <div className="flex items-start gap-3 relative text-xs">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 border-2 border-white ring-1 ring-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0 z-10">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="font-semibold text-slate-800">Account Registered</p>
                      <p className="text-[11px] text-slate-400">{createdAtFormatted}</p>
                    </div>
                  </div>

                  {/* Event 2: Activation */}
                  <div className="flex items-start gap-3 relative text-xs">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 border-2 border-white ring-1 ring-indigo-200 text-indigo-600 flex items-center justify-center flex-shrink-0 z-10">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="font-semibold text-slate-800">Email Activation Verified</p>
                      <p className="text-[11px] text-slate-400">Brevo SMTP verification complete</p>
                    </div>
                  </div>

                  {/* Event 3: Last Profile Update */}
                  <div className="flex items-start gap-3 relative text-xs">
                    <div className="w-7 h-7 rounded-full bg-slate-50 border-2 border-white ring-1 ring-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 z-10">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="font-semibold text-slate-800">Profile Synchronized</p>
                      <p className="text-[11px] text-slate-400">{updatedAtFormatted}</p>
                    </div>
                  </div>

                  {/* Event 4: Current Session */}
                  <div className="flex items-start gap-3 relative text-xs">
                    <div className="w-7 h-7 rounded-full bg-violet-50 border-2 border-white ring-1 ring-violet-200 text-violet-600 flex items-center justify-center flex-shrink-0 z-10">
                      <Laptop className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">Active Web Session</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </div>
                      <p className="text-[11px] text-slate-400">Authenticated via JWT Token</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* RIGHT COLUMN: Personal Info, Security, Preferences, Danger (8 cols) */}
            {/* ============================================================ */}
            <div className="lg:col-span-8 space-y-6">
              {/* 3. PERSONAL INFORMATION SECTION */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        Personal Information
                      </h2>
                      <p className="text-xs text-slate-400">
                        Primary account holder details registered with Expense Manager
                      </p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 text-[11px] font-medium border border-slate-200/60">
                    <Info className="w-3 h-3 text-slate-400" />
                    Read-only
                  </span>
                </div>

                {/* Personal Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Full Name
                    </span>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {currentFullName}
                    </p>
                  </div>

                  {/* Email Address */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Email Address
                    </span>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {currentEmail}
                    </p>
                  </div>

                  {/* Account Status */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Account Status
                    </span>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <p className="text-sm font-semibold text-slate-900">
                        Active & Verified
                      </p>
                    </div>
                  </div>

                  {/* User Identifier */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      User Identifier
                    </span>
                    <p className="text-sm font-semibold text-slate-900 font-mono">
                      #{profile.id ? String(profile.id).padStart(4, "0") : "0001"}
                    </p>
                  </div>

                  {/* Member Since */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Member Since
                    </span>
                    <p className="text-sm font-semibold text-slate-900">
                      {createdAtFormatted}
                    </p>
                  </div>

                  {/* Last Updated */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Last Updated
                    </span>
                    <p className="text-sm font-semibold text-slate-900">
                      {updatedAtFormatted}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Personal profile information is synchronized securely with your backend database credentials. Contact your workspace administrator for identity updates.
                  </p>
                </div>
              </div>

              {/* 4. ACCOUNT & SECURITY SECTION */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">
                      Account & Security
                    </h2>
                    <p className="text-xs text-slate-400">
                      Authentication protection, session verification, and credentials
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Status Item 1: Verification */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white text-emerald-600 flex items-center justify-center border border-slate-200/70 flex-shrink-0 mt-0.5 sm:mt-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Email Verification</p>
                        <p className="text-[11px] text-slate-500">
                          Activated through Brevo SMTP transactional token verification
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                      Verified
                    </span>
                  </div>

                  {/* Status Item 2: Password */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white text-slate-600 flex items-center justify-center border border-slate-200/70 flex-shrink-0 mt-0.5 sm:mt-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Password Encryption</p>
                        <p className="text-[11px] text-slate-500">
                          Password is encrypted and securely stored using bcrypt one-way hashing
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 tracking-wider self-start sm:self-auto">
                      ••••••••••••
                    </span>
                  </div>

                  {/* Status Item 3: Token Session */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white text-indigo-600 flex items-center justify-center border border-slate-200/70 flex-shrink-0 mt-0.5 sm:mt-0">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Session Authentication</p>
                        <p className="text-[11px] text-slate-500">
                          Protected with cryptographically signed JSON Web Tokens (JWT)
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
                      JWT Stateless
                    </span>
                  </div>
                </div>
              </div>

              {/* 6. PREFERENCES SECTION */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">
                      Preferences & Localization
                    </h2>
                    <p className="text-xs text-slate-400">
                      Display conventions, financial formatting, and regional defaults
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Currency Preference */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white text-indigo-600 flex items-center justify-center border border-slate-200/60 flex-shrink-0">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Primary Currency
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        Indian Rupee (INR - ₹)
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Default currency for all charts and reports
                      </p>
                    </div>
                  </div>

                  {/* Regional Format */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white text-emerald-600 flex items-center justify-center border border-slate-200/60 flex-shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Numbering System
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        en-IN (Lakhs & Crores)
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Standard Indian financial notation
                      </p>
                    </div>
                  </div>

                  {/* Time Zone */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white text-amber-600 flex items-center justify-center border border-slate-200/60 flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Time Zone
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        Asia/Kolkata (IST)
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        UTC +05:30 Indian Standard Time
                      </p>
                    </div>
                  </div>

                  {/* Notification Channel */}
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white text-purple-600 flex items-center justify-center border border-slate-200/60 flex-shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Email Notifications
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        Transactional SMTP
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Brevo automated summaries enabled
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7. DANGER ZONE */}
              <div className="bg-white rounded-2xl border border-rose-200/80 p-6 shadow-xs">
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-rose-100">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">
                      Danger Zone
                    </h2>
                    <p className="text-xs text-slate-400">
                      Session termination and account management actions
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Action 1: Sign Out */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-50/30 border border-rose-100/70">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Terminate Current Session
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Clears your authentication token from this browser and returns to login.
                      </p>
                    </div>
                    <button
                      onClick={logout}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-colors shadow-2xs flex-shrink-0 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>

                  {/* Action 2: Delete Account (Disabled/Not available in backend) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70 opacity-80">
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Permanent Account Erasure
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Account deletion is restricted by workspace security policy.
                      </p>
                    </div>
                    <button
                      disabled
                      title="Account deletion is disabled by workspace administrator"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed flex-shrink-0"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
