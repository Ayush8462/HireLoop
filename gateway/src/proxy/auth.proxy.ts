import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env.js";

export const authProxy = createProxyMiddleware({
  target: env.services.auth,
  changeOrigin: true,
  pathFilter: ["/api/auth", "/api/v1/auth"],
  pathRewrite: {
    "^/api/v1/auth": "",
    "^/api/auth": "",
  },
});