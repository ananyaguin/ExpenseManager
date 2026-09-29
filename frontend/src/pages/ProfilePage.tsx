import React, { useState, useEffect } from "react";
import { User, Mail, Calendar, ShieldCheck, Clock } from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/layout/AppLayout";
import { authApi } from "../api/authApi";
import { ProfileDTO } from "../types";
import { formatDate } from "../util/formatters";
import { ProfileSkeleton } from "../components/common/LoadingSkeleton";
import { getErrorMessage } from "../api/errorUtil";

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);

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
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppLayout pageTitle="User Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Account Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your personal financial manager account details (read-only)
          </p>
        </div>

        {loading ? (
          <ProfileSkeleton />
        ) : !profile ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
            <p className="text-sm text-slate-500">Failed to load profile details.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Top decorative gradient band */}
            <div className="h-28 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 relative"></div>

            {/* Profile Avatar & Primary Info */}
            <div className="px-6 sm:px-8 pb-8 -mt-14">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div className="flex items-end gap-4">
                  <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-lg flex-shrink-0">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                      {profile.profileImageUrl ? (
                        <img
                          src={profile.profileImageUrl}
                          alt={profile.fullName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <span>{getInitials(profile.fullName)}</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-1">
                    <h3 className="text-xl font-bold text-slate-900">{profile.fullName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {profile.email}
                    </p>
                  </div>
                </div>

                <div className="self-start sm:self-end">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Active Account
                  </span>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white text-indigo-600 flex items-center justify-center border border-slate-200/60 shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Full Name</p>
                      <p className="text-sm font-semibold text-slate-800">{profile.fullName}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white text-indigo-600 flex items-center justify-center border border-slate-200/60 shadow-xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Email Address</p>
                      <p className="text-sm font-semibold text-slate-800">{profile.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white text-indigo-600 flex items-center justify-center border border-slate-200/60 shadow-xs">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Member Since</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {profile.createdAt ? formatDate(profile.createdAt) : "Verified Member"}
                      </p>
                    </div>
                  </div>
                </div>

                {profile.updatedAt && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white text-slate-500 flex items-center justify-center border border-slate-200/60 shadow-xs">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Last Profile Update</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {formatDate(profile.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Read Only Note */}
              <div className="mt-6 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center">
                <p className="text-xs text-indigo-700 font-medium">
                  // Note: Profile details are synchronized securely with your backend credentials.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
