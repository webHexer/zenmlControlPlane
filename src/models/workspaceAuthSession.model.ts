import mongoose from "mongoose";

const workspaceAuthSessionSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    identity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkspaceIdentity",
      required: true,
      index: true,
    },
    // jnjUsername: {
    //   type: String,
    //   required: true,
    //   index: true,
    // },

    authType: {
      type: String,
      enum: ["apiKey", "accessToken"],
      required: true,
    },

    credentials: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    lastUsedAt: Date,
  },
  { timestamps: true },
);

workspaceAuthSessionSchema.index(
  { workspace: 1, identity: 1 },
  { unique: true },
);

export const WorkspaceAuthSession = mongoose.model(
  "WorkspaceAuthSession",
  workspaceAuthSessionSchema,
);
