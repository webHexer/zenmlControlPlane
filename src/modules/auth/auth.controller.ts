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

// login to service account and create auth session
export const loginToServiceAccount = async (req: Request, res: Response) => {
  const result = await authService.loginToServiceAccount(req.body);
  res.json(result);
};

// login to user account and create auth session
export const loginToUserAccount = async (req: Request, res: Response) => {
  const result = await authService.loginToUserAccount(req.body);
  res.json(result);
};
