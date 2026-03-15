import { Request, Response, NextFunction } from "express";
import { createAuditLog } from "../audit/audit.service";

export const auditMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = Date.now();

  res.on("finish", async () => {
    try {
      await createAuditLog({
        userId: req.body.jnjUsername || req.body.grantedByJNJUsername,

        method: req.method,
        path: req.originalUrl,

        query: req.query,
        body: req.body,

        statusCode: res.statusCode,

        ip: req.ip,
        userAgent: req.headers["user-agent"],

        duration: Date.now() - startTime,
      });
    } catch (err) {
      console.error("Audit middleware error:", err);
    }
  });

  next();
};
