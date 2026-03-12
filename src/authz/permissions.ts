import { Role } from "./roles";
import { Resource } from "./resources";
import { Action } from "./actions";

export const permissions = {
  [Role.ADMIN]: {
    [Resource.USER_ACCOUNT]: [
      Action.CREATE_USER_ACCOUNT,
      Action.DELETE_USER_ACCOUNT,
    ],
    [Resource.SERVICE_ACCOUNT]: [
      Action.CREATE_SERVICE_ACCOUNT,
      Action.DELETE_SERVICE_ACCOUNT,
    ],
    [Resource.PIPELINE]: [Action.VIEW_PIPELINE, Action.RUN_PIPELINE],
    [Resource.STACK]: [Action.CREATE_STACK, Action.UPDATE_STACK],
    [Resource.PROJECTS]: [
      Action.READ,
      Action.CREATE,
      Action.DELETE,
      Action.UPDATE,
    ],
  },

  [Role.DEVELOPER]: {
    [Resource.PIPELINE]: [Action.READ, Action.CREATE],
    [Resource.PROJECTS]: [Action.READ, Action.CREATE, Action.UPDATE],
  },

  [Role.VIEWER]: {
    [Resource.PIPELINE]: [Action.READ],
    [Resource.PROJECTS]: [Action.READ],
  },
};
