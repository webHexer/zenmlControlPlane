import { Types } from "mongoose";
import { WorkspaceAuthSession } from "../models/workspaceAuthSession.model";

interface StoreAuthSessionParams {
  workspaceId: Types.ObjectId;
  identityId: Types.ObjectId;
  authType: "accessToken" | "apiKey";
  token: string;
  expiresAt?: Date | null;
}
export const saveAuthSessionToDB = async (data: StoreAuthSessionParams) => {
  return WorkspaceAuthSession.findOneAndUpdate(
    {
      workspace: data.workspaceId,
      identity: data.identityId,
    },
    {
      workspace: data.workspaceId,
      identity: data.identityId,
      authType: data.authType,
      credentials: data.token,
      expiresAt: data.expiresAt,
      lastUsedAt: new Date(),
    },
    { upsert: true, new: true },
  );
};

export const findAuthSession = async (
  workspace: Types.ObjectId,
  identity: Types.ObjectId,
) => {
  return WorkspaceAuthSession.findOne({
    workspace,
    identity,
  });
};
