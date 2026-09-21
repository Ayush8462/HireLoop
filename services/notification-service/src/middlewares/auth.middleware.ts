import { RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";

interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: string;
}

/**
 * Middleware: authenticate frontend users via JWT Bearer token.
 * Attaches `req.user = { authUserId, role }`.
 */
export const authenticate: RequestHandler = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      res.status(401).json({
        success: false,
        error: { message: "Authentication required" },
      });
      return;
    }

    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
      res.status(401).json({
        success: false,
        error: { message: "Invalid authorization header" },
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    if (!decoded.sub) {
      res.status(401).json({ success: false, error: { message: "Invalid access token" } });
      return;
    }

    req.user = { authUserId: decoded.sub, role: decoded.role };
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: { message: "Invalid or expired access token" },
    });
  }
};
