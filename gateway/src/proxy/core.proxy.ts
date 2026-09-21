import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env.js";

export const coreProxy = createProxyMiddleware({
  target: env.services.core,
  changeOrigin: true,
  pathFilter: [
    "/api/profiles",
    "/api/companies",
    "/api/company",
    "/api/roadmaps",
    "/api/roadmap",
    "/api/referrals",
    "/api/interviews",
  ],
  pathRewrite: {
    "^/api": "",
  },
});
