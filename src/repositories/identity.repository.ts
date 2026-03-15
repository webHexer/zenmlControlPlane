import { WorkspaceIdentity } from "../models/workspaceIdentity.model";
import { ClientSession, Types } from "mongoose";

interface saveIdentityToDBParams {
  workspaceId: Types.ObjectId;
  jnjUsername: string;
  identityType: string;
  status: string;
  serviceAccount?: Types.ObjectId;
  zenmlUsername?: string;
  zenmlPassword?: string;
  role?: string;
}

export const findIdentity = async (
  workspaceId: Types.ObjectId,
  jnjUsername: string,
  status?: string,
) => {
  return WorkspaceIdentity.findOne({
    workspace: workspaceId,
    jnjUsername,
    status: status || "active",
  }).populate("serviceAccount");
};

export const saveIdentityToDB = async (
  data: saveIdentityToDBParams,
  session?: ClientSession,
) => {
  return WorkspaceIdentity.findOneAndUpdate(
    {
      workspace: data.workspaceId,
      jnjUsername: data.jnjUsername,
    },
    {
      workspace: data.workspaceId,
      jnjUsername: data.jnjUsername,
      identityType: data.identityType,
      status: data.status,
      serviceAccount: data.serviceAccount,
      zenmlUsername: data.zenmlUsername,
      zenmlPassword: data.zenmlPassword,
      role: data.role,
    },
    { upsert: true, new: true, session },
  );
};
