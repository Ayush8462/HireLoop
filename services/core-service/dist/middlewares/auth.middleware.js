import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/api-error.js";
export const authenticate = (req, _res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            throw new ApiError(401, "Authentication required");
        }
        const [scheme, token] = authorization.split(" ");
        if (scheme !== "Bearer" || !token) {
            throw new ApiError(401, "Invalid authorization header");
        }
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
        if (!decoded.sub) {
            throw new ApiError(401, "Invalid access token");
        }
        const user = {
            userId: decoded.sub,
            role: decoded.role,
        };
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof ApiError) {
            next(error);
            return;
        }
        logger.warn({
            error,
        }, "Authentication failed");
        next(new ApiError(401, "Invalid or expired access token"));
    }
};
//# sourceMappingURL=auth.middleware.js.map