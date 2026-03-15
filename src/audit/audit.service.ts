import { saveAuditLog } from "../repositories/audit.repository";
import { AuditEvent } from "./audit.types";

export const createAuditLog = async (event: AuditEvent) => {
  try {
    await saveAuditLog({
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      metadata: event.metadata,
      ip: event.ip,
    });
  } catch (error) {
    console.error("Audit log failed", error);
  }
};
