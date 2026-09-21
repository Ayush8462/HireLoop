import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications.js";
import NotificationPanel from "./NotificationPanel.jsx";

/**
 * NotificationBell — renders a bell icon with an unread badge.
 * Clicking it opens/closes the notification panel dropdown.
 *
 * Props:
 *   token  — JWT access token from AuthContext
 *   dark   — boolean for dark mode support (optional)
 */
export default function NotificationBell({ token, dark = false }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const { notifications, unreadCount, markAsRead, markAllRead, loading } =
    useNotifications(token);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  const handleBellClick = () => setOpen((prev) => !prev);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={handleBellClick}
        className={`relative p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          dark
            ? "text-gray-300 hover:text-white hover:bg-gray-700"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={22} />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <NotificationPanel
          notifications={notifications}
          loading={loading}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllRead={handleMarkAllRead}
          onClose={() => setOpen(false)}
          dark={dark}
        />
      )}
    </div>
  );
}
