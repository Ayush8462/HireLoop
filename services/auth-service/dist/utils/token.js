import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";
export function createAccessTolken(payload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN
    });
}
export function createRefreshToken(payload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    });
}
export function hashToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}
export function getRefreshTokenExpiry() {
    const expireIn = env.REFRESH_TOKEN_EXPIRES_IN;
    const now = Date.now();
    const durations = {
        "1d": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
    };
    const duration = durations[expireIn];
    if (!duration) {
        throw new Error("Unsupported refresh token expiration");
    }
    return new Date(now + duration);
}
export function verifyRefreshToken(token) {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    if (typeof decoded === "string" || !decoded.sub || !("sid" in decoded)) {
        throw new Error("Invalid refresh token");
    }
    return { sub: decoded.sub, sid: decoded.sid };
}
//# sourceMappingURL=token.js.map