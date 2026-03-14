import express from "express";
import { createWorkspace } from "./createWorkspace.controller";

const router = express.Router();

router.post("/createWorkspace", createWorkspace);

export default router;
