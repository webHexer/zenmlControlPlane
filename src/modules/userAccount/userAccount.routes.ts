import express from "express";
import { Action } from "../../authz/actions";
import { Resource } from "../../authz/resources";
import { requirePermission } from "../../middlewares/authorize.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { createUserAccount } from "./userAccount.controller";
import { auditMiddleware } from "../../middlewares/audit.middleware";

// Note: This router is mounted at /userAccount, so the full path for creating a service account will be:
// POST /userAccount/createUserAccount
const router = express.Router();

// create a user account for a workspace
// Request Body:
// {
//   "workspaceName": "string",
//   "grantedByJNJUsername": "string",
//   "isAdmin": boolean,
//   "username": "string",
//   "email": "string",
//   "password": "string",
//   "role": "string",
//   "grantedToJNJUsername": "string"
// }
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
