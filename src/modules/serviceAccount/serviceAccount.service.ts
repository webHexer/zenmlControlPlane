import { Request } from "express";
import { saveIdentityToDB } from "../../repositories/identity.repository";
import { createServiceAccountRecord } from "../../repositories/serviceAccount.repository";
import {
  activateServiceUser,
  createServiceUser,
} from "../../clients/serviceUser.client";

export const createServiceAccount = async (req: Request) => {
  try {
    const { serviceAccountUsername, description, grantedToJNJUsername, role } =
      req.body;
    const { workspace, token } = req.context!;

    const serviceUserPayload = {
      name: serviceAccountUsername,
      description,
      active: true,
    };
    // Create service account in ZenML server
    const serviceUser = await createServiceUser(
      workspace.zenmlServerUrl,
      serviceUserPayload,
      token,
    );

    const apiKeyName = `${serviceAccountUsername}-api-key`;
    const activateServiceUserPayload = {
      name: apiKeyName,
      description: `${serviceAccountUsername} API key`,
    };

    // Activate service account and get api key
    const activatedServiceUserData = await activateServiceUser(
      workspace.zenmlServerUrl,
      serviceUser.id,
      activateServiceUserPayload,
      token,
    );

    // create service account record in our database and map it to the user identity
    const serviceAccount = await createServiceAccountRecord({
      workspaceId: workspace._id,
      grantedToJNJUsername,
      serviceAccountUsername,
      serviceAccountId: serviceUser.id,
      description,
      apiKey: activatedServiceUserData.body.key,
      apiKeyName,
    });

    // Store the service account as an identity in our database and map it to the user identity
    await saveIdentityToDB({
      workspaceId: workspace._id,
      jnjUsername: grantedToJNJUsername,
      identityType: "service",
      status: "active",
      serviceAccount: serviceAccount._id,
      role,
    });

    return { message: "Service account created successfully" };
  } catch (error) {
    // 🔁 Rollback ZenML if DB fails
    // if (serviceAccountId && workspace && accessToken) {
    //   try {
    //     await fetch(
    //       `${workspace.zenmlServerUrl}/api/v1/service_accounts/${serviceAccountId}`,
    //       {
    //         method: "DELETE",
    //         headers: {
    //           Authorization: `Bearer ${accessToken}`,
    //         },
    //       },
    //     );
    //   } catch (rollbackError) {
    //     console.error("Rollback failed:", rollbackError);
    //   }
    // }

    throw error;
  }
};
