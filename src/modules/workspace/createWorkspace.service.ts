import { saveWorkspaceToDB } from "../../repositories/workspace.repository";
import {
  activateWorkspace,
  getWorkspaceInfo,
} from "../../clients/createWorkspace.client";

import { createZenMLInstance } from "./docker.service";
import { waitForZenML } from "../../utils/waitForZenml";
import { saveIdentityToDB } from "../../repositories/identity.repository";
import { encrypt } from "../../utils/crypto";

interface CreateWorkspaceParams {
  zenmlUsername: string;
  zenmlPassword: string;
  workspaceName: string;
  jnjUsername: string;
}

export const createWorkspaceService = async ({
  zenmlUsername,
  zenmlPassword,
  workspaceName,
  jnjUsername,
}: CreateWorkspaceParams) => {
  // 1️⃣ Create new ZenML container
  const { url: zenmlServerUrl, containerId } = await createZenMLInstance();

  console.log("ZenML instance created:", zenmlServerUrl);

  // 2️⃣ Get workspace info
  const info = await waitForZenML(() => getWorkspaceInfo(zenmlServerUrl));

  // 3️⃣ Activate workspace
  const activateWorkspacePayload = {
    admin_password: zenmlPassword,
    admin_username: zenmlUsername,
    server_name: workspaceName,
  };

  await activateWorkspace(zenmlServerUrl, activateWorkspacePayload);

  // 4️⃣ Save workspace in DB
  const workspace = await saveWorkspaceToDB({
    workspaceId: info.id,
    workspaceName,
    zenmlServerUrl,
    containerId,
  });

  if (!workspace) {
    console.log(workspace);
    throw new Error("Workspace creation failed");
  }

  await saveIdentityToDB({
    workspaceId: workspace._id,
    jnjUsername,
    zenmlUsername,
    zenmlPasswordEncrypted: encrypt(zenmlPassword),
    identityType: "user",
    status: "active",
    role: "admin",
  });

  return {
    workspaceId: info.id,
    workspaceName,
    zenmlServerUrl,
    containerId,
  };
};
