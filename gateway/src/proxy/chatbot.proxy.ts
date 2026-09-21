import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env.js";

export const chatbotProxy = createProxyMiddleware({
  target: env.services.chatbot,
  changeOrigin: true,
  pathFilter: ["/api/chatbot"],
  pathRewrite: {
    "^/api/chatbot": "",
  },
});
