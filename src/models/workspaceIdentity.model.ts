import mongoose from "mongoose";

const workspaceIdentitySchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    jnjUsername: {
      type: String,
      required: true,
      index: true,
    },

    identityType: {
      type: String,
      enum: ["service", "user"],
      required: true,
    },

    serviceAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceAccount",
    },

    zenmlUsername: String,
    zenmlPasswordEncrypted: String,

    role: {
      type: String,
      enum: ["admin", "viewer"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

workspaceIdentitySchema.index(
  { workspace: 1, jnjUsername: 1 },
  { unique: true },
);

export const WorkspaceIdentity = mongoose.model(
  "WorkspaceIdentity",
  workspaceIdentitySchema,
);
