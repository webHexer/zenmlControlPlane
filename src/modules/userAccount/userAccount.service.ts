import { Request } from "express";
import { zenmlRequest } from "../../clients/zenml.client";
import { storeIdentity } from "../../repositories/identity.repository";
import { encrypt } from "../../utils/crypto";

export const createUserAccount = async (req: Request) => {
  try {
    const {
      isAdmin,
      zenmlUsername,
      email,
      password,
      role,
      grantedToJNJUsername,
    } = req.body;
    const { workspace, token } = req.context!;

    const userAccountResponse = await zenmlRequest(
      `${workspace.zenmlServerUrl}/api/v1/users`,
      "POST",
      token,
      {
        is_admin: isAdmin,
        name: zenmlUsername,
      },
    );

    await zenmlRequest(
      `${workspace.zenmlServerUrl}/api/v1/users/${userAccountResponse.id}/activate`,
      "PUT",
      token,
      {
        activation_token: userAccountResponse.body.activation_token,
        email,
        full_name: zenmlUsername,
        email_opted_in: email ? true : false,
        password,
      },
    );

    await storeIdentity({
      workspaceId: workspace._id,
      grantedToJNJUsername,
      zenmlUsername,
      zenmlPasswordEncrypted: encrypt(password),
      identityType: "user",
      status: "active",
      role: role || (isAdmin === true ? "admin" : "viewer"),
    });

    return {
      message: "User account created and activated successfully",
    };
  } catch (err) {
    throw err;
  }
};
