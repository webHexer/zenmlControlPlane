import express from "express";
import { loginToWorkspace } from "./auth.controller";

// Note: This router is mounted at /auth, so the full paths will be:
// POST /auth/loginToWorkspace
// POST /auth/loginToServiceAccount
// POST /auth/loginToUserAccount
const router = express.Router();

// Define the routes for authentication
router.post("/loginToWorkspace", loginToWorkspace);

export default router;
