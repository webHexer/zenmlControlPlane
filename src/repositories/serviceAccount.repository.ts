import { Types } from "mongoose";
import { ServiceAccount } from "../models/serviceAccount.model";

interface StoreServiceAccountInterface {
  workspaceId: Types.ObjectId;
  grantedToJNJUsername: string;
  serviceAccountUsername: string;
  serviceAccountId: string;
  description: string;
  apiKey: string;
  apiKeyName: string;
}

export const createServiceAccountRecord = async (
  data: StoreServiceAccountInterface,
) => {
  return ServiceAccount.create({
    workspace: data.workspaceId,
    jnjUsername: data.grantedToJNJUsername,
    serviceAccountUsername: data.serviceAccountUsername,
    serviceAccountId: data.serviceAccountId,
    description: data.description,
    apiKey: data.apiKey,
    apiKeyName: data.apiKeyName,
  });
};
