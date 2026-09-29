import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Clock,
  Lock,
  LogOut,
  Shield,
  CheckCircle2,
  AlertTriangle,
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

  // Safe fallback values from profile or context user
  const currentFullName = profile?.fullName || authUser?.fullName || "Account User";
  const currentEmail = profile?.email || authUser?.email || "No email available";
  const createdAtFormatted = profile?.createdAt
    ? formatDate(profile.createdAt)
    : authUser?.createdAt
    ? formatDate(authUser.createdAt)
    : "Verified Member";

  return (
    <AppLayout pageTitle="User Profile">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* ============================================================ */}
        {/* PAGE HEADER */}
        {/* ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              User Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage your personal account and security details
            </p>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-200"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-48 bg-slate-200 rounded"></div>
                  <div className="h-4 w-36 bg-slate-100 rounded"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
                <div className="h-5 w-36 bg-slate-200 rounded mb-4"></div>
                <div className="h-12 bg-slate-50 rounded-xl"></div>
                <div className="h-12 bg-slate-50 rounded-xl"></div>
                <div className="h-12 bg-slate-50 rounded-xl"></div>
                <div className="h-12 bg-slate-50 rounded-xl"></div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
                <div className="h-5 w-36 bg-slate-200 rounded mb-4"></div>
                <div className="h-12 bg-slate-50 rounded-xl"></div>
                <div className="h-14 bg-slate-50 rounded-xl"></div>
                <div className="h-10 bg-slate-50 rounded-xl"></div>
              </div>
            </div>
          </div>
        ) : !profile ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200/80 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Failed to load profile details</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We encountered an issue retrieving your account details from the server.
            </p>
            <button
              onClick={fetchProfile}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <>
            {/* ============================================================ */}
            {/* 1. PROFILE SUMMARY CARD (Card 1) */}
            {/* ============================================================ */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Compact Accent Header (Height 64px) */}
              <div className="h-16 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 relative">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
              </div>

              {/* Profile Details Container */}
              <div className="px-6 pb-6 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-8">
                  {/* Avatar & User Details */}
                  <div className="flex items-end gap-4 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 ring-4 ring-white shadow-md flex-shrink-0">
                      <div className="w-full h-full rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-inner overflow-hidden">
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

                    <div className="mb-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                        {currentFullName}
                      </h2>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{currentEmail}</span>
                      </p>
                    </div>
                  </div>

                  {/* Active Status Badge */}
                  <div className="self-start sm:self-end flex-shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  </div>
                </div>

                {/* Member Since Strip */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Member since: <strong className="font-semibold text-slate-700">{createdAtFormatted}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Fintech Verified Account</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* 2 & 3. TWO BALANCED CARDS (Cards 2 & 3) */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 2. PERSONAL INFORMATION CARD (Card 2) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        Personal Information
                      </h2>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md">
                      Read-only
                    </span>
                  </div>

                  {/* Information Fields */}
                  <div className="space-y-3">
                    {/* Full Name */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Full Name
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
                        {currentFullName}
                      </p>
                    </div>

                    {/* Email Address */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Email Address
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
                        {currentEmail}
                      </p>
                    </div>

                    {/* Account Status */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Account Status
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <p className="text-sm font-semibold text-slate-900">
                          Active
                        </p>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Member Since
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        {createdAtFormatted}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 & 4. ACCOUNT SECURITY & ACTIVITY CARD (Card 3) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Card Header: Account Security */}
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        Account Security
                      </h2>
                    </div>
                  </div>

                  {/* Security Fields */}
                  <div className="space-y-3">
                    {/* Email Verification */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Email Verification
                        </span>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          Verified & Active
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </div>

                    {/* Password */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Password
                          </span>
                          <p className="font-mono text-sm text-slate-800 tracking-widest mt-0.5">
                            ••••••••
                          </p>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center text-slate-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        Your password is securely stored.
                      </p>
                    </div>
                  </div>

                  {/* Account Activity (Small) */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Account Activity
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
                        <span className="text-slate-500 font-medium">Account Created</span>
                        <span className="font-semibold text-slate-800">{createdAtFormatted}</span>
                      </div>

                      {profile.updatedAt && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
                          <span className="text-slate-500 font-medium">Last Profile Update</span>
                          <span className="font-semibold text-slate-800">{formatDate(profile.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
