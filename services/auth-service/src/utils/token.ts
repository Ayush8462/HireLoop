import jwt, {JwtPayload} from "jsonwebtoken";
import crypto from "crypto";

import {env} from "../config/env.js";

export interface AccessTokenPayload {
    sub: string;
    role: string;
}

export interface RefreshTokenPayload{
    sub: string;
    sid: string;
}


export function createAccessTolken(
    payload: AccessTokenPayload,
): string{
    return jwt.sign(payload, env.JWT_ACCESS_SECRET,{
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN
    } as jwt.SignOptions);
}

export function createRefreshToken(
    payload: RefreshTokenPayload
): string{
    return jwt.sign(
        payload,
        env.JWT_REFRESH_SECRET,
        {
            expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
        } as jwt.SignOptions
    )
}


export function hashToken(
    token: string
): string{
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")
}


export function getRefreshTokenExpiry(): Date{
    const expireIn = env.REFRESH_TOKEN_EXPIRES_IN;

    const now = Date.now();

    const durations: Record<
        string,
        number
    >={
        "1d": 24*60*60*1000,
        "7d": 7*24*60*60*1000,
        "30d": 30*7*24*60*60*1000,
    };

    const duration = durations[expireIn];

    if(!duration){
        throw new Error(
            "Unsupported refresh token expiration"
        );
    }

    return new Date(now+duration);
}


export function verifyRefreshToken(
    token: string
): RefreshTokenPayload{
    const decoded = jwt.verify(token,env.JWT_REFRESH_SECRET);

    if(typeof decoded === "string" || !decoded.sub || !("sid" in decoded)){
        throw new Error("Invalid refresh token");
    }

    return { sub: decoded.sub, sid: decoded.sid as string};
}