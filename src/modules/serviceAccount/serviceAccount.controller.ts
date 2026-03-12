import { NextFunction, Request, Response } from "express";
import * as serviceAccountService from "./serviceAccount.service";

export const createServiceAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await serviceAccountService.createServiceAccount(req);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
