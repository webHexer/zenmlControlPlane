import { ClientSession, Types } from "mongoose";
import { ServiceAccount } from "../models/serviceAccount.model";

interface StoreServiceAccountInterface {
  workspaceId: Types.ObjectId;
  grantedToJNJUsername: string;
  serviceUsername: string;
  serviceAccountId: string;
  description: string;
  apiKey: string;
  apiKeyName: string;
}

export const createServiceAccountRecord = async (
  data: StoreServiceAccountInterface,
  session?: ClientSession,
) => {
  const result = await ServiceAccount.create(
    [
      {
        workspace: data.workspaceId,
        jnjUsername: data.grantedToJNJUsername,
        serviceAccountUsername: data.serviceUsername,
        serviceAccountId: data.serviceAccountId,
        description: data.description,
        apiKey: data.apiKey,
        apiKeyName: data.apiKeyName,
      },
    ],
    { session },
  );
  return result[0];
};
