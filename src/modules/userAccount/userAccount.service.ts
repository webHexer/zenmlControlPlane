import { Request } from "express";
import mongoose from "mongoose";

import { generateZenMLPassword } from "../../utils/credentialGenerator";
import { encrypt } from "../../utils/crypto";
import {
  activateZenmlUser,
  createZenmlUser,
  rollbackZenmlUser,
  saveUserAccountAndIdentity,
} from "./helper";

export const createUserAccount = async (req: Request) => {
  const { email, role, grantedToJNJUsername, zenmlUsername } = req.body;

  if (!req.context) {
    throw new Error("Request context missing");
  }

  if (!zenmlUsername || !grantedToJNJUsername) {
    throw new Error("Missing required fields");
  }

  const { workspace, token } = req.context;

  const session = await mongoose.startSession();
  session.startTransaction();

  let zenmlUserId: string | undefined;

  try {
    // 1 Generate password
    const zenmlPassword = generateZenMLPassword();
    const encryptedPassword = encrypt(zenmlPassword);

    // 2 Create ZenML user
    const userResponse = await createZenmlUser(
      workspace.zenmlServerUrl,
      zenmlUsername,
      role === "admin" ? true : false,
      token,
    );

    zenmlUserId = userResponse.id;

    // 3 Activate ZenML user
    await activateZenmlUser(
      workspace.zenmlServerUrl,
      userResponse,
      email,
      zenmlUsername,
      zenmlPassword,
      token,
    );

    // // 4 Determine role
    // const userRole = role ?? (isAdmin ? "admin" : "viewer");

    // 5 Save user account + identity
    await saveUserAccountAndIdentity(
      workspace._id,
      grantedToJNJUsername,
      zenmlUsername,
      encryptedPassword,
      role ?? (isAdmin ? "admin" : "viewer"),
      session,
    );

    await session.commitTransaction();

    return {
      message: "User account created successfully.",
      jnjUsername: grantedToJNJUsername,
      zenmlUsername,
    };
  } catch (error) {
    await session.abortTransaction();

    // rollback ZenML user
    if (zenmlUserId) {
      await rollbackZenmlUser(workspace.zenmlServerUrl, zenmlUserId, token);
    }

    throw error;
  } finally {
    session.endSession();
  }
};
