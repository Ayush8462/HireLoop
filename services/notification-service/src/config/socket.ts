import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "./env.js";

// Map of authUserId -> Set of socket IDs (a user can have multiple tabs open)
const userSocketMap = new Map<string, Set<string>>();

let io: SocketServer;

export function initSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: [env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      if (!decoded.sub) {
        return next(new Error("Invalid token"));
      }
      // Attach authUserId to socket data
      socket.data.authUserId = decoded.sub as string;
      next();
    } catch {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const authUserId = socket.data.authUserId as string;

    // Register socket
    if (!userSocketMap.has(authUserId)) {
      userSocketMap.set(authUserId, new Set());
    }
    userSocketMap.get(authUserId)!.add(socket.id);

    console.info(`[socket] User connected: ${authUserId} (socket: ${socket.id})`);

    socket.on("disconnect", () => {
      const sockets = userSocketMap.get(authUserId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSocketMap.delete(authUserId);
        }
      }
      console.info(`[socket] User disconnected: ${authUserId} (socket: ${socket.id})`);
    });
  });

  return io;
}

/**
 * Emit a notification event to a specific user by their authUserId.
 * Works even if the user has multiple tabs open.
 */
export function emitToUser(authUserId: string, event: string, data: unknown): void {
  if (!io) return;

  const socketIds = userSocketMap.get(authUserId);
  if (!socketIds || socketIds.size === 0) {
    // User is not connected — notification is still saved in DB for later
    console.info(`[socket] User ${authUserId} is offline. Notification saved to DB.`);
    return;
  }

  for (const socketId of socketIds) {
    io.to(socketId).emit(event, data);
  }
  console.info(`[socket] Emitted "${event}" to user ${authUserId} (${socketIds.size} socket(s))`);
}

export function getIo(): SocketServer {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
