import express from "express";
import { loginToWorkspace } from "./auth.controller";
import { auditMiddleware } from "../../middlewares/audit.middleware";

const router = express.Router();

// Define the routes for authentication
router.post("/loginToWorkspace", auditMiddleware, loginToWorkspace);

export default router;
