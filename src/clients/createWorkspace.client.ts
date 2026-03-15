import { API_ENDPOINTS } from "../constants/endpoints";
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
  return zenmlRequest({
    url: `${zenmlServerUrl}${API_ENDPOINTS.ACTIVATE_WORKSPACE}`,
    method: "PUT",
    body,
  });
};

export const getWorkspaceInfo = async (zenmlServerUrl: string) => {
  return zenmlRequest({
    url: `${zenmlServerUrl}${API_ENDPOINTS.WORKSPACE_INFO}`,
    method: "GET",
  });
};
