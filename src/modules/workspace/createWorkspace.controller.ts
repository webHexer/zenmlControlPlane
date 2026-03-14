import { Request, Response, NextFunction } from "express";

import { createWorkspaceService } from "./createWorkspace.service";

export const createWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await createWorkspaceService(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
