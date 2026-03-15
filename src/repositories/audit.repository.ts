import { AuditLog } from "../models/audit.model";

export const saveAuditLog = async (data: any) => {
  return AuditLog.create(data);
};
