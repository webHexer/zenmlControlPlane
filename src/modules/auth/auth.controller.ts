import { NextFunction, Request, Response } from "express";
import * as authService from "./auth.service";

// login to workspace and create auth session
export const loginToWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.loginToWorkspace(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
