import mongoose from "mongoose";

const userAccountSchema = new mongoose.Schema(
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

    zenmlUsername: {
      type: String,
      required: true,
    },

    zenmlPassword: {
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

export const UserAccount = mongoose.model("UserAccount", userAccountSchema);
