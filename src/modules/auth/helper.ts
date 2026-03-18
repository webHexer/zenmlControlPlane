import { decrypt } from "../../utils/crypto";
import { ZenMLTokenResponse } from "./auth.types";

export const loginToZenML = async (
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
    throw new Error("ZenML login failed");
  }

  const result: ZenMLTokenResponse = await response.json();
  return result.access_token;
};
