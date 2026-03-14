import { ENDPOINTS } from "../constants/endpoints";
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
  return zenmlRequest(
    `${zenmlServerUrl}${ENDPOINTS.CREATE_USER}`,
    "POST",
    body,
    token,
  );
};

export const activateUser = async (
  zenmlServerUrl: string,
  userId: string,
  body: ActivateUserBodyType,
  token: string,
) => {
  return zenmlRequest(
    `${zenmlServerUrl}${ENDPOINTS.ACTIVATE_USER(userId)}`,
    "PUT",
    body,
    token,
  );
};
