import { AppError } from "../../utils/AppError";
import { findIdentity } from "../../repositories/identity.repository";
import { findWorkspaceByName } from "../../repositories/workspace.repository";
import { saveAuthSessionToDB } from "../../repositories/authSession.repository";
import { decrypt } from "../../utils/crypto";
interface LoginParams {
  workspaceName: string;
  jnjUsername: string;
}

type AuthType = "apiKey" | "accessToken";

interface ZenMLTokenResponse {
  access_token: string;
}

const loginToZenML = async (
  serverUrl: string,
  username: string,
  encryptedPassword: string,
): Promise<string> => {
  const password = decrypt(encryptedPassword);

  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  const response = await fetch(`${serverUrl}/api/v1/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    throw new AppError("ZenML login failed");
  }

  const result: ZenMLTokenResponse = await response.json();
  return result.access_token;
};

export const loginToWorkspace = async ({
  workspaceName,
  jnjUsername,
}: LoginParams) => {
  // 1 Find workspace
  const workspace = await findWorkspaceByName(workspaceName);
  if (!workspace) throw new AppError("Workspace not found");

  // 2 Find identity
  const identity = await findIdentity(workspace._id, jnjUsername);
  if (!identity) throw new AppError("User not mapped to workspace");

  const account: any = identity.account;

  let token: string;
  let authType: AuthType;
  let expiresAt: Date | null = null;
  console.log("account", account);

  // 3 Resolve authentication method
  switch (identity.accountType) {
    case "ServiceAccount":
      if (!account?.apiKey) {
        throw new AppError("Service account API key missing");
      }

      token = account.apiKey;
      authType = "apiKey";
      break;

    case "UserAccount":
      if (!account?.zenmlUsername || !account?.zenmlPassword) {
        throw new AppError("User account credentials missing");
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
      throw new AppError("Invalid identity type");
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
    throw new AppError("Failed to create auth session");
  }

  return { message: "Login successful" };
};
