import { AppError } from "../../utils/AppError";
import { findIdentity } from "../../repositories/identity.repository";
import { findWorkspaceByName } from "../../repositories/workspace.repository";
import { storeAuthSession } from "../../repositories/authSession.repository";

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
