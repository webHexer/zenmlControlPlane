import express from "express";
import { Action } from "../../authz/actions";
import { Resource } from "../../authz/resources";
import { requirePermission } from "../../middlewares/authorize.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { createServiceAccount } from "./serviceAccount.controller";
import { auditMiddleware } from "../../middlewares/audit.middleware";

// Note: This router is mounted at /serviceAccount, so the full path for creating a service account will be:
// POST /serviceAccount/createServiceAccount
const router = express.Router();

// Endpoint to create a new service account for a specified workspace.
// The caller must be authenticated and have the appropriate permission (CREATE_SERVICE_ACCOUNT)
// on the SERVICE_ACCOUNT resource.
//
// Expected request payload (JSON):
// {
//   "workspaceName": "string",            // required: workspace identifier where the account will live
//   "grantedByJNJUsername": "string",    // required: JNJ username of the user granting access
//   "serviceUsername": "string",  // required: the desired username for the service account
//   "description": "string",             // optional: human-readable description of the account
//   "grantedToJNJUsername": "string",    // required: JNJ username of the principal receiving the account
//   "role": "string"                     // required: role to assign (e.g. "admin", "editor", "viewer")
// }
//
// Note: This router is mounted at /serviceAccount, so the full path is
// POST /serviceAccount/createServiceAccount
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
