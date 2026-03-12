import { Request, Response, NextFunction } from "express";
import { createZenProxy } from "./createProxy";

// Proxy middleware to forward requests to the ZenML server
export const proxyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { ...restPayload } = req.body;
    const { workspace, token } = req.context!;

    req.body = restPayload;

    const proxy = createZenProxy(workspace.zenmlServerUrl, token);

    proxy(req, res, next);
  } catch (err) {
    next(err);
  }
};
