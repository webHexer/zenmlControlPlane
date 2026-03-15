import express from "express";
import { Action } from "../../authz/actions";
import { Resource } from "../../authz/resources";
import { requirePermission } from "../../middlewares/authorize.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { createServiceAccount } from "./serviceAccount.controller";
import { auditMiddleware } from "../../middlewares/audit.middleware";

const router = express.Router();

router.post(
  "/createServiceAccount",
  authenticate,
  requirePermission({
    resource: Resource.SERVICE_ACCOUNT,
    action: Action.CREATE,
  }),
  auditMiddleware,
  createServiceAccount,
);

export default router;
