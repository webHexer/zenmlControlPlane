import { saveAuditLog } from "../repositories/audit.repository";

export const createAuditLog = async (data: any) => {
  try {
    await saveAuditLog(data);
  } catch (error) {
    console.error("Audit logging failed:", error);
  }
};
