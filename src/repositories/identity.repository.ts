import { WorkspaceIdentity } from "../models/workspaceIdentity.model";
import { ClientSession, Types } from "mongoose";

interface saveIdentityInDBParams {
  workspace: Types.ObjectId;
  jnjUsername: string;
  accountType: "UserAccount" | "ServiceAccount";
  account: Types.ObjectId;
}

export const findIdentity = async (
  workspaceId: Types.ObjectId,
  jnjUsername: string,
) => {
  return WorkspaceIdentity.findOne({
    workspace: workspaceId,
    jnjUsername,
  }).populate("account");
};

export const saveIdentityInDB = async (
  data: saveIdentityInDBParams,
  session?: ClientSession,
) => {
  return WorkspaceIdentity.findOneAndUpdate(
    {
      workspace: data.workspace,
      jnjUsername: data.jnjUsername,
    },
    {
      workspace: data.workspace,
      jnjUsername: data.jnjUsername,
      accountType: data.accountType,
      account: data.account,
    },
    {
      upsert: true,
      new: true,
      session,
      setDefaultsOnInsert: true,
    },
  );
};
