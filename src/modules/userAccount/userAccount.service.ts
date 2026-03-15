import { Request } from "express";
import mongoose from "mongoose";

import { saveIdentityToDB } from "../../repositories/identity.repository";
import {
  activateUser,
  createUser,
  deleteUser,
} from "../../clients/user.client";
import { generateZenMLPassword } from "../../utils/credentialGenerator";

export const createUserAccount = async (req: Request) => {
  const { isAdmin, email, role, grantedToJNJUsername, zenmlUsername } =
    req.body;
  const { workspace, token } = req.context!;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1 Generate credentials
    // const zenmlUsername = generateZenMLUsername();
    const zenmlPassword = generateZenMLPassword();
    // const encryptedPassword = encrypt(zenmlPassword);

    // 2 Create user in ZenML
    const createUserPayload = {
      is_admin: isAdmin,
      name: zenmlUsername,
    };

    const userResponse = await createUser(
      workspace.zenmlServerUrl,
      createUserPayload,
      token,
    );

    // 3 Activate user
    const activateUserPayload = {
      activation_token: userResponse.body.activation_token,
      email,
      full_name: zenmlUsername,
      email_opted_in: Boolean(email),
      password: zenmlPassword,
    };

    await activateUser(
      workspace.zenmlServerUrl,
      userResponse.id,
      activateUserPayload,
      token,
    );

    // 4 Determine role
    const userRole = role ?? (isAdmin ? "admin" : "viewer");

    // 5 Save identity in database
    const identityData = {
      workspaceId: workspace._id,
      jnjUsername: grantedToJNJUsername,
      zenmlUsername,
      zenmlPasswordEncrypted: zenmlPassword,
      identityType: "user",
      status: "active",
      role: userRole,
    };

    await saveIdentityToDB(identityData, session);

    // 6 Commit transaction
    await session.commitTransaction();

    console.log(
      `User account created for JNJ user ${grantedToJNJUsername} with ZenML username ${zenmlUsername}`,
    );
    return {
      message: "User account created and activated successfully",
      zenmlUsername,
    };
  } catch (error) {
    await session.abortTransaction();

    if (zenmlUsername) {
      try {
        await deleteUser(workspace.zenmlServerUrl, zenmlUsername, token);
      } catch (rollbackError) {
        console.error("Failed to rollback ZenML user:", rollbackError);
      }
    }

    throw error;
  } finally {
    session.endSession();
  }
};
