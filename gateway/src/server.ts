import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { notificationProxy } from "./proxy/notification.proxy.js";

const server = http.createServer(app);

// Forward websocket upgrade requests for socket.io to notification service
server.on("upgrade", (req, socket, head) => {
  if (req.url?.startsWith("/socket.io")) {
    const upgradeFn = (notificationProxy as unknown as { upgrade?: (req: unknown, socket: unknown, head: unknown) => void }).upgrade;
    if (typeof upgradeFn === "function") {
      upgradeFn(req, socket, head);
    }
  }
});

server.listen(env.port, () => {
  console.log(`Hireloop Gateway running on port ${env.port}`);
});


