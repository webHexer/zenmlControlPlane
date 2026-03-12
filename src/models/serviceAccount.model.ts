// models/serviceAccount.model.ts
import mongoose from "mongoose";

const ServiceAccountSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    jnjUsername: {
      type: String,
      required: true,
    },

    serviceAccountUsername: {
      type: String,
      required: true,
    },

    serviceAccountId: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    apiKeyName: {
      type: String,
      required: true,
    },

    apiKey: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "developer", "viewer"],
      default: "viewer",
    },
  },
  { timestamps: true },
);

export const ServiceAccount = mongoose.model(
  "ServiceAccount",
  ServiceAccountSchema,
);
