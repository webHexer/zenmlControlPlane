import { Audit } from "../models/audit.model";

export const saveAuditLog = async (data: any) => {
  return Audit.create(data);
};
