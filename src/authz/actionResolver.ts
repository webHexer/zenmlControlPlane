import { Action } from "./actions";

export function resolveActionFromMethod(method: string): Action {
  switch (method) {
    case "GET":
      return Action.READ;

    case "POST":
      return Action.CREATE;

    case "PUT":
    case "PATCH":
      return Action.UPDATE;

    case "DELETE":
      return Action.DELETE;

    default:
      return Action.READ;
  }
}
