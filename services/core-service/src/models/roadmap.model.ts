import {
  HydratedDocument,
  Model,
  Schema,
  Types,
  model,
} from "mongoose";

export interface IRoadmapResource {
  title: string;
  url: string;
  type?: string;
}

export interface IRoadmapTopic {
  title: string;
  description?: string;
  resources: IRoadmapResource[];
}

export interface IRoadmapStage {
  title: string;
  description?: string;
  order: number;
  topics: IRoadmapTopic[];
}

export interface IRoadmap {
  companyId: Types.ObjectId;

  title: string;
  description?: string;

  createdBy: string;

  stages: IRoadmapStage[];

  isPublished: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export type RoadmapDocument = HydratedDocument<IRoadmap>;

const roadmapResourceSchema = new Schema<IRoadmapResource>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },

    type: {
      type: String,
      trim: true,
      maxlength: 50,
    },
  },
  {
    _id: false,
  },
);

const roadmapTopicSchema = new Schema<IRoadmapTopic>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    resources: {
      type: [roadmapResourceSchema],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const roadmapStageSchema = new Schema<IRoadmapStage>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    topics: {
      type: [roadmapTopicSchema],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const roadmapSchema = new Schema<IRoadmap>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 3000,
    },

    createdBy: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    stages: {
      type: [roadmapStageSchema],
      default: [],
    },

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

roadmapSchema.index({
  companyId: 1,
  isPublished: 1,
});

export const Roadmap: Model<IRoadmap> = model<IRoadmap>(
  "Roadmap",
  roadmapSchema,
);