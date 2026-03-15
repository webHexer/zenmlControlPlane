import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },

    method: {
      type: String,
      required: true,
    },

    path: {
      type: String,
      required: true,
    },

    query: {
      type: Object,
    },

    body: {
      type: Object,
    },

    statusCode: {
      type: Number,
    },

    ip: {
      type: String,
    },

    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Audit = mongoose.model("Audit", auditSchema);
