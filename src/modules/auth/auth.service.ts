import { findIdentity } from "../../repositories/identity.repository";
import { findWorkspaceByName } from "../../repositories/workspace.repository";
import { saveAuthSessionToDB } from "../../repositories/authSession.repository";
import { AuthType, LoginParams } from "../auth/auth.types";
import { loginToZenML } from "./helper";

export const loginToWorkspace = async ({
  workspaceName,
  jnjUsername,
}: LoginParams) => {
  // 1 Find workspace
  const workspace = await findWorkspaceByName(workspaceName);
  if (!workspace) throw new Error("Workspace not found");

  // 2 Find identity
  const identity = await findIdentity(workspace._id, jnjUsername);
  if (!identity) throw new Error("User not mapped to workspace");

  const account: any = identity.account;

  let token: string;
  let authType: AuthType;
  let expiresAt: Date | null = null;

  // 3 Resolve authentication method
  switch (identity.accountType) {
    case "ServiceAccount":
      if (!account?.apiKey) {
        throw new Error("Service account API key missing");
      }

      token = account.apiKey;
      authType = "apiKey";
      break;

    case "UserAccount":
      if (!account?.zenmlUsername || !account?.zenmlPassword) {
        throw new Error("User account credentials missing");
      }

      token = await loginToZenML(
        workspace.zenmlServerUrl,
        account.zenmlUsername,
        account.zenmlPassword,
      );

      authType = "accessToken";
      expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);
      break;

    default:
      throw new Error("Invalid identity type");
  }

  // 4 Store auth session
  const session = await saveAuthSessionToDB({
    workspaceId: workspace._id,
    identityId: identity._id,
    authType,
    token,
    expiresAt,
  });

  if (!session) {
    throw new Error("Failed to create auth session");
  }

  return { message: "Login successful" };
};
