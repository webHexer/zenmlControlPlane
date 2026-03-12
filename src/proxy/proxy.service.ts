// import { Workspace } from "../models/workspace.model";
// import { WorkspaceAuthSession } from "../models/workspaceAuthSession.model";
// import { WorkspaceIdentity } from "../models/workspaceIdentity.model";

// // This service will be used by the proxy middleware to validate the session and get the workspace details
// export const getProxySession = async (workspace: any, identity: any) => {
//   const session = await WorkspaceAuthSession.findOne({
//     workspace: workspace._id,
//     identity: identity!._id,
//   });

//   if (!session) throw new Error("User not logged in");

//   return {
//     session,
//   };
// };
