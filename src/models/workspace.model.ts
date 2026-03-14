import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    workspaceName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    workspaceId: {
      type: String,
      required: true,
      unique: true,
    },

    containerId: {
      type: String,
      required: true,
    },

    zenmlServerUrl: {
      type: String,
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

export const Workspace = mongoose.model("Workspace", workspaceSchema);
