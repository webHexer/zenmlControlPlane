import { permissions } from "./permissions";
import { Action } from "./actions";
import { Resource } from "./resources";

interface AuthorizeParams {
  role: string;
  action: Action;
  resource: Resource;
}

export const authorize = ({
  role,
  action,
  resource,
}: AuthorizeParams): boolean => {
  const rolePermissions = permissions[role as keyof typeof permissions];

  if (!rolePermissions) return false;

  const resourcePermissions =
    rolePermissions[resource as keyof typeof rolePermissions];

  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
};
