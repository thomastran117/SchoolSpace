import { setRouteMetadata } from "./registry";

export function requireAuth<T extends (...args: unknown[]) => unknown>(
  handler: T
): T {
  setRouteMetadata(handler, { requireAuth: true });
  return handler;
}

export function requireRoles(roles: string[]) {
  return <T extends (...args: unknown[]) => unknown>(handler: T): T => {
    setRouteMetadata(handler, { requireAuth: true, roles });
    return handler;
  };
}
