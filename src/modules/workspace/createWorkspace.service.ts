import { saveWorkspaceToDB } from "../../repositories/workspace.repository";
import {
  activateWorkspace,
  getWorkspaceInfo,
} from "../../clients/createWorkspace.client";

import { createZenMLInstance, destroyZenMLInstance } from "./docker.service";
import { waitForZenML } from "../../utils/waitForZenml";
import { saveIdentityInDB } from "../../repositories/identity.repository";
import mongoose from "mongoose";
import { generateZenMLPassword } from "../../utils/credentialGenerator";
import { encrypt } from "../../utils/crypto";
import { saveUserAccountInDB } from "../../repositories/userAccount.repository";
import { generateValuesYaml } from "./gitops/helmValues.service";
import { pushWorkspaceToGit } from "./gitops/git.service";

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

const getZenmlUrl = (workspace: string) => {
  // const isLocal = process.env.RUN_ENV === "local";

  // if (isLocal) {
  //   return process.env.ZENML_BASE_URL!; // e.g. http://localhost:8082
  // }

  return `http://zenml-service-${workspace}.zenml.svc.cluster.local`;
};

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
    const rawPassword = generateZenMLPassword();
    const encryptedPassword = encrypt(rawPassword);

    // 2 Generate Helm values.yaml
    const valuesYaml = generateValuesYaml(workspaceName);

    // 3 Push to Git (THIS triggers deployment)
    await pushWorkspaceToGit(workspaceName, valuesYaml);

    // 4 Construct future service URL (IMPORTANT)
    // const zenmlServerUrl = getZenmlUrl(workspaceName);
    const zenmlServerUrl = `http://zenml-service-${workspaceName}.zenml.svc.cluster.local`;

    // 3 Get workspace info
    const workspaceInfo = await waitForZenML(() =>
      getWorkspaceInfo(zenmlServerUrl),
    );

    if (!workspaceInfo) {
      throw new Error("Failed to retrieve workspace info after ZenML startup");
    }

    // 4 Activate workspace
    await activateWorkspace(
      zenmlServerUrl,
      buildActivationPayload(zenmlUsername, rawPassword, workspaceName),
    );

    // 5 Save workspace
    const workspace = await saveWorkspaceToDB(
      {
        workspaceId: workspaceInfo.id,
        workspaceName,
        zenmlServerUrl,
      },
      session,
    );

    // 6 Save user account
    const userAccount = await saveUserAccountInDB(
      {
        workspace: workspace._id,
        jnjUsername,
        zenmlUsername,
        zenmlPassword: encryptedPassword,
        role: "admin",
      },
      session,
    );

    // 7 Save identity mapping
    await saveIdentityInDB(
      {
        workspace: workspace._id,
        jnjUsername,
        accountType: "UserAccount",
        account: userAccount._id,
      },
      session,
    );

    // 8 Commit transaction
    await session.commitTransaction();

    return {
      message: `Workspace ${workspaceName} created successfully with workspace ID ${workspaceInfo.id} and deployed on server ${zenmlServerUrl}`,
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
