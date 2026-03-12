import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      context?: {
        workspace: any;
        // workspaceName: string;
        role: string;
        identity: any;
        token: string;
        // grantedByJNJUsername?: string;
        // jnjUsername?: string;
      };
    }
  }
}
