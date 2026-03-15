import { ClientSession, Types } from "mongoose";
import { UserAccount } from "../models/userAccount.model";

interface saveUserAccountInDBType {
  workspace: Types.ObjectId;
  jnjUsername: string;
  zenmlUsername: string;
  zenmlPassword: string;
  role: string;
}

export const saveUserAccountInDB = async (
  data: saveUserAccountInDBType,
  session?: ClientSession,
) => {
  const result = await UserAccount.create([data], { session });
  return result[0];
};
