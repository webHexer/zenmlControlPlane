import express from "express";
import {
  loginToWorkspace,
  loginToServiceAccount,
  loginToUserAccount,
} from "./auth.controller";

// Note: This router is mounted at /auth, so the full paths will be:
// POST /auth/loginToWorkspace
// POST /auth/loginToServiceAccount
// POST /auth/loginToUserAccount
const router = express.Router();

// Define the routes for authentication
router.post("/loginToWorkspace", loginToWorkspace);
router.post("/loginToServiceAccount", loginToServiceAccount);
router.post("/loginToUserAccount", loginToUserAccount);

export default router;
