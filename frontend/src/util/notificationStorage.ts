export interface AppNotification {
  id: string;
  type: "budget_exceeded" | "budget_warning" | "transaction_added" | "password_changed" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const getNotificationKey = (userId?: string | number | null) => {
  return `em_notifications_${userId || "default"}`;
};

export const getNotifications = (userId?: string | number | null): AppNotification[] => {
  try {
    const raw = localStorage.getItem(getNotificationKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading notifications", e);
  }
  return [];
};

export const addNotification = (
  notification: Omit<AppNotification, "id" | "timestamp" | "read">,
  userId?: string | number | null
): AppNotification => {
  const current = getNotifications(userId);
  const newNotif: AppNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };

  // Keep latest 25 notifications
  const updated = [newNotif, ...current].slice(0, 25);
  try {
    localStorage.setItem(getNotificationKey(userId), JSON.stringify(updated));
    window.dispatchEvent(new Event("em:notification_update"));
  } catch (e) {
    console.error("Error saving notification", e);
  }
  return newNotif;
};

export const markAllNotificationsRead = (userId?: string | number | null): void => {
  const current = getNotifications(userId);
  const updated = current.map((n) => ({ ...n, read: true }));
  try {
    localStorage.setItem(getNotificationKey(userId), JSON.stringify(updated));
    window.dispatchEvent(new Event("em:notification_update"));
  } catch (e) {
    console.error("Error updating notifications", e);
  }
};

export const clearNotifications = (userId?: string | number | null): void => {
  try {
    localStorage.removeItem(getNotificationKey(userId));
    window.dispatchEvent(new Event("em:notification_update"));
  } catch (e) {
    console.error("Error clearing notifications", e);
  }
};
