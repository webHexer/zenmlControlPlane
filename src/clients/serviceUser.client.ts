import { API_ENDPOINTS } from "../constants/endpoints";
import { zenmlRequest } from "./zenml.client";
export interface ServiceUserBodyType {
  name: string;
  description: string;
  active: boolean;
}
export interface ActivateServiceUserBodyType {
  name: string;
  description: string;
}

export const createServiceUser = async (
  zenmlServerUrl: string,
  body: ServiceUserBodyType,
  token: string,
) => {
  return zenmlRequest({
    url: `${zenmlServerUrl}${API_ENDPOINTS.CREATE_SERVICE_USER}`,
    method: "POST",
    body,
    token,
  });
};

export const deleteServiceUser = async (
  zenmlServerUrl: string,
  serviceUserId: string,
  token: string,
) => {
  return zenmlRequest({
    url: `${zenmlServerUrl}${API_ENDPOINTS.DELETE_SERVICE_USER(serviceUserId)}`,
    method: "DELETE",
    token,
  });
};

export const activateServiceUser = async (
  zenmlServerUrl: string,
  serviceUserId: string,
  body: ActivateServiceUserBodyType,
  token: string,
) => {
  return zenmlRequest({
    url: `${zenmlServerUrl}${API_ENDPOINTS.ACTIVATE_SERVICE_USER(serviceUserId)}`,
    method: "POST",
    body,
    token,
  });
};
