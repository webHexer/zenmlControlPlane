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

    accountType: {
      type: String,
      enum: ["UserAccount", "ServiceAccount"], // model names
      required: true,
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "accountType",
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
