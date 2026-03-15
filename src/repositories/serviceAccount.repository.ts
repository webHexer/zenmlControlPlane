import { ClientSession, Types } from "mongoose";
import { ServiceAccount } from "../models/serviceAccount.model";

interface StoreServiceAccountInterface {
  workspace: Types.ObjectId;
  jnjUsername: string;
  serviceUsername: string;
  serviceAccountId: string;
  description: string;
  apiKey: string;
  apiKeyName: string;
  role: string;
}

export const createServiceAccountRecord = async (
  data: StoreServiceAccountInterface,
  session?: ClientSession,
) => {
  const result = await ServiceAccount.create(
    [
      {
        workspace: data.workspace,
        jnjUsername: data.jnjUsername,
        serviceUsername: data.serviceUsername,
        serviceAccountId: data.serviceAccountId,
        description: data.description,
        apiKey: data.apiKey,
        apiKeyName: data.apiKeyName,
        role: data.role,
      },
    ],
    { session },
  );
  return result[0];
};
