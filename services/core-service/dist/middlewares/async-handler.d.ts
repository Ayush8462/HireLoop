import { NextFunction, Request, RequestHandler, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
export declare const asyncHandler: <P extends ParamsDictionary = ParamsDictionary, ResBody = unknown, ReqBody = unknown, ReqQuery extends ParsedQs = ParsedQs>(handler: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => Promise<void>) => RequestHandler<P, ResBody, ReqBody, ReqQuery>;
