import express from "express";
import { Action } from "../../authz/actions";
import { Resource } from "../../authz/resources";
import { requirePermission } from "../../middlewares/authorize.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { createUserAccount } from "./userAccount.controller";

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
  authenticate, // authenticate the user
  requirePermission({
    resource: Resource.USERS,
    action: Action.CREATE_USER_ACCOUNT,
  }), // check if the user has permission to create a user account
  createUserAccount,
);

export default router;
