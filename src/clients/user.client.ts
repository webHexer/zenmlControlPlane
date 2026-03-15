import { API_ENDPOINTS } from "../constants/endpoints";
import { zenmlRequest } from "./zenml.client";

interface createUserBodyType {
  is_admin: boolean;
  name: string;
}

export interface ActivateUserBodyType {
  activation_token: string;
  email: string;
  full_name: string;
  email_opted_in: boolean;
  password: string;
}

export const createUser = async (
  zenmlServerUrl: string,
  body: createUserBodyType,
  token: string,
) => {
  return zenmlRequest({
    url: `${zenmlServerUrl}${API_ENDPOINTS.CREATE_USER}`,
    method: "POST",
    body,
    token,
  });
};

export const deleteUser = async (
  zenmlServerUrl: string,
  zenmlUsername: string,
  token: string,
) => {
  return zenmlRequest({
    url: `${zenmlServerUrl}${API_ENDPOINTS.DELETE_USER(zenmlUsername)}`,
    method: "DELETE",
    token,
  });
};

export const activateUser = async (
  zenmlServerUrl: string,
  userId: string,
  body: ActivateUserBodyType,
  token: string,
) => {
  return zenmlRequest({
    url: `${zenmlServerUrl}${API_ENDPOINTS.ACTIVATE_USER(userId)}`,
    method: "PUT",
    body,
    token,
  });
};
