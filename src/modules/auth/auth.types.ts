export interface LoginParams {
  workspaceName: string;
  jnjUsername: string;
}

export type AuthType = "apiKey" | "accessToken";

export interface ZenMLTokenResponse {
  access_token: string;
}
