import { Request, Response, NextFunction } from "express";
import { findWorkspaceByName } from "../repositories/workspace.repository";
import { findIdentity } from "../repositories/identity.repository";
import { findAuthSession } from "../repositories/authSession.repository";
import { AppError } from "../utils/AppError";
import { sessionCache } from "../cache/session.cache";

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

    const username = (jnjUsername ?? grantedByJNJUsername).trim().toLowerCase();

    const cacheKey = `${workspaceName.trim().toLowerCase()}:${username}`;

    // 1️⃣ Try cache first
    const cached = sessionCache.get(cacheKey);
    if (cached) {
      console.log(`Session cache hit for key ${cacheKey}`);
      req.context = cached;
      return next();
    }

    // 2️⃣ Fetch workspace
    const workspace = await findWorkspaceByName(workspaceName);

    if (!workspace) {
      throw new AppError("Workspace not found", 404);
    }

    // 3️⃣ Fetch identity
    const identity: any = await findIdentity(workspace._id, username);

    if (!identity) {
      throw new AppError("User identity not found", 404);
    }

    const account = identity.account;

    if (!account) {
      throw new AppError("Account mapping missing", 500);
    }

    // 4️⃣ Fetch session
    const session = await findAuthSession(workspace._id, identity._id);

    if (!session) {
      throw new AppError("User not logged in to workspace", 401);
    }

    const token = session.credentials;

    // 5️⃣ Extract role from account
    const role = account.role ?? null;

    const context = {
      workspace,
      token,
      role,
      identity,
      account,
    };

    // 6️⃣ Cache session
    sessionCache.set(cacheKey, context);
    console.log(`Session cached for key ${cacheKey}`);

    req.context = context;

    next();
  } catch (err) {
    next(err);
  }
};
