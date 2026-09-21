import React from "react";
import { Bell, CheckCheck, X, ExternalLink } from "lucide-react";

// ── Type-to-icon/color mapping ────────────────────────────────────────────────
function getNotificationMeta(type) {
  switch (type) {
    case "REFERRAL_REQUEST":
      return { icon: "📩", color: "bg-blue-100 text-blue-700", label: "Referral Request" };
    case "REFERRAL_ACCEPTED":
      return { icon: "✅", color: "bg-green-100 text-green-700", label: "Referral Accepted" };
    case "REFERRAL_REJECTED":
      return { icon: "❌", color: "bg-red-100 text-red-700", label: "Referral Declined" };
    case "REFERRAL_SUBMITTED":
      return { icon: "📤", color: "bg-purple-100 text-purple-700", label: "Referral Submitted" };
    case "REFERRAL_CANCELLED":
      return { icon: "🚫", color: "bg-gray-100 text-gray-600", label: "Referral Cancelled" };
    case "INTERVIEW_CONFIRMED":
      return { icon: "🎉", color: "bg-indigo-100 text-indigo-700", label: "Interview Confirmed" };
    default:
      return { icon: "🔔", color: "bg-gray-100 text-gray-600", label: "Notification" };
  }
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ── Single notification item ──────────────────────────────────────────────────
function NotificationItem({ notification, onMarkAsRead, dark }) {
  const id = notification._id || notification.id;
  const meta = getNotificationMeta(notification.type);

  return (
    <div
      onClick={() => !notification.isRead && onMarkAsRead(id)}
      className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
        notification.isRead
          ? dark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
          : dark ? "bg-indigo-900/30 hover:bg-indigo-900/50" : "bg-indigo-50/60 hover:bg-indigo-50"
      }`}
    >
      {/* Icon badge */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base ${meta.color}`}
      >
        {meta.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight truncate ${dark ? "text-gray-100" : "text-gray-900"}`}>
          {notification.title}
        </p>
        <p className={`text-xs mt-0.5 leading-relaxed line-clamp-2 ${dark ? "text-gray-400" : "text-gray-500"}`}>
          {notification.message}
        </p>

        {/* Meet link for interview notifications */}
        {notification.type === "INTERVIEW_CONFIRMED" && notification.data?.meetLink && (
          <a
            href={notification.data.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            <ExternalLink size={11} />
            Join Google Meet
          </a>
        )}

        <p className={`text-[10px] mt-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>
          {timeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-2" />
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
/**
 * NotificationPanel — dropdown that shows the user's notifications.
 *
 * Props:
 *   notifications  — array of notification objects
 *   loading        — boolean
 *   onMarkAsRead   — fn(id)
 *   onMarkAllRead  — fn()
 *   onClose        — fn()
 *   dark           — boolean
 */
export default function NotificationPanel({
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllRead,
  onClose,
  dark = false,
}) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl shadow-2xl border z-50 overflow-hidden ${
        dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
      style={{ maxHeight: "480px" }}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${
          dark ? "border-gray-700" : "border-gray-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <Bell size={16} className={dark ? "text-gray-300" : "text-gray-700"} />
          <span className={`text-sm font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              title="Mark all as read"
              className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                dark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"
              }`}
            >
              <CheckCheck size={14} />
              All read
            </button>
          )}
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              dark ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="overflow-y-auto" style={{ maxHeight: "380px" }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>Loading…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dark ? "bg-gray-700" : "bg-gray-100"}`}>
              <Bell size={22} className={dark ? "text-gray-500" : "text-gray-400"} />
            </div>
            <p className={`text-sm font-medium ${dark ? "text-gray-300" : "text-gray-700"}`}>
              All caught up!
            </p>
            <p className={`text-xs text-center ${dark ? "text-gray-500" : "text-gray-400"}`}>
              You have no notifications yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id || notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                dark={dark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
