import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    userId: String,
    action: String,
    resource: String,
    resourceId: String,
    method: String,
    path: String,
    statusCode: Number,
    ip: String,
    userAgent: String,
    payload: Object,
  },
  { timestamps: true },
);

export const AuditLog = mongoose.model("AuditLog", auditSchema);
