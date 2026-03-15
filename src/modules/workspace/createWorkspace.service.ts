import { saveWorkspaceToDB } from "../../repositories/workspace.repository";
import {
  activateWorkspace,
  getWorkspaceInfo,
} from "../../clients/createWorkspace.client";

import { createZenMLInstance, destroyZenMLInstance } from "./docker.service";
import { waitForZenML } from "../../utils/waitForZenml";
import { saveIdentityToDB } from "../../repositories/identity.repository";
import mongoose from "mongoose";
import { generateZenMLPassword } from "../../utils/credentialGenerator";

interface CreateWorkspaceParams {
  workspaceName: string;
  jnjUsername: string;
  zenmlUsername: string;
}

// Helper to build activation payload
const buildActivationPayload = (
  username: string,
  password: string,
  workspaceName: string,
) => ({
  admin_username: username,
  admin_password: password,
  server_name: workspaceName,
});

export const createWorkspaceService = async (params: CreateWorkspaceParams) => {
  let containerId: string | undefined;
  const session = await mongoose.startSession();
  session.startTransaction();
  console.log(
    `Starting transaction for creating workspace ${params.workspaceName}`,
  );

  try {
    const { workspaceName, jnjUsername, zenmlUsername } = params;

    // 1 Generate credentials
    // const zenmlUsername = generateZenMLUsername();
    const zenmlPassword = generateZenMLPassword();

    // 2 Create container
    const instance = await createZenMLInstance();

    containerId = instance.containerId;
    const zenmlServerUrl = instance.url;

    // 3 Get workspace info
    const workspaceInfo = await waitForZenML(() =>
      getWorkspaceInfo(zenmlServerUrl),
    );

    // 4 Activate workspace
    await activateWorkspace(
      zenmlServerUrl,
      buildActivationPayload(zenmlUsername, zenmlPassword, workspaceName),
    );

    // 5 Save workspace
    const workspace = await saveWorkspaceToDB(
      {
        workspaceId: workspaceInfo.id,
        workspaceName,
        zenmlServerUrl,
        containerId,
      },
      session,
    );

    // 6 Save identity
    await saveIdentityToDB(
      {
        workspaceId: workspace._id,
        jnjUsername,
        zenmlUsername,
        zenmlPasswordEncrypted: zenmlPassword,
        identityType: "user",
        status: "active",
        role: "admin",
      },
      session,
    );

    // 7 Commit transaction
    await session.commitTransaction();

    console.log(
      `Workspace ${workspaceName} created successfully with workspace ID ${workspaceInfo.id} and deployed on server ${zenmlServerUrl}`,
    );
    return {
      workspaceId: workspaceInfo.id,
      workspaceName,
      zenmlServerUrl,
      containerId,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // cleanup infra
    if (containerId) {
      await destroyZenMLInstance(containerId);
    }
    throw error;
  } finally {
    session.endSession();
  }
};
