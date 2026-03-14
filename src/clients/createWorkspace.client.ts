import { ENDPOINTS } from "../constants/endpoints";
import { zenmlRequest } from "./zenml.client";

interface activateWorkspaceBodyType {
  admin_password: string;
  admin_username: string;
  server_name: string;
}

export const activateWorkspace = async (
  zenmlServerUrl: string,
  body: activateWorkspaceBodyType,
) => {
  return zenmlRequest(
    `${zenmlServerUrl}${ENDPOINTS.ACTIVATE_WORKSPACE}`,
    "PUT",
    body,
  );
};

export const getWorkspaceInfo = async (zenmlServerUrl: string) => {
  return zenmlRequest(`${zenmlServerUrl}${ENDPOINTS.WORKSPACE_INFO}`, "GET");
};
