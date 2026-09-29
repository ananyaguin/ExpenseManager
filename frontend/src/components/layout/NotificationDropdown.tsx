import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  KeyRound,
  Info,
  Check,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getNotifications,
  markAllNotificationsRead,
  clearNotifications,
  AppNotification,
} from "../../util/notificationStorage";

export const NotificationDropdown: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    setNotifications(getNotifications(user?.id || user?.email));
  };

  useEffect(() => {
    loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener("em:notification_update", handleUpdate);
    return () => window.removeEventListener("em:notification_update", handleUpdate);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    markAllNotificationsRead(user?.id || user?.email);
    loadNotifications();
  };

  const handleClearAll = () => {
    clearNotifications(user?.id || user?.email);
    loadNotifications();
  };

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "budget_exceeded":
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case "budget_warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "transaction_added":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "password_changed":
        return <KeyRound className="w-4 h-4 text-indigo-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diffSecs < 60) return "Just now";
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/80 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3.5 px-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  title="Clear all notifications"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Budget warnings and activity alerts will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 px-4 flex items-start gap-3 transition-colors ${
                    !notif.read ? "bg-indigo-50/30" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="p-1.5 rounded-xl bg-white border border-slate-100 shadow-2xs flex-shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 truncate">{notif.title}</p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {formatTime(notif.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
