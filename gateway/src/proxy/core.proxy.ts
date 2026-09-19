import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env.js";

export const coreProxy = createProxyMiddleware({
  target: env.services.core,
  changeOrigin: true,
  pathRewrite: {
    "^/api": "",
  },
});
