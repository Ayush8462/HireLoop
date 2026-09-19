import { Types } from "mongoose";
import { ReferralStatus } from "../models/referral.model.js";
interface RequestReferralInput {
    seniorId: string;
    companyId: string;
    jobTitle: string;
    jobUrl?: string;
    message?: string;
}
export declare class ReferralService {
    requestReferral(authUserId: string, data: RequestReferralInput): Promise<import("mongoose").Document<unknown, {}, import("../models/referral.model.js").IReferral, {}, import("mongoose").DefaultSchemaOptions> & import("../models/referral.model.js").IReferral & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    updateStatus(authUserId: string, referralId: string, status: ReferralStatus): Promise<(import("mongoose").Document<unknown, {}, import("../models/referral.model.js").IReferral, {}, import("mongoose").DefaultSchemaOptions> & import("../models/referral.model.js").IReferral & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    getMySentReferrals(authUserId: string, status?: ReferralStatus): Promise<(import("mongoose").Document<unknown, {}, import("../models/referral.model.js").IReferral, {}, import("mongoose").DefaultSchemaOptions> & import("../models/referral.model.js").IReferral & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getMyReceivedReferrals(authUserId: string, status?: ReferralStatus): Promise<(import("mongoose").Document<unknown, {}, import("../models/referral.model.js").IReferral, {}, import("mongoose").DefaultSchemaOptions> & import("../models/referral.model.js").IReferral & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
export declare const referralService: ReferralService;
export {};
