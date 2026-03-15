import express from "express";
import { loginToWorkspace } from "./auth.controller";
import { auditMiddleware } from "../../middlewares/audit.middleware";

// Note: This router is mounted at /auth, so the full paths will be:
// POST /auth/loginToWorkspace
// POST /auth/loginToServiceAccount
// POST /auth/loginToUserAccount
const router = express.Router();

// Define the routes for authentication
router.post("/loginToWorkspace", auditMiddleware, loginToWorkspace);

export default router;
