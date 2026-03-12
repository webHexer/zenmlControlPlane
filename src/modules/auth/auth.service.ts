import { Workspace } from "../../models/workspace.model";
import { WorkspaceIdentity } from "../../models/workspaceIdentity.model";
import { WorkspaceAuthSession } from "../../models/workspaceAuthSession.model";
import { AppError } from "../../utils/AppError";
import { findIdentity } from "../../repositories/identity.repository";
import { findWorkspaceByName } from "../../repositories/workspace.repository";
import { storeAuthSession } from "../../repositories/authSession.repository";
import { decrypt } from "../../utils/crypto";

export const loginToWorkspace = async ({ workspaceName, jnjUsername }: any) => {
  try {
    // 1 find the workspace
    const workspace = await findWorkspaceByName(workspaceName);
    if (!workspace) throw new AppError("Workspace not found");

    // 2 Find the identity for the user in the workspace
    const identity = await findIdentity(workspace._id, jnjUsername, "active");

    if (!identity) throw new AppError("User not mapped to workspace");

    let token: string;
    let authType: "apiKey" | "accessToken" = "apiKey";
    let expiresAt: Date | null = null;

    // 3 If the identity is of type service, we can directly use the API key as token.
    // If it's of type user, we need to login to ZenML server to get the access token
    if (identity.identityType === "service") {
      token = (identity.serviceAccount as any)?.apiKey;
      authType = "apiKey";
    } else {
      // For identityType "user", we need to login to ZenML server to get the access token
      const params = new URLSearchParams();
      params.append("username", identity.zenmlUsername!);
      params.append("password", decrypt(identity.zenmlPasswordEncrypted!));

      const loginResponse = await fetch(
        `${workspace.zenmlServerUrl}/api/v1/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params,
        },
      );

      if (!loginResponse.ok) {
        throw new AppError("ZenML login failed");
      }

      const result = await loginResponse.json();

      token = result.access_token;
      authType = "accessToken";
      expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);
    }

    // 4 Store the auth session in the database
    const session = await storeAuthSession({
      workspaceId: workspace._id,
      identityId: identity._id,
      authType,
      token,
      expiresAt,
    });

    if (!session) throw new AppError("Failed to create auth session");

    return { message: "Login successful" };
  } catch (error: any) {
    throw error;
  }
};

export const loginToServiceAccount = async ({
  workspaceName,
  jnjUsername,
}: any) => {
  const workspace = await Workspace.findOne({ workspaceName });
  if (!workspace) throw new Error("Workspace not found");

  const identity = await WorkspaceIdentity.findOne({
    workspace: workspace._id,
    jnjUsername,
    status: "active",
  }).populate("serviceAccount");

  if (!identity) throw new Error("Identity not found");

  const apiKey = (identity.serviceAccount as any)?.apiKey;

  await WorkspaceAuthSession.findOneAndUpdate(
    { workspace: workspace._id, identity: identity._id },
    {
      workspace: workspace._id,
      identity: identity._id,
      authType: "apiKey",
      credentials: apiKey,
      lastUsedAt: new Date(),
    },
    { upsert: true },
  );

  return { message: "Service account login successful" };
};

export const loginToUserAccount = async ({
  workspaceName,
  jnjUsername,
}: any) => {
  const workspace = await Workspace.findOne({ workspaceName });
  if (!workspace) throw new Error("Workspace not found");

  const identity = await WorkspaceIdentity.findOne({
    workspace: workspace._id,
    jnjUsername,
    status: "active",
  });

  if (!identity) throw new Error("User not mapped");

  const params = new URLSearchParams();
  params.append("username", identity.zenmlUsername!);
  params.append("password", identity.zenmlPasswordEncrypted!);

  const loginResponse = await fetch(
    `${workspace.zenmlServerUrl}/api/v1/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    },
  );

  if (!loginResponse.ok) {
    throw new Error("ZenML login failed");
  }

  const result = await loginResponse.json();

  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);

  await WorkspaceAuthSession.findOneAndUpdate(
    { workspace: workspace._id, identity: identity._id },
    {
      workspace: workspace._id,
      identity: identity._id,
      authType: "accessToken",
      credentials: result.access_token,
      expiresAt,
      lastUsedAt: new Date(),
    },
    { upsert: true },
  );

  return { message: "User login successful" };
};
