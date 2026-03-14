import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import serviceAccountRoutes from "./modules/serviceAccount/serviceAccount.routes";
import userAccountRoutes from "./modules/userAccount/userAccount.routes";
import createWorkspaceRoutes from "./modules/workspace/createWorkspace.routes";
import { proxyMiddleware } from "./proxy/proxy.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { requirePermission } from "./middlewares/authorize.middleware";
import { authenticate } from "./middlewares/auth.middleware";
import { resolveResourceFromPath } from "./authz/resourceResolver";
import { resolveActionFromMethod } from "./authz/actionResolver";

const app = express();

app.use(express.json());

// Routes
app.use("/workspace", createWorkspaceRoutes);
app.use("/auth", authRoutes);
app.use("/serviceAccount", serviceAccountRoutes);
app.use("/userAccount", userAccountRoutes);

// Proxy Middleware (should be after all other routes)
app.use(
  "/",
  authenticate,
  requirePermission((req) => {
    const resource = resolveResourceFromPath(req.path);

    if (!resource) {
      throw new Error("Unknown resource");
    }

    const action = resolveActionFromMethod(req.method);

    return { resource, action };
  }),
  proxyMiddleware,
);

app.use(errorHandler);

export default app;
