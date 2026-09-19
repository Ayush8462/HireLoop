import { z } from "zod";
export declare const companyFields: {
    name: z.ZodString;
    logo: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    description: z.ZodOptional<z.ZodString>;
    industry: z.ZodOptional<z.ZodString>;
    headquarters: z.ZodOptional<z.ZodString>;
};
export declare const createCompanySchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        logo: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        description: z.ZodOptional<z.ZodString>;
        industry: z.ZodOptional<z.ZodString>;
        headquarters: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    params: z.ZodObject<{}, z.core.$strip>;
    query: z.ZodObject<{}, z.core.$strip>;
}, z.core.$strip>;
export declare const roadmapResourceSchema: z.ZodObject<{
    title: z.ZodString;
    url: z.ZodString;
    type: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const roadmapTopicSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    resources: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        url: z.ZodString;
        type: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const roadmapStageSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    order: z.ZodNumber;
    topics: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        resources: z.ZodDefault<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            url: z.ZodString;
            type: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const createRoadmapFields: {
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    stages: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        order: z.ZodNumber;
        topics: z.ZodDefault<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            resources: z.ZodDefault<z.ZodArray<z.ZodObject<{
                title: z.ZodString;
                url: z.ZodString;
                type: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
    isPublished: z.ZodDefault<z.ZodBoolean>;
};
export declare const createRoadmapSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        stages: z.ZodDefault<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            order: z.ZodNumber;
            topics: z.ZodDefault<z.ZodArray<z.ZodObject<{
                title: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                resources: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    title: z.ZodString;
                    url: z.ZodString;
                    type: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>>;
        isPublished: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
    params: z.ZodObject<{
        companyId: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodObject<{}, z.core.$strip>;
}, z.core.$strip>;
export declare const updateRoadmapSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        stages: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            order: z.ZodNumber;
            topics: z.ZodDefault<z.ZodArray<z.ZodObject<{
                title: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                resources: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    title: z.ZodString;
                    url: z.ZodString;
                    type: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>>>;
        isPublished: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, z.core.$strip>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodObject<{}, z.core.$strip>;
}, z.core.$strip>;
