import { Request } from "express";
import { saveIdentityToDB } from "../../repositories/identity.repository";
import { encrypt } from "../../utils/crypto";
import { activateUser, createUser } from "../../clients/user.client";

export const createUserAccount = async (req: Request) => {
  const {
    isAdmin,
    zenmlUsername,
    email,
    password,
    role,
    grantedToJNJUsername,
  } = req.body;
  const { workspace, token } = req.context!;

  const userPayload = {
    is_admin: isAdmin,
    name: zenmlUsername,
  };
  const userResponse = await createUser(
    workspace.zenmlServerUrl,
    userPayload,
    token,
  );

  const activateUserPayload = {
    activation_token: userResponse.body.activation_token,
    email,
    full_name: zenmlUsername,
    email_opted_in: email ? true : false,
    password,
  };
  await activateUser(
    workspace.zenmlServerUrl,
    userResponse.id,
    activateUserPayload,
    token,
  );

  await saveIdentityToDB({
    workspaceId: workspace._id,
    jnjUsername: grantedToJNJUsername,
    zenmlUsername,
    zenmlPasswordEncrypted: encrypt(password),
    identityType: "user",
    status: "active",
    role: role || (isAdmin === true ? "admin" : "viewer"),
  });

  return {
    message: "User account created and activated successfully",
  };
};
