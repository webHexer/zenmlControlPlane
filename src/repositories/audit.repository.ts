import { AuditLog } from "../models/audit.model";

export const createAuditLog = async (data: any) => {
  return AuditLog.create(data);
};
