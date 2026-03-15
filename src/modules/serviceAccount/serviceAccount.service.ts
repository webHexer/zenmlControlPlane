import { Request } from "express";
import mongoose from "mongoose";

import { saveIdentityInDB } from "../../repositories/identity.repository";
import { createServiceAccountRecord } from "../../repositories/serviceAccount.repository";
import {
  activateServiceUser,
  createServiceUser,
  deleteServiceUser,
} from "../../clients/serviceUser.client";
import { AppError } from "../../utils/AppError";

export const createServiceAccount = async (req: Request) => {
  const { serviceUsername, description, grantedToJNJUsername, role } = req.body;
  const { workspace, token } = req.context!;

  const session = await mongoose.startSession();
  session.startTransaction();

  // used for rollback
  let rollbackServiceUserId: string | undefined;

  try {
    // 1 Create service user in ZenML
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

    console.log("Service user created in ZenML with ID:", serviceUser);

    if (!serviceUser?.id) {
      throw new AppError("Failed to create service user in ZenML");
    }

    const serviceUserId = serviceUser.id;
    rollbackServiceUserId = serviceUserId;

    // 2 Generate API key
    const apiKeyName = `${serviceUsername}-api-key`;

    const activateServiceUserPayload = {
      name: apiKeyName,
      description: `${serviceUsername} API key`,
    };

    const activatedServiceUser = await activateServiceUser(
      workspace.zenmlServerUrl,
      serviceUserId,
      activateServiceUserPayload,
      token,
    );

    const apiKey = activatedServiceUser?.body?.key;

    console.log("API key generated for service user:", apiKey);

    if (!apiKey) {
      throw new AppError("Failed to generate API key for service user");
    }

    // 3 Save service account in DB
    const serviceAccount = await createServiceAccountRecord(
      {
        workspace: workspace._id,
        jnjUsername: grantedToJNJUsername,
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
      throw new AppError("Failed to create service account record");
    }

    // 4 Save identity mapping
    await saveIdentityInDB(
      {
        workspace: workspace._id,
        jnjUsername: grantedToJNJUsername,
        accountType: "ServiceAccount",
        account: serviceAccount._id,
      },
      session,
    );

    // 5 Commit transaction
    await session.commitTransaction();

    return {
      message: "Service account created successfully",
    };
  } catch (error) {
    await session.abortTransaction();

    // Rollback ZenML service user if created
    if (rollbackServiceUserId) {
      try {
        await deleteServiceUser(
          workspace.zenmlServerUrl,
          rollbackServiceUserId,
          token,
        );
      } catch (rollbackError) {
        console.error("Failed to rollback ZenML service user:", rollbackError);
      }
    }

    throw error;
  } finally {
    session.endSession();
  }
};
