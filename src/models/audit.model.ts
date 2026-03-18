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

// TTL index: documents will auto-delete 30 days after creation
auditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
export const Audit = mongoose.model("Audit", auditSchema);
