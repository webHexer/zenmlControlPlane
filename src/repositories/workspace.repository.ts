import { Workspace } from "../models/workspace.model";

export const findWorkspaceByName = async (workspaceName: string) => {
  return Workspace.findOne({ workspaceName });
};
