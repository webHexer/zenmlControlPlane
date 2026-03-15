import express from "express";
import { Action } from "../../authz/actions";
import { Resource } from "../../authz/resources";
import { requirePermission } from "../../middlewares/authorize.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { createUserAccount } from "./userAccount.controller";
import { auditMiddleware } from "../../middlewares/audit.middleware";

const router = express.Router();

router.post(
  "/createUserAccount",
  authenticate,
  requirePermission({
    resource: Resource.USERS,
    action: Action.CREATE,
  }),
  auditMiddleware,
  createUserAccount,
);

export default router;
