import { Request } from "express";
import mongoose from "mongoose";

import { saveIdentityToDB } from "../../repositories/identity.repository";
import { createServiceAccountRecord } from "../../repositories/serviceAccount.repository";
import {
  activateServiceUser,
  createServiceUser,
  deleteServiceUser,
} from "../../clients/serviceUser.client";

export const createServiceAccount = async (req: Request) => {
  const { serviceUsername, description, grantedToJNJUsername, role } = req.body;
  const { workspace, token } = req.context!;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Create service account in ZenML
    const serviceUserPayload = {
      name: serviceUsername,
      description,
      active: true,
    };

    const serviceUser = await createServiceUser(
      workspace.zenmlServerUrl,
      serviceUserPayload,
      token,
    );

    // 2️⃣ Generate API key for service account
    const apiKeyName = `${serviceUsername}-api-key`;

    const activateServiceUserPayload = {
      name: apiKeyName,
      description: `${serviceUsername} API key`,
    };

    const activatedServiceUser = await activateServiceUser(
      workspace.zenmlServerUrl,
      serviceUser.id,
      activateServiceUserPayload,
      token,
    );

    const apiKey = activatedServiceUser.body.key;

    // 3️⃣ Save service account record in DB
    const serviceAccountData = {
      workspaceId: workspace._id,
      grantedToJNJUsername,
      serviceUsername,
      serviceAccountId: serviceUser.id,
      description,
      apiKey,
      apiKeyName,
    };

    const serviceAccount = await createServiceAccountRecord(
      serviceAccountData,
      session,
    );

    // 4️⃣ Save identity mapping in DB
    const identityData = {
      workspaceId: workspace._id,
      jnjUsername: grantedToJNJUsername,
      identityType: "service",
      status: "active",
      serviceAccount: serviceAccount._id,
      role,
    };

    await saveIdentityToDB(identityData, session);

    await session.commitTransaction();

    return {
      message: "Service account created successfully",
    };
  } catch (error) {
    await session.abortTransaction();

    if (serviceUsername) {
      try {
        await deleteServiceUser(
          workspace.zenmlServerUrl,
          serviceUsername,
          token,
        );
      } catch (rollbackError) {
        console.error("Failed to rollback ZenML user:", rollbackError);
      }
    }

    throw error;
  } finally {
    session.endSession();
  }
};
