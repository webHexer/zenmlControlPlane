import { Role } from "./roles";
import { Resource } from "./resources";
import { Action } from "./actions";

export const permissions = {
  [Role.ADMIN]: {
    [Resource.USERS]: [
      Action.READ,
      Action.CREATE,
      Action.DELETE,
      Action.UPDATE,
    ],
    [Resource.SERVICE_ACCOUNT]: [
      Action.READ,
      Action.CREATE,
      Action.DELETE,
      Action.UPDATE,
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
    [Resource.USERS]: [Action.READ],
    [Resource.SERVICE_ACCOUNT]: [Action.READ],
    [Resource.PIPELINE]: [Action.READ, Action.CREATE],
    [Resource.PROJECTS]: [Action.READ, Action.CREATE, Action.UPDATE],
  },

  [Role.VIEWER]: {
    [Resource.USERS]: [Action.READ],
    [Resource.SERVICE_ACCOUNT]: [Action.READ],
    [Resource.PIPELINE]: [Action.READ],
    [Resource.PROJECTS]: [Action.READ],
  },
};
