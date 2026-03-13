import { Request, Response, NextFunction } from "express";
import { findWorkspaceByName } from "../repositories/workspace.repository";
import { findIdentity } from "../repositories/identity.repository";
import { AppError } from "../utils/AppError";
import { findAuthSession } from "../repositories/authSession.repository";
import { sessionCache } from "../cache/session.cache";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { workspaceName, grantedByJNJUsername, jnjUsername } = req.body;

    const userNameForCache = (jnjUsername ?? grantedByJNJUsername)
      .trim()
      .toLowerCase();

    const cacheKey = `${workspaceName.trim().toLowerCase()}:${userNameForCache}`;

    // 1 Try cache first
    const cached = sessionCache.get(cacheKey);
    if (cached) {
      console.log(`Session cache hit for key ${cacheKey}`);
      req.context = cached;
      return next();
    }

    // 2 Fetch from DB if not in cache

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

    const context = {
      workspace,
      token,
      role: identity.role,
      identity,
    };

    // Store in cache for subsequent requests
    sessionCache.set(cacheKey, context);
    console.log(`Session cached for key ${cacheKey}`);

    req.context = context;

    next();
  } catch (err) {
    next(err);
  }
};
