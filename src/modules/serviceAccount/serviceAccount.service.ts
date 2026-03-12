import { Request } from "express";
import { zenmlRequest } from "../../clients/zenml.client";
import { storeIdentity } from "../../repositories/identity.repository";
import { createServiceAccountRecord } from "../../repositories/serviceAccount.repository";

export const createServiceAccount = async (req: Request) => {
  try {
    const { serviceAccountUsername, description, grantedToJNJUsername, role } =
      req.body;
    const { workspace, token } = req.context!;

    // Create service account in ZenML server
    const serviceAccountData = await zenmlRequest(
      `${workspace.zenmlServerUrl}/api/v1/service_accounts`,
      "POST",
      token,
      {
        name: serviceAccountUsername,
        description,
        active: true,
      },
    );

    const apiKeyName = `${serviceAccountUsername}-api-key`;
    // Create API key for the service account
    const apiKeyData = await zenmlRequest(
      `${workspace.zenmlServerUrl}/api/v1/service_accounts/${serviceAccountData.id}/api_keys`,
      "POST",
      token,
      {
        name: apiKeyName,
        description: `${serviceAccountUsername} API key`,
      },
    );

    // create service account record in our database and map it to the user identity
    const serviceAccount = await createServiceAccountRecord({
      workspaceId: workspace._id,
      grantedToJNJUsername,
      serviceAccountUsername,
      serviceAccountId: serviceAccountData.id,
      description,
      apiKey: apiKeyData.body.key,
      apiKeyName,
    });

    // Store the service account as an identity in our database and map it to the user identity
    await storeIdentity({
      workspaceId: workspace._id,
      grantedToJNJUsername,
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
