import { Request, Response, NextFunction } from "express";
import { authorize } from "../authz/authorize";
import { Action } from "../authz/actions";
import { Resource } from "../authz/resources";
import { AppError } from "../utils/AppError";
import { Role } from "../authz/roles";

export const requirePermission =
  (
    resolver:
      | { resource: Resource; action: Action }
      | ((req: Request) => { resource: Resource; action: Action }),
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      let resource;
      let action;

      if (typeof resolver === "function") {
        const result = resolver(req);
        resource = result.resource;
        action = result.action;
      } else {
        resource = resolver.resource;
        action = resolver.action;
      }

      const allowed = authorize({
        role: req.context!.role,
        resource,
        action,
      });
      console.log(req.context!.role, resource, action);
      if (!allowed) {
        throw new AppError("Access denied", 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
