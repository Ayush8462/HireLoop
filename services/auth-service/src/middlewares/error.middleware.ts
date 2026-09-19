import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    console.error(error);

    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid request data",
                details: error.flatten(),
            },
        });
    }

    if (error instanceof Error) {
        return res.status(400).json({
            success: false,
            error: {
                code: "BAD_REQUEST",
                message: error.message,
            },
        });
    }

    return res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
        },
    });
}