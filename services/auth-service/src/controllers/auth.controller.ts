import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

import { AuthService } from "../services/auth.service.js";
import { success } from "zod";
import { access } from "fs";

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
