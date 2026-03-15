import express from "express";
import { createWorkspace } from "./createWorkspace.controller";
import { auditMiddleware } from "../../middlewares/audit.middleware";

const router = express.Router();

router.post("/createWorkspace", auditMiddleware, createWorkspace);

export default router;
