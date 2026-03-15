import { Request } from "express";
import mongoose from "mongoose";

import { saveIdentityInDB } from "../../repositories/identity.repository";
import { saveUserAccountInDB } from "../../repositories/userAccount.repository";
import {
  activateUser,
  createUser,
  deleteUser,
} from "../../clients/user.client";
import { generateZenMLPassword } from "../../utils/credentialGenerator";
import { encrypt } from "../../utils/crypto";
import { AppError } from "../../utils/AppError";

export const createUserAccount = async (req: Request) => {
  const { isAdmin, email, role, grantedToJNJUsername, zenmlUsername } =
    req.body;

  if (!req.context) {
    throw new Error("Request context missing");
  }

  const { workspace, token } = req.context;

  const session = await mongoose.startSession();
  session.startTransaction();

  let rollbackZenmlUserId: string | undefined;

  try {
    // 1 Generate password
    const zenmlPassword = generateZenMLPassword();
    const encryptedPassword = encrypt(zenmlPassword);

    // 2 Create ZenML user
    const createUserPayload = {
      is_admin: isAdmin,
      name: zenmlUsername,
    };

    const userResponse = await createUser(
      workspace.zenmlServerUrl,
      createUserPayload,
      token,
    );

    if (!userResponse?.id) {
      throw new AppError("Failed to create ZenML user");
    }

    const zenmlUserId = userResponse.id;
    rollbackZenmlUserId = zenmlUserId;

    // 3 Activate ZenML user
    const activateUserPayload = {
      activation_token: userResponse.body.activation_token,
      email,
      full_name: zenmlUsername,
      email_opted_in: Boolean(email),
      password: zenmlPassword,
    };

    await activateUser(
      workspace.zenmlServerUrl,
      zenmlUserId,
      activateUserPayload,
      token,
    );

    // 4 Determine role
    const userRole = role ?? (isAdmin ? "admin" : "viewer");

    // 5 Save UserAccount document
    const userAccount = await saveUserAccountInDB(
      {
        workspace: workspace._id,
        jnjUsername: grantedToJNJUsername,
        zenmlUsername,
        zenmlPassword: encryptedPassword,
        role: userRole,
      },
      session,
    );

    if (!userAccount) {
      throw new AppError("Failed to create user account record");
    }

    // 6 Save WorkspaceIdentity
    await saveIdentityInDB(
      {
        workspace: workspace._id,
        jnjUsername: grantedToJNJUsername,
        accountType: "UserAccount",
        account: userAccount._id,
      },
      session,
    );

    // 7 Commit transaction
    await session.commitTransaction();

    return {
      message: `User account created for JNJ user ${grantedToJNJUsername} with ZenML username ${zenmlUsername}`,
    };
  } catch (error) {
    await session.abortTransaction();

    // rollback ZenML user
    if (rollbackZenmlUserId) {
      try {
        await deleteUser(workspace.zenmlServerUrl, rollbackZenmlUserId, token);
      } catch (rollbackError) {
        console.error("Failed to rollback ZenML user:", rollbackError);
      }
    }

    throw new Error("Failed to create user account");
  } finally {
    session.endSession();
  }
};
