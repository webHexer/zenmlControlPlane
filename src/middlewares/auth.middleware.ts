import { Request, Response, NextFunction } from "express";
import { findWorkspaceByName } from "../repositories/workspace.repository";
import { findIdentity } from "../repositories/identity.repository";
import { AppError } from "../utils/AppError";
import { findAuthSession } from "../repositories/authSession.repository";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { workspaceName, grantedByJNJUsername, jnjUsername } = req.body;

    if (!workspaceName || !(grantedByJNJUsername || jnjUsername)) {
      throw new AppError("workspaceName and username required", 400);
    }

    const workspace = await findWorkspaceByName(workspaceName);

    if (!workspace) {
      throw new AppError("Workspace not found", 404);
    }

    const identity = await findIdentity(
      workspace._id,
      jnjUsername ?? grantedByJNJUsername,
    );

    if (!identity) {
      throw new AppError("User identity not found", 404);
    }

    if (identity.status !== "active") {
      throw new AppError("User is not active", 403);
    }

    // Find session of the user who is granting access, to authenticate with ZenML server
    const session = await findAuthSession(workspace._id, identity!._id);

    if (!session) {
      throw new AppError("User not logged in to workspace", 401);
    }

    const token = session.credentials;

    req.context = {
      workspace,
      token,
      role: identity.role,
      identity,
    };

    next();
  } catch (err) {
    next(err);
  }
};
