import crypto from "crypto";

export const generateZenMLUsername = () => {
  return `zenml_${crypto.randomBytes(4).toString("hex")}`;
};

export const generateZenMLPassword = () => {
  return crypto.randomBytes(16).toString("hex");
};
