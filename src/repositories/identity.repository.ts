import { WorkspaceIdentity } from "../models/workspaceIdentity.model";
import { Types } from "mongoose";

interface StoreIdentityParams {
  workspaceId: Types.ObjectId;
  grantedToJNJUsername: string;
  identityType: string;
  status: string;
  serviceAccount?: Types.ObjectId;
  zenmlUsername?: string;
  zenmlPasswordEncrypted?: string;
  role?: string;
}

export const findIdentity = async (
  workspaceId: Types.ObjectId,
  jnjUsername: string,
  status?: string,
) => {
  console.log(
    `Finding identity for workspaceId: ${workspaceId}, jnjUsername: ${jnjUsername}, status: ${status || "active"}`,
  );
  return WorkspaceIdentity.findOne({
    workspace: workspaceId,
    jnjUsername,
    status: status || "active",
  }).populate("serviceAccount");
};

export const storeIdentity = async (data: StoreIdentityParams) => {
  return WorkspaceIdentity.findOneAndUpdate(
    {
      workspace: data.workspaceId,
      jnjUsername: data.grantedToJNJUsername,
    },
    {
      workspace: data.workspaceId,
      jnjUsername: data.grantedToJNJUsername,
      identityType: data.identityType,
      status: data.status,
      serviceAccount: data.serviceAccount,
      zenmlUsername: data.zenmlUsername,
      zenmlPasswordEncrypted: data.zenmlPasswordEncrypted,
      role: data.role,
    },
    { upsert: true, new: true },
  );
};
