import { Request } from "express";
import mongoose from "mongoose";
import {
  createZenmlServiceUser,
  generateServiceApiKey,
  rollbackServiceUser,
  saveServiceAccountAndIdentity,
} from "./helper";

export const createServiceAccount = async (req: Request) => {
  const { serviceUsername, description, grantedToJNJUsername, role } = req.body;

  if (!req.context) {
    throw new Error("Request context missing");
  }

  if (!serviceUsername || !grantedToJNJUsername) {
    throw new Error("Missing required fields");
  }

  const { workspace, token } = req.context;

  const session = await mongoose.startSession();
  session.startTransaction();

  let serviceUserId: string | undefined;

  try {
    // 1 Create ZenML service user
    const serviceUser = await createZenmlServiceUser(
      workspace.zenmlServerUrl,
      serviceUsername,
      description,
      token,
    );

    serviceUserId = serviceUser.id;

    // 2 Generate API key
    const { apiKey, apiKeyName } = await generateServiceApiKey(
      workspace.zenmlServerUrl,
      serviceUserId!,
      serviceUsername,
      token,
    );

    // 3 Save DB records
    await saveServiceAccountAndIdentity(
      workspace._id,
      grantedToJNJUsername,
      serviceUsername,
      serviceUserId!,
      description,
      apiKey,
      apiKeyName,
      role,
      session,
    );

    await session.commitTransaction();

    return {
      message: "Service account created successfully",
    };
  } catch (error) {
    await session.abortTransaction();

    if (serviceUserId) {
      await rollbackServiceUser(workspace.zenmlServerUrl, serviceUserId, token);
    }

    throw error;
  } finally {
    session.endSession();
  }
};
