import { ENDPOINTS } from "../constants/endpoints";
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
  return zenmlRequest(
    `${zenmlServerUrl}${ENDPOINTS.CREATE_SERVICE_USER}`,
    "POST",
    body,
    token,
  );
};

export const activateServiceUser = async (
  zenmlServerUrl: string,
  serviceUserId: string,
  body: ActivateServiceUserBodyType,
  token: string,
) => {
  return zenmlRequest(
    `${zenmlServerUrl}${ENDPOINTS.ACTIVATE_SERVICE_USER(serviceUserId)}`,
    "POST",
    body,
    token,
  );
};
