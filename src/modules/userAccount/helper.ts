import mongoose from "mongoose";
import {
  activateUser,
  createUser,
  deleteUser,
} from "../../clients/user.client";
import { AppError } from "../../utils/AppError";
import { saveUserAccountInDB } from "../../repositories/userAccount.repository";
import { saveIdentityInDB } from "../../repositories/identity.repository";

export const createZenmlUser = async (
  serverUrl: string,
  zenmlUsername: string,
  isAdmin: boolean,
  token: string,
) => {
  const payload = {
    is_admin: isAdmin,
    name: zenmlUsername,
  };

  const userResponse = await createUser(serverUrl, payload, token);

  if (!userResponse?.id) {
    throw new AppError("Failed to create ZenML user");
  }

  return userResponse;
};

export const activateZenmlUser = async (
  serverUrl: string,
  userResponse: any,
  email: string,
  zenmlUsername: string,
  zenmlPassword: string,
  token: string,
) => {
  const payload = {
    activation_token: userResponse.body.activation_token,
    email,
    full_name: zenmlUsername,
    email_opted_in: Boolean(email),
    password: zenmlPassword,
  };

  await activateUser(serverUrl, userResponse.id, payload, token);
};

export const saveUserAccountAndIdentity = async (
  workspaceId: any,
  jnjUsername: string,
  zenmlUsername: string,
  encryptedPassword: string,
  role: string,
  session: mongoose.ClientSession,
) => {
  const userAccount = await saveUserAccountInDB(
    {
      workspace: workspaceId,
      jnjUsername,
      zenmlUsername,
      zenmlPassword: encryptedPassword,
      role,
    },
    session,
  );

  if (!userAccount) {
    throw new AppError("Failed to create user account record");
  }

  await saveIdentityInDB(
    {
      workspace: workspaceId,
      jnjUsername,
      accountType: "UserAccount",
      account: userAccount._id,
    },
    session,
  );
};

export const rollbackZenmlUser = async (
  serverUrl: string,
  zenmlUserId: string,
  token: string,
) => {
  try {
    await deleteUser(serverUrl, zenmlUserId, token);
  } catch (error) {
    console.error("Failed to rollback ZenML user:", error);
  }
};
