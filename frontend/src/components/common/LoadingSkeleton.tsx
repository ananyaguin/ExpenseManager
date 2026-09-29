import React from "react";

export const CardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-slate-200 rounded w-28"></div>
      <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
    </div>
    <div className="h-8 bg-slate-200 rounded w-36 mb-2"></div>
    <div className="h-3 bg-slate-100 rounded w-20"></div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm animate-pulse h-80 flex flex-col justify-between">
    <div className="h-5 bg-slate-200 rounded w-40 mb-4"></div>
    <div className="flex-1 flex items-end gap-3 pb-4">
      <div className="flex-1 bg-slate-100 rounded-t h-40"></div>
      <div className="flex-1 bg-slate-200 rounded-t h-56"></div>
      <div className="flex-1 bg-slate-100 rounded-t h-32"></div>
      <div className="flex-1 bg-slate-200 rounded-t h-48"></div>
      <div className="flex-1 bg-slate-100 rounded-t h-64"></div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden animate-pulse">
    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
      <div className="h-5 bg-slate-200 rounded w-32"></div>
      <div className="h-8 bg-slate-100 rounded w-24"></div>
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100"></div>
            <div>
              <div className="h-4 bg-slate-200 rounded w-32 mb-1.5"></div>
              <div className="h-3 bg-slate-100 rounded w-20"></div>
            </div>
          </div>
          <div className="h-5 bg-slate-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="bg-white p-8 rounded-2xl border border-slate-200/70 shadow-sm max-w-xl mx-auto animate-pulse flex flex-col items-center">
    <div className="w-24 h-24 rounded-full bg-slate-200 mb-4"></div>
    <div className="h-6 bg-slate-200 rounded w-48 mb-2"></div>
    <div className="h-4 bg-slate-100 rounded w-36 mb-6"></div>
    <div className="w-full space-y-3 pt-6 border-t border-slate-100">
      <div className="h-10 bg-slate-50 rounded-xl"></div>
      <div className="h-10 bg-slate-50 rounded-xl"></div>
    </div>
  </div>
);
