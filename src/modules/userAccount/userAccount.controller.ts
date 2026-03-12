import { Request, Response, NextFunction } from "express";
import * as userAccountService from "./userAccount.service";

export const createUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await userAccountService.createUserAccount(req);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
