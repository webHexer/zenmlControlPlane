import { ClientSession } from "mongoose";
import { Workspace } from "../models/workspace.model";
interface saveWorkspaceParams {
  workspaceId: string;
  workspaceName: string;
  zenmlServerUrl: string;
  containerId: string;
}

export const findWorkspaceByName = async (workspaceName: string) => {
  return Workspace.findOne({ workspaceName });
};

export const saveWorkspaceToDB = async (
  data: saveWorkspaceParams,
  session?: ClientSession,
) => {
  const workspace = await Workspace.create(
    [
      {
        workspaceId: data.workspaceId,
        workspaceName: data.workspaceName,
        zenmlServerUrl: data.zenmlServerUrl,
        containerId: data.containerId,
      },
    ],
    { session }, // ✅ important
  );
  return workspace[0];
};
