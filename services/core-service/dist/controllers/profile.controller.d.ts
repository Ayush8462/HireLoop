import { RequestHandler } from "express";
export declare const createProfile: RequestHandler;
export declare const getMyProfile: RequestHandler;
export declare const getProfileById: RequestHandler<{
    id: string;
}, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const updateMyProfile: RequestHandler;
