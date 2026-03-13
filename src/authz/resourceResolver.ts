import { Resource } from "./resources";

export function resolveResourceFromPath(path: string): Resource | null {
  const parts = path.split("/");

  const resource = parts[3];

  if (!resource) return null;

  if (Object.values(Resource).includes(resource as Resource)) {
    return resource as Resource;
  }

  return null;
}
