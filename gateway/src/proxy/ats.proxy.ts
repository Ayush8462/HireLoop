import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env.js";

export const atsProxy = createProxyMiddleware({
  target: env.services.ats,
  changeOrigin: true,
  pathFilter: ["/api/ats"],
  pathRewrite: {
    "^/api/ats": "",
  },
});
