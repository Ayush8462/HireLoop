import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env.js";

export const notificationProxy = createProxyMiddleware({
  target: env.services.notification,
  changeOrigin: true,
  pathFilter: ["/api/notifications", "/notifications"],
  pathRewrite: {
    "^/api/notifications": "/notifications",
    "^/notifications": "/notifications",
  },
  // Pass WebSocket upgrades so Socket.io works through the gateway too
  ws: true,
});
