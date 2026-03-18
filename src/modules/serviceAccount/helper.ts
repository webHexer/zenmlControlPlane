import { saveIdentityInDB } from "../../repositories/identity.repository";
import { createServiceAccountRecord } from "../../repositories/serviceAccount.repository";

import {
  activateServiceUser,
  createServiceUser,
  deleteServiceUser,
} from "../../clients/serviceUser.client";
import mongoose from "mongoose";

export const createZenmlServiceUser = async (
  serverUrl: string,
  serviceUsername: string,
  description: string,
  token: string,
) => {
  const payload = {
    name: serviceUsername,
    description,
    active: true,
  };

  const serviceUser = await createServiceUser(serverUrl, payload, token);

  if (!serviceUser?.id) {
    throw new Error("Failed to create service user in ZenML");
  }

  return serviceUser;
};

export const generateServiceApiKey = async (
  serverUrl: string,
  serviceUserId: string,
  serviceUsername: string,
  token: string,
) => {
  const apiKeyName = `${serviceUsername}-api-key`;

  const payload = {
    name: apiKeyName,
    description: `${serviceUsername} API key`,
  };

  const activatedServiceUser = await activateServiceUser(
    serverUrl,
    serviceUserId,
    payload,
    token,
  );

  const apiKey = activatedServiceUser?.body?.key;

  if (!apiKey) {
    throw new Error("Failed to generate API key for service user");
  }

  return {
    apiKey,
    apiKeyName,
  };
};

export const saveServiceAccountAndIdentity = async (
  workspaceId: mongoose.Types.ObjectId,
  jnjUsername: string,
  serviceUsername: string,
  serviceUserId: string,
  description: string,
  apiKey: string,
  apiKeyName: string,
  role: string,
  session: mongoose.ClientSession,
) => {
  const serviceAccount = await createServiceAccountRecord(
    {
      workspace: workspaceId,
      jnjUsername,
      serviceUsername,
      serviceAccountId: serviceUserId,
      description,
      apiKey,
      apiKeyName,
      role,
    },
    session,
  );

  if (!serviceAccount) {
    throw new Error("Failed to create service account record");
  }

  await saveIdentityInDB(
    {
      workspace: workspaceId,
      jnjUsername,
      accountType: "ServiceAccount",
      account: serviceAccount._id,
    },
    session,
  );
};

export const rollbackServiceUser = async (
  serverUrl: string,
  serviceUserId: string,
  token: string,
) => {
  try {
    await deleteServiceUser(serverUrl, serviceUserId, token);
  } catch (error) {
    console.error("Failed to rollback ZenML service user:", error);
  }
};
