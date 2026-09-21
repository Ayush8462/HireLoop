import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { getNotifications, getUnreadCount, markAsRead as apiMarkAsRead, markAllRead as apiMarkAllRead } from "../api/notifications.js";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Custom hook for real-time notifications.
 *
 * Usage:
 *   const { notifications, unreadCount, markAsRead, markAllRead, loading } = useNotifications(token);
 */
export function useNotifications(token) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  // ── Fetch notifications from REST API ──────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getNotifications(1, 30);
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      console.error("[useNotifications] Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ── Socket.io connection ────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    fetchNotifications();

    // Connect to notification-service via gateway (WebSocket)
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.info("[socket] Connected to notification service");
    });

    socket.on("disconnect", () => {
      console.info("[socket] Disconnected from notification service");
    });

    // Real-time new notification — prepend to list and increment count
    socket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("connect_error", (err) => {
      console.warn("[socket] Connection error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, fetchNotifications]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    try {
      await apiMarkAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("[useNotifications] markAsRead failed:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await apiMarkAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("[useNotifications] markAllRead failed:", err);
    }
  }, []);

  return { notifications, unreadCount, markAsRead, markAllRead, loading, refetch: fetchNotifications };
}
