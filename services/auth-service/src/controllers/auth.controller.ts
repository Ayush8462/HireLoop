import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = registerSchema.parse(req.body);
    const user = await authService.register(input);

    return res.status(201).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);

    const result = await authService.login(input);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshtoken = req.cookies.refreshToken;

    if (!refreshtoken) {
      return res.status(401).json({
        success: false,
        error: {
          code: "Refresh_Token_Missing",
          message: "Refresh token not found",
        },
      });
    }

    const result = await authService.refresh(refreshtoken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,

      secure: env.COOKIE_SECURE,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try{
        const refreshToken = req.cookies.refreshToken;

        await authService.logout(refreshToken);

        res.clearCookie("refreshToken",{
            httpOnly:true,
            secure: env.COOKIE_SECURE,
            sameSite: "lax",
            path:"/",
        })

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        })

    }catch(error){
        next(error);
    }
}

/**
 * GET /internal/user-email/:authUserId
 * Internal endpoint — only callable by other services using x-internal-secret header.
 * Returns email, firstName, lastName for a given user ID.
 */
export async function getInternalUserEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const internalSecret = req.headers["x-internal-secret"];
    if (!internalSecret || internalSecret !== process.env.NOTIFICATION_INTERNAL_SECRET) {
      return res.status(403).json({
        success: false,
        error: { message: "Forbidden: invalid internal secret" },
      });
    }

    const authUserId = String(req.params.authUserId);
    const user = await authService.getUserEmailById(authUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    next(error);
  }
}
